import { describe, test, expect, beforeEach } from 'vitest';
import {
  dbRepo,
  encodeCustomPackToken,
  decodeCustomPackToken,
  getDailyChallengeForDate,
  calculateLevelFromXp,
  generateShareCode
} from '../database';
import { TeamColor, GameHistoryEntry } from '../types';

describe('Local-First Database Engine & Creative Features', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('Records match telemetry, updates XP/Level, leaderboard, and unlocks achievements', () => {
    const match: GameHistoryEntry = {
      id: 'match_test_1',
      date: '2026-11-26',
      players: ['سارا', 'رضا', 'مریم', 'علی', 'نیما', 'نگار', 'آرش', 'تارا'],
      winnerColor: TeamColor.Blue,
      winnerNames: ['سارا', 'نیما'],
      language: 'fa',
      difficulty: 'hard',
      roundsCount: 8,
      wordsGuessed: 18,
      wordsSwapped: 0,
      mode: 'daily',
      dailyDateKey: '2026-11-26'
    };

    const { history, stats, newlyUnlocked } = dbRepo.recordMatch(match);

    expect(history.length).toBe(1);
    expect(stats.totalGamesPlayed).toBe(1);
    expect(stats.totalWordsGuessed).toBe(18);
    expect(stats.dailyStreak).toBe(1);
    expect(stats.xp).toBeGreaterThan(100);
    expect(stats.level).toBe(calculateLevelFromXp(stats.xp));

    // Multiple achievements unlocked in one epic match
    expect(newlyUnlocked).toContain('first_win');
    expect(newlyUnlocked).toContain('proverb_master');
    expect(newlyUnlocked).toContain('speed_demon');
    expect(newlyUnlocked).toContain('marathon');
    expect(newlyUnlocked).toContain('full_house_8p');
    expect(newlyUnlocked).toContain('zero_swap');
    expect(newlyUnlocked).toContain('daily_hero');

    // Leaderboard populated and sorted by wins
    const leaderboard = dbRepo.getPlayerProfiles();
    expect(leaderboard.length).toBe(8);
    expect(leaderboard[0].wins).toBe(1);
    expect(['سارا', 'نیما']).toContain(leaderboard[0].name);
  });

  test('Polyglot achievement unlocks after playing in 3 distinct languages', () => {
    (['fa', 'en', 'de'] as const).forEach((lang, idx) => {
      dbRepo.recordMatch({
        id: `m_${idx}`,
        date: '2026-11-26',
        players: ['A', 'B', 'C', 'D'],
        winnerColor: TeamColor.Red,
        winnerNames: ['B', 'D'],
        language: lang
      });
    });

    const stats = dbRepo.getStats();
    expect(stats.languagesPlayed).toEqual(['fa', 'en', 'de']);
    expect(stats.unlockedAchievements.some(a => a.id === 'polyglot')).toBe(true);
  });

  test('Custom Word Packs CRUD and DOUR1 share token encode/decode roundtrip (including Persian)', () => {
    const { pack, newlyUnlocked } = dbRepo.createCustomPack({
      title: 'شب نشینی دوستان',
      language: 'fa',
      difficulty: 'medium',
      words: ['قورمه سبزی', 'تخته نرد', 'چای آتیشی', 'قورمه سبزی'] // duplicate should be deduped
    });

    expect(pack.words.length).toBe(3);
    expect(pack.shareCode).toHaveLength(6);
    expect(newlyUnlocked).toContain('pack_creator');
    expect(dbRepo.getCustomPacks().length).toBe(1);

    const token = encodeCustomPackToken(pack);
    expect(token.startsWith('DOUR1:')).toBe(true);

    const decoded = decodeCustomPackToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.title).toBe('شب نشینی دوستان');
    expect(decoded?.language).toBe('fa');
    expect(decoded?.words).toEqual(['قورمه سبزی', 'تخته نرد', 'چای آتیشی']);

    // Import from token
    const imported = dbRepo.importCustomPackFromToken(token);
    expect(imported).not.toBeNull();
    expect(dbRepo.getCustomPacks().length).toBe(2);

    // Invalid token rejected cleanly
    expect(decodeCustomPackToken('INVALID_TOKEN')).toBeNull();
    expect(dbRepo.importCustomPackFromToken('DOUR1:not_base64!!!')).toBeNull();

    // Delete pack
    const remaining = dbRepo.deleteCustomPack(pack.id);
    expect(remaining.length).toBe(1);
  });

  test('Smart Anti-Repeat Word Memory prioritizes unseen words before seen ones', () => {
    const indices = [0, 1, 2, 3, 4];
    const getId = (i: number) => `word_${i}`;

    dbRepo.recordWordOutcome('word_0', 'guessed');
    dbRepo.recordWordOutcome('word_1', 'swapped');

    const mem = dbRepo.getWordMemory();
    expect(mem['word_0'].guessedCount).toBe(1);
    expect(mem['word_1'].swappedCount).toBe(1);

    const prioritized = dbRepo.prioritizeUnseenIndices(indices, getId);
    // First 3 items must be the unseen indices {2, 3, 4}
    expect(new Set(prioritized.slice(0, 3))).toEqual(new Set([2, 3, 4]));
    expect(new Set(prioritized.slice(3))).toEqual(new Set([0, 1]));
  });

  test('Daily Challenge generator is deterministic for a given date', () => {
    const d1 = getDailyChallengeForDate(new Date('2026-11-26T08:00:00Z'));
    const d2 = getDailyChallengeForDate(new Date('2026-11-26T22:00:00Z'));
    expect(d1.dateKey).toBe('2026-11-26');
    expect(d1.seed).toBe(d2.seed);
    expect(d1.categories).toEqual(d2.categories);
    expect(d1.categories.length).toBe(3);
    expect(d1.difficulty).toBe(d2.difficulty);

    const share1 = generateShareCode('deterministic-seed');
    const share2 = generateShareCode('deterministic-seed');
    expect(share1).toBe(share2);
    expect(share1).toHaveLength(6);
  });

  test('Offline sync queue records pending writes and flushes on syncWithCloud', async () => {
    dbRepo.recordMatch({
      id: 'offline_match_1',
      date: '2026-11-26',
      players: ['P1', 'P2', 'P3', 'P4'],
      winnerColor: TeamColor.Green,
      winnerNames: ['P1', 'P3'],
      language: 'en'
    });

    expect(dbRepo.getPendingSyncCount()).toBeGreaterThan(0);

    const result = await dbRepo.syncWithCloud('test_user_uid');
    expect(result.syncedItems).toBeGreaterThan(0);
    expect(dbRepo.getPendingSyncCount()).toBe(0);
  });
});
