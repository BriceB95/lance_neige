import { RobotStats, UpgradeCategory, UpgradeItem } from '../types';

export const BASE_STATS: RobotStats = {
  damage: 1,
  multishot: 1,
  ballSize: 1,
  maxSnow: 10,
  snowPerPile: 3,
  pickupRadius: 2,
  speed: 1,
  maxHealth: 100,
  armor: 0,
  heartHeal: 10,
};

export const BASE_POWER = 10;
export const DEFAULT_PAINT = 0x0284c7;

// Par palier : puissance gagnée, nombre de défis, niveau de jeu requis
export const TIERS = [
  { tier: 1, power: 2, challenges: 1, minLevel: 1 },
  { tier: 2, power: 4, challenges: 1, minLevel: 4 },
  { tier: 3, power: 6, challenges: 2, minLevel: 7 },
  { tier: 4, power: 8, challenges: 2, minLevel: 10 },
  { tier: 5, power: 10, challenges: 3, minLevel: 13 },
];

export const CATEGORIES: { id: UpgradeCategory; label: string; icon: string }[] = [
  { id: 'canon', label: 'Canon', icon: '🎯' },
  { id: 'reservoir', label: 'Réservoir', icon: '❄️' },
  { id: 'moteur', label: 'Moteur', icon: '⚡' },
  { id: 'armure', label: 'Armure', icon: '🛡️' },
  { id: 'gadget', label: 'Gadgets', icon: '🧲' },
  { id: 'style', label: 'Style', icon: '🎨' },
];

type Def = [
  id: string,
  tier: number,
  category: UpgradeCategory,
  icon: string,
  name: string,
  description: string,
  stats: Partial<RobotStats>,
  extra?: { paint?: number; crown?: boolean }
];

const DEFS: Def[] = [
  // Palier 1
  ['upgrade-cannon', 1, 'canon', '🎯', 'Super Lanceur Double', 'Tire 2 boules de neige à la fois !', { multishot: 1 }],
  ['t1-boules-tassees', 1, 'canon', '⚪', 'Boules Tassées', 'Des boules bien serrées qui tapent plus fort.', { damage: 0.5 }],
  ['upgrade-tank', 1, 'reservoir', '❄️', 'Réservoir XL Glacé', 'Plus de place pour stocker la neige !', { maxSnow: 10 }],
  ['t1-pelle', 1, 'reservoir', '🪣', 'Pelle à Neige Rapide', 'Ramasse plus de neige sur chaque tas.', { snowPerPile: 1 }],
  ['upgrade-speed', 1, 'moteur', '⚡', 'Chenilles Turbo Polaires', 'Le robot file sur la neige fraîche !', { speed: 0.2 }],
  ['upgrade-shield', 1, 'armure', '🧣', 'Écharpe Bouclier Magique', 'Une écharpe qui amortit les boules de neige.', { armor: 10 }],
  ['t1-casque', 1, 'armure', '🧢', 'Casque en Laine', 'Bien au chaud, le robot tient plus longtemps.', { maxHealth: 20 }],
  ['t1-aimant', 1, 'gadget', '🧲', 'Petit Aimant à Flocons', 'Attire la neige de plus loin.', { pickupRadius: 0.5 }],
  ['upgrade-gold', 1, 'style', '✨', 'Armure Dorée Étincelante', 'Le robot brille comme de l\'or !', {}, { paint: 0xf59e0b }],
  ['t1-rouge', 1, 'style', '🚒', 'Peinture Rouge Pompier', 'Une belle carrosserie rouge vif.', {}, { paint: 0xdc2626 }],

  // Palier 2
  ['upgrade-storm', 2, 'canon', '🌪️', 'Méga Rafale de Flocons', 'Des boules plus grosses et plus fortes.', { ballSize: 0.3, damage: 0.5 }],
  ['t2-canon-glace', 2, 'canon', '🧊', 'Canon de Glace', 'Des boules dures comme la glace.', { damage: 1 }],
  ['t2-reservoir-geant', 2, 'reservoir', '🛢️', 'Réservoir Géant', 'Encore plus de neige dans le robot.', { maxSnow: 10 }],
  ['t2-double-pelle', 2, 'reservoir', '⛏️', 'Double Pelle', 'Deux pelles pour ramasser deux fois plus vite.', { snowPerPile: 1 }],
  ['t2-skis', 2, 'moteur', '🎿', 'Skis Glisse-Vite', 'Le robot glisse comme un champion.', { speed: 0.15 }],
  ['t2-gilet', 2, 'armure', '🦺', 'Gilet en Duvet', 'Un gilet tout doux et très solide.', { maxHealth: 25 }],
  ['t2-bouclier-bois', 2, 'armure', '🪵', 'Bouclier en Bois', 'Un bouclier qui arrête les boules.', { armor: 8 }],
  ['t2-coeur', 2, 'gadget', '💗', 'Cœur Chaleureux', 'Les cœurs soignent plus.', { heartHeal: 5 }],
  ['t2-phares', 2, 'gadget', '🔦', 'Phares Antibrouillard', 'Repère la neige de plus loin.', { pickupRadius: 0.5 }],
  ['t2-vert', 2, 'style', '🌲', 'Peinture Vert Sapin', 'Une carrosserie couleur forêt.', {}, { paint: 0x16a34a }],

  // Palier 3
  ['t3-triple', 3, 'canon', '🔱', 'Lanceur Triple', 'Une boule de plus à chaque tir !', { multishot: 1 }],
  ['t3-boules-geantes', 3, 'canon', '☃️', 'Boules Géantes', 'Des boules énormes, impossibles à rater.', { ballSize: 0.3, damage: 0.5 }],
  ['t3-silo', 3, 'reservoir', '🏗️', 'Silo à Neige', 'Un énorme stock de neige.', { maxSnow: 15 }],
  ['t3-aspirateur', 3, 'reservoir', '🌀', 'Aspirateur à Neige', 'Aspire beaucoup de neige d\'un coup.', { snowPerPile: 2 }],
  ['t3-reacteur', 3, 'moteur', '🔥', 'Petit Réacteur', 'Un réacteur qui pousse fort.', { speed: 0.15 }],
  ['t3-armure-glace', 3, 'armure', '🛡️', 'Armure de Glace', 'Une armure froide et solide.', { armor: 10, maxHealth: 10 }],
  ['t3-batterie', 3, 'armure', '🔋', 'Super Batterie', 'Beaucoup plus d\'énergie.', { maxHealth: 30 }],
  ['t3-trousse', 3, 'gadget', '🩹', 'Trousse de Secours', 'Les cœurs soignent encore plus.', { heartHeal: 5 }],
  ['t3-grand-aimant', 3, 'gadget', '🧭', 'Grand Aimant', 'Attire la neige de très loin.', { pickupRadius: 0.7 }],
  ['t3-rose', 3, 'style', '🍬', 'Peinture Rose Bonbon', 'Une carrosserie rose sucrée.', {}, { paint: 0xec4899 }],

  // Palier 4
  ['t4-canon-cristal', 4, 'canon', '💎', 'Canon de Cristal', 'Des boules brillantes et puissantes.', { damage: 1.5 }],
  ['t4-quadruple', 4, 'canon', '🎆', 'Rafale Quadruple', 'Encore une boule de plus par tir !', { multishot: 1 }],
  ['t4-citerne', 4, 'reservoir', '🚛', 'Citerne Polaire', 'Un réservoir grand comme un camion.', { maxSnow: 15 }],
  ['t4-chasse-neige', 4, 'reservoir', '🚜', 'Lame Chasse-Neige', 'Pousse et ramasse la neige.', { snowPerPile: 2, pickupRadius: 0.3 }],
  ['t4-turbo', 4, 'moteur', '🌌', 'Turbo Aurore', 'Un turbo magique très rapide.', { speed: 0.2 }],
  ['t4-carapace', 4, 'armure', '🐢', 'Carapace de Tortue', 'Une carapace super résistante.', { armor: 10 }],
  ['t4-coeur-acier', 4, 'armure', '🫀', 'Cœur d\'Acier', 'Une énergie énorme.', { maxHealth: 40 }],
  ['t4-elixir', 4, 'gadget', '🧪', 'Élixir des Neiges', 'Les cœurs soignent beaucoup plus.', { heartHeal: 10 }],
  ['t4-couronne', 4, 'style', '👑', 'Couronne Royale', 'Le robot devient le roi de la banquise.', {}, { crown: true }],
  ['t4-violet', 4, 'style', '🔮', 'Peinture Violet Magique', 'Une carrosserie violette enchantée.', {}, { paint: 0x7c3aed }],

  // Palier 5
  ['t5-etoile-filante', 5, 'canon', '🌠', 'Canon Étoile Filante', 'Des boules rapides comme des étoiles.', { damage: 2 }],
  ['t5-tempete', 5, 'canon', '🌨️', 'Tempête Arctique', 'Une vraie tempête de boules de neige !', { multishot: 1, ballSize: 0.2 }],
  ['t5-glacier', 5, 'reservoir', '🏔️', 'Réservoir Glacier', 'Un glacier entier dans le robot.', { maxSnow: 20 }],
  ['t5-pelleteuse', 5, 'reservoir', '🦾', 'Bras Pelleteuse', 'Un bras géant pour la neige.', { snowPerPile: 2 }],
  ['t5-fusee', 5, 'moteur', '🚀', 'Moteur Fusée', 'Le robot va aussi vite qu\'une fusée !', { speed: 0.25 }],
  ['t5-dragon', 5, 'armure', '🐉', 'Écailles de Dragon', 'Des écailles que rien ne traverse.', { armor: 12 }],
  ['t5-titan', 5, 'armure', '💪', 'Énergie de Titan', 'La force d\'un géant.', { maxHealth: 50 }],
  ['t5-ange', 5, 'gadget', '😇', 'Ailes d\'Ange Gardien', 'Les cœurs soignent énormément.', { heartHeal: 10 }],
  ['t5-chrome', 5, 'style', '🪞', 'Chrome Miroir', 'Une carrosserie brillante comme un miroir.', {}, { paint: 0xcbd5e1 }],
  ['t5-nuit', 5, 'style', '🌃', 'Nuit Étoilée', 'Une carrosserie bleu nuit.', {}, { paint: 0x1e1b4b }],
];

export const INITIAL_UPGRADES: UpgradeItem[] = DEFS.map(([id, tier, category, icon, name, description, stats, extra]) => {
  const t = TIERS[tier - 1];
  return {
    id,
    name,
    icon,
    description,
    category,
    tier,
    power: t.power,
    challenges: t.challenges,
    stats,
    paint: extra?.paint,
    crown: extra?.crown,
    unlocked: false,
    equipped: false,
  };
});

export function tierMinLevel(tier: number): number {
  return TIERS[tier - 1]?.minLevel ?? 1;
}

/** Texte court du bonus, généré à partir des stats */
export function describeBonus(u: UpgradeItem): string {
  const s = u.stats;
  const parts: string[] = [];
  if (s.damage) parts.push(`+${s.damage} dégâts`);
  if (s.multishot) parts.push(`+${s.multishot} boule par tir`);
  if (s.ballSize) parts.push(`Boules +${Math.round(s.ballSize * 100)}%`);
  if (s.maxSnow) parts.push(`+${s.maxSnow} places de neige`);
  if (s.snowPerPile) parts.push(`+${s.snowPerPile} neige par tas`);
  if (s.pickupRadius) parts.push(`Ramassage +${s.pickupRadius} m`);
  if (s.speed) parts.push(`Vitesse +${Math.round(s.speed * 100)}%`);
  if (s.maxHealth) parts.push(`+${s.maxHealth} énergie max`);
  if (s.armor) parts.push(`-${s.armor}% de dégâts reçus`);
  if (s.heartHeal) parts.push(`Cœurs +${s.heartHeal}%`);
  if (u.paint !== undefined) parts.push('Nouvelle couleur');
  if (u.crown) parts.push('Couronne');
  return parts.join(' • ');
}

/** Statistiques du robot : toutes les améliorations débloquées s'additionnent */
export function computeRobotStats(upgrades: UpgradeItem[]): RobotStats {
  const stats = { ...BASE_STATS };
  for (const u of upgrades) {
    if (!u.unlocked) continue;
    for (const key of Object.keys(u.stats) as (keyof RobotStats)[]) {
      stats[key] += u.stats[key] ?? 0;
    }
  }
  stats.armor = Math.min(60, stats.armor);
  return stats;
}

export function computePower(upgrades: UpgradeItem[]): number {
  return upgrades.reduce((sum, u) => sum + (u.unlocked ? u.power : 0), BASE_POWER);
}

/** Apparence : peinture équipée (une seule à la fois) et couronne */
export function computeLook(upgrades: UpgradeItem[]): { paint: number; crown: boolean } {
  const painted = upgrades.find((u) => u.unlocked && u.equipped && u.paint !== undefined);
  const crown = upgrades.some((u) => u.unlocked && u.equipped && u.crown);
  return { paint: painted?.paint ?? DEFAULT_PAINT, crown };
}
