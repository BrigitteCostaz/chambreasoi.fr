import type { PageMeta } from "@config/types/page-meta";

export const sitemap: Record<string, PageMeta> = {
  home: {
    key: "home",
    path: "/",
    title: "UNE CHAMBRE À SOI - Chambre d'hôtes Challes-les-Eaux",
    description:
      "Chambre d'hôtes calme à Challes-les-Eaux (Savoie). A43 sortie 20 (3km), WiFi, terrasse, parking gratuit.",
    jsonLd: {
      "@type": "WebPage",
      name: "Une chambre à soi — Chambre d'hôtes à Challes-les-Eaux",
    },
  },

  room: {
    key: "room",
    path: "/la-chambre",
    title: "La chambre",
    description: "Découvrez la chambre et ses équipements.",
    mainEntityId: "https://chambreasoi.fr/#room-1",
    jsonLd: [
      {
        "@type": "WebPage",
        name: "La chambre — Une chambre à soi",
      },
      {
        "@type": "HotelRoom",
        "@id": "https://chambreasoi.fr/#room-1",
      },
    ],
  },

  reservations: {
    key: "reservations",
    path: "/tarifs-et-reservation",
    title: "Infos pratiques",
    description: "Consultez les tarifs, la disponibilité et les modalités de votre séjour.",
    jsonLd: {
      "@type": "WebPage",
      name: "Tarifs et disponibilité",
    },
  },

  location: {
    key: "location",
    path: "/acces-et-localisation",
    title: "Localisation",
    description: "Comment accéder à la chambre d'hôtes à Challes-les-Eaux.",
    jsonLd: {
      "@type": "Place",
      name: "Une chambre à soi",
      "@id": "https://chambreasoi.fr/#place",
    },
  },

  surroundings: {
    key: "surroundings",
    path: "/decouvrir-les-environs",
    title: "Bons Plans",
    description: "Activités et lieux à découvrir autour de Challes-les-Eaux.",
    jsonLd: {
      "@type": "WebPage",
      name: "Découvrir les environs",
    },
  },

  mentionsLegales: {
    key: "mentionsLegales",
    path: "/legales/mentions-legales",
    title: "mentions légales",
    description: "Consultez les mentions légales de Une chambre à soi.",
    jsonLd: {
      "@type": "WebPage",
      name: "Mentions légales",
    },
  },

  politiqueConfidentialite: {
    key: "politiqueConfidentialite",
    path: "/legales/politique-confidentialite",
    title: "politique de confidentialité",
    description: "Consultez la politique de confidentialité de Une chambre à soi.",
    jsonLd: {
      "@type": "WebPage",
      name: "Politique de confidentialité",
    },
  },
};
