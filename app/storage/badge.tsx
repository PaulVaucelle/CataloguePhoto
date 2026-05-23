import { Domain } from "./catalogue";

export type Badge = {
  id: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

function countDone(domain: Domain): number {
  return domain.objects.filter((o) => o.done).length;
}

function countDoneByType(domain: Domain, type: string): number {
  return domain.objects.filter(
    (o) => o.done && o.type.toLowerCase().includes(type.toLowerCase()),
  ).length;
}

function countDoneById(domain: Domain, id: string): boolean {
  return domain.objects.some((o) => o.id === id && o.done);
}

export function computeBadges(domains: Domain[]): Badge[] {
  const astro = domains.find((d) => d.id === "astro");
  const fleurs = domains.find((d) => d.id === "fleurs");
  const arbres = domains.find((d) => d.id === "arbres");
  const oiseaux = domains.find((d) => d.id === "oiseaux");

  const totalDone = domains.reduce((s, d) => s + countDone(d), 0);

  const badges: Badge[] = [
    // --- Badges globaux ---
    {
      id: "global_1",
      icon: "🌱",
      label: "Premier pas",
      description: "Photographier votre 1er objet",
      unlocked: totalDone >= 1,
    },
    {
      id: "global_10",
      icon: "📷",
      label: "Explorateur",
      description: "Photographier 10 objets au total",
      unlocked: totalDone >= 10,
    },
    {
      id: "global_50",
      icon: "🏅",
      label: "Collectionneur",
      description: "Photographier 50 objets au total",
      unlocked: totalDone >= 50,
    },
    {
      id: "global_100",
      icon: "🌟",
      label: "Expert",
      description: "Photographier 100 objets au total",
      unlocked: totalDone >= 100,
    },

    // --- Badges Astronomie ---
    ...(astro
      ? [
          {
            id: "astro_1",
            icon: "🔭",
            label: "Apprenti astronome",
            description: "Photographier votre 1er objet Messier",
            unlocked: countDone(astro) >= 1,
          },
          {
            id: "astro_10",
            icon: "🌌",
            label: "Chasseur de galaxies",
            description: "Photographier 10 galaxies",
            unlocked: countDoneByType(astro, "galaxie") >= 10,
          },
          {
            id: "astro_nebuleuse",
            icon: "💫",
            label: "Chasseur de nébuleuses",
            description: "Photographier 5 nébuleuses",
            unlocked: countDoneByType(astro, "nebuleuse") >= 5,
          },
          {
            id: "astro_amas",
            icon: "✨",
            label: "Chasseur d'amas",
            description: "Photographier 10 amas",
            unlocked: countDoneByType(astro, "amas") >= 10,
          },
          {
            id: "astro_m42",
            icon: "⭐",
            label: "La Grande Nébuleuse",
            description: "Photographier M42 — Nébuleuse d'Orion",
            unlocked: astro ? countDoneById(astro, "m42") : false,
          },
          {
            id: "astro_m31",
            icon: "🌠",
            label: "Voisine cosmique",
            description: "Photographier M31 — Galaxie d'Andromède",
            unlocked: astro ? countDoneById(astro, "m31") : false,
          },
          {
            id: "astro_m45",
            icon: "🌃",
            label: "Les Sept Soeurs",
            description: "Photographier M45 — Les Pléiades",
            unlocked: astro ? countDoneById(astro, "m45") : false,
          },
          {
            id: "astro_complet",
            icon: "🏆",
            label: "Messier complet",
            description: "Photographier les 110 objets Messier",
            unlocked: countDone(astro) >= 110,
          },
        ]
      : []),

    // --- Badges Fleurs ---
    ...(fleurs
      ? [
          {
            id: "fleurs_1",
            icon: "🌸",
            label: "Premier bouquet",
            description: "Photographier votre 1ère fleur",
            unlocked: countDone(fleurs) >= 1,
          },
          {
            id: "fleurs_sauvage",
            icon: "🌿",
            label: "Amoureux de la nature",
            description: "Photographier 5 fleurs sauvages",
            unlocked: countDoneByType(fleurs, "sauvage") >= 5,
          },
          {
            id: "fleurs_aromatique",
            icon: "🫧",
            label: "Herboriste",
            description: "Photographier 3 plantes aromatiques",
            unlocked: countDoneByType(fleurs, "aromatique") >= 3,
          },
          {
            id: "fleurs_complet",
            icon: "💐",
            label: "Jardin complet",
            description: "Photographier les 40 fleurs",
            unlocked: countDone(fleurs) >= 40,
          },
        ]
      : []),

    // --- Badges Arbres ---
    ...(arbres
      ? [
          {
            id: "arbres_1",
            icon: "🌱",
            label: "Jeune pousse",
            description: "Photographier votre 1er arbre",
            unlocked: countDone(arbres) >= 1,
          },
          {
            id: "arbres_feuillu",
            icon: "🍂",
            label: "Sylviculteur",
            description: "Photographier 5 feuillus",
            unlocked: countDoneByType(arbres, "feuillu") >= 5,
          },
          {
            id: "arbres_conifere",
            icon: "🌲",
            label: "Forestier",
            description: "Photographier 5 conifères",
            unlocked: countDoneByType(arbres, "conifere") >= 5,
          },
          {
            id: "arbres_complet",
            icon: "🌳",
            label: "Forêt complète",
            description: "Photographier les 40 arbres",
            unlocked: countDone(arbres) >= 40,
          },
        ]
      : []),

    // --- Badges Oiseaux ---
    ...(oiseaux
      ? [
          {
            id: "oiseaux_1",
            icon: "🐣",
            label: "Premier envol",
            description: "Photographier votre 1er oiseau",
            unlocked: countDone(oiseaux) >= 1,
          },
          {
            id: "oiseaux_rapace",
            icon: "🦅",
            label: "Fauconnier",
            description: "Photographier 3 rapaces",
            unlocked: countDoneByType(oiseaux, "rapace") >= 3,
          },
          {
            id: "oiseaux_nocturne",
            icon: "🦉",
            label: "Noctambule",
            description: "Photographier 1 rapace nocturne",
            unlocked: countDoneByType(oiseaux, "nocturne") >= 1,
          },
          {
            id: "oiseaux_passereau",
            icon: "🐦",
            label: "Ami des oiseaux",
            description: "Photographier 10 passereaux",
            unlocked: countDoneByType(oiseaux, "passereau") >= 10,
          },
          {
            id: "oiseaux_complet",
            icon: "🦜",
            label: "Ornithologue",
            description: "Photographier les 60 oiseaux",
            unlocked: countDone(oiseaux) >= 60,
          },
        ]
      : []),
  ];

  return badges;
}
