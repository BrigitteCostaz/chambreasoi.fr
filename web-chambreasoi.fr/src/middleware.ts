import { defineMiddleware } from 'astro:middleware'
import { setWorkerEnv } from '@chambreasoi/sanity/config'

export const onRequest = defineMiddleware((context, next) => {
  // In production (Cloudflare Workers), runtime.env contains bindings
  // In development (Astro dev server), we need to provide env vars from import.meta.env
  const runtimeEnv = context.locals.runtime?.env || {}

  // Build merged env object with all Sanity config aliases
  // This ensures compatibility across dev and production
  const projectId =
    runtimeEnv.SANITY_PROJECT_ID ||
    runtimeEnv.PUBLIC_SANITY_PROJECT_ID ||
    import.meta.env.PUBLIC_SANITY_PROJECT_ID

  const dataset =
    runtimeEnv.SANITY_DATASET ||
    runtimeEnv.PUBLIC_SANITY_DATASET ||
    import.meta.env.PUBLIC_SANITY_DATASET ||
    'production'

  const mergedEnv = {
    ...runtimeEnv,
    // Provide all supported aliases for maximum compatibility
    SANITY_PROJECT_ID: projectId,
    PUBLIC_SANITY_PROJECT_ID: projectId,
    SANITY_STUDIO_PROJECT_ID: projectId,
    SANITY_DATASET: dataset,
    PUBLIC_SANITY_DATASET: dataset,
    SANITY_STUDIO_DATASET: dataset,
  }

  setWorkerEnv(mergedEnv)
  return next()
})
