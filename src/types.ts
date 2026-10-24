export type DifficultyLevel = 'cp1' | 'cp2' | 'ce1';
export type TerrainTheme = 'snow-forest' | 'ice-plain' | 'crystal-valley';

export interface CurriculumItem {
  id: string;
  level: DifficultyLevel;
  type: 'word' | 'sentence' | 'spelling';
  content: string; // The text to read or write
  hint: string;
  syllables?: string[]; // e.g. ["ro", "bot"]
  scrambled?: string[]; // for spelling/arranging
  category: 'animaux' | 'neige' | 'aventure' | 'robot';
  explanation: string;
}

export interface UpgradeItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  costSnow: number;
  unlocked: boolean;
  equipped: boolean;
  type: 'cannon' | 'tank' | 'speed' | 'cosmetic' | 'shield';
  bonus: string;
  challengeRequired: CurriculumItem;
}

export interface Trophy {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlockedAt: number | null;
}

export type RewardCategory = 'reading' | 'writing' | 'robot' | 'snow';
export type RewardRarity = 'common' | 'rare' | 'legendary';

export interface StickerReward {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  category: RewardCategory;
  rarity: RewardRarity;
  glowColor: string;
  borderColor: string;
  unlockedAt: number | null;
  placedX?: number; // 0-100% position on the album sheet
  placedY?: number;
  isStuckOnAlbum?: boolean;
}

export interface ParentStats {
  wordsReadCount: number;
  wordsWrittenCount: number;
  totalPlayTimeMinutes: number;
  accuracyRate: number; // percentage
  challengesCompleted: number;
  snowballsThrown: number;
  snowCollected: number;
  currentLevel: DifficultyLevel;
  lastSessionDate: string;
  masteredWords: string[];
}

export interface PlayerState {
  snowAmmo: number;
  maxSnow: number;
  stars: number;
  score: number;
  health: number;
  maxHealth: number;
  speedMultiplier: number;
  cannonTier: number;
  hasShield: boolean;
  colorTheme: string;
  unlockedUpgrades: string[];
  equippedUpgrades: Record<string, boolean>;
  gameLevel: number;
}

export type LevelMode = 'clear' | 'defend';

export interface LevelConfig {
  number: number;
  mode: LevelMode;
  enemyCount: number;
  enemyHp: number;
  enemyScale: number;
  enemySpeed: number;
  throwInterval: number;
  duration: number; // secondes (mode défense)
  castleHp: number;
  title: string;
  hint: string;
}

export interface LevelProgress {
  level: number;
  mode: LevelMode;
  killed: number;
  total: number;
  timeLeft: number;
  castleHp: number;
  castleMaxHp: number;
}
