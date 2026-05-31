import { ALL_PUBLIC_ROUTES } from "@config/public-routes";

export { ALL_PUBLIC_ROUTES };

export function buildCloudflarePurgePayload(paths: readonly string[] = ALL_PUBLIC_ROUTES) {
  return {
    purge_everything: false,
    files: [...paths],
  };
}
