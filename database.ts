import {
  AchievementId,
  CustomWordPack,
  DailyChallengeRecord,
  DifficultyLevel,
  GameHistoryEntry,
  GameSettings,
  Language,
  PlayerProfileStats,
  UserAggregateStats,
  WordDifficulty,
  WordMemoryEntry
} from './types';
import { CATEGORIES } from './constants';
import {
  deleteCustomPackFromCloud,
  fetchCustomPacksFromCloud,
  fetchSettingsFromCloud,
  fetchUserMatchHistory,
  fetchUserStatsFromCloud,
  publishPackToCloud,
  saveCustomPackToCloud,
  saveDailyChallengeToCloud,
  saveMatchToCloud,
  syncPlayerProfilesToCloud,
  syncSettingsToCloud,
  syncUserStatsToCloud
} from './firebase';

const KEYS = {
  HISTORY: 'dor_history',
  SETTINGS: 'dor_settings',
  STATS: 'dour_db_stats_v2',
  CUSTOM_PACKS: 'dour_db_custom_packs_v2',
  PLAYER_PROFILES: 'dour_db_player_profiles_v2',
  WORD_MEMORY: 'dour_db_word_memory_v2',
  DAILY_CHALLENGES: 'dour_db_daily_challenges_v2',
  SYNC_QUEUE: 'dour_db_sync_queue_v2'
} as const;

export interface AchievementMeta {
  id: AchievementId;
  icon: string;
  xpReward: number;
}

export const ACHIEVEMENTS_CATALOG: AchievementMeta[] = [
  { id: 'first_win', icon: '🏆', xpReward: 50 },
  { id: 'polyglot', icon: '🌍', xpReward: 100 },
  { id: 'proverb_master', icon: '🧠', xpReward: 120 },
  { id: 'speed_demon', icon: '⚡', xpReward: 100 },
  { id: 'marathon', icon: '🔥', xpReward: 150 },
  { id: 'pack_creator', icon: '🎨', xpReward: 80 },
  { id: 'daily_hero', icon: '📅', xpReward: 100 },
  { id: 'full_house_8p', icon: '🎉', xpReward: 90 },
  { id: 'zero_swap', icon: '🎯', xpReward: 110 },
  { id: 'veteran_10', icon: '👑', xpReward: 250 }
];

type SyncQueueItem =
  | { type: 'match'; payload: { entry: GameHistoryEntry; settings?: GameSettings } }
  | { type: 'pack_save'; payload: CustomWordPack }
  | { type: 'pack_delete'; payload: { packId: string } }
  | { type: 'daily'; payload: DailyChallengeRecord };

const DEFAULT_STATS: UserAggregateStats = {
  totalGamesPlayed: 0,
  totalWordsGuessed: 0,
  totalWordsSwapped: 0,
  languagesPlayed: [],
  dailyStreak: 0,
  xp: 0,
  level: 1,
  unlockedAchievements: []
};

function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export function calculateLevelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1);
}

export function normalizePlayerKey(name: string): string {
  const cleaned = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\p{L}\p{N}_-]/gu, '');
  return cleaned || 'player';
}

export function generateShareCode(seedInput?: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  if (seedInput) {
    let hash = 2166136261;
    for (let i = 0; i < seedInput.length; i++) {
      hash ^= seedInput.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.abs(hash + i * 31) % alphabet.length];
      hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    }
    return code;
  }
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

// Offline-friendly compact pack export/import string (DOUR1:...)
export function encodeCustomPackToken(pack: Pick<CustomWordPack, 'title' | 'language' | 'difficulty' | 'words'>): string {
  const payload = JSON.stringify({
    t: pack.title.trim().slice(0, 40),
    l: pack.language,
    d: pack.difficulty,
    w: pack.words.map(w => w.trim()).filter(Boolean).slice(0, 100)
  });
  const bytes = new TextEncoder().encode(payload);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return 'DOUR1:' + btoa(binary);
}

export function decodeCustomPackToken(token: string): Omit<CustomWordPack, 'id' | 'createdAt' | 'updatedAt' | 'shareCode' | 'playCount'> | null {
  try {
    const trimmed = token.trim();
    if (!trimmed.startsWith('DOUR1:')) return null;
    const b64 = trimmed.slice(6);
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = JSON.parse(new TextDecoder().decode(bytes));
    if (!decoded || typeof decoded.t !== 'string' || !Array.isArray(decoded.w) || decoded.w.length < 3) {
      return null;
    }
    const validDiff: WordDifficulty = ['easy', 'medium', 'hard'].includes(decoded.d) ? decoded.d : 'easy';
    return {
      title: decoded.t.trim().slice(0, 40),
      language: decoded.l as Language,
      difficulty: validDiff,
      words: decoded.w.map((w: unknown) => String(w).trim()).filter(Boolean).slice(0, 100)
    };
  } catch {
    return null;
  }
}

export function getDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeDailySeed(dateKey: string): number {
  let hash = 5381;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) + hash + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDailyChallengeForDate(date = new Date()): DailyChallengeRecord {
  const dateKey = getDateKey(date);
  const existingMap = safeReadJSON<Record<string, DailyChallengeRecord>>(KEYS.DAILY_CHALLENGES, {});
  if (existingMap[dateKey]) {
    return existingMap[dateKey];
  }

  const seed = computeDailySeed(dateKey);
  const allCats = Object.keys(CATEGORIES);
  const selectedCats: string[] = [];
  let cursor = seed;
  while (selectedCats.length < 3 && selectedCats.length < allCats.length) {
    const cat = allCats[cursor % allCats.length];
    if (!selectedCats.includes(cat)) selectedCats.push(cat);
    cursor = Math.imul(cursor ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  }

  const diffs: DifficultyLevel[] = ['easy', 'medium', 'hard', 'all'];
  const difficulty = diffs[seed % diffs.length];

  return {
    dateKey,
    seed,
    categories: selectedCats,
    difficulty,
    completed: false,
    bestWordsGuessed: 0
  };
}

class LocalFirstDatabase {
  // ---- STATS & ACHIEVEMENTS ----
  getStats(): UserAggregateStats {
    const stored = safeReadJSON<Partial<UserAggregateStats>>(KEYS.STATS, {});
    return {
      ...DEFAULT_STATS,
      ...stored,
      languagesPlayed: Array.isArray(stored.languagesPlayed) ? stored.languagesPlayed : [],
      unlockedAchievements: Array.isArray(stored.unlockedAchievements) ? stored.unlockedAchievements : []
    };
  }

  saveStats(stats: UserAggregateStats): void {
    safeWriteJSON(KEYS.STATS, stats);
  }

  private unlockAchievement(stats: UserAggregateStats, id: AchievementId, newlyUnlocked: AchievementId[]): void {
    if (stats.unlockedAchievements.some(a => a.id === id)) return;
    const meta = ACHIEVEMENTS_CATALOG.find(a => a.id === id);
    stats.unlockedAchievements.push({ id, unlockedAt: new Date().toISOString() });
    stats.xp += meta?.xpReward || 50;
    stats.level = calculateLevelFromXp(stats.xp);
    newlyUnlocked.push(id);
  }

  // ---- MATCH HISTORY ----
  getHistory(): GameHistoryEntry[] {
    return safeReadJSON<GameHistoryEntry[]>(KEYS.HISTORY, []);
  }

  recordMatch(
    entry: GameHistoryEntry,
    settings?: GameSettings,
    userId?: string | null
  ): { history: GameHistoryEntry[]; stats: UserAggregateStats; newlyUnlocked: AchievementId[] } {
    const enriched: GameHistoryEntry = {
      ...entry,
      timestamp: entry.timestamp || Date.now(),
      difficulty: entry.difficulty || settings?.difficulty || 'easy',
      roundsCount: entry.roundsCount || settings?.roundsCount || 3,
      roundDuration: entry.roundDuration || settings?.roundDuration || 90,
      categories: entry.categories || settings?.selectedCategories || [],
      wordsGuessed: entry.wordsGuessed ?? 0,
      wordsSwapped: entry.wordsSwapped ?? 0,
      mode: entry.mode || 'classic'
    };

    const existing = this.getHistory();
    const updatedHistory = [enriched, ...existing.filter(m => m.id !== enriched.id)].slice(0, 50);
    safeWriteJSON(KEYS.HISTORY, updatedHistory);

    // Update aggregate stats
    const stats = this.getStats();
    const newlyUnlocked: AchievementId[] = [];
    stats.totalGamesPlayed += 1;
    stats.totalWordsGuessed += enriched.wordsGuessed || 0;
    stats.totalWordsSwapped += enriched.wordsSwapped || 0;
    if (!stats.languagesPlayed.includes(enriched.language)) {
      stats.languagesPlayed.push(enriched.language);
    }

    // Base XP: 25 per match + 5 per word guessed
    stats.xp += 25 + (enriched.wordsGuessed || 0) * 5;
    stats.level = calculateLevelFromXp(stats.xp);

    // Check achievements
    this.unlockAchievement(stats, 'first_win', newlyUnlocked);
    if (stats.languagesPlayed.length >= 3) {
      this.unlockAchievement(stats, 'polyglot', newlyUnlocked);
    }
    if (enriched.difficulty === 'hard') {
      this.unlockAchievement(stats, 'proverb_master', newlyUnlocked);
    }
    if ((enriched.wordsGuessed || 0) >= 15) {
      this.unlockAchievement(stats, 'speed_demon', newlyUnlocked);
    }
    if ((enriched.roundsCount || 0) >= 8) {
      this.unlockAchievement(stats, 'marathon', newlyUnlocked);
    }
    if (enriched.players.length >= 8) {
      this.unlockAchievement(stats, 'full_house_8p', newlyUnlocked);
    }
    if ((enriched.wordsGuessed || 0) >= 5 && (enriched.wordsSwapped || 0) === 0) {
      this.unlockAchievement(stats, 'zero_swap', newlyUnlocked);
    }
    if (stats.totalGamesPlayed >= 10) {
      this.unlockAchievement(stats, 'veteran_10', newlyUnlocked);
    }

    // Daily challenge completion & streak
    if (enriched.mode === 'daily') {
      const dateKey = enriched.dailyDateKey || getDateKey();
      const record = this.completeDailyChallenge(dateKey, enriched.wordsGuessed || 0, userId);
      if (stats.lastDailyDateKey !== dateKey) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = getDateKey(yesterday);
        stats.dailyStreak = stats.lastDailyDateKey === yesterdayKey ? stats.dailyStreak + 1 : 1;
        stats.lastDailyDateKey = dateKey;
      }
      this.unlockAchievement(stats, 'daily_hero', newlyUnlocked);
      if (userId) {
        saveDailyChallengeToCloud(userId, record).catch(() => {
          this.enqueueSync({ type: 'daily', payload: record });
        });
      }
    }

    this.saveStats(stats);

    // Update per-player leaderboard
    const updatedProfiles = this.updatePlayerProfiles(enriched);

    // Sync to cloud or enqueue offline
    if (userId) {
      saveMatchToCloud(userId, enriched, settings, stats).catch(() => {
        this.enqueueSync({ type: 'match', payload: { entry: enriched, settings } });
      });
      syncPlayerProfilesToCloud(userId, updatedProfiles).catch(() => {});
    } else {
      this.enqueueSync({ type: 'match', payload: { entry: enriched, settings } });
    }

    return { history: updatedHistory, stats, newlyUnlocked };
  }

  // ---- PLAYER LEADERBOARD ----
  getPlayerProfiles(): PlayerProfileStats[] {
    const map = safeReadJSON<Record<string, PlayerProfileStats>>(KEYS.PLAYER_PROFILES, {});
    return Object.values(map).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.wordsGuessed !== a.wordsGuessed) return b.wordsGuessed - a.wordsGuessed;
      return b.gamesPlayed - a.gamesPlayed;
    });
  }

  private updatePlayerProfiles(entry: GameHistoryEntry): PlayerProfileStats[] {
    const map = safeReadJSON<Record<string, PlayerProfileStats>>(KEYS.PLAYER_PROFILES, {});
    const winnerSet = new Set(entry.winnerNames.map(normalizePlayerKey));
    const avgWords = entry.players.length > 0 ? Math.round((entry.wordsGuessed || 0) / entry.players.length) : 0;
    const nowIso = new Date().toISOString();
    const touched: PlayerProfileStats[] = [];

    entry.players.forEach(rawName => {
      const name = rawName.trim();
      if (!name) return;
      const key = normalizePlayerKey(name);
      const prev = map[key] || {
        key,
        name,
        gamesPlayed: 0,
        wins: 0,
        wordsGuessed: 0,
        lastPlayedAt: nowIso
      };
      const updated: PlayerProfileStats = {
        ...prev,
        name,
        gamesPlayed: prev.gamesPlayed + 1,
        wins: prev.wins + (winnerSet.has(key) ? 1 : 0),
        wordsGuessed: prev.wordsGuessed + avgWords,
        lastPlayedAt: nowIso
      };
      map[key] = updated;
      touched.push(updated);
    });

    safeWriteJSON(KEYS.PLAYER_PROFILES, map);
    return touched;
  }

  // ---- CUSTOM WORD PACKS ----
  getCustomPacks(): CustomWordPack[] {
    return safeReadJSON<CustomWordPack[]>(KEYS.CUSTOM_PACKS, []);
  }

  createCustomPack(
    input: { title: string; description?: string; language: Language; difficulty: WordDifficulty; words: string[] },
    userId?: string | null
  ): { pack: CustomWordPack; newlyUnlocked: AchievementId[] } {
    const cleanedWords = Array.from(new Set(input.words.map(w => w.trim()).filter(Boolean))).slice(0, 200);
    const now = new Date().toISOString();
    const id = `pack_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const pack: CustomWordPack = {
      id,
      title: input.title.trim().slice(0, 40),
      description: input.description?.trim().slice(0, 120) || '',
      language: input.language,
      difficulty: input.difficulty,
      words: cleanedWords,
      createdAt: now,
      updatedAt: now,
      shareCode: generateShareCode(`${id}_${input.title}`),
      playCount: 0
    };

    const packs = [pack, ...this.getCustomPacks()];
    safeWriteJSON(KEYS.CUSTOM_PACKS, packs);

    const stats = this.getStats();
    const newlyUnlocked: AchievementId[] = [];
    this.unlockAchievement(stats, 'pack_creator', newlyUnlocked);
    this.saveStats(stats);

    if (userId) {
      saveCustomPackToCloud(userId, pack).catch(() => {
        this.enqueueSync({ type: 'pack_save', payload: pack });
      });
      publishPackToCloud(userId, pack).catch(() => {});
      syncUserStatsToCloud(userId, stats).catch(() => {});
    } else {
      this.enqueueSync({ type: 'pack_save', payload: pack });
    }

    return { pack, newlyUnlocked };
  }

  deleteCustomPack(packId: string, userId?: string | null): CustomWordPack[] {
    const remaining = this.getCustomPacks().filter(p => p.id !== packId);
    safeWriteJSON(KEYS.CUSTOM_PACKS, remaining);
    if (userId) {
      deleteCustomPackFromCloud(userId, packId).catch(() => {
        this.enqueueSync({ type: 'pack_delete', payload: { packId } });
      });
    }
    return remaining;
  }

  importCustomPackFromToken(token: string, userId?: string | null): CustomWordPack | null {
    const decoded = decodeCustomPackToken(token);
    if (!decoded) return null;
    const { pack } = this.createCustomPack(decoded, userId);
    return pack;
  }

  // ---- SMART WORD MEMORY (ANTI-REPEAT ACROSS SESSIONS) ----
  getWordMemory(): Record<string, WordMemoryEntry> {
    return safeReadJSON<Record<string, WordMemoryEntry>>(KEYS.WORD_MEMORY, {});
  }

  recordWordOutcome(wordId: string, outcome: 'guessed' | 'swapped'): void {
    const mem = this.getWordMemory();
    const prev = mem[wordId] || {
      wordId,
      seenCount: 0,
      guessedCount: 0,
      swappedCount: 0,
      lastSeenAt: 0
    };
    mem[wordId] = {
      ...prev,
      seenCount: prev.seenCount + 1,
      guessedCount: prev.guessedCount + (outcome === 'guessed' ? 1 : 0),
      swappedCount: prev.swappedCount + (outcome === 'swapped' ? 1 : 0),
      lastSeenAt: Date.now()
    };
    safeWriteJSON(KEYS.WORD_MEMORY, mem);
  }

  prioritizeUnseenIndices(indices: number[], getWordId: (idx: number) => string): number[] {
    const mem = this.getWordMemory();
    const unseen: number[] = [];
    const seen: number[] = [];
    for (const idx of indices) {
      const id = getWordId(idx);
      if (mem[id] && mem[id].seenCount > 0) {
        seen.push(idx);
      } else {
        unseen.push(idx);
      }
    }
    const shuffle = (arr: number[]) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    // Unseen words come first (shuffled), followed by least-recently-seen words
    seen.sort((a, b) => (mem[getWordId(a)]?.lastSeenAt || 0) - (mem[getWordId(b)]?.lastSeenAt || 0));
    return [...shuffle(unseen), ...seen];
  }

  // ---- DAILY CHALLENGE ----
  completeDailyChallenge(dateKey: string, wordsGuessed: number, userId?: string | null): DailyChallengeRecord {
    const map = safeReadJSON<Record<string, DailyChallengeRecord>>(KEYS.DAILY_CHALLENGES, {});
    const base = getDailyChallengeForDate(new Date(`${dateKey}T12:00:00`));
    const updated: DailyChallengeRecord = {
      ...base,
      completed: true,
      bestWordsGuessed: Math.max(base.bestWordsGuessed || 0, wordsGuessed),
      completedAt: new Date().toISOString()
    };
    map[dateKey] = updated;
    safeWriteJSON(KEYS.DAILY_CHALLENGES, map);
    if (userId) {
      saveDailyChallengeToCloud(userId, updated).catch(() => {});
    }
    return updated;
  }

  // ---- OFFLINE SYNC QUEUE & CLOUD HYDRATION ----
  private enqueueSync(item: SyncQueueItem): void {
    const queue = safeReadJSON<SyncQueueItem[]>(KEYS.SYNC_QUEUE, []);
    queue.push(item);
    safeWriteJSON(KEYS.SYNC_QUEUE, queue.slice(-100));
  }

  getPendingSyncCount(): number {
    return safeReadJSON<SyncQueueItem[]>(KEYS.SYNC_QUEUE, []).length;
  }

  async syncWithCloud(userId: string): Promise<{ cloudSettings: GameSettings | null; syncedItems: number }> {
    let syncedItems = 0;
    const queue = safeReadJSON<SyncQueueItem[]>(KEYS.SYNC_QUEUE, []);
    const remaining: SyncQueueItem[] = [];
    const stats = this.getStats();

    for (const item of queue) {
      try {
        if (item.type === 'match') {
          await saveMatchToCloud(userId, item.payload.entry, item.payload.settings, stats);
        } else if (item.type === 'pack_save') {
          await saveCustomPackToCloud(userId, item.payload);
        } else if (item.type === 'pack_delete') {
          await deleteCustomPackFromCloud(userId, item.payload.packId);
        } else if (item.type === 'daily') {
          await saveDailyChallengeToCloud(userId, item.payload);
        }
        syncedItems += 1;
      } catch {
        remaining.push(item);
      }
    }
    safeWriteJSON(KEYS.SYNC_QUEUE, remaining);

    // Hydrate from cloud & merge
    const [cloudSettings, cloudStats, cloudPacks, cloudHistory] = await Promise.all([
      fetchSettingsFromCloud(userId),
      fetchUserStatsFromCloud(userId),
      fetchCustomPacksFromCloud(userId),
      fetchUserMatchHistory(userId)
    ]);

    if (cloudStats) {
      const localStats = this.getStats();
      const mergedAchievements = new Map(localStats.unlockedAchievements.map(a => [a.id, a]));
      cloudStats.unlockedAchievements?.forEach(a => {
        if (!mergedAchievements.has(a.id)) mergedAchievements.set(a.id, a);
      });
      const mergedLanguages = Array.from(new Set([...localStats.languagesPlayed, ...(cloudStats.languagesPlayed || [])]));
      const mergedXp = Math.max(localStats.xp, cloudStats.xp || 0);
      const merged: UserAggregateStats = {
        totalGamesPlayed: Math.max(localStats.totalGamesPlayed, cloudStats.totalGamesPlayed || 0),
        totalWordsGuessed: Math.max(localStats.totalWordsGuessed, cloudStats.totalWordsGuessed || 0),
        totalWordsSwapped: Math.max(localStats.totalWordsSwapped, cloudStats.totalWordsSwapped || 0),
        languagesPlayed: mergedLanguages,
        dailyStreak: Math.max(localStats.dailyStreak, cloudStats.dailyStreak || 0),
        lastDailyDateKey: localStats.lastDailyDateKey || cloudStats.lastDailyDateKey,
        xp: mergedXp,
        level: calculateLevelFromXp(mergedXp),
        unlockedAchievements: Array.from(mergedAchievements.values())
      };
      this.saveStats(merged);
      await syncUserStatsToCloud(userId, merged);
    }

    if (cloudPacks.length > 0) {
      const localPacks = this.getCustomPacks();
      const byId = new Map(localPacks.map(p => [p.id, p]));
      cloudPacks.forEach(p => { if (!byId.has(p.id)) byId.set(p.id, p); });
      safeWriteJSON(KEYS.CUSTOM_PACKS, Array.from(byId.values()));
    }

    if (cloudHistory.length > 0) {
      const localHistory = this.getHistory();
      const byId = new Map(localHistory.map(m => [m.id, m]));
      cloudHistory.forEach(m => { if (!byId.has(m.id)) byId.set(m.id, m); });
      const mergedHistory = Array.from(byId.values())
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 50);
      safeWriteJSON(KEYS.HISTORY, mergedHistory);
    }

    if (!cloudSettings) {
      const localSettings = safeReadJSON<GameSettings | null>(KEYS.SETTINGS, null);
      if (localSettings) {
        await syncSettingsToCloud(userId, localSettings);
      }
    }

    return { cloudSettings, syncedItems };
  }
}

export const dbRepo = new LocalFirstDatabase();
