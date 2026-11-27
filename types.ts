export enum TeamColor {
  Blue = 'BLUE',
  Red = 'RED',
  Green = 'GREEN',
  Yellow = 'YELLOW'
}

export type Language = 'fa' | 'en' | 'nl' | 'de' | 'fr' | 'ar' | 'tr' | 'pl' | 'uk';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'all';
export type WordDifficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'classic' | 'daily' | 'custom';

export interface Player {
  id: number;
  name: string;
  teamId: number;
  teamColor: TeamColor;
}

export interface Team {
  id: number;
  color: TeamColor;
  timeRemaining: number;
  isEliminated: boolean;
  playerIds: number[];
  wordsGuessed?: number;
}

export interface GameSettings {
  playerCount: 4 | 6 | 8;
  roundsCount: number;
  roundDuration: number;
  difficulty?: DifficultyLevel;
  selectedCategories: string[];
  selectedCustomPackIds?: string[];
  playerNames: string[];
  language: Language;
  soundEnabled?: boolean;
  sfxEnabled?: boolean;
  bgmEnabled?: boolean;
  passPhoneScreenEnabled?: boolean;
}

export interface GameHistoryEntry {
  id: string;
  date: string;
  timestamp?: number;
  players: string[];
  winnerColor: TeamColor | 'TIE';
  winnerNames: string[];
  language: Language;
  difficulty?: DifficultyLevel;
  roundsCount?: number;
  roundDuration?: number;
  categories?: string[];
  wordsGuessed?: number;
  wordsSwapped?: number;
  mvpPlayer?: string;
  mode?: GameMode;
  dailyDateKey?: string;
}

export interface CustomWordPack {
  id: string;
  title: string;
  description?: string;
  language: Language;
  difficulty: WordDifficulty;
  words: string[];
  createdAt: string;
  updatedAt: string;
  shareCode: string;
  playCount: number;
}

export interface PlayerProfileStats {
  key: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  wordsGuessed: number;
  lastPlayedAt: string;
}

export interface WordMemoryEntry {
  wordId: string;
  seenCount: number;
  guessedCount: number;
  swappedCount: number;
  lastSeenAt: number;
}

export type AchievementId =
  | 'first_win'
  | 'polyglot'
  | 'proverb_master'
  | 'speed_demon'
  | 'marathon'
  | 'pack_creator'
  | 'daily_hero'
  | 'full_house_8p'
  | 'zero_swap'
  | 'veteran_10';

export interface UnlockedAchievement {
  id: AchievementId;
  unlockedAt: string;
}

export interface DailyChallengeRecord {
  dateKey: string;
  seed: number;
  categories: string[];
  difficulty: DifficultyLevel;
  completed: boolean;
  bestWordsGuessed: number;
  completedAt?: string;
}

export interface UserAggregateStats {
  totalGamesPlayed: number;
  totalWordsGuessed: number;
  totalWordsSwapped: number;
  languagesPlayed: Language[];
  dailyStreak: number;
  lastDailyDateKey?: string;
  xp: number;
  level: number;
  unlockedAchievements: UnlockedAchievement[];
}

export enum GameStatus {
  Splash = 'SPLASH',
  Setup = 'SETUP',
  SeatingConfirm = 'SEATING_CONFIRM',
  ActiveTurn = 'ACTIVE_TURN',
  PassPhone = 'PASS_PHONE',
  Paused = 'PAUSED',
  RoundEnded = 'ROUND_ENDED',
  TeamEliminated = 'TEAM_ELIMINATED',
  WordExhaustion = 'WORD_EXHAUSTION',
  GameEnded = 'GAME_ENDED',
  WinnerScreen = 'WINNER_SCREEN',
  // Backward-compatibility aliases
  RoundStarting = 'PASS_PHONE',
  Playing = 'ACTIVE_TURN',
  RoundFinished = 'ROUND_ENDED',
  GameOver = 'WINNER_SCREEN',
  Help = 'PAUSED'
}
