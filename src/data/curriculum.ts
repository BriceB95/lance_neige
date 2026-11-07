import { CurriculumItem, DifficultyLevel, ReviewEntry, Trophy, StickerReward } from '../types';

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

// Phrase à trou : l'enfant choisit le bon mot (homophones, accords, conjugaison)
const blank = (level: DifficultyLevel, text: string, answer: string, options: string[], rule: string): CurriculumItem => ({
  id: `blank-${slug(text)}`,
  level,
  type: 'blank',
  content: text.replace('___', answer),
  emoji: '',
  hint: 'Choisis le mot qui convient.',
  explanation: rule,
  blank: { text, answer, options },
});

// Petite histoire suivie d'une question de compréhension
const story = (
  level: DifficultyLevel,
  title: string,
  emoji: string,
  text: string,
  question: string,
  answer: string,
  options: string[]
): CurriculumItem => ({
  id: `story-${slug(title)}`,
  level,
  type: 'story',
  content: `Histoire : ${title}`,
  emoji,
  hint: 'Lis bien toute l\'histoire avant de répondre.',
  story: { text, question, answer, options },
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

  // CE1 : homophones et compréhension
  blank('ce1', 'Le chat ___ tout noir.', 'est', ['est', 'et'], 'On peut dire « Le chat était tout noir » : c\'est EST, le verbe être.'),
  blank('ce1', 'Tom ___ Lili jouent dehors.', 'et', ['et', 'est'], 'On peut dire « Tom et puis Lili » : c\'est ET.'),
  blank('ce1', 'Léa ___ un vélo rouge.', 'a', ['a', 'à'], 'On peut dire « Léa avait un vélo » : c\'est A sans accent.'),
  blank('ce1', 'Je vais ___ la piscine.', 'à', ['à', 'a'], 'On ne peut pas dire « je vais avait la piscine » : c\'est À avec accent.'),
  blank('ce1', 'Mon papa ___ très grand.', 'est', ['est', 'et'], 'On peut dire « Mon papa était grand » : c\'est EST.'),
  blank('ce1', 'Il ___ faim ce matin.', 'a', ['a', 'à'], 'On peut dire « Il avait faim » : c\'est A.'),
  blank('ce1', 'Le robot ___ le roi de la neige.', 'est', ['est', 'et'], 'On peut dire « Le robot était le roi » : c\'est EST.'),
  blank('ce1', 'Nous allons ___ l\'école.', 'à', ['à', 'a'], 'On ne peut pas dire « avait l\'école » : c\'est À.'),
  story('ce1', 'Le bonhomme', '⛄', 'Lucas fait un bonhomme de neige. Il lui met une carotte pour le nez et une écharpe rouge.', 'Qu\'est-ce que Lucas met pour le nez ?', 'une carotte', ['une carotte', 'une écharpe', 'un bouton']),
  story('ce1', 'Le chat Minou', '🐱', 'Minou est un petit chat gris. Il dort toute la journée sur le canapé. Le soir, il joue avec une balle.', 'Où dort Minou ?', 'sur le canapé', ['sur le canapé', 'dans le jardin', 'sous le lit']),
  story('ce1', 'La sortie au zoo', '🦁', 'Ce matin, Emma va au zoo avec sa classe. Elle voit un lion, une girafe et des singes.', 'Avec qui Emma va-t-elle au zoo ?', 'avec sa classe', ['avec sa classe', 'avec son papa', 'toute seule']),
  story('ce1', 'L\'anniversaire', '🎂', 'Papa prépare un gâteau au chocolat pour l\'anniversaire de Léo. Léo a sept ans aujourd\'hui.', 'Quel âge a Léo ?', 'sept ans', ['sept ans', 'six ans', 'huit ans']),

  // CE1+ : mots longs, son/sont, on/ont, pluriels, histoires
  word('ce1plus', 'ESCARGOT', '🐌', ['ES', 'CAR', 'GOT'], 'Il porte sa maison sur son dos.', 'Le T à la fin est muet.'),
  word('ce1plus', 'ARAIGNÉE', '🕷️', ['A', 'RAI', 'GNÉE'], 'Elle a huit pattes et tisse une toile.'),
  word('ce1plus', 'PERROQUET', '🦜', ['PER', 'RO', 'QUET'], 'Un oiseau coloré qui répète les mots.'),
  word('ce1plus', 'TÉLÉPHONE', '📱', ['TÉ', 'LÉ', 'PHO', 'NE'], 'On l\'utilise pour appeler quelqu\'un.', 'PH fait le son [f].'),
  word('ce1plus', 'BIBLIOTHÈQUE', '📚', ['BI', 'BLI', 'O', 'THÈ', 'QUE'], 'On y emprunte des livres.'),
  word('ce1plus', 'ABEILLE', '🐝', ['A', 'BEIL', 'LE'], 'Elle fabrique du miel.'),
  word('ce1plus', 'CHAMPIGNON', '🍄', ['CHAM', 'PI', 'GNON'], 'Il pousse dans la forêt après la pluie.'),
  word('ce1plus', 'HIPPOPOTAME', '🦛', ['HIP', 'PO', 'PO', 'TA', 'ME'], 'Un très gros animal qui aime l\'eau.'),
  word('ce1plus', 'AQUARIUM', '🐠', ['A', 'QUA', 'RI', 'UM'], 'Les poissons nagent dedans à la maison.'),
  word('ce1plus', 'FOURCHETTE', '🍴', ['FOUR', 'CHET', 'TE'], 'On mange avec elle.'),
  word('ce1plus', 'ANANAS', '🍍', ['A', 'NA', 'NAS'], 'Un fruit avec une couronne de feuilles.'),
  word('ce1plus', 'AVION', '✈️', ['A', 'VI', 'ON'], 'Il vole très haut dans le ciel.'),
  word('ce1plus', 'VOLCAN', '🌋', ['VOL', 'CAN'], 'Une montagne qui crache de la lave.'),
  word('ce1plus', 'CERISE', '🍒', ['CE', 'RI', 'SE'], 'Un petit fruit rouge avec un noyau.'),
  word('ce1plus', 'TROMPETTE', '🎺', ['TROM', 'PET', 'TE'], 'On souffle dedans pour faire de la musique.'),
  word('ce1plus', 'CHENILLE', '🐛', ['CHE', 'NIL', 'LE'], 'Elle deviendra un papillon.'),
  word('ce1plus', 'SERPENT', '🐍', ['SER', 'PENT'], 'Il rampe sans pattes.'),
  word('ce1plus', 'TAMBOUR', '🥁', ['TAM', 'BOUR'], 'On tape dessus pour faire du bruit.'),
  sentence('ce1plus', 'Les enfants jouent dans la cour de récréation.', '🧒', 'Où jouent les enfants ?'),
  sentence('ce1plus', 'L\'araignée tisse une toile dans le grenier.', '🕷️', 'Que fait l\'araignée ?'),
  sentence('ce1plus', 'Le perroquet répète tous les mots.', '🦜', 'Qui répète les mots ?'),
  sentence('ce1plus', 'Nous avons mangé une soupe bien chaude.', '🍲', 'Qu\'avons-nous mangé ?'),
  sentence('ce1plus', 'Le volcan crache de la lave brûlante.', '🌋', 'Qu\'est-ce qui crache de la lave ?'),
  sentence('ce1plus', 'Mon avion en papier vole jusqu\'au plafond.', '✈️', 'Jusqu\'où vole l\'avion ?'),
  blank('ce1plus', 'Les oiseaux ___ dans le nid.', 'sont', ['sont', 'son'], 'On peut dire « Les oiseaux étaient » : c\'est SONT.'),
  blank('ce1plus', 'Paul range ___ cartable.', 'son', ['son', 'sont'], 'C\'est le cartable de Paul, le sien : c\'est SON.'),
  blank('ce1plus', 'Les enfants ___ faim.', 'ont', ['ont', 'on'], 'On peut dire « Les enfants avaient faim » : c\'est ONT.'),
  blank('ce1plus', '___ joue au ballon dans la cour.', 'On', ['On', 'Ont'], 'On peut dire « Il joue au ballon » : c\'est ON.'),
  blank('ce1plus', 'Les ___ dorment au soleil.', 'chats', ['chats', 'chat'], 'Après LES, le nom prend un S.'),
  blank('ce1plus', 'Une ___ vole vers la fleur.', 'abeille', ['abeille', 'abeilles'], 'Avec UNE, il n\'y en a qu\'une : pas de S.'),
  blank('ce1plus', 'Les fleurs ___ très belles.', 'sont', ['sont', 'son'], 'On peut dire « Les fleurs étaient belles » : c\'est SONT.'),
  blank('ce1plus', 'Mes amis ___ un petit chien.', 'ont', ['ont', 'on'], 'On peut dire « Mes amis avaient un chien » : c\'est ONT.'),
  blank('ce1plus', 'Les ___ galopent dans le pré.', 'chevaux', ['chevaux', 'chevals'], 'Un cheval, des chevaux : AL devient AUX.'),
  blank('ce1plus', 'Il y a trois ___ dans le ciel.', 'nuages', ['nuages', 'nuage'], 'Trois, c\'est plusieurs : le nom prend un S.'),
  story('ce1plus', 'Le robot perdu', '🤖', 'Bip-Boop s\'est perdu dans la forêt enneigée. Il suit les traces d\'un renard et retrouve enfin le chemin de la maison.', 'Comment Bip-Boop retrouve-t-il le chemin ?', 'Il suit les traces d\'un renard.', ['Il suit les traces d\'un renard.', 'Il demande à un oiseau.', 'Il regarde une carte.']),
  story('ce1plus', 'La pluie', '☔', 'Il pleut très fort. Inès prend son parapluie jaune et met ses bottes. Elle saute dans toutes les flaques.', 'De quelle couleur est le parapluie ?', 'jaune', ['jaune', 'rouge', 'bleu']),
  story('ce1plus', 'Le marché', '🍎', 'Le samedi, Hugo va au marché avec sa grand-mère. Ils achètent des pommes, des tomates et du fromage. Ensuite, ils rentrent préparer le repas.', 'Avec qui Hugo va-t-il au marché ?', 'avec sa grand-mère', ['avec sa grand-mère', 'avec son frère', 'avec sa maîtresse']),
  story('ce1plus', 'La cabane', '🌳', 'Nina et Sam construisent une cabane dans le jardin avec des branches. Quand le vent souffle, la cabane tombe. Ils rient et recommencent.', 'Pourquoi la cabane tombe-t-elle ?', 'à cause du vent', ['à cause du vent', 'à cause de la pluie', 'à cause du chien']),
  story('ce1plus', 'Le poisson rouge', '🐟', 'Arthur a un poisson rouge qui s\'appelle Bulle. Chaque matin, il lui donne un peu de nourriture. Bulle nage alors très vite.', 'Quand Arthur nourrit-il Bulle ?', 'chaque matin', ['chaque matin', 'chaque soir', 'le dimanche']),

  // CE2 : mots difficiles, sa/ça, mes/mais, ou/où, conjugaison, histoires
  word('ce2', 'MAGICIEN', '🧙', ['MA', 'GI', 'CIEN'], 'Il fait des tours de magie.', 'Le C devant I fait le son [s].'),
  word('ce2', 'PHOTOGRAPHIE', '📷', ['PHO', 'TO', 'GRA', 'PHIE'], 'On la prend avec un appareil.', 'Deux fois PH, qui font le son [f].'),
  word('ce2', 'ASTRONAUTE', '🧑‍🚀', ['AS', 'TRO', 'NAU', 'TE'], 'Il voyage dans l\'espace.'),
  word('ce2', 'ORCHESTRE', '🎻', ['OR', 'CHES', 'TRE'], 'Des musiciens qui jouent ensemble.', 'Ici, CH se prononce [k].'),
  word('ce2', 'AUTOMNE', '🍂', ['AU', 'TOMNE'], 'La saison où les feuilles tombent.', 'Le M ne se prononce pas.'),
  word('ce2', 'THERMOMÈTRE', '🌡️', ['THER', 'MO', 'MÈ', 'TRE'], 'Il mesure la température.'),
  word('ce2', 'MICROSCOPE', '🔬', ['MI', 'CROS', 'CO', 'PE'], 'Il montre les choses minuscules.'),
  word('ce2', 'PARACHUTE', '🪂', ['PA', 'RA', 'CHU', 'TE'], 'Il ralentit la chute depuis un avion.'),
  word('ce2', 'DINOSAURE', '🦕', ['DI', 'NO', 'SAU', 'RE'], 'Un animal géant d\'il y a très longtemps.'),
  word('ce2', 'AMBULANCE', '🚑', ['AM', 'BU', 'LAN', 'CE'], 'Elle emmène les malades à l\'hôpital.', 'Devant B, on écrit M et pas N.'),
  word('ce2', 'RHINOCÉROS', '🦏', ['RHI', 'NO', 'CÉ', 'ROS'], 'Il a une corne sur le nez.', 'Le H après le R ne s\'entend pas.'),
  word('ce2', 'CHÂTAIGNE', '🌰', ['CHÂ', 'TAI', 'GNE'], 'On la ramasse en automne.'),
  word('ce2', 'SCORPION', '🦂', ['SCOR', 'PI', 'ON'], 'Il a une pince et une queue qui pique.'),
  word('ce2', 'PAON', '🦚', ['PAON'], 'Un oiseau qui fait la roue avec ses plumes.', 'AON se prononce comme AN.'),
  word('ce2', 'GYMNASTIQUE', '🤸', ['GYM', 'NAS', 'TI', 'QUE'], 'Un sport avec des roulades.', 'Le Y se prononce comme un I.'),
  word('ce2', 'XYLOPHONE', '🎵', ['XY', 'LO', 'PHO', 'NE'], 'On tape sur ses lames pour faire de la musique.'),
  word('ce2', 'SQUELETTE', '💀', ['SQUE', 'LET', 'TE'], 'Tous les os du corps.'),
  sentence('ce2', 'Pendant l\'automne, les feuilles tombent des arbres.', '🍂', 'Quand les feuilles tombent-elles ?'),
  sentence('ce2', 'L\'astronaute flotte dans sa fusée au-dessus de la Terre.', '🧑‍🚀', 'Qui flotte dans la fusée ?'),
  sentence('ce2', 'Le magicien fait apparaître un lapin dans son chapeau.', '🧙', 'Que fait apparaître le magicien ?'),
  sentence('ce2', 'Les dinosaures vivaient il y a très longtemps.', '🦕', 'Quand vivaient les dinosaures ?'),
  sentence('ce2', 'Hier, nous sommes allés à la bibliothèque.', '📚', 'Où sommes-nous allés ?'),
  sentence('ce2', 'Le rhinocéros possède une grande corne sur le nez.', '🦏', 'Qui a une corne ?'),
  blank('ce2', 'Le lion dévore ___ proie.', 'sa', ['sa', 'ça'], 'C\'est la proie du lion, la sienne : c\'est SA.'),
  blank('ce2', '___ chaussures sont neuves.', 'Mes', ['Mes', 'Mais'], 'Ce sont les miennes : c\'est MES.'),
  blank('ce2', 'J\'aime le chocolat ___ pas les épinards.', 'mais', ['mais', 'mes'], 'MAIS marque une opposition.'),
  blank('ce2', 'Tu veux du lait ___ du jus ?', 'ou', ['ou', 'où'], 'On peut dire « ou bien » : c\'est OU sans accent.'),
  blank('ce2', '___ est ton manteau ?', 'Où', ['Où', 'Ou'], 'On parle d\'un lieu : c\'est OÙ avec accent.'),
  blank('ce2', 'Demain, nous ___ au zoo.', 'irons', ['irons', 'allions', 'sommes allés'], 'Demain, c\'est le futur : nous IRONS.'),
  blank('ce2', 'Hier, il ___ toute la journée.', 'a neigé', ['a neigé', 'neigera', 'neige'], 'Hier, c\'est le passé : il A NEIGÉ.'),
  blank('ce2', 'Les enfants ___ des gâteaux.', 'mangent', ['mangent', 'mange', 'manges'], 'Avec ILS (les enfants), le verbe finit par -ENT.'),
  blank('ce2', 'Tu ___ très bien.', 'chantes', ['chantes', 'chante', 'chantent'], 'Avec TU, le verbe prend un S.'),
  blank('ce2', 'Nous ___ la neige.', 'aimons', ['aimons', 'aimez', 'aiment'], 'Avec NOUS, le verbe finit par -ONS.'),
  blank('ce2', 'Vous ___ très vite.', 'courez', ['courez', 'courons', 'courent'], 'Avec VOUS, le verbe finit par -EZ.'),
  story('ce2', 'L\'expédition', '🧭', 'Les explorateurs partent vers le pôle Nord. Il fait si froid que leur barbe se couvre de givre. Le soir, ils dorment dans un igloo pour se protéger du vent glacé.', 'Pourquoi dorment-ils dans un igloo ?', 'pour se protéger du vent glacé', ['pour se protéger du vent glacé', 'pour regarder les étoiles', 'pour pêcher des poissons']),
  story('ce2', 'La grande course', '🐢', 'Le lièvre se moque de la tortue qui marche lentement. Pendant la course, il s\'arrête pour faire une sieste. La tortue continue sans s\'arrêter et gagne.', 'Pourquoi la tortue gagne-t-elle ?', 'Elle ne s\'arrête jamais.', ['Elle ne s\'arrête jamais.', 'Elle court plus vite.', 'Le lièvre est malade.']),
  story('ce2', 'Le potager', '🌱', 'Au printemps, Chloé plante des graines de radis. Elle les arrose tous les jours. Trois semaines plus tard, elle récolte de petits radis roses.', 'Combien de temps faut-il pour récolter les radis ?', 'trois semaines', ['trois semaines', 'trois jours', 'trois mois']),
  story('ce2', 'Le dragon gentil', '🐉', 'Dans la montagne vit un dragon qui ne crache pas de feu mais des bulles de savon. Les enfants du village viennent jouer avec lui chaque après-midi.', 'Que crache le dragon ?', 'des bulles de savon', ['des bulles de savon', 'du feu', 'de la neige']),
  story('ce2', 'La panne', '🕯️', 'Pendant la tempête, l\'électricité est coupée. Toute la famille allume des bougies et joue aux cartes. Personne ne regrette la télévision ce soir-là.', 'Que fait la famille pendant la panne ?', 'Elle joue aux cartes.', ['Elle joue aux cartes.', 'Elle regarde la télévision.', 'Elle va dormir.']),
];

export const LEVEL_ORDER: DifficultyLevel[] = ['cp1', 'cp2', 'ce1', 'ce1plus', 'ce2'];

export const LEVEL_LABELS: Record<DifficultyLevel, string> = {
  cp1: 'CP début',
  cp2: 'CP fin',
  ce1: 'CE1',
  ce1plus: 'CE1+',
  ce2: 'CE2',
};

/** Niveaux où l'aide diminue (pas de syllabes, lettres pièges, images proches) */
export const isHardLevel = (level: DifficultyLevel) => LEVEL_ORDER.indexOf(level) >= 3;

const WINDOW = 15;

/**
 * Niveau automatique : monte au-delà de 85 % de réussite sur les 15 dernières réponses,
 * descend sous 60 %. Renvoie le nouveau niveau et l'historique (remis à zéro si changement).
 */
export function adjustLevel(level: DifficultyLevel, recent: boolean[], correct: boolean): { level: DifficultyLevel; recent: boolean[] } {
  const next = [...recent, correct].slice(-WINDOW);
  if (next.length < WINDOW) return { level, recent: next };
  const rate = next.filter(Boolean).length / next.length;
  const idx = LEVEL_ORDER.indexOf(level);
  if (rate >= 0.85 && idx < LEVEL_ORDER.length - 1) return { level: LEVEL_ORDER[idx + 1], recent: [] };
  if (rate < 0.6 && idx > 0) return { level: LEVEL_ORDER[idx - 1], recent: [] };
  return { level, recent: next };
}

export const todayKey = () => new Date().toLocaleDateString('fr-CA');

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('fr-CA');
};

/** Mots de l'école saisis par le parent (un par ligne) */
export function buildCustomItems(lines: string[]): CurriculumItem[] {
  return lines
    .map((l) => l.trim().replace(/\s+/g, ' '))
    .filter((l) => l.length > 0)
    .map((l) => {
      const isSentence = l.includes(' ');
      const content = isSentence ? l.charAt(0).toUpperCase() + l.slice(1) : l.toUpperCase();
      return {
        id: `custom-${slug(content)}`,
        level: 'cp1' as DifficultyLevel,
        type: isSentence ? 'sentence' : 'word',
        content,
        emoji: '',
        hint: isSentence ? 'Une phrase de l\'école !' : 'Un mot de la semaine de l\'école !',
        custom: true,
      } as CurriculumItem;
    });
}

// Intervalles de révision (jours) selon la boîte : plus le mot est su, plus il revient tard
const REVIEW_DAYS = [0, 1, 3, 7, 21];

export function updateReview(review: Record<string, ReviewEntry>, word: string, correct: boolean): Record<string, ReviewEntry> {
  const prev = review[word];
  let box: number;
  if (!correct) box = 0;
  else if (!prev) box = 3; // réussi du premier coup
  else box = Math.min(4, prev.box + 1);
  return {
    ...review,
    [word]: { box, due: addDays(REVIEW_DAYS[box]), errors: (prev?.errors ?? 0) + (correct ? 0 : 1) },
  };
}

/** Mots ratés à retravailler (boîte 0 à 2) */
export function wordsToReview(review: Record<string, ReviewEntry>): string[] {
  return Object.entries(review)
    .filter(([, r]) => r.box <= 2)
    .sort((a, b) => a[1].box - b[1].box || b[1].errors - a[1].errors)
    .map(([w]) => w);
}

interface PickOptions {
  custom: CurriculumItem[];
  review: Record<string, ReviewEntry>;
  preferType?: 'word' | 'sentence';
}

/**
 * Choisit les défis : d'abord les mots ratés à revoir aujourd'hui, puis les mots de l'école,
 * puis des mots nouveaux du niveau scolaire réglé par le parent.
 */
export function pickChallenges(level: DifficultyLevel, count: number, mastered: string[], opts: PickOptions): CurriculumItem[] {
  const maxIdx = LEVEL_ORDER.indexOf(level);
  const base = CURRICULUM_ITEMS.filter((c) => LEVEL_ORDER.indexOf(c.level) <= maxIdx);
  const all = [...opts.custom, ...base];
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
  const today = todayKey();
  const typeOk = (c: CurriculumItem) => !opts.preferType || c.type === opts.preferType;

  const due = all
    .filter((c) => opts.review[c.content] && opts.review[c.content].due <= today && opts.review[c.content].box <= 2)
    .sort((a, b) => opts.review[a.content].box - opts.review[b.content].box);
  const customFresh = shuffle(opts.custom.filter((c) => !mastered.includes(c.content)));
  const fresh = base.filter((c) => !mastered.includes(c.content) && !opts.review[c.content]);
  const current = shuffle(fresh.filter((c) => c.level === level));
  const older = shuffle(fresh.filter((c) => c.level !== level));
  const ordered = [...due, ...customFresh, ...current, ...older, ...shuffle(all)];

  const picked: CurriculumItem[] = [];
  for (const pass of [true, false]) {
    for (const item of ordered) {
      if (picked.length >= count) break;
      if (picked.includes(item) || (pass && !typeOk(item))) continue;
      picked.push(item);
    }
  }
  return picked;
}

/**
 * Deux images pièges différentes de la bonne réponse.
 * En mode difficile, elles correspondent à des mots qui se ressemblent (même début, longueur proche).
 */
export function pickDistractors(item: CurriculumItem, count = 2, hard = false): string[] {
  const candidates = CURRICULUM_ITEMS.filter((c) => c.emoji && c.emoji !== item.emoji && (c.type === 'word' || c.type === 'sentence'));
  const score = (c: CurriculumItem) => {
    if (!hard) return Math.random();
    const a = c.content.toUpperCase();
    const b = item.content.toUpperCase();
    let same = 0;
    while (same < Math.min(a.length, b.length) && a[same] === b[same]) same++;
    return -same * 3 + Math.abs(a.length - b.length) * 0.5 + Math.random() * 1.5;
  };
  const sorted = candidates.map((c) => ({ e: c.emoji, s: score(c) })).sort((x, y) => x.s - y.s);
  return Array.from(new Set(sorted.map((x) => x.e))).slice(0, count);
}

/** Mots pièges écrits (pour les mots de l'école, qui n'ont pas d'image) */
export function pickWordDistractors(item: CurriculumItem, pool: CurriculumItem[], count = 2): string[] {
  const candidates = Array.from(
    new Set([...pool, ...CURRICULUM_ITEMS].filter((c) => c.type === item.type && c.content !== item.content).map((c) => c.content))
  );
  // Privilégie des mots de longueur proche pour obliger à bien lire
  return candidates
    .sort((a, b) => Math.abs(a.length - item.content.length) - Math.abs(b.length - item.content.length) + (Math.random() - 0.5) * 4)
    .slice(0, count);
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

