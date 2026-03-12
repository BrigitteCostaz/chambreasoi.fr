import { defineMiddleware } from 'astro:middleware'
import { setWorkerEnv } from '@chambreasoi/sanity/config'

/**
 * Ensure `@chambreasoi/sanity` can resolve env vars consistently across:
 * - Cloudflare runtime (context.locals.runtime.env)
 * - Local Astro dev (import.meta.env for PUBLIC_* variables)
 *
 * We only inject PUBLIC_* values from import.meta.env. Secrets should be
 * provided via Cloudflare bindings / process.env and never exposed to the client.
 */
export const onRequest = defineMiddleware((context, next) => {
  const runtimeEnv = context.locals.runtime?.env ?? {}

  // Vite replaces `import.meta.env.PUBLIC_*` at build time. In dev this provides
  // values from `.env` even when runtime.env is empty.
  const mergedEnv: Record<string, unknown> = {
    ...runtimeEnv,

    // Provide the minimal set of PUBLIC_* vars we rely on.
    ...(import.meta.env.PUBLIC_SANITY_PROJECT_ID
      ? { PUBLIC_SANITY_PROJECT_ID: import.meta.env.PUBLIC_SANITY_PROJECT_ID }
      : {}),
    ...(import.meta.env.PUBLIC_SANITY_DATASET
      ? { PUBLIC_SANITY_DATASET: import.meta.env.PUBLIC_SANITY_DATASET }
      : {}),

    // Also provide common aliases so downstream config resolution is robust.
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
  }

  setWorkerEnv(mergedEnv)

  return next()
})
