import { CurriculumItem, UpgradeItem, Trophy, StickerReward } from '../types';

export const CURRICULUM_ITEMS: CurriculumItem[] = [
  // Niveau 1 - CP (Mots simples phonétiques)
  {
    id: 'word-neige',
    level: 'cp1',
    type: 'word',
    content: 'NEIGE',
    syllables: ['NEI', 'GE'],
    scrambled: ['E', 'N', 'I', 'G', 'E'],
    hint: 'Blanche et froide, elle tombe du ciel en hiver !',
    category: 'neige',
    explanation: 'Le son "ei" fait comme dans reine ou neige.'
  },
  {
    id: 'word-robot',
    level: 'cp1',
    type: 'word',
    content: 'ROBOT',
    syllables: ['RO', 'BOT'],
    scrambled: ['T', 'O', 'B', 'O', 'R'],
    hint: 'Ton super ami en métal qui adore la neige !',
    category: 'robot',
    explanation: 'Le mot robot a deux syllabes : RO et BOT. Le T muet dort à la fin !'
  },
  {
    id: 'word-glace',
    level: 'cp1',
    type: 'word',
    content: 'GLACE',
    syllables: ['GLA', 'CE'],
    scrambled: ['A', 'C', 'L', 'E', 'G'],
    hint: 'Très froide et glissante sur le lac !',
    category: 'neige',
    explanation: 'Le C devant le E fait le son "ss" comme dans glace !'
  },
  {
    id: 'word-ami',
    level: 'cp1',
    type: 'word',
    content: 'AMI',
    syllables: ['A', 'MI'],
    scrambled: ['I', 'M', 'A'],
    hint: 'Une personne gentille avec qui on joue dans la cour !',
    category: 'aventure',
    explanation: 'Un mot tout court et doux avec 2 syllabes faciles : A - MI.'
  },
  {
    id: 'word-etoile',
    level: 'cp2',
    type: 'word',
    content: 'ÉTOILE',
    syllables: ['É', 'TOI', 'LE'],
    scrambled: ['L', 'E', 'É', 'T', 'O', 'I'],
    hint: 'Elle brille tout en haut dans le ciel la nuit !',
    category: 'aventure',
    explanation: 'Le son "oi" fait [wa] comme dans oiseau ou étoile !'
  },
  {
    id: 'word-ours',
    level: 'cp2',
    type: 'word',
    content: 'OURS',
    syllables: ['OURS'],
    scrambled: ['S', 'U', 'R', 'O'],
    hint: 'Le grand animal blanc qui vit sur la banquise.',
    category: 'animaux',
    explanation: 'Le son "ou" fait comme dans loup ou ours !'
  },
  {
    id: 'sent-douce',
    level: 'cp2',
    type: 'sentence',
    content: 'La neige est toute douce.',
    hint: 'Lis bien chaque mot en faisant attention au point à la fin.',
    category: 'neige',
    explanation: 'Une belle phrase commence par une majuscule et se termine par un point !'
  },
  {
    id: 'sent-bonhomme',
    level: 'ce1',
    type: 'sentence',
    content: 'Le bonhomme de neige rigole.',
    hint: 'Observe les bonshommes de neige farceurs qui esquivent tes boules !',
    category: 'neige',
    explanation: 'Le mot "bonhomme" a deux "m" bien costauds.'
  },
  {
    id: 'word-chateau',
    level: 'ce1',
    type: 'word',
    content: 'CHÂTEAU',
    syllables: ['CHÂ', 'TEAU'],
    scrambled: ['U', 'A', 'E', 'T', 'Â', 'H', 'C'],
    hint: 'On en construit de magnifiques avec des blocs de glace !',
    category: 'aventure',
    explanation: 'Le son "o" s\'écrit "EAU" à la fin de château.'
  },
  {
    id: 'sent-ami-robot',
    level: 'ce1',
    type: 'sentence',
    content: 'Bip-Boop est le roi de la banquise.',
    hint: 'Ton robot est le plus rapide pour ramasser les flocons !',
    category: 'robot',
    explanation: '"Banquise" prend un Q-U pour faire le son [k].'
  }
];

export const INITIAL_UPGRADES: UpgradeItem[] = [
  {
    id: 'upgrade-tank',
    name: 'Réservoir XL Glacé',
    icon: '❄️',
    description: 'Permet de stocker 20 boules de neige au lieu de 10 !',
    costSnow: 15,
    unlocked: false,
    equipped: false,
    type: 'tank',
    bonus: 'Capacité maximale +10 boules',
    challengeRequired: CURRICULUM_ITEMS[2] // GLACE
  },
  {
    id: 'upgrade-speed',
    name: 'Chenilles Turbo Polaires',
    icon: '⚡',
    description: 'Le robot file à toute allure sur la neige fraîche !',
    costSnow: 20,
    unlocked: false,
    equipped: false,
    type: 'speed',
    bonus: 'Vitesse de déplacement +35%',
    challengeRequired: CURRICULUM_ITEMS[1] // ROBOT
  },
  {
    id: 'upgrade-cannon',
    name: 'Super Lanceur Double',
    icon: '🎯',
    description: 'Tire 2 boules de neige scintillantes à la fois !',
    costSnow: 25,
    unlocked: false,
    equipped: false,
    type: 'cannon',
    bonus: 'Tir double automatique',
    challengeRequired: CURRICULUM_ITEMS[6] // La neige est toute douce
  },
  {
    id: 'upgrade-shield',
    name: 'Écharpe Bouclier Magique',
    icon: '🧣',
    description: 'Une douce écharpe qui absorbe les éclaboussures de neige !',
    costSnow: 30,
    unlocked: false,
    equipped: false,
    type: 'shield',
    bonus: 'Barrière de protection contre les tirs',
    challengeRequired: CURRICULUM_ITEMS[4] // ÉTOILE
  },
  {
    id: 'upgrade-gold',
    name: 'Armure Dorée Étincelante',
    icon: '👑',
    description: 'Le robot brille comme un roi des neiges en or massif !',
    costSnow: 35,
    unlocked: false,
    equipped: false,
    type: 'cosmetic',
    bonus: 'Style légendaire & étincelles au sol',
    challengeRequired: CURRICULUM_ITEMS[8] // CHÂTEAU
  },
  {
    id: 'upgrade-storm',
    name: 'Méga Rafale de Flocons',
    icon: '🌪️',
    description: 'Des boules de neige géantes qui font danser les ennemis !',
    costSnow: 40,
    unlocked: false,
    equipped: false,
    type: 'cannon',
    bonus: 'Boules géantes avec onde de choc',
    challengeRequired: CURRICULUM_ITEMS[7] // Le bonhomme de neige rigole
  }
];

export const TROPHIES_LIST: Trophy[] = [
  {
    id: 'trophy-first-snow',
    title: 'Premier Flocon',
    desc: 'Tu as ramassé ton tout premier tas de neige !',
    icon: '❄️',
    unlockedAt: null
  },
  {
    id: 'trophy-first-hit',
    title: 'Touché Glacé !',
    desc: 'Tu as éclaboussé un bonhomme de neige farceur !',
    icon: '🎯',
    unlockedAt: null
  },
  {
    id: 'trophy-first-read',
    title: 'Apprenti Lecteur',
    desc: 'Tu as validé ton premier mot en le lisant tout seul !',
    icon: '📖',
    unlockedAt: null
  },
  {
    id: 'trophy-wordsmith',
    title: 'Génie des Lettres',
    desc: 'Tu as réussi 3 défis d\'écriture sans faute !',
    icon: '✍️',
    unlockedAt: null
  },
  {
    id: 'trophy-custom-bot',
    title: 'Bricoleur Suprême',
    desc: 'Tu as amélioré ton robot dans l\'atelier !',
    icon: '🤖',
    unlockedAt: null
  },
  {
    id: 'trophy-grand-nord',
    title: 'Héros du Pôle Nord',
    desc: 'Tu as dépassé les 500 points sur la banquise !',
    icon: '🏆',
    unlockedAt: null
  }
];

export const STICKERS_LIST: StickerReward[] = [
  {
    id: 'stk-reading-1',
    name: 'Premier Déchiffreur',
    tagline: 'Tu as lu ton premier mot avec Bip-Boop !',
    icon: '📖',
    category: 'reading',
    rarity: 'common',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    borderColor: '#38bdf8',
    unlockedAt: null,
    placedX: 20,
    placedY: 30,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-reading-2',
    name: 'Champion des Syllabes',
    tagline: 'Les syllabes sautillent sous tes yeux !',
    icon: '🧩',
    category: 'reading',
    rarity: 'rare',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    borderColor: '#a855f7',
    unlockedAt: null,
    placedX: 45,
    placedY: 25,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-reading-3',
    name: 'Lecteur d\'Or',
    tagline: 'Une phrase entière lue à haute voix !',
    icon: '🌟',
    category: 'reading',
    rarity: 'legendary',
    glowColor: 'rgba(234, 179, 8, 0.7)',
    borderColor: '#eab308',
    unlockedAt: null,
    placedX: 75,
    placedY: 28,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-writing-1',
    name: 'Plume Magique',
    tagline: 'Premier mot assemblé sans faire de faute !',
    icon: '✍️',
    category: 'writing',
    rarity: 'common',
    glowColor: 'rgba(52, 211, 153, 0.6)',
    borderColor: '#34d399',
    unlockedAt: null,
    placedX: 18,
    placedY: 60,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-writing-2',
    name: 'Architecte des Mots',
    tagline: 'Tu construis les mots lettre après lettre !',
    icon: '🏰',
    category: 'writing',
    rarity: 'rare',
    glowColor: 'rgba(244, 63, 94, 0.6)',
    borderColor: '#f43f5e',
    unlockedAt: null,
    placedX: 48,
    placedY: 58,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-snow-1',
    name: 'Flocon d\'Argent',
    tagline: 'Le plus rapide à ramasser la neige fraîche !',
    icon: '❄️',
    category: 'snow',
    rarity: 'common',
    glowColor: 'rgba(125, 211, 252, 0.6)',
    borderColor: '#7dd3fc',
    unlockedAt: null,
    placedX: 72,
    placedY: 62,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-snow-2',
    name: 'Farceur des Neiges',
    tagline: 'Touché en plein dans le chapeau rigolo !',
    icon: '⛄',
    category: 'snow',
    rarity: 'rare',
    glowColor: 'rgba(251, 146, 60, 0.6)',
    borderColor: '#fb923c',
    unlockedAt: null,
    placedX: 30,
    placedY: 82,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-robot-1',
    name: 'Pilote Polaire',
    tagline: 'Ton robot a reçu sa première amélioration !',
    icon: '🤖',
    category: 'robot',
    rarity: 'common',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    borderColor: '#06b6d4',
    unlockedAt: null,
    placedX: 65,
    placedY: 84,
    isStuckOnAlbum: false
  },
  {
    id: 'stk-robot-2',
    name: 'Roi de la Banquise',
    tagline: 'Armure dorée éclatante et trophée suprême !',
    icon: '👑',
    category: 'robot',
    rarity: 'legendary',
    glowColor: 'rgba(250, 204, 21, 0.8)',
    borderColor: '#facc15',
    unlockedAt: null,
    placedX: 50,
    placedY: 42,
    isStuckOnAlbum: false
  }
];

