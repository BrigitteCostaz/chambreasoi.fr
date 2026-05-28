/**
 * Runtime env helper that works in both:
 * - Cloudflare Workers (prod / preview)
 * - Node.js (local dev)
 *
 * Key idea:
 * - Never statically import "cloudflare:workers" from shared code, because it
 *   will crash in Node.
 * - Instead, dynamically import a Cloudflare-only module that statically imports
 *   "cloudflare:workers". If that import fails, fall back to process.env.
 *
 * Usage:
 *   const runtimeEnv = await getRuntimeEnv();
 *   const projectId = readEnv("PUBLIC_SANITY_PROJECT_ID", runtimeEnv);
 */

/**
 * Shape compatible with our env helpers (`Record<string, unknown>`).
 * - Cloudflare bindings are typically strings/objects/Fetcher, etc.
 * - process.env is `Record<string, string | undefined>` but we widen to unknown.
 */
export type RuntimeEnv = Record<string, unknown>;

/**
 * Read Cloudflare bindings via a Cloudflare-only module.
 *
 * Contract:
 * - Loads `src/utils/cf-env.ts` via dynamic import.
 * - Expects that module to export `getCloudflareEnv(): object`.
 * - If the import fails (Node runtime) or export is missing, this returns `undefined`
 *   and callers fall back to `process.env`.
 */
async function tryGetCloudflareEnv(): Promise<RuntimeEnv | undefined> {
  try {
    // Dynamic import avoids Node resolving "cloudflare:workers" at load time.
    const mod = (await import("./cf-env")) as unknown as {
      getCloudflareEnv?: () => unknown;
    };

    const maybeEnv = mod.getCloudflareEnv?.();
    if (maybeEnv && typeof maybeEnv === "object") {
      return maybeEnv as RuntimeEnv;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Read Node environment variables (local dev).
 */
function getNodeProcessEnv(): RuntimeEnv {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (typeof process === "undefined" || !process.env) return {};
  return process.env as unknown as RuntimeEnv;
}

/**
 * Return the best available runtime env object.
 *
 * Precedence:
 * 1) Cloudflare bindings (when running on Workers)
 * 2) process.env (Node dev)
 */
export async function getRuntimeEnv(): Promise<RuntimeEnv> {
  const cf = await tryGetCloudflareEnv();
  if (cf) return cf;
  return getNodeProcessEnv();
}
