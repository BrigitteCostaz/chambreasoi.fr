/** CMS-backed SSR routes that must not be edge-cached (Sanity freshness). */
export const CMS_SSR_PATHS = [
  "/",
  "/la-chambre/",
  "/tarifs-et-reservation/",
  "/acces-et-localisation/",
  "/decouvrir-les-environs/",
] as const;

export const CMS_SSR_CACHE_CONTROL = "private, no-store";

function normalizePathname(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function isCmsSsrPath(pathname: string): boolean {
  return (CMS_SSR_PATHS as readonly string[]).includes(normalizePathname(pathname));
}
