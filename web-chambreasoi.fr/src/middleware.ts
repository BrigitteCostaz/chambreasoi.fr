import { defineMiddleware } from "astro:middleware";
import { setWorkerEnv } from "@chambreasoi/sanity/config";

/**
 * Astro middleware — runs once per incoming request.
 *
 * On Cloudflare Workers the environment variables (SANITY_PROJECT_ID,
 * SANITY_DATASET, etc.) are not available via `process.env` or
 * `import.meta.env` at runtime. Instead they live on the Worker `env`
 * bindings object, which Astro's Cloudflare adapter exposes at
 * `context.locals.runtime.env`.
 *
 * We forward that object to the shared `@chambreasoi/sanity` config
 * resolver so `sanityConfig()` can read bindings the Cloudflare-correct
 * way — before any page or API route tries to create a Sanity client.
 *
 * @see https://docs.astro.build/en/guides/integrations-guide/cloudflare/#cloudflare-runtime
 * @see https://developers.cloudflare.com/workers/configuration/environment-variables/
 */
export const onRequest = defineMiddleware((context, next) => {
  // `runtime` is injected by @astrojs/cloudflare — guard for local dev
  // where the adapter may not be active or the shape differs.
  const runtime = (context.locals as unknown as Record<string, unknown>)
    .runtime as { env?: Record<string, unknown> } | undefined;

  if (runtime?.env) {
    setWorkerEnv(runtime.env);
  }

  return next();
});
