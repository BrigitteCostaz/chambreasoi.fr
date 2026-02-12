/**
 * Public Sanity configuration resolver.
 *
 * Reads projectId / dataset / apiVersion from environment variables.
 * Works in Node (process.env), Vite/Astro (import.meta.env), and Cloudflare Workers.
 *
 * NEVER put tokens or secrets here — this module is safe for client bundles.
 */

export interface SanityPublicConfig {
  projectId: string;
  dataset: string;
  apiVersion: string;
  useCdn: boolean;
}

// ---------------------------------------------------------------------------
// Env reading — defensive across runtimes
// ---------------------------------------------------------------------------

/**
 * Read a single env variable from whichever runtime context is available.
 * Order: process.env → import.meta.env → undefined
 */
function readEnv(key: string): string | undefined {
  // Node / Cloudflare Workers
  if (typeof process !== "undefined" && process.env) {
    const val = process.env[key];
    if (val !== undefined && val !== "") return val;
  }

  // Vite / Astro (import.meta.env is statically replaced at build time)
  try {
    const meta = import.meta as unknown as { env?: Record<string, string | undefined> };
    const val = meta.env?.[key];
    if (val !== undefined && val !== "") return val;
  } catch {
    // import.meta may not exist in all runtimes — swallow safely
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULTS = {
  apiVersion: "2024-01-01",
  dataset: "production",
  useCdn: true,
} as const;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolve the full public Sanity config.
 *
 * Env vars checked (in order, first non-empty wins):
 *   projectId  → SANITY_PROJECT_ID | PUBLIC_SANITY_PROJECT_ID | SANITY_STUDIO_PROJECT_ID
 *   dataset    → SANITY_DATASET    | PUBLIC_SANITY_DATASET    | SANITY_STUDIO_DATASET
 *   apiVersion → SANITY_API_VERSION
 *
 * Throws at call-time if projectId is missing — fail fast during dev.
 */
export function sanityConfig(overrides?: Partial<SanityPublicConfig>): SanityPublicConfig {
  const projectId =
    overrides?.projectId ??
    readEnv("SANITY_PROJECT_ID") ??
    readEnv("PUBLIC_SANITY_PROJECT_ID") ??
    readEnv("SANITY_STUDIO_PROJECT_ID");

  if (!projectId) {
    throw new Error(
      "[sanityConfig] Missing projectId. " +
        "Set SANITY_PROJECT_ID, PUBLIC_SANITY_PROJECT_ID, or SANITY_STUDIO_PROJECT_ID in your environment.",
    );
  }

  const dataset =
    overrides?.dataset ??
    readEnv("SANITY_DATASET") ??
    readEnv("PUBLIC_SANITY_DATASET") ??
    readEnv("SANITY_STUDIO_DATASET") ??
    DEFAULTS.dataset;

  const apiVersion =
    overrides?.apiVersion ?? readEnv("SANITY_API_VERSION") ?? DEFAULTS.apiVersion;

  const useCdn = overrides?.useCdn ?? DEFAULTS.useCdn;

  return { projectId, dataset, apiVersion, useCdn };
}
