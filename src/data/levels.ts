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
