/**
 * Runtime env helper that works in both:
 * - Cloudflare Workers (prod / preview)
 * - Node.js (local dev)
 *
 * Key idea:
 * - Prefer env bindings provided by the current Astro request context.
 * - Fall back to process.env when no runtime bindings are available (local dev).
 *
 * Usage:
 *   const runtimeEnv = getRuntimeEnv();
 *   const projectId = readEnv("PUBLIC_SANITY_PROJECT_ID", runtimeEnv);
 */

/**
 * Shape compatible with our env helpers (`Record<string, unknown>`).
 * - Cloudflare bindings are typically strings/objects/Fetcher, etc.
 * - process.env is `Record<string, string | undefined>` but we widen to unknown.
 */
export type RuntimeEnv = Record<string, unknown>;

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
 * 1) Request-local runtime bindings (Cloudflare Workers)
 * 2) process.env (Node dev)
 */
export function getRuntimeEnv(requestEnv?: RuntimeEnv): RuntimeEnv {
  if (requestEnv && typeof requestEnv === "object") return requestEnv;
  return getNodeProcessEnv();
}
