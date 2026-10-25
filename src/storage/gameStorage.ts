import { ParentStats, PlayerState, Trophy, UpgradeItem, StickerReward } from '../types';
import { TROPHIES_LIST, STICKERS_LIST } from '../data/curriculum';
import { INITIAL_UPGRADES } from '../data/upgrades';

const STORAGE_KEYS = {
  PLAYER: 'roboneige_player_state_v1',
  UPGRADES: 'roboneige_upgrades_v1',
  STATS: 'roboneige_parent_stats_v1',
  TROPHIES: 'roboneige_trophies_v1',
  STICKERS: 'roboneige_stickers_v1'
};

const DEFAULT_PLAYER_STATE: PlayerState = {
  snowAmmo: 5,
  stars: 0,
  score: 0,
  health: 100,
  gameLevel: 1
};

const DEFAULT_PARENT_STATS: ParentStats = {
  wordsReadCount: 0,
  wordsWrittenCount: 0,
  totalPlayTimeMinutes: 1,
  accuracyRate: 100,
  answersTotal: 0,
  answersCorrect: 0,
  dailyLimitMinutes: 120,
  challengesCompleted: 0,
  snowballsThrown: 0,
  snowCollected: 5,
  currentLevel: 'cp1',
  lastSessionDate: new Date().toISOString(),
  masteredWords: []
};

export function loadPlayerState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER);
    if (raw) {
      const state: PlayerState = { ...DEFAULT_PLAYER_STATE, ...JSON.parse(raw) };
      // Un robot sans énergie repart avec un peu de vie (la vie max est recalculée par l'App)
      if (state.health <= 0) state.health = 100;
      return state;
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return DEFAULT_PLAYER_STATE;
}

export function savePlayerState(state: PlayerState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(state));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function loadUpgrades(): UpgradeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPGRADES);
    if (raw) {
      const saved: Record<string, { unlocked: boolean; equipped: boolean }> = JSON.parse(raw);
      return INITIAL_UPGRADES.map(u => ({
        ...u,
        unlocked: saved[u.id]?.unlocked ?? u.unlocked,
        equipped: saved[u.id]?.equipped ?? u.equipped
      }));
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return INITIAL_UPGRADES;
}

export function saveUpgrades(upgrades: UpgradeItem[]): void {
  try {
    const map: Record<string, { unlocked: boolean; equipped: boolean }> = {};
    upgrades.forEach(u => {
      map[u.id] = { unlocked: u.unlocked, equipped: u.equipped };
    });
    localStorage.setItem(STORAGE_KEYS.UPGRADES, JSON.stringify(map));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function loadParentStats(): ParentStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) return { ...DEFAULT_PARENT_STATS, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return DEFAULT_PARENT_STATS;
}

export function saveParentStats(stats: ParentStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function loadTrophies(): Trophy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TROPHIES);
    if (raw) {
      const saved: Record<string, number | null> = JSON.parse(raw);
      return TROPHIES_LIST.map(t => ({
        ...t,
        unlockedAt: saved[t.id] !== undefined ? saved[t.id] : t.unlockedAt
      }));
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return TROPHIES_LIST;
}

export function saveTrophies(trophies: Trophy[]): void {
  try {
    const map: Record<string, number | null> = {};
    trophies.forEach(t => {
      map[t.id] = t.unlockedAt;
    });
    localStorage.setItem(STORAGE_KEYS.TROPHIES, JSON.stringify(map));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function loadStickers(): StickerReward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STICKERS);
    if (raw) {
      const saved: Record<string, { unlockedAt: number | null; placedX?: number; placedY?: number; isStuckOnAlbum?: boolean }> = JSON.parse(raw);
      return STICKERS_LIST.map(s => ({
        ...s,
        unlockedAt: saved[s.id]?.unlockedAt !== undefined ? saved[s.id].unlockedAt : s.unlockedAt,
        placedX: saved[s.id]?.placedX ?? s.placedX,
        placedY: saved[s.id]?.placedY ?? s.placedY,
        isStuckOnAlbum: saved[s.id]?.isStuckOnAlbum ?? s.isStuckOnAlbum
      }));
    }
  } catch (e) {
    console.warn('Storage read error:', e);
  }
  return STICKERS_LIST;
}

export function saveStickers(stickers: StickerReward[]): void {
  try {
    const map: Record<string, { unlockedAt: number | null; placedX?: number; placedY?: number; isStuckOnAlbum?: boolean }> = {};
    stickers.forEach(s => {
      map[s.id] = {
        unlockedAt: s.unlockedAt,
        placedX: s.placedX,
        placedY: s.placedY,
        isStuckOnAlbum: s.isStuckOnAlbum
      };
    });
    localStorage.setItem(STORAGE_KEYS.STICKERS, JSON.stringify(map));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PLAYER);
    localStorage.removeItem(STORAGE_KEYS.UPGRADES);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.TROPHIES);
    localStorage.removeItem(STORAGE_KEYS.STICKERS);
  } catch (e) {
    console.warn('Reset error:', e);
  }
}
