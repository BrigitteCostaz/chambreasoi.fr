import type { PageMeta } from "@config/types/page-meta";
import { parsePagesSitemap } from "./pages.schema";
import { buildBreadcrumbList } from "./schema/breadcrumbs";

const SITE_URL = "https://chambreasoi.fr";

const breadcrumbHome = { name: "Accueil", path: "/" };

const pages = {
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
    title: "Chambre d'hôtes à Challes-les-Eaux — Une chambre à soi",
    titleNav: "la chambre",
    description:
      "Chambre double avec salle de bain privative, terrasse et WiFi à Challes-les-Eaux (Savoie). Parking gratuit, accès A43 sortie 20",
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
      buildBreadcrumbList(SITE_URL, "/la-chambre", [breadcrumbHome, { name: "La chambre" }]),
    ],
  },

  reservations: {
    key: "reservations",
    path: "/tarifs-et-reservation",
    title: "Tarifs et réservation — Chambre d'hôtes Challes-les-Eaux",
    titleNav: "infos pratiques",
    description:
      "Consultez les tarifs, les disponibilités à jour et les modalités de réservation de votre séjour à Challes-les-Eaux.",
    jsonLd: [
      {
        "@type": "WebPage",
        name: "Tarifs et disponibilité",
      },
      buildBreadcrumbList(SITE_URL, "/tarifs-et-reservation", [
        breadcrumbHome,
        { name: "Tarifs et réservation" },
      ]),
    ],
  },

  location: {
    key: "location",
    path: "/acces-et-localisation",
    title: "Accès et localisation — Chambre d'hôtes Challes-les-Eaux",
    titleNav: "localisation",
    description:
      "Accès facile depuis l'A43 (sortie 20), la gare de Chambéry et le Médipôle de Savoie. Plan, adresse et transports à Challes-les-Eaux.",
    jsonLd: [
      {
        "@type": "Place",
        name: "Une chambre à soi",
        "@id": "https://chambreasoi.fr/#place",
      },
      buildBreadcrumbList(SITE_URL, "/acces-et-localisation", [
        breadcrumbHome,
        { name: "Accès et localisation" },
      ]),
    ],
  },

  surroundings: {
    key: "surroundings",
    path: "/decouvrir-les-environs",
    title: "Découvrir les environs — Chambre d'hôtes Challes-les-Eaux",
    titleNav: "bons plans",
    description:
      "Activités et lieux à découvrir autour de Challes-les-Eaux (Savoie). commerces, restaurants, sentiers de randonnée, etc.",
    jsonLd: [
      {
        "@type": "WebPage",
        name: "Découvrir les environs",
      },
      buildBreadcrumbList(SITE_URL, "/decouvrir-les-environs", [
        breadcrumbHome,
        { name: "Découvrir les environs" },
      ]),
    ],
  },

  mentionsLegales: {
    key: "mentionsLegales",
    path: "/legales/mentions-legales",
    title: "Mentions légales",
    description:
      "Consultez les informations légales de la chambre d'hôtes Une chambre à soi à Challes-les-Eaux.",
    jsonLd: [
      {
        "@type": "WebPage",
        name: "Mentions légales",
      },
      buildBreadcrumbList(SITE_URL, "/legales/mentions-legales", [
        breadcrumbHome,
        { name: "Mentions légales" },
      ]),
    ],
  },

  politiqueConfidentialite: {
    key: "politiqueConfidentialite",
    path: "/legales/politique-confidentialite",
    title: "Politique de confidentialité",
    description:
      "Consultez la politique de confidentialité de la chambre d'hôtes Une chambre à soi à Challes-les-Eaux.",
    jsonLd: [
      {
        "@type": "WebPage",
        name: "Politique de confidentialité",
      },
      buildBreadcrumbList(SITE_URL, "/legales/politique-confidentialite", [
        breadcrumbHome,
        { name: "Politique de confidentialité" },
      ]),
    ],
  },

  notFound: {
    key: "notFound",
    path: "/404",
    title: "Page introuvable — Une chambre à soi",
    description:
      "Cette page n'existe pas ou a été déplacée. Retournez à l'accueil de la chambre d'hôtes Une chambre à soi à Challes-les-Eaux.",
    noindex: true,
  },
} satisfies Record<string, PageMeta>;

export const sitemap = parsePagesSitemap(pages);
