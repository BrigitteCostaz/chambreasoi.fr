/**
 * Public Sanity configuration resolver.
 *
 * Reads projectId / dataset / apiVersion from environment variables.
 * Works in Node (process.env), Vite/Astro (import.meta.env), and Cloudflare Workers
 * (Worker `env` bindings passed via `setWorkerEnv()`).
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
// Cloudflare Worker env bindings
// ---------------------------------------------------------------------------

/**
 * Module-level reference to the Cloudflare Worker `env` bindings object.
 *
 * Set once per request via `setWorkerEnv()` — typically called from Astro
 * middleware (`src/middleware.ts`) or a plain Worker `fetch()` handler.
 *
 * Because Workers use a single-threaded V8 isolate the value is safe to
 * store at module scope: each request runs to completion (or to its first
 * `await`) before the next one can overwrite it, and in practice the
 * bindings object is identical across all requests within one deployment.
 */
let workerEnv: Record<string, unknown> | undefined;

/**
 * Store the Cloudflare Worker `env` bindings so that `readEnv()` can
 * resolve environment variables from them.
 *
 * Call this **once** at the start of every incoming request — before any
 * code that calls `sanityConfig()`.
 *
 * @example
 * ```ts
 * // src/middleware.ts (Astro + @astrojs/cloudflare)
 * import { defineMiddleware } from "astro:middleware";
 * import { setWorkerEnv } from "@chambreasoi/sanity/config";
 *
 * export const onRequest = defineMiddleware((context, next) => {
 *   setWorkerEnv(env); // import { env } from "cloudflare:workers"
 *   return next();
 * });
 * ```
 *
 * @example
 * ```ts
 * // Plain Cloudflare Worker
 * import { setWorkerEnv } from "@chambreasoi/sanity/config";
 *
 * export default {
 *   async fetch(request, env, ctx) {
 *     setWorkerEnv(env);
 *     return app.fetch(request, env, ctx);
 *   },
 * };
 * ```
 */
export function setWorkerEnv(env: Record<string, unknown> | undefined): void {
  workerEnv = env;
}

// ---------------------------------------------------------------------------
// Env reading — defensive across runtimes
// ---------------------------------------------------------------------------

/**
 * Read a single env variable from whichever runtime context is available.
 *
 * Resolution order (first non-empty string wins):
 *   0. Cloudflare Worker bindings (`setWorkerEnv()`)
 *   1. Node-style `process.env`
 *   2. Vite / Astro `import.meta.env` (statically replaced at build time)
 */
function readEnv(key: string): string | undefined {
  // 0) Cloudflare Workers bindings (preferred on Workers — always available
  //    when `setWorkerEnv()` has been called from middleware / fetch handler)
  if (workerEnv !== undefined) {
    const val = workerEnv[key];
    if (typeof val === "string" && val !== "") return val;
  }

  // 1) Node / Cloudflare Workers with nodejs_compat `process.env` polyfill
  if (typeof process !== "undefined" && process.env) {
    const val = process.env[key];
    if (val !== undefined && val !== "") return val;
  }

  // 2) Vite / Astro (import.meta.env is statically replaced at build time)
  try {
    const meta = import.meta as unknown as {
      env?: Record<string, string | undefined>;
    };
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
export function sanityConfig(
  overrides?: Partial<SanityPublicConfig>,
): SanityPublicConfig {
  const projectId =
    overrides?.projectId ??
    readEnv("SANITY_PROJECT_ID") ??
    readEnv("PUBLIC_SANITY_PROJECT_ID") ??
    readEnv("SANITY_STUDIO_PROJECT_ID");

  if (!projectId) {
    throw new Error(
      "[sanityConfig] Missing projectId. " +
        "Set SANITY_PROJECT_ID, PUBLIC_SANITY_PROJECT_ID, or SANITY_STUDIO_PROJECT_ID in your environment. " +
        "On Cloudflare Workers, ensure setWorkerEnv(env) is called before sanityConfig().",
    );
  }

  const dataset =
    overrides?.dataset ??
    readEnv("SANITY_DATASET") ??
    readEnv("PUBLIC_SANITY_DATASET") ??
    readEnv("SANITY_STUDIO_DATASET") ??
    DEFAULTS.dataset;

  const apiVersion =
    overrides?.apiVersion ??
    readEnv("SANITY_API_VERSION") ??
    DEFAULTS.apiVersion;

  const useCdn = overrides?.useCdn ?? DEFAULTS.useCdn;

  return { projectId, dataset, apiVersion, useCdn };
}
