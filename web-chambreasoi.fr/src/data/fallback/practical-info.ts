import type {
  PracticalInfoAccent,
  PracticalInfoContentResult,
  PracticalInfoTextBlockResult,
} from "@lib/sanity";

export const tariffColClasses = [
  "lg:row-start-3 lg:col-start-2",
  "lg:row-start-4 lg:col-start-2",
  "lg:row-start-5 lg:col-start-2",
  "lg:row-start-6 lg:col-start-2",
] as const;

export const tariffAccentClasses = [
  "bg-accentStone/25",
  "bg-accentForest/20",
  "bg-accentBistre/25",
  "bg-accentStone/25",
] as const;

export const accentClasses: Record<PracticalInfoAccent, string> = {
  stone: "bg-accentStone/25",
  forest: "bg-accentForest/20",
  bistre: "bg-accentBistre/25",
};

export const bookingCardPositionClasses = [
  "lg:col-start-3 lg:row-start-3",
  "lg:col-start-4 lg:row-start-3",
  "lg:col-start-5 lg:row-start-3",
  "lg:col-start-3 lg:row-start-4",
  "lg:col-start-4 lg:row-start-4",
  "lg:col-start-5 lg:row-start-4",
] as const;

export const serviceDesktopPositionClassesByCount = {
  1: ["lg:col-start-5 lg:row-start-3"],
  2: ["lg:col-start-4 lg:row-start-3", "lg:col-start-5 lg:row-start-3"],
  3: [
    "lg:col-start-3 lg:row-start-3",
    "lg:col-start-4 lg:row-start-3",
    "lg:col-start-5 lg:row-start-3",
  ],
  4: [
    "lg:col-start-2 lg:row-start-3",
    "lg:col-start-3 lg:row-start-3",
    "lg:col-start-4 lg:row-start-3",
    "lg:col-start-5 lg:row-start-3",
  ],
  5: [
    "lg:col-start-1 lg:row-start-3",
    "lg:col-start-2 lg:row-start-3",
    "lg:col-start-3 lg:row-start-3",
    "lg:col-start-4 lg:row-start-3",
    "lg:col-start-5 lg:row-start-3",
  ],
} as const;

type BookingCard = NonNullable<PracticalInfoContentResult["bookingCards"]>[number];
type ServiceCard = NonNullable<PracticalInfoContentResult["serviceCards"]>[number];

export type ServiceImage = {
  alt: string;
  placeholderSrc: string;
  sanityImage?: {
    asset?: { _ref?: string; _id?: string; url?: string } | null;
    alt?: string | null;
  } | null;
  fallbackImagePath?: string;
};

const textBlock = (
  key: string,
  children: Array<string | { text: string; strong: true }>
): PracticalInfoTextBlockResult => ({
  _key: key,
  _type: "block",
  style: "normal",
  children: children.map((child, index) => {
    const isStrong = typeof child !== "string";
    return {
      _key: `${key}-${index}`,
      _type: "span",
      text: isStrong ? child.text : child,
      marks: isStrong ? ["strong"] : [],
    };
  }),
});

export const defaultBookingCards: BookingCard[] = [
  {
    _key: "arrival",
    title: "Arrivée",
    body: [
      textBlock("arrival-body", [
        "Votre chambre sera disponible à partir de ",
        { text: "15h", strong: true },
        " le jour de votre arrivée. Vous pouvez toutefois déposer vos bagages en dehors de ces horaires, sur demande lors de la réservation.",
      ]),
    ],
    secondaryText: null,
    accent: "stone",
  },
  {
    _key: "departure",
    title: "Départ",
    body: [
      textBlock("departure-body", [
        "Le jour de votre départ, merci de libérer votre chambre avant ",
        { text: "11h", strong: true },
        ".",
      ]),
    ],
    secondaryText: null,
    accent: "forest",
  },
  {
    _key: "booking",
    title: "Réservation",
    body: [
      textBlock("booking-body", [
        "Les réservations se font ",
        { text: "uniquement par téléphone", strong: true },
        ".",
      ]),
    ],
    secondaryText: null,
    accent: "bistre",
  },
  {
    _key: "payment",
    title: "Paiement",
    body: [
      textBlock("payment-body", [
        "Le paiement s'effectue à l'arrivée par chèque, carte bancaire ou en espèces.",
      ]),
    ],
    secondaryText:
      "Vous trouverez 2 distributeurs automatiques dans le centre de Challes-les-Eaux.",
    accent: "stone",
  },
  {
    _key: "pets",
    title: "Animaux",
    body: [
      textBlock("pets-body", [
        "Les animaux de compagnie ne sont pas acceptés dans l'établissement.",
      ]),
    ],
    secondaryText: null,
    accent: "forest",
  },
  {
    _key: "smoking",
    title: "Tabac",
    body: [
      textBlock("smoking-body", [
        "L'établissement est entièrement non-fumeur. Il est interdit de fumer dans les chambres et les espaces communs. Un espace fumeur est disponible à l'extérieur.",
      ]),
    ],
    secondaryText: null,
    accent: "bistre",
  },
];

export const defaultServiceCards: ServiceCard[] = [
  {
    _key: "health",
    category: "Santé",
    title: "Pour la clinique Médipôle",
    body: [
      textBlock("health-body", [
        "Pour les personnes séjournant chez nous dans le cadre d'un rendez-vous ou d'une visite à la clinique Médipôle, nous proposons un ",
        { text: "accompagnement en voiture gratuit", strong: true },
        ", à convenir lors de votre réservation par téléphone.",
      ]),
    ],
    accent: "stone",
  },
  {
    _key: "children",
    category: "Enfants",
    title: "Parents solos",
    body: [
      textBlock("children-body", [
        "Nous proposons ",
        { text: "2 couchages pour enfants (3–10 ans)", strong: true },
        " dans une chambre attenante, au tarif de ",
        { text: "10 € par enfant", strong: true },
        ". À demander au moment de la réservation.",
      ]),
    ],
    accent: "forest",
  },
  {
    _key: "discovery",
    category: "Découverte",
    title: "Séjours touristiques",
    body: [
      textBlock("discovery-body", [
        "Vous disposerez de ",
        { text: "carnets et guides de randonnées", strong: true },
        " de la région, ainsi que de conseils sur les sites à consulter pour préparer vos promenades autour de Challes-les-Eaux.",
      ]),
    ],
    accent: "bistre",
  },
];

export const fallbackServiceImages: ServiceImage[] = [
  {
    alt: "Extérieur d'une maison contemporaine de plain-pied avec façade gris foncé, bardage bois et grande terrasse en bois, dotée de larges baies vitrées coulissantes donnant sur la terrasse, avec un pot de fleurs sur un petit tabouret et un aperçu des espaces de vie intérieurs",
    placeholderSrc: "@images/chambreasoi-service-detail-02.png",
    fallbackImagePath: "@images/chambreasoi-service-detail-02.png",
  },
  {
    alt: "Fauteuil de style Art Déco avec tissu à motifs géométriques et coussin jaune surmonté d'un chapeau marron, à côté d'une table basse en bois brut avec des livres empilés et une petite plante en pot près d'une fenêtre",
    placeholderSrc: "@images/chambreasoi-service-detail-04.png",
    fallbackImagePath: "@images/chambreasoi-service-detail-04.png",
  },
  {
    alt: "Bureau en bois clair avec un tiroir blanc et une chaise en bois à assise paillée, placés contre un mur blanc avec une œuvre encadrée au-dessus, vus depuis un lit blanc au premier plan",
    placeholderSrc: "@images/chambreasoi-service-detail-05.png",
    fallbackImagePath: "@images/chambreasoi-service-detail-05.png",
  },
  {
    alt: "Table à manger sombre dressée avec deux verres à vin vides, des assiettes blanches empilées et des couverts, un arrosoir vert et des branches nues bourgeonnantes dans un vase, avec une œuvre d'art abstraite encadrée aux couleurs vives au mur et un poêle à bois noir en arrière-plan",
    placeholderSrc: "@images/chambreasoi-service-detail-03.png",
    fallbackImagePath: "@images/chambreasoi-service-detail-03.png",
  },
  {
    alt: "Gros plan sur un lit fait avec draps blancs à côté d'un rideau transparent, avec la lumière du soleil projetant des ombres diagonales sur un parquet en bois",
    placeholderSrc: "@images/chambreasoi-service-detail-01.png",
    fallbackImagePath: "@images/chambreasoi-service-detail-01.png",
  },
];
