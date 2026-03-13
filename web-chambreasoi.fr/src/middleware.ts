import { defineMiddleware } from "astro:middleware";
import { setWorkerEnv } from "@chambreasoi/sanity/config";
import { getRuntimeEnv } from "@utils/runtime-env";

/**
 * Middleware that provides a consistent env object to `@chambreasoi/sanity`.
 *
 * Goal:
 * - Use Cloudflare Workers bindings in production (when running on Workers)
 * - Avoid importing `cloudflare:workers` in shared code so Node dev doesn't break
 *
 * How:
 * - `getRuntimeEnv()` dynamically tries to load Cloudflare bindings via a CF-only module.
 * - If unavailable (Node dev), it falls back to process.env.
 * - We then overlay PUBLIC_* vars from import.meta.env for dev/build reliability.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const runtimeEnv = await getRuntimeEnv();

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
