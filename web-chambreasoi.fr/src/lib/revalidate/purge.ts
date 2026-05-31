import { ALL_PUBLIC_ROUTES, toAbsoluteUrls } from "@config/public-routes";

export { ALL_PUBLIC_ROUTES };

const DEFAULT_BASE_URL = "https://chambreasoi.fr";

export function buildCloudflarePurgePayload(
  paths: readonly string[] = ALL_PUBLIC_ROUTES,
  baseUrl: string = DEFAULT_BASE_URL
) {
  return {
    purge_everything: false,
    files: toAbsoluteUrls(baseUrl, paths),
  };
}
