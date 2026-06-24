const normalizeBaseUrl = (baseUrl: string): string =>
  baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

/** Absolute page URL with trailing slash (canonical form used in JSON-LD @id). */
export function toCanonicalPageUrl(baseUrl: string, path: string): string {
  const origin = normalizeBaseUrl(baseUrl);

  if (path === "/" || path === "") {
    return `${origin}/`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const withTrailingSlash = normalizedPath.endsWith("/")
    ? normalizedPath
    : `${normalizedPath}/`;

  return new URL(withTrailingSlash, `${origin}/`).href;
}
