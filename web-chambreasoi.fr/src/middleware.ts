import { defineMiddleware } from "astro:middleware";
import { setWorkerEnv } from "@chambreasoi/sanity/config";
import { getCloudflareBindings, getRuntimeEnv } from "@utils/runtime-env";

/**
 * Middleware that provides a consistent env object to `@chambreasoi/sanity`.
 *
 * Goal:
 * - Use Cloudflare Workers bindings in production (when running on Workers)
 * - Fall back to process.env in Node dev
 *
 * How:
 * - `getCloudflareBindings()` reads `import { env } from "cloudflare:workers"` (Astro v6).
 * - We overlay PUBLIC_* vars from import.meta.env for dev/build reliability.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const runtimeEnv = getRuntimeEnv(await getCloudflareBindings());

  const mergedEnv: Record<string, unknown> = {
    ...runtimeEnv,

    // Provide the minimal set of PUBLIC_* vars we rely on (Vite replacement; reliable in dev/build).
    ...(import.meta.env.PUBLIC_SANITY_PROJECT_ID
      ? { PUBLIC_SANITY_PROJECT_ID: import.meta.env.PUBLIC_SANITY_PROJECT_ID }
      : {}),
    ...(import.meta.env.PUBLIC_SANITY_DATASET
      ? { PUBLIC_SANITY_DATASET: import.meta.env.PUBLIC_SANITY_DATASET }
      : {}),

    // Provide common aliases so downstream config resolution is robust.
    ...(import.meta.env.PUBLIC_SANITY_PROJECT_ID
      ? {
          SANITY_PROJECT_ID: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
          SANITY_STUDIO_PROJECT_ID: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
        }
      : {}),
    ...(import.meta.env.PUBLIC_SANITY_DATASET
      ? {
          SANITY_DATASET: import.meta.env.PUBLIC_SANITY_DATASET,
          SANITY_STUDIO_DATASET: import.meta.env.PUBLIC_SANITY_DATASET,
        }
      : {}),
  };

  setWorkerEnv(mergedEnv);

  return next();
});
