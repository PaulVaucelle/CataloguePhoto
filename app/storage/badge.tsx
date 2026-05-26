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
        description: 'Photographier votre 1er objet Messier',
        unlocked: countDone(astro) >= 1,
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
        id: 'astro_complet',
        icon: '🏆',
        label: 'Messier complet',
        description: 'Photographier les 110 objets Messier',
        unlocked: countDone(astro) >= 110,
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
        id: 'fleurs_complet',
        icon: '💐',
        label: 'Jardin complet',
        description: 'Photographier les 40 fleurs',
        unlocked: countDone(fleurs) >= 40,
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
        id: 'arbres_complet',
        icon: '🌳',
        label: 'Forêt complète',
        description: 'Photographier les 40 arbres',
        unlocked: countDone(arbres) >= 40,
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
        id: 'oiseaux_rapace',
        icon: '🦅',
        label: 'Fauconnier',
        description: 'Photographier 3 rapaces',
        unlocked: countDoneByType(oiseaux, 'rapace') >= 3,
      },
      {
        id: 'oiseaux_nocturne',
        icon: '🦉',
        label: 'Noctambule',
        description: 'Photographier 1 rapace nocturne',
        unlocked: countDoneByType(oiseaux, 'nocturne') >= 1,
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
        description: 'Photographier les 3 pics',
        unlocked: countDoneByType(oiseaux, 'piciforme') >= 3,
      },
      {
        id: 'oiseaux_complet',
        icon: '🦜',
        label: 'Ornithologue',
        description: 'Photographier les 60 oiseaux',
        unlocked: countDone(oiseaux) >= 60,
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
        id: 'min_silicate',
        icon: '🔮',
        label: 'Silicates',
        description: 'Photographier 5 silicates',
        unlocked: countDoneByType(mineraux, 'silicate') >= 5,
      },
      {
        id: 'min_carbonate',
        icon: '🪨',
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
        unlocked: isDoneById(mineraux, 'min34') && isDoneById(mineraux, 'min35') && isDoneById(mineraux, 'min38'),
      },
      {
        id: 'min_volcanique',
        icon: '🌋',
        label: 'Volcanologue',
        description: 'Photographier l\'Obsidienne et le Basalte',
        unlocked: isDoneById(mineraux, 'min44') && isDoneById(mineraux, 'min46'),
      },
      {
        id: 'min_20',
        icon: '🏔️',
        label: 'Géologue expert',
        description: 'Photographier 20 minéraux',
        unlocked: countDone(mineraux) >= 20,
      },
      {
        id: 'min_complet',
        icon: '💍',
        label: 'Minéralogiste',
        description: 'Photographier les 50 minéraux',
        unlocked: countDone(mineraux) >= 50,
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
        id: 'ch_comestible',
        icon: '🧺',
        label: 'Cueilleur',
        description: 'Photographier 5 champignons comestibles',
        unlocked: countDoneByType(champignons, 'comestible') >= 5,
      },
      {
        id: 'ch_mortel',
        icon: '☠️',
        label: 'Prudent',
        description: 'Identifier les 3 champignons mortels',
        unlocked: countDoneByType(champignons, 'mortel') >= 3,
      },
      {
        id: 'ch_cepe',
        icon: '🌰',
        label: 'Chasseur de cèpes',
        description: 'Photographier le Cèpe de Bordeaux',
        unlocked: isDoneById(champignons, 'ch02'),
      },
      {
        id: 'ch_truffe',
        icon: '⚫',
        label: 'Rabassier',
        description: 'Photographier la Truffe noire',
        unlocked: isDoneById(champignons, 'ch07'),
      },
      {
        id: 'ch_morille',
        icon: '🌸',
        label: 'Printanier',
        description: 'Photographier la Morille commune',
        unlocked: isDoneById(champignons, 'ch06'),
      },
      {
        id: 'ch_20',
        icon: '🍂',
        label: 'Mycologue',
        description: 'Photographier 20 champignons',
        unlocked: countDone(champignons) >= 20,
      },
      {
        id: 'ch_complet',
        icon: '🏆',
        label: 'Expert mycologue',
        description: 'Photographier les 50 champignons',
        unlocked: countDone(champignons) >= 50,
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
        id: 'pays_europe',
        icon: '🇪🇺',
        label: 'Européen',
        description: 'Visiter 10 pays européens',
        unlocked: countDoneByType(pays, 'europe') >= 10,
      },
      {
        id: 'pays_asie',
        icon: '🏯',
        label: 'Asiatique',
        description: 'Visiter 5 pays asiatiques',
        unlocked: countDoneByType(pays, 'asie') >= 5,
      },
      {
        id: 'pays_afrique',
        icon: '🦁',
        label: 'Africain',
        description: 'Visiter 5 pays africains',
        unlocked: countDoneByType(pays, 'afrique') >= 5,
      },
      {
        id: 'pays_amerique',
        icon: '🌎',
        label: 'Américain',
        description: 'Visiter 5 pays américains',
        unlocked: countDoneByType(pays, 'amérique') >= 5,
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
        unlocked: ['p02','p04','p05','p08','p11','p12','p07'].every(id => isDoneById(pays, id)),
      },
      {
        id: 'pays_g20',
        icon: '💼',
        label: 'Tour du G20',
        description: 'Visiter 10 pays du G20',
        unlocked: countDone(pays) >= 10,
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