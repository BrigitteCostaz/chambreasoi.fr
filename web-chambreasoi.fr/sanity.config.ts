import { defineConfig } from 'sanity'

/**
 * Sanity Studio stub config for the web app.
 *
 * Why this exists:
 * - `@sanity/astro` tries to load `sanity.config.ts|js` from the web project root.
 * - This stub unblocks `astro check` / `astro build` even when the real Studio
 *   lives in `studio-chambreasoi.fr/`.
 *
 * IMPORTANT:
 * - This is intentionally minimal and should not include schemas, plugins, or secrets.
 * - If you want to run the actual Studio, use the dedicated workspace:
 *   `pnpm -C studio-chambreasoi.fr dev`
 */

function readPublicEnv(key: string): string | undefined {
  // Prefer Vite/Astro env (PUBLIC_ vars). Fallback to Node env.
  try {
    const meta = import.meta as unknown as { env?: Record<string, string | undefined> }
    const v = meta.env?.[key]
    if (typeof v === 'string' && v.length > 0) return v
  } catch {
    // ignore
  }

  if (typeof process !== 'undefined' && process.env) {
    const v = process.env[key]
    if (typeof v === 'string' && v.length > 0) return v
  }

  return undefined
}

const projectId =
  readPublicEnv('PUBLIC_SANITY_PROJECT_ID') ??
  readPublicEnv('SANITY_PROJECT_ID') ??
  readPublicEnv('SANITY_STUDIO_PROJECT_ID')

const dataset =
  readPublicEnv('PUBLIC_SANITY_DATASET') ??
  readPublicEnv('SANITY_DATASET') ??
  readPublicEnv('SANITY_STUDIO_DATASET') ??
  'production'

if (!projectId) {
  throw new Error(
    '[web/sanity.config.ts] Missing PUBLIC_SANITY_PROJECT_ID (or SANITY_PROJECT_ID). ' +
    'Set it in web-chambreasoi.fr/.env for local dev and in Cloudflare Pages env vars for builds.',
  )
}

export default defineConfig({
  name: 'web-stub',
  title: 'chambreasoi.fr (web stub)',

  projectId,
  dataset,

  // Keep this empty on purpose: this is not the real Studio.
  plugins: [],
  schema: { types: [] },
})
