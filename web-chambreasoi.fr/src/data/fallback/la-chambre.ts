import type { RoomPageAccent } from "@lib/sanity";

export type Accent = RoomPageAccent;

export interface ContentCard {
  _key?: string;
  title: string;
  body: string;
  accent: Accent;
}

export const accentClasses: Record<Accent, string> = {
  stone: "bg-accentStone/25",
  forest: "bg-accentForest/20",
  bistre: "bg-accentBistre/25",
};

export const defaultPrivateCards: ContentCard[] = [
  {
    title: "La chambre",
    body: "Une chambre équipée d'un lit double avec draps et couette, d'un chauffage individuel, du wifi, d'un dressing ainsi que d'un petit bureau pour travailler ou vous installer confortablement.",
    accent: "stone",
  },
  {
    title: "La terrasse",
    body: "Depuis votre chambre, vous accédez directement à la terrasse, idéale pour savourer vos petits-déjeuners ou profiter du soleil en toute tranquillité lorsque le temps le permet.",
    accent: "forest",
  },
  {
    title: "La salle de bain",
    body: "Vous disposez également d'une salle de bain privative avec douche ainsi que du linge de toilette fourni pour votre confort.",
    accent: "bistre",
  },
];

export const defaultSharedCards: ContentCard[] = [
  {
    title: "La cuisine équipée",
    body: "La partie cuisine, accessible de 18h à 20h30, comprend un réfrigérateur, une bouilloire, des plaques chauffantes et un micro-ondes pour chauffer ou réchauffer vos plats.",
    accent: "stone",
  },
  {
    title: "La salle à manger",
    body: "Un espace salle à manger est prévu pour prendre vos petits-déjeuners ou vos repas sur place dans un cadre convivial.",
    accent: "forest",
  },
  {
    title: "Le salon",
    body: "Un coin salon avec téléviseur est également à votre disposition pour vos moments de détente.",
    accent: "bistre",
  },
];

export const defaultServiceCards: ContentCard[] = [
  {
    title: "Chauffage individuel",
    body: "La chambre est équipée d'un chauffage individuel pour un confort optimal en toute saison.",
    accent: "forest",
  },
  {
    title: "Parking et local vélo sécurisé",
    body: "Un parking pour voiture ou moto est disponible devant la maison, ainsi qu'un abri sécurisé pouvant accueillir jusqu'à deux vélos.",
    accent: "bistre",
  },
  {
    title: "Connexion wifi",
    body: "Une connexion wifi est disponible pour rester connecté pendant votre séjour.",
    accent: "stone",
  },
];

export const rightCardPositions = [
  "lg:col-start-3 lg:row-start-3",
  "lg:col-start-5 lg:row-start-3",
  "lg:col-start-4 lg:row-start-3",
] as const;
export const leftCardPositions = [
  "lg:col-start-1 lg:row-start-3",
  "lg:col-start-2 lg:row-start-3",
  "lg:col-start-3 lg:row-start-3",
] as const;
export const mobileInterleavedCardOrdersWithHero = [
  "max-lg:order-4 lg:order-none",
  "max-lg:order-6 lg:order-none",
  "max-lg:order-8 lg:order-none",
] as const;
export const mobileInterleavedGalleryOrdersWithHero = [
  "max-lg:order-5 lg:order-none",
  "max-lg:order-7 lg:order-none",
  "max-lg:order-9 lg:order-none",
] as const;
export const mobileInterleavedCardOrdersNoHero = [
  "max-lg:order-3 lg:order-none",
  "max-lg:order-5 lg:order-none",
  "max-lg:order-7 lg:order-none",
] as const;
export const mobileInterleavedGalleryOrdersNoHero = [
  "max-lg:order-4 lg:order-none",
  "max-lg:order-6 lg:order-none",
  "max-lg:order-8 lg:order-none",
] as const;
