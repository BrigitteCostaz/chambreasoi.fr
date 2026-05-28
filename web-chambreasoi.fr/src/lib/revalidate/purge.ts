export const ALL_PUBLIC_ROUTES = [
  "/",
  "/la-chambre",
  "/tarifs-et-reservation",
  "/acces-et-localisation",
  "/decouvrir-les-environs",
  "/legales/mentions-legales",
  "/legales/politique-confidentialite",
] as const;

export function buildCloudflarePurgePayload() {
  return {
    purge_everything: false,
    files: [...ALL_PUBLIC_ROUTES],
  };
}
