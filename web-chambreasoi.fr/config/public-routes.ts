import { toCanonicalPageUrl } from "./canonical-url";
import { sitemap } from "./pages";

/** Stable order for purge / fallback revalidation. */
export const PUBLIC_PAGE_KEYS = [
  "home",
  "room",
  "reservations",
  "location",
  "surroundings",
  "mentionsLegales",
  "politiqueConfidentialite",
] as const;

export type PublicPageKey = (typeof PUBLIC_PAGE_KEYS)[number];

export function getPublicPaths(): string[] {
  return PUBLIC_PAGE_KEYS.map((key) => sitemap[key].path);
}

export const ALL_PUBLIC_ROUTES = getPublicPaths();

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function toAbsoluteUrls(baseUrl: string, paths: readonly string[]): string[] {
  return paths.map((path) => toCanonicalPageUrl(baseUrl, path));
}

/** Cloudflare Pages `_redirects` rules for legacy URLs without a trailing slash. */
export function buildTrailingSlashRedirects(): string {
  return ALL_PUBLIC_ROUTES.filter((path) => path !== "/")
    .map((path) => `${path} ${path}/ 301`)
    .join("\n");
}

export function getPublicAbsoluteUrls(baseUrl: string): string[] {
  return toAbsoluteUrls(baseUrl, ALL_PUBLIC_ROUTES);
}
