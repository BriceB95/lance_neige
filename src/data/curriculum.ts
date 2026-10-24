import { CurriculumItem, DifficultyLevel, Trophy, StickerReward } from '../types';

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const word = (
  level: DifficultyLevel,
  content: string,
  emoji: string,
  syllables: string[],
  hint: string,
  explanation?: string
): CurriculumItem => ({ id: `word-${slug(content)}`, level, type: 'word', content, emoji, syllables, hint, explanation });

const sentence = (level: DifficultyLevel, content: string, emoji: string, hint: string): CurriculumItem => ({
  id: `sent-${slug(content)}`,
  level,
  type: 'sentence',
  content,
  emoji,
  hint,
  explanation: 'Une phrase commence par une majuscule et se termine par un point.',
});

export const CURRICULUM_ITEMS: CurriculumItem[] = [
  // CP début : syllabes simples
  word('cp1', 'ROBOT', '🤖', ['RO', 'BOT'], 'Ton super ami en métal !', 'Le T muet dort à la fin !'),
  word('cp1', 'NEIGE', '❄️', ['NEI', 'GE'], 'Blanche et froide, elle tombe en hiver.', 'Le son "ei" comme dans reine.'),
  word('cp1', 'GLACE', '🧊', ['GLA', 'CE'], 'Très froide et glissante.', 'Le C devant le E fait le son [s].'),
  word('cp1', 'AMI', '🤝', ['A', 'MI'], 'Une personne gentille avec qui on joue.'),
  word('cp1', 'LUNE', '🌙', ['LU', 'NE'], 'Elle brille dans le ciel la nuit.'),
  word('cp1', 'VÉLO', '🚲', ['VÉ', 'LO'], 'Il a deux roues et des pédales.'),
  word('cp1', 'MOTO', '🏍️', ['MO', 'TO'], 'Elle roule vite avec un moteur.'),
  word('cp1', 'LAPIN', '🐰', ['LA', 'PIN'], 'Il a de grandes oreilles.'),
  word('cp1', 'SAPIN', '🌲', ['SA', 'PIN'], 'Un arbre vert qu\'on décore à Noël.'),
  word('cp1', 'TOMATE', '🍅', ['TO', 'MA', 'TE'], 'Un fruit rouge pour la salade.'),
  word('cp1', 'SALADE', '🥗', ['SA', 'LA', 'DE'], 'Des feuilles vertes à manger.'),
  word('cp1', 'PIRATE', '🏴‍☠️', ['PI', 'RA', 'TE'], 'Il cherche des trésors sur la mer.'),
  word('cp1', 'TORTUE', '🐢', ['TOR', 'TUE'], 'Elle avance lentement avec sa carapace.'),
  word('cp1', 'PIZZA', '🍕', ['PIZ', 'ZA'], 'Un plat rond avec du fromage.'),
  word('cp1', 'CAROTTE', '🥕', ['CA', 'ROT', 'TE'], 'Le nez orange du bonhomme de neige !'),
  word('cp1', 'CANARD', '🦆', ['CA', 'NARD'], 'Il fait coin-coin sur la mare.', 'Le D à la fin ne s\'entend pas.'),
  word('cp1', 'KIWI', '🥝', ['KI', 'WI'], 'Un petit fruit vert et poilu.'),
  word('cp1', 'TAXI', '🚕', ['TA', 'XI'], 'Une voiture jaune qui transporte les gens.'),
  word('cp1', 'LIT', '🛏️', ['LIT'], 'On dort dedans.', 'Le T à la fin est muet.'),
  word('cp1', 'RAT', '🐀', ['RAT'], 'Un petit animal avec une longue queue.'),
  word('cp1', 'ÉCOLE', '🏫', ['É', 'CO', 'LE'], 'On y apprend à lire et à écrire.'),
  word('cp1', 'PATATE', '🥔', ['PA', 'TA', 'TE'], 'On en fait des frites.'),
  sentence('cp1', 'Le chat dort sur le lit.', '🐱', 'Où se repose le chat ?'),
  sentence('cp1', 'Le lapin a une carotte.', '🐰', 'Qui a une carotte ?'),
  sentence('cp1', 'Lili a un vélo.', '🚲', 'Qu\'est-ce que Lili a ?'),
  sentence('cp1', 'La tortue va lentement.', '🐢', 'Qui avance doucement ?'),

  // CP fin : ou, on, an, oi, ch, eau, ai, in
  word('cp2', 'OURS', '🐻‍❄️', ['OURS'], 'Le grand animal blanc de la banquise.', 'Le son "ou" comme dans loup.'),
  word('cp2', 'ÉTOILE', '⭐', ['É', 'TOI', 'LE'], 'Elle brille dans le ciel la nuit.', 'Le son "oi" comme dans oiseau.'),
  word('cp2', 'MOUTON', '🐑', ['MOU', 'TON'], 'Il fait bêê et donne de la laine.'),
  word('cp2', 'POISSON', '🐟', ['POIS', 'SON'], 'Il nage dans l\'eau.', 'Deux S entre deux voyelles font le son [s].'),
  word('cp2', 'CHAT', '🐱', ['CHAT'], 'Il fait miaou.', 'Le T à la fin est muet.'),
  word('cp2', 'CHIEN', '🐶', ['CHIEN'], 'Il fait wouf et remue la queue.'),
  word('cp2', 'MAISON', '🏠', ['MAI', 'SON'], 'On habite dedans.', 'Un seul S entre deux voyelles fait le son [z].'),
  word('cp2', 'BALLON', '⚽', ['BAL', 'LON'], 'On joue au foot avec.'),
  word('cp2', 'GÂTEAU', '🎂', ['GÂ', 'TEAU'], 'On souffle les bougies dessus.', 'Le son "o" s\'écrit EAU à la fin.'),
  word('cp2', 'OISEAU', '🐦', ['OI', 'SEAU'], 'Il vole avec ses ailes.'),
  word('cp2', 'BATEAU', '⛵', ['BA', 'TEAU'], 'Il flotte sur la mer.'),
  word('cp2', 'LOUP', '🐺', ['LOUP'], 'Il hurle à la lune.', 'Le P à la fin est muet.'),
  word('cp2', 'DRAGON', '🐉', ['DRA', 'GON'], 'Il crache du feu dans les contes.'),
  word('cp2', 'LION', '🦁', ['LI', 'ON'], 'Le roi des animaux.'),
  word('cp2', 'COCHON', '🐷', ['CO', 'CHON'], 'Il est rose et fait groin-groin.'),
  word('cp2', 'CHAPEAU', '🎩', ['CHA', 'PEAU'], 'On le met sur la tête.'),
  word('cp2', 'BONBON', '🍬', ['BON', 'BON'], 'Une petite sucrerie.'),
  word('cp2', 'MOUFLE', '🧤', ['MOU', 'FLE'], 'Elle garde la main au chaud.'),
  word('cp2', 'ÉCHARPE', '🧣', ['É', 'CHAR', 'PE'], 'On l\'enroule autour du cou.'),
  word('cp2', 'FUSÉE', '🚀', ['FU', 'SÉE'], 'Elle part dans l\'espace.'),
  word('cp2', 'HIBOU', '🦉', ['HI', 'BOU'], 'Il ouvre ses grands yeux la nuit.', 'Le H du début ne fait pas de bruit.'),
  word('cp2', 'RENARD', '🦊', ['RE', 'NARD'], 'Un animal roux et rusé.'),
  word('cp2', 'FLOCON', '🌨️', ['FLO', 'CON'], 'Un petit morceau de neige qui tombe.'),
  word('cp2', 'LUTIN', '🧝', ['LU', 'TIN'], 'Il aide le Père Noël.'),
  word('cp2', 'PINGOUIN', '🐧', ['PIN', 'GOUIN'], 'Un oiseau noir et blanc de la banquise.'),
  word('cp2', 'ORANGE', '🍊', ['O', 'RAN', 'GE'], 'Un fruit rond plein de jus.'),
  word('cp2', 'CHOCOLAT', '🍫', ['CHO', 'CO', 'LAT'], 'Une gourmandise marron.'),
  sentence('cp2', 'La neige est toute douce.', '❄️', 'Comment est la neige ?'),
  sentence('cp2', 'Le poisson nage dans l\'eau.', '🐟', 'Qui nage ?'),
  sentence('cp2', 'Le bateau flotte sur la mer.', '⛵', 'Qu\'est-ce qui flotte ?'),
  sentence('cp2', 'Le hibou chante la nuit.', '🦉', 'Qui chante la nuit ?'),
  sentence('cp2', 'Le dragon crache du feu.', '🐉', 'Qui crache du feu ?'),
  sentence('cp2', 'La fusée part dans le ciel.', '🚀', 'Qu\'est-ce qui part dans le ciel ?'),
  sentence('cp2', 'Le pingouin glisse sur la glace.', '🐧', 'Qui glisse ?'),
  sentence('cp2', 'Le loup a faim ce soir.', '🐺', 'Qui a faim ?'),

  // CE1 : sons complexes (ph, gn, ill, eil, euil...)
  word('ce1', 'CHÂTEAU', '🏰', ['CHÂ', 'TEAU'], 'Le roi et la reine y habitent.', 'Le son "o" s\'écrit EAU à la fin.'),
  word('ce1', 'BONHOMME', '⛄', ['BON', 'HOMME'], 'On le fabrique avec de la neige.', 'Bonhomme prend deux M.'),
  word('ce1', 'ÉLÉPHANT', '🐘', ['É', 'LÉ', 'PHANT'], 'Il a une trompe et de grandes oreilles.', 'PH fait le son [f].'),
  word('ce1', 'TRAÎNEAU', '🛷', ['TRAÎ', 'NEAU'], 'Il glisse sur la neige.'),
  word('ce1', 'MONTAGNE', '🏔️', ['MON', 'TA', 'GNE'], 'Très haute, avec de la neige en haut.', 'GN chante comme dans agneau.'),
  word('ce1', 'GRENOUILLE', '🐸', ['GRE', 'NOUIL', 'LE'], 'Elle saute et fait croa-croa.', 'ILL fait le son [j].'),
  word('ce1', 'PAPILLON', '🦋', ['PA', 'PIL', 'LON'], 'Il a de jolies ailes colorées.'),
  word('ce1', 'ÉCUREUIL', '🐿️', ['É', 'CU', 'REUIL'], 'Il cache des noisettes.'),
  word('ce1', 'SOLEIL', '☀️', ['SO', 'LEIL'], 'Il nous chauffe et nous éclaire.', 'EIL comme dans réveil.'),
  word('ce1', 'PARAPLUIE', '☂️', ['PA', 'RA', 'PLUIE'], 'Il protège de la pluie.'),
  word('ce1', 'CROCODILE', '🐊', ['CRO', 'CO', 'DI', 'LE'], 'Il a beaucoup de dents.'),
  word('ce1', 'CITROUILLE', '🎃', ['CI', 'TROUIL', 'LE'], 'Une grosse courge orange.', 'Le C devant I fait le son [s].'),
  word('ce1', 'ORDINATEUR', '💻', ['OR', 'DI', 'NA', 'TEUR'], 'Une machine avec un écran et un clavier.'),
  word('ce1', 'DAUPHIN', '🐬', ['DAU', 'PHIN'], 'Il saute dans la mer.', 'PH fait le son [f].'),
  word('ce1', 'BALEINE', '🐋', ['BA', 'LEI', 'NE'], 'Le plus gros animal de la mer.'),
  word('ce1', 'CHAUSSURE', '👟', ['CHAUS', 'SU', 'RE'], 'On la met au pied.'),
  word('ce1', 'GIRAFE', '🦒', ['GI', 'RA', 'FE'], 'Elle a un très long cou.', 'Le G devant I fait le son [ʒ].'),
  word('ce1', 'KANGOUROU', '🦘', ['KAN', 'GOU', 'ROU'], 'Il saute avec son bébé dans sa poche.'),
  word('ce1', 'HÉLICOPTÈRE', '🚁', ['HÉ', 'LI', 'COP', 'TÈ', 'RE'], 'Il vole avec des hélices.'),
  sentence('ce1', 'Le bonhomme de neige rigole.', '⛄', 'Qui rigole ?'),
  sentence('ce1', 'Bip-Boop est le roi de la banquise.', '🤖', 'Qui est le roi ?'),
  sentence('ce1', 'Le soleil brille très fort.', '☀️', 'Qu\'est-ce qui brille ?'),
  sentence('ce1', 'Je mets mon bonnet et mes moufles.', '🧤', 'Qu\'est-ce que je mets ?'),
  sentence('ce1', 'Le papillon vole de fleur en fleur.', '🦋', 'Qui vole ?'),
  sentence('ce1', 'La grenouille saute dans la mare.', '🐸', 'Qui saute ?'),
  sentence('ce1', 'Le traîneau glisse vite sur la neige.', '🛷', 'Qu\'est-ce qui glisse ?'),
  sentence('ce1', 'Le dauphin joue avec les vagues.', '🐬', 'Qui joue dans l\'eau ?'),
];

const LEVEL_ORDER: DifficultyLevel[] = ['cp1', 'cp2', 'ce1'];

/**
 * Choisit des défis adaptés au niveau scolaire réglé par le parent,
 * en privilégiant les mots pas encore maîtrisés.
 */
export function pickChallenges(level: DifficultyLevel, count: number, mastered: string[]): CurriculumItem[] {
  const maxIdx = LEVEL_ORDER.indexOf(level);
  const pool = CURRICULUM_ITEMS.filter((c) => LEVEL_ORDER.indexOf(c.level) <= maxIdx);
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
  const fresh = pool.filter((c) => !mastered.includes(c.content));
  // Surtout des mots du niveau actuel, un peu de révision des niveaux précédents
  const current = shuffle(fresh.filter((c) => c.level === level));
  const review = shuffle(fresh.filter((c) => c.level !== level));
  const ordered = [...current, ...review, ...shuffle(pool)];
  const picked: CurriculumItem[] = [];
  for (const item of ordered) {
    if (picked.length >= count) break;
    if (!picked.includes(item)) picked.push(item);
  }
  return picked;
}

/** Deux images pièges différentes de la bonne réponse */
export function pickDistractors(item: CurriculumItem, count = 2): string[] {
  const emojis = Array.from(new Set(CURRICULUM_ITEMS.map((c) => c.emoji))).filter((e) => e !== item.emoji);
  return emojis.sort(() => Math.random() - 0.5).slice(0, count);
}

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

