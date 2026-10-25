export type DifficultyLevel = 'cp1' | 'cp2' | 'ce1';
export type TerrainTheme = 'snow-forest' | 'ice-plain' | 'crystal-valley';

export interface CurriculumItem {
  id: string;
  level: DifficultyLevel;
  type: 'word' | 'sentence';
  content: string; // Le texte à lire ou écrire
  emoji: string; // Image associée (vérifie que l'enfant a compris ce qu'il a lu)
  hint: string;
  syllables?: string[]; // ex. ["RO", "BOT"]
  explanation?: string;
}

export type UpgradeCategory = 'canon' | 'reservoir' | 'moteur' | 'armure' | 'gadget' | 'style';

export interface RobotStats {
  damage: number; // dégâts par boule
  multishot: number; // boules par tir
  ballSize: number; // multiplicateur de taille des boules
  maxSnow: number;
  snowPerPile: number;
  pickupRadius: number;
  speed: number; // multiplicateur de vitesse
  maxHealth: number;
  armor: number; // % de dégâts en moins
  heartHeal: number; // % d'énergie rendue par cœur
}

export interface UpgradeItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: UpgradeCategory;
  tier: number; // 1 à 5
  power: number; // puissance ajoutée au robot
  challenges: number; // nombre de défis lecture/écriture à réussir
  stats: Partial<RobotStats>;
  paint?: number; // couleur de carrosserie (style)
  crown?: boolean;
  unlocked: boolean;
  equipped: boolean;
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
  answersTotal: number;
  answersCorrect: number;
  dailyLimitMinutes: number; // temps de jeu maximum par jour
  challengesCompleted: number;
  snowballsThrown: number;
  snowCollected: number;
  currentLevel: DifficultyLevel;
  lastSessionDate: string;
  masteredWords: string[];
}

export interface PlayerState {
  snowAmmo: number;
  stars: number;
  score: number;
  health: number;
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
  enemyDamage: number;
  requiredPower: number; // puissance minimale du robot pour entrer dans ce niveau (0 = libre)
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
