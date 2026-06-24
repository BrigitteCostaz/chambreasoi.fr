import { defineMiddleware } from "astro:middleware";
import { setWorkerEnv } from "@chambreasoi/sanity/config";
import { mergeSanityRuntimeEnv } from "@lib/sanity-env";
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
 * - Build-time PUBLIC_* vars are only a fallback when runtime bindings are missing.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const runtimeEnv = getRuntimeEnv(await getCloudflareBindings());

  const mergedEnv = mergeSanityRuntimeEnv(runtimeEnv, {
    PUBLIC_SANITY_PROJECT_ID: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
    PUBLIC_SANITY_DATASET: import.meta.env.PUBLIC_SANITY_DATASET,
  });

  setWorkerEnv(mergedEnv);

  return next();
});
