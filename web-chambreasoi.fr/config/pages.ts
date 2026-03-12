import type { PageMeta } from "@config/types/page-meta";

export const sitemap: Record<string, PageMeta> = {
  home: {
    key: "home",
    path: "/",
    title: "UNE CHAMBRE A SOI - Chambre d'hôtes Challes-les-Eaux",
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
    title: "Réservation",
    description: "Consultez les tarifs et réservez votre séjour.",
    jsonLd: {
      "@type": "WebPage",
      name: "Tarifs et réservation",
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
};
