import { LevelConfig } from '../types';

/**
 * Niveaux impairs : éclater tous les bonshommes.
 * Niveaux pairs : défendre le château pendant 1 minute.
 * La difficulté augmente tous les 2 niveaux.
 */
export function getLevelConfig(level: number): LevelConfig {
  const n = Math.max(1, Math.floor(level));
  const stage = Math.floor((n - 1) / 2);

  if (n % 2 === 1) {
    const enemyCount = Math.min(5 + stage * 2, 13);
    return {
      number: n,
      mode: 'clear',
      enemyCount,
      enemyHp: Math.min(3 + stage * 2, 9),
      enemyScale: Math.min(1 + stage * 0.25, 1.75),
      enemySpeed: Math.min(1.3 + stage * 0.2, 2.4),
      throwInterval: Math.max(5 - stage * 0.5, 2.5),
      duration: 0,
      castleHp: 0,
      title: `Niveau ${n} : Chasse aux bonshommes`,
      hint: `Éclate les ${enemyCount} bonshommes de neige ! ⛄`,
    };
  }

  return {
    number: n,
    mode: 'defend',
    enemyCount: Math.min(8 + stage * 2, 16),
    enemyHp: Math.min(2 + stage, 6),
    enemySpeed: Math.min(1.4 + stage * 0.15, 2.4),
    enemyScale: Math.min(0.9 + stage * 0.15, 1.5),
    throwInterval: Math.max(6 - stage * 0.5, 3),
    duration: 60,
    castleHp: 100,
    title: `Niveau ${n} : Défends le château`,
    hint: 'Protège le château pendant 1 minute ! 🏰',
  };
}
