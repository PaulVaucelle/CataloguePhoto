import { Domain } from './catalogue';

export type Badge = {
  id: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

function countDone(domain: Domain): number {
  return domain.objects.filter(o => o.done).length;
}

function countDoneByType(domain: Domain, type: string): number {
  return domain.objects.filter(o => o.done && o.type.toLowerCase().includes(type.toLowerCase())).length;
}

function isDoneById(domain: Domain, id: string): boolean {
  return domain.objects.some(o => o.id === id && o.done);
}

export function computeBadges(domains: Domain[]): Badge[] {
  const astro       = domains.find(d => d.id === 'astro');
  const fleurs      = domains.find(d => d.id === 'fleurs');
  const arbres      = domains.find(d => d.id === 'arbres');
  const oiseaux     = domains.find(d => d.id === 'oiseaux');
  const mineraux    = domains.find(d => d.id === 'mineraux');
  const champignons = domains.find(d => d.id === 'champignons');
  const pays        = domains.find(d => d.id === 'pays');

  const totalDone = domains.reduce((s, d) => s + countDone(d), 0);

  const badges: Badge[] = [

    // --- Badges globaux ---
    {
      id: 'global_1',
      icon: '🌱',
      label: 'Premier pas',
      description: 'Photographier votre 1er objet',
      unlocked: totalDone >= 1,
    },
    {
      id: 'global_10',
      icon: '📷',
      label: 'Explorateur',
      description: 'Photographier 10 objets au total',
      unlocked: totalDone >= 10,
    },
    {
      id: 'global_50',
      icon: '🏅',
      label: 'Collectionneur',
      description: 'Photographier 50 objets au total',
      unlocked: totalDone >= 50,
    },
    {
      id: 'global_100',
      icon: '🌟',
      label: 'Expert',
      description: 'Photographier 100 objets au total',
      unlocked: totalDone >= 100,
    },
    {
      id: 'global_250',
      icon: '🔥',
      label: 'Passionné',
      description: 'Photographier 250 objets au total',
      unlocked: totalDone >= 250,
    },
    {
      id: 'global_500',
      icon: '💫',
      label: 'Légende',
      description: 'Photographier 500 objets au total',
      unlocked: totalDone >= 500,
    },
    {
      id: 'global_900',
      icon: '🏆',
      label: 'NatureScope Master',
      description: 'Photographier 900 objets au total',
      unlocked: totalDone >= 900,
    },
    {
      id: 'global_all_domains',
      icon: '🗺️',
      label: 'Touche-à-tout',
      description: 'Photographier au moins 1 objet dans chaque domaine',
      unlocked: domains.filter(d => !d.id.startsWith('custom_')).every(d => countDone(d) >= 1),
    },

    // --- Badges Astronomie ---
    ...(astro ? [
      {
        id: 'astro_1',
        icon: '🔭',
        label: 'Apprenti astronome',
        description: 'Photographier votre 1er objet du catalogue',
        unlocked: countDone(astro) >= 1,
      },
      {
        id: 'astro_10',
        icon: '🌙',
        label: 'Observateur',
        description: 'Photographier 10 objets du catalogue',
        unlocked: countDone(astro) >= 10,
      },
      {
        id: 'astro_25',
        icon: '🌠',
        label: 'Astronome amateur',
        description: 'Photographier 25 objets du catalogue',
        unlocked: countDone(astro) >= 25,
      },
      {
        id: 'astro_galaxie',
        icon: '🌌',
        label: 'Chasseur de galaxies',
        description: 'Photographier 10 galaxies',
        unlocked: countDoneByType(astro, 'galaxie') >= 10,
      },
      {
        id: 'astro_nebuleuse',
        icon: '💫',
        label: 'Chasseur de nébuleuses',
        description: 'Photographier 5 nébuleuses',
        unlocked: countDoneByType(astro, 'nebuleuse') >= 5,
      },
      {
        id: 'astro_amas',
        icon: '✨',
        label: 'Chasseur d\'amas',
        description: 'Photographier 10 amas',
        unlocked: countDoneByType(astro, 'amas') >= 10,
      },
      {
        id: 'astro_m42',
        icon: '⭐',
        label: 'La Grande Nébuleuse',
        description: 'Photographier M42 — Nébuleuse d\'Orion',
        unlocked: isDoneById(astro, 'm42'),
      },
      {
        id: 'astro_m31',
        icon: '🌠',
        label: 'Voisine cosmique',
        description: 'Photographier M31 — Galaxie d\'Andromède',
        unlocked: isDoneById(astro, 'm31'),
      },
      {
        id: 'astro_m45',
        icon: '🌃',
        label: 'Les Sept Sœurs',
        description: 'Photographier M45 — Les Pléiades',
        unlocked: isDoneById(astro, 'm45'),
      },
      {
        id: 'astro_m1',
        icon: '💥',
        label: 'Reste de supernova',
        description: 'Photographier M1 — Nébuleuse du Crabe',
        unlocked: isDoneById(astro, 'm1'),
      },
      {
        id: 'astro_messier',
        icon: '🥇',
        label: 'Messier complet',
        description: 'Photographier les 110 objets Messier',
        unlocked: countDone(astro) >= 110,
      },
      {
        id: 'astro_caldwell_start',
        icon: '🔭',
        label: 'Catalogue Caldwell',
        description: 'Photographier votre 1er objet Caldwell',
        unlocked: astro.objects.filter(o => o.id.startsWith('c') && o.done).length >= 1,
      },
      {
        id: 'astro_caldwell_25',
        icon: '🌟',
        label: 'Caldwell explorateur',
        description: 'Photographier 25 objets Caldwell',
        unlocked: astro.objects.filter(o => o.id.startsWith('c') && o.done).length >= 25,
      },
      {
        id: 'astro_caldwell_complet',
        icon: '🏆',
        label: 'Caldwell complet',
        description: 'Photographier les 109 objets Caldwell',
        unlocked: astro.objects.filter(o => o.id.startsWith('c') && o.done).length >= 109,
      },
      {
        id: 'astro_double_catalogue',
        icon: '👑',
        label: 'Double catalogue',
        description: 'Photographier Messier ET Caldwell au complet',
        unlocked: countDone(astro) >= 219,
      },
      {
        id: 'astro_c80',
        icon: '⚡',
        label: 'Oméga Centauri',
        description: 'Photographier C80 — le plus grand amas globulaire visible',
        unlocked: isDoneById(astro, 'c80'),
      },
      {
        id: 'astro_c92',
        icon: '🌋',
        label: 'Nébuleuse de la Carène',
        description: 'Photographier C92 — la plus grande nébuleuse du catalogue',
        unlocked: isDoneById(astro, 'c92'),
      },
    ] : []),

    // --- Badges Fleurs ---
    ...(fleurs ? [
      {
        id: 'fleurs_1',
        icon: '🌸',
        label: 'Premier bouquet',
        description: 'Photographier votre 1ère fleur',
        unlocked: countDone(fleurs) >= 1,
      },
      {
        id: 'fleurs_10',
        icon: '🌼',
        label: 'Fleuriste',
        description: 'Photographier 10 fleurs',
        unlocked: countDone(fleurs) >= 10,
      },
      {
        id: 'fleurs_25',
        icon: '🌺',
        label: 'Botaniste',
        description: 'Photographier 25 fleurs',
        unlocked: countDone(fleurs) >= 25,
      },
      {
        id: 'fleurs_sauvage',
        icon: '🌿',
        label: 'Amoureux de la nature',
        description: 'Photographier 5 fleurs sauvages',
        unlocked: countDoneByType(fleurs, 'sauvage') >= 5,
      },
      {
        id: 'fleurs_aromatique',
        icon: '🫧',
        label: 'Herboriste',
        description: 'Photographier 3 plantes aromatiques',
        unlocked: countDoneByType(fleurs, 'aromatique') >= 3,
      },
      {
        id: 'fleurs_aquatique',
        icon: '💧',
        label: 'Fleurs des eaux',
        description: 'Photographier 2 fleurs aquatiques',
        unlocked: countDoneByType(fleurs, 'aquatique') >= 2,
      },
      {
        id: 'fleurs_orchidee',
        icon: '🌷',
        label: 'Orchidophile',
        description: 'Photographier 3 orchidées sauvages',
        unlocked: countDoneByType(fleurs, 'orchidée sauvage') >= 3,
      },
      {
        id: 'fleurs_alpine',
        icon: '🏔️',
        label: 'Alpiniste floral',
        description: 'Photographier l\'Edelweiss',
        unlocked: isDoneById(fleurs, 'f68'),
      },
      {
        id: 'fleurs_carnivore',
        icon: '🪤',
        label: 'Chasseur de plantes carnivores',
        description: 'Photographier 2 plantes carnivores',
        unlocked: countDoneByType(fleurs, 'carnivore') >= 2,
      },
      {
        id: 'fleurs_50',
        icon: '🌻',
        label: 'Grand botaniste',
        description: 'Photographier 50 fleurs',
        unlocked: countDone(fleurs) >= 50,
      },
      {
        id: 'fleurs_complet',
        icon: '💐',
        label: 'Jardin complet',
        description: 'Photographier les 100 fleurs',
        unlocked: countDone(fleurs) >= 100,
      },
    ] : []),

    // --- Badges Arbres ---
    ...(arbres ? [
      {
        id: 'arbres_1',
        icon: '🌱',
        label: 'Jeune pousse',
        description: 'Photographier votre 1er arbre',
        unlocked: countDone(arbres) >= 1,
      },
      {
        id: 'arbres_10',
        icon: '🌿',
        label: 'Promeneur',
        description: 'Photographier 10 arbres',
        unlocked: countDone(arbres) >= 10,
      },
      {
        id: 'arbres_feuillu',
        icon: '🍂',
        label: 'Sylviculteur',
        description: 'Photographier 5 feuillus',
        unlocked: countDoneByType(arbres, 'feuillu') >= 5,
      },
      {
        id: 'arbres_conifere',
        icon: '🌲',
        label: 'Forestier',
        description: 'Photographier 5 conifères',
        unlocked: countDoneByType(arbres, 'conifere') >= 5,
      },
      {
        id: 'arbres_persistant',
        icon: '🍃',
        label: 'Méditerranéen',
        description: 'Photographier 3 feuillus persistants',
        unlocked: countDoneByType(arbres, 'persistant') >= 3,
      },
      {
        id: 'arbres_rare',
        icon: '🦕',
        label: 'Fossile vivant',
        description: 'Photographier le Ginkgo biloba',
        unlocked: isDoneById(arbres, 'a63'),
      },
      {
        id: 'arbres_saule',
        icon: '🌊',
        label: 'Bord de l\'eau',
        description: 'Photographier 3 saules différents',
        unlocked: arbres.objects.filter(o => o.done && o.name.toLowerCase().includes('saule')).length >= 3,
      },
      {
        id: 'arbres_chene',
        icon: '🌳',
        label: 'Ami des chênes',
        description: 'Photographier 4 espèces de chênes',
        unlocked: arbres.objects.filter(o => o.done && o.name.toLowerCase().includes('chene')).length >= 4,
      },
      {
        id: 'arbres_40',
        icon: '🏕️',
        label: 'Dendrologue',
        description: 'Photographier 40 arbres',
        unlocked: countDone(arbres) >= 40,
      },
      {
        id: 'arbres_complet',
        icon: '🌳',
        label: 'Forêt complète',
        description: 'Photographier les 80 arbres',
        unlocked: countDone(arbres) >= 80,
      },
    ] : []),

    // --- Badges Oiseaux ---
    ...(oiseaux ? [
      {
        id: 'oiseaux_1',
        icon: '🐣',
        label: 'Premier envol',
        description: 'Photographier votre 1er oiseau',
        unlocked: countDone(oiseaux) >= 1,
      },
      {
        id: 'oiseaux_10',
        icon: '🐤',
        label: 'Observateur',
        description: 'Photographier 10 oiseaux',
        unlocked: countDone(oiseaux) >= 10,
      },
      {
        id: 'oiseaux_rapace',
        icon: '🦅',
        label: 'Fauconnier',
        description: 'Photographier 3 rapaces',
        unlocked: countDoneByType(oiseaux, 'rapace') >= 3,
      },
      {
        id: 'oiseaux_grand_rapace',
        icon: '🦁',
        label: 'Grands rapaces',
        description: 'Photographier l\'Aigle royal et le Vautour fauve',
        unlocked: isDoneById(oiseaux, 'o82') && isDoneById(oiseaux, 'o85'),
      },
      {
        id: 'oiseaux_nocturne',
        icon: '🦉',
        label: 'Noctambule',
        description: 'Photographier 1 rapace nocturne',
        unlocked: countDoneByType(oiseaux, 'nocturne') >= 1,
      },
      {
        id: 'oiseaux_chouettes',
        icon: '🌙',
        label: 'Chasseur de nuit',
        description: 'Photographier 3 rapaces nocturnes',
        unlocked: countDoneByType(oiseaux, 'nocturne') >= 3,
      },
      {
        id: 'oiseaux_passereau',
        icon: '🐦',
        label: 'Ami des oiseaux',
        description: 'Photographier 10 passereaux',
        unlocked: countDoneByType(oiseaux, 'passereau') >= 10,
      },
      {
        id: 'oiseaux_pic',
        icon: '🪵',
        label: 'Piciforme',
        description: 'Photographier les 6 pics et torcol',
        unlocked: countDoneByType(oiseaux, 'piciforme') >= 6,
      },
      {
        id: 'oiseaux_marin',
        icon: '🌊',
        label: 'Ornithologue marin',
        description: 'Photographier 5 oiseaux marins',
        unlocked: (countDoneByType(oiseaux, 'charadriiforme') + countDoneByType(oiseaux, 'suliforme') + countDoneByType(oiseaux, 'procellariforme')) >= 5,
      },
      {
        id: 'oiseaux_macareux',
        icon: '🐧',
        label: 'Macareux !',
        description: 'Photographier le Macareux moine',
        unlocked: isDoneById(oiseaux, 'o147'),
      },
      {
        id: 'oiseaux_cigogne',
        icon: '👶',
        label: 'Nid de cigognes',
        description: 'Photographier les 2 cigognes',
        unlocked: isDoneById(oiseaux, 'o99') && isDoneById(oiseaux, 'o100'),
      },
      {
        id: 'oiseaux_martin',
        icon: '💎',
        label: 'Joyau des rivières',
        description: 'Photographier le Martin-pêcheur',
        unlocked: isDoneById(oiseaux, 'o113'),
      },
      {
        id: 'oiseaux_50',
        icon: '🦜',
        label: 'Grand ornithologue',
        description: 'Photographier 50 oiseaux',
        unlocked: countDone(oiseaux) >= 50,
      },
      {
        id: 'oiseaux_complet',
        icon: '🦅',
        label: 'Ornithologue expert',
        description: 'Photographier les 150 oiseaux',
        unlocked: countDone(oiseaux) >= 150,
      },
    ] : []),

    // --- Badges Minéraux ---
    ...(mineraux ? [
      {
        id: 'min_1',
        icon: '💎',
        label: 'Géologue débutant',
        description: 'Photographier votre 1er minéral',
        unlocked: countDone(mineraux) >= 1,
      },
      {
        id: 'min_10',
        icon: '🪨',
        label: 'Collecteur',
        description: 'Photographier 10 minéraux',
        unlocked: countDone(mineraux) >= 10,
      },
      {
        id: 'min_silicate',
        icon: '🔮',
        label: 'Silicates',
        description: 'Photographier 5 silicates',
        unlocked: countDoneByType(mineraux, 'silicate') >= 5,
      },
      {
        id: 'min_quartz',
        icon: '🌈',
        label: 'Collection de quartz',
        description: 'Photographier 4 variétés de quartz',
        unlocked: mineraux.objects.filter(o => o.done && o.name.toLowerCase().includes('quartz')).length >= 4,
      },
      {
        id: 'min_carbonate',
        icon: '🏔️',
        label: 'Carbonates',
        description: 'Photographier 3 carbonates',
        unlocked: countDoneByType(mineraux, 'carbonate') >= 3,
      },
      {
        id: 'min_metal',
        icon: '⚙️',
        label: 'Métallurgiste',
        description: 'Photographier 3 métaux natifs',
        unlocked: countDoneByType(mineraux, 'métal natif') >= 3,
      },
      {
        id: 'min_precieux',
        icon: '👑',
        label: 'Trésor',
        description: 'Photographier l\'Or, l\'Argent et le Diamant',
        unlocked: isDoneById(mineraux, 'min56') && isDoneById(mineraux, 'min57') && isDoneById(mineraux, 'min62'),
      },
      {
        id: 'min_corindon',
        icon: '❤️',
        label: 'Rubis et Saphir',
        description: 'Photographier le Rubis et le Saphir',
        unlocked: isDoneById(mineraux, 'min48') && isDoneById(mineraux, 'min49'),
      },
      {
        id: 'min_volcanique',
        icon: '🌋',
        label: 'Volcanologue',
        description: 'Photographier l\'Obsidienne et le Basalte',
        unlocked: isDoneById(mineraux, 'min69') && isDoneById(mineraux, 'min72'),
      },
      {
        id: 'min_emeraude',
        icon: '💚',
        label: 'Pierres précieuses',
        description: 'Photographier l\'Émeraude et l\'Aigue-marine',
        unlocked: isDoneById(mineraux, 'min26') && isDoneById(mineraux, 'min25'),
      },
      {
        id: 'min_40',
        icon: '🏔️',
        label: 'Géologue expert',
        description: 'Photographier 40 minéraux',
        unlocked: countDone(mineraux) >= 40,
      },
      {
        id: 'min_complet',
        icon: '💍',
        label: 'Minéralogiste',
        description: 'Photographier les 80 minéraux',
        unlocked: countDone(mineraux) >= 80,
      },
    ] : []),

    // --- Badges Champignons ---
    ...(champignons ? [
      {
        id: 'ch_1',
        icon: '🍄',
        label: 'Cueilleur débutant',
        description: 'Photographier votre 1er champignon',
        unlocked: countDone(champignons) >= 1,
      },
      {
        id: 'ch_10',
        icon: '🧺',
        label: 'Cueilleur',
        description: 'Photographier 10 champignons',
        unlocked: countDone(champignons) >= 10,
      },
      {
        id: 'ch_comestible',
        icon: '🍽️',
        label: 'Fin gourmet',
        description: 'Photographier 5 champignons comestibles',
        unlocked: countDoneByType(champignons, 'comestible') >= 5,
      },
      {
        id: 'ch_mortel',
        icon: '☠️',
        label: 'Prudent',
        description: 'Identifier les 4 champignons mortels',
        unlocked: countDoneByType(champignons, 'mortel') >= 4,
      },
      {
        id: 'ch_cepe',
        icon: '🌰',
        label: 'Chasseur de cèpes',
        description: 'Photographier les 3 cèpes',
        unlocked: champignons.objects.filter(o => o.done && o.name.toLowerCase().includes('cèpe')).length >= 3,
      },
      {
        id: 'ch_truffe',
        icon: '⚫',
        label: 'Rabassier',
        description: 'Photographier les 2 truffes',
        unlocked: champignons.objects.filter(o => o.done && o.name.toLowerCase().includes('truffe')).length >= 2,
      },
      {
        id: 'ch_morille',
        icon: '🌸',
        label: 'Printanier',
        description: 'Photographier les 2 morilles',
        unlocked: champignons.objects.filter(o => o.done && o.name.toLowerCase().includes('morille')).length >= 2,
      },
      {
        id: 'ch_chanterelle',
        icon: '🟡',
        label: 'Chasseur de chanterelles',
        description: 'Photographier les 3 chanterelles',
        unlocked: (isDoneById(champignons, 'ch07') && isDoneById(champignons, 'ch08') && isDoneById(champignons, 'ch09')),
      },
      {
        id: 'ch_medicinal',
        icon: '💊',
        label: 'Pharmacologue',
        description: 'Photographier 2 champignons médicinaux',
        unlocked: countDoneByType(champignons, 'médicinal') >= 2,
      },
      {
        id: 'ch_40',
        icon: '🍂',
        label: 'Mycologue',
        description: 'Photographier 40 champignons',
        unlocked: countDone(champignons) >= 40,
      },
      {
        id: 'ch_complet',
        icon: '🏆',
        label: 'Expert mycologue',
        description: 'Photographier les 80 champignons',
        unlocked: countDone(champignons) >= 80,
      },
    ] : []),

    // --- Badges Pays ---
    ...(pays ? [
      {
        id: 'pays_1',
        icon: '✈️',
        label: 'Premier voyage',
        description: 'Visiter votre 1er pays',
        unlocked: countDone(pays) >= 1,
      },
      {
        id: 'pays_10',
        icon: '🗺️',
        label: 'Voyageur',
        description: 'Visiter 10 pays',
        unlocked: countDone(pays) >= 10,
      },
      {
        id: 'pays_europe',
        icon: '🇪🇺',
        label: 'Européen',
        description: 'Visiter 10 pays européens',
        unlocked: countDoneByType(pays, 'europe') >= 10,
      },
      {
        id: 'pays_europe_complet',
        icon: '🏰',
        label: 'Grand tour d\'Europe',
        description: 'Visiter 30 pays européens',
        unlocked: countDoneByType(pays, 'europe') >= 30,
      },
      {
        id: 'pays_asie',
        icon: '🏯',
        label: 'Asiatique',
        description: 'Visiter 5 pays asiatiques',
        unlocked: countDoneByType(pays, 'asie') >= 5,
      },
      {
        id: 'pays_asie_complet',
        icon: '🐉',
        label: 'Grand voyageur d\'Asie',
        description: 'Visiter 20 pays asiatiques',
        unlocked: countDoneByType(pays, 'asie') >= 20,
      },
      {
        id: 'pays_afrique',
        icon: '🦁',
        label: 'Africain',
        description: 'Visiter 5 pays africains',
        unlocked: countDoneByType(pays, 'afrique') >= 5,
      },
      {
        id: 'pays_afrique_complet',
        icon: '🌍',
        label: 'Safari continental',
        description: 'Visiter 30 pays africains',
        unlocked: countDoneByType(pays, 'afrique') >= 30,
      },
      {
        id: 'pays_amerique',
        icon: '🌎',
        label: 'Américain',
        description: 'Visiter 5 pays américains',
        unlocked: (countDoneByType(pays, 'amérique du nord') + countDoneByType(pays, 'amérique du sud') + countDoneByType(pays, 'amérique centrale')) >= 5,
      },
      {
        id: 'pays_oceanie',
        icon: '🏝️',
        label: 'Océanien',
        description: 'Visiter 3 pays d\'Océanie',
        unlocked: countDoneByType(pays, 'océanie') >= 3,
      },
      {
        id: 'pays_voisins',
        icon: '🤝',
        label: 'Voisins de la France',
        description: 'Visiter tous les pays frontaliers de la France',
        unlocked: ['p02', 'p04', 'p05', 'p08', 'p11', 'p12', 'p07'].every(id => isDoneById(pays, id)),
      },
      {
        id: 'pays_g7',
        icon: '💼',
        label: 'Tour du G7',
        description: 'Visiter les 7 pays du G7',
        unlocked: ['p01', 'p02', 'p04', 'p06', 'p31', 'p32', 'p59'].every(id => isDoneById(pays, id)),
      },
      {
        id: 'pays_50',
        icon: '🌍',
        label: 'Grand voyageur',
        description: 'Visiter 50 pays',
        unlocked: countDone(pays) >= 50,
      },
      {
        id: 'pays_100',
        icon: '🌐',
        label: 'Globe-trotteur',
        description: 'Visiter 100 pays',
        unlocked: countDone(pays) >= 100,
      },
      {
        id: 'pays_150',
        icon: '🚀',
        label: 'Explorateur mondial',
        description: 'Visiter 150 pays',
        unlocked: countDone(pays) >= 150,
      },
      {
        id: 'pays_complet',
        icon: '🏆',
        label: 'Tour du monde',
        description: 'Visiter les 195 pays',
        unlocked: countDone(pays) >= 195,
      },
    ] : []),
  ];

  return badges;
}