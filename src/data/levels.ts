import { LevelConfig } from '../types';

// Puissance exigée aux niveaux 4, 7, 10, 13... (tous les 3 niveaux)
const POWER_GATES = [20, 45, 80, 130, 190, 260, 300];

export function requiredPowerFor(level: number): number {
  if (level < 4 || (level - 1) % 3 !== 0) return 0;
  const gate = (level - 1) / 3 - 1;
  return POWER_GATES[Math.min(gate, POWER_GATES.length - 1)];
}

/**
 * Niveaux impairs : éclater tous les bonshommes.
 * Niveaux pairs : défendre le château pendant 1 minute.
 * Niveaux 5, 10, 15... : boss.
 * Les bonshommes deviennent plus résistants et frappent plus fort à chaque niveau :
 * sans amélioration du robot, la victoire devient impossible.
 */
export function getLevelConfig(level: number): LevelConfig {
  const n = Math.max(1, Math.floor(level));
  const d = n - 1;
  const growth = Math.pow(1.18, d);
  const common = {
    number: n,
    enemyScale: Math.min(1 + d * 0.06, 1.8),
    enemySpeed: Math.min(1.3 + d * 0.06, 2.6),
    throwInterval: Math.max(5 - d * 0.15, 2.2),
    enemyDamage: Math.round(10 + d * 1.5),
    requiredPower: requiredPowerFor(n),
  };

  // Tous les 5 niveaux : un boss géant protégé par un bouclier que seule la lecture brise
  if (n % 5 === 0) {
    return {
      ...common,
      mode: 'boss',
      enemyCount: 1,
      enemyHp: Math.round(3 * growth * 8),
      enemyScale: 2.4,
      enemySpeed: Math.min(1 + d * 0.04, 2),
      throwInterval: Math.max(common.throwInterval * 0.6, 1.5),
      duration: 0,
      castleHp: 0,
      title: `Niveau ${n} : Le Boss des neiges`,
      hint: 'Lis une phrase pour briser le bouclier du Boss ! 👑',
    };
  }

  if (n % 2 === 1) {
    const enemyCount = Math.min(5 + Math.floor(d / 2) * 2, 14);
    return {
      ...common,
      mode: 'clear',
      enemyCount,
      enemyHp: Math.round(3 * growth),
      duration: 0,
      castleHp: 0,
      title: `Niveau ${n} : Chasse aux bonshommes`,
      hint: `Éclate les ${enemyCount} bonshommes de neige ! ⛄`,
    };
  }

  return {
    ...common,
    mode: 'defend',
    enemyCount: Math.min(8 + Math.floor(d / 2), 16),
    enemyHp: Math.max(2, Math.round(2 * growth)),
    duration: 60,
    castleHp: 100,
    title: `Niveau ${n} : Défends le château`,
    hint: 'Protège le château pendant 1 minute ! 🏰',
  };
}
