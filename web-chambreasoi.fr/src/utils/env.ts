/**
 * Minimal environment helper for Astro + Cloudflare.
 *
 * Goals:
 * - Provide a single place to read required env vars.
 * - Work in:
 *   - Cloudflare runtime (`context.locals.runtime.env`)
 *   - Server-side Node (process.env)
 *   - Vite/Astro build-time (import.meta.env for PUBLIC_ vars)
 *
 * Notes:
 * - Only PUBLIC_ variables should be read via import.meta.env.
 * - Secrets should be read from runtime bindings or process.env, never from import.meta.env.
 */

export type EnvLike = Record<string, unknown> | undefined;

export class MissingEnvError extends Error {
  public readonly key: string;

  constructor(key: string, hint?: string) {
    super(`[env] Missing required environment variable "${key}".` + (hint ? ` ${hint}` : ""));
    this.name = "MissingEnvError";
    this.key = key;
  }
}

/**
 * Read a string env var from a provided env object (Cloudflare bindings style).
 */
function readFromObject(env: EnvLike, key: string): string | undefined {
  if (!env) return undefined;
  const v = (env as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/**
 * Read a string env var from process.env (Node style).
 */
function readFromProcess(key: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof process === "undefined" || !process.env) return undefined;
  const v = process.env[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

/**
 * Read a string env var from import.meta.env (Vite/Astro build-time).
 * Only works reliably for statically-replaced keys (e.g. PUBLIC_* vars).
 */
function readFromImportMeta(key: string): string | undefined {
  try {
    const meta = import.meta as unknown as {
      env?: Record<string, string | undefined>;
    };
    const v = meta.env?.[key];
    return typeof v === "string" && v.trim() !== "" ? v : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Best-effort read:
 * 1) provided env object (Cloudflare bindings)
 * 2) process.env
 * 3) import.meta.env (PUBLIC_* only)
 */
export function readEnv(key: string, env?: EnvLike): string | undefined {
  return (
    readFromObject(env, key) ??
    readFromProcess(key) ??
    (key.startsWith("PUBLIC_") ? readFromImportMeta(key) : undefined)
  );
}

/**
 * Require an env var (throws if missing).
 */
export function requireEnv(key: string, env?: EnvLike, hint?: string): string {
  const v = readEnv(key, env);
  if (!v) throw new MissingEnvError(key, hint);
  return v;
}

/**
 * Sanity public env convenience:
 * - Prefer PUBLIC_ variables.
 * - Accept common aliases (SANITY_* / SANITY_STUDIO_*) for flexibility.
 */
export function getPublicSanityEnv(env?: EnvLike): {
  projectId: string;
  dataset: string;
} {
  const projectId =
    readEnv("PUBLIC_SANITY_PROJECT_ID", env) ??
    readEnv("SANITY_PROJECT_ID", env) ??
    readEnv("SANITY_STUDIO_PROJECT_ID", env);

  if (!projectId) {
    throw new MissingEnvError(
      "PUBLIC_SANITY_PROJECT_ID",
      "Set PUBLIC_SANITY_PROJECT_ID (recommended) or SANITY_PROJECT_ID / SANITY_STUDIO_PROJECT_ID."
    );
  }

  const dataset =
    readEnv("PUBLIC_SANITY_DATASET", env) ??
    readEnv("SANITY_DATASET", env) ??
    readEnv("SANITY_STUDIO_DATASET", env) ??
    "production";

  return { projectId, dataset };
}
