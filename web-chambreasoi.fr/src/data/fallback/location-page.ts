export const defaultFoldAmenities = {
  amenitiesLabel: "avec",
  amenities: ["un lit double", "une salle de bain privative"],
} as const;

export const defaultSecondaryMapMarker = {
  lat: 45.545448,
  lng: 5.96975,
  title: "Médipôle de Savoie",
  subtitle: "Hôpital privé · Urgences 24/7",
  phone: "04 79 26 80 80",
  phoneHref: "tel:+33479268080",
  website: "https://medipole-de-savoie.fr",
} as const;

export const defaultExitMarkers = [
  {
    lat: 45.5365,
    lng: 5.968,
    title: "Sortie autoroute · Le Médipôle",
    subtitle: "Accès depuis l'A43 / A41\nSortie 20 : Baldoph / Challes-les-Eaux / Myans",
  },
] as const;

export const defaultBoundaries = [
  {
    url: "/data/massif-des-bauges.geojson",
    name: "Massif des Bauges",
    osmId: "7466521",
  },
  {
    url: "/data/massif-de-la-chartreuse.geojson",
    name: "Massif de la Chartreuse",
    osmId: "7468871",
  },
] as const;
