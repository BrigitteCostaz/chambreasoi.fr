import { defineConfig } from 'sanity'

/**
 * Sanity Studio stub config for the web app.
 *
 * Why this exists:
 * - `@sanity/astro` requires a `sanity.config.ts|js` in the project root.
 * - The real Studio lives in `studio-chambreasoi.fr/` and is deployed via
 *   `pnpm -C studio-chambreasoi.fr deploy`. This file just satisfies the
 *   integration's discovery requirement so `astro check` / `astro build`
 *   don't fail.
 *
 * Why we use static import.meta.env references here (not dynamic):
 * - This file is bundled into the client-side Studio chunk by Vite.
 * - Vite can only statically inline `import.meta.env.PUBLIC_*` values when
 *   the property name is a literal in the source.  Dynamic access like
 *   `import.meta.env[variable]` is NOT inlined, so the value arrives as
 *   `undefined` at runtime in the browser and the Studio fails to hydrate.
 * - Using the literal form `import.meta.env.PUBLIC_SANITY_PROJECT_ID` makes
 *   Vite replace the expression with the string value at build time, which
 *   works correctly in both SSR (Cloudflare Worker) and browser contexts.
 *
 * Why we use hardcoded fallbacks instead of throwing:
 * - projectId and dataset are PUBLIC, non-secret values — hardcoding is safe.
 * - Throwing from module-level code in a client bundle causes the Astro
 *   island hydration to fail with an uncaught error, breaking the whole
 *   Studio page even when the value is actually available via another path.
 */

// Use named static references so Vite can inline the values at build time.
// Fallback to the known-safe public defaults so the Studio always has valid
// config even in edge-case build environments.
const projectId: string =
  import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'vq8mnl17'

const dataset: string =
  import.meta.env.PUBLIC_SANITY_DATASET || 'production'

export default defineConfig({
  name: 'web-stub',
  title: 'chambreasoi.fr',

  projectId,
  dataset,

  // Intentionally empty: this is not the real Studio.
  // Schema and plugins live in studio-chambreasoi.fr/sanity.config.ts.
  plugins: [],
  schema: { types: [] },
})
