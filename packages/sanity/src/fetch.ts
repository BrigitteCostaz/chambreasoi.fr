/**
 * Typed Sanity fetch wrapper with in-flight request deduplication.
 *
 * Features:
 * - Generic return type (`fetchSanity<T>`)
 * - In-flight deduplication: identical concurrent queries share one network call
 * - Safe cache keys with size limit (falls back to hash for huge queries)
 * - Configurable `useCdn` per call
 * - SSR / build / Cloudflare Workers compatible
 * - Explicit errors when config is missing
 *
 * No tokens — public dataset read access only.
 */

import type { SanityClient } from "@sanity/client";
import { getSanityClient } from "./client";
import type { SanityPublicConfig } from "./config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FetchParams = Record<string, unknown> | undefined;

interface FetchOptions {
  /** Override useCdn for this specific request (default: false for SSR safety). */
  useCdn?: boolean;
  /** Additional client config overrides. */
  clientOverrides?: Partial<SanityPublicConfig>;
}

interface CacheKeyContext {
  query: string;
  params?: FetchParams;
  options?: FetchOptions;
}

// ---------------------------------------------------------------------------
// In-flight deduplication map
// ---------------------------------------------------------------------------

const inFlight = new Map<string, Promise<unknown>>();

// ---------------------------------------------------------------------------
// Cache key helpers
// ---------------------------------------------------------------------------

/** Max raw key length before we hash — prevents unbounded memory from huge queries. */
const MAX_RAW_KEY_LENGTH = 2048;

/**
 * Deterministic JSON.stringify with sorted keys.
 * Produces the same string regardless of insertion order.
 */
function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "__undefined";
  if (typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

/**
 * Simple DJB2-style string hash. Not cryptographic — just for key compaction.
 * Returns a hex string.
 */
function simpleHash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(16);
}

/**
 * Build a deduplication key from query + params + options.
 * Falls back to a hash if the raw key exceeds `MAX_RAW_KEY_LENGTH`.
 */
function buildCacheKey({ query, params, options }: CacheKeyContext): string {
  const normalizedOptions = {
    useCdn: options?.useCdn ?? false,
    clientOverrides: options?.clientOverrides ?? {},
  };
  const raw = `${query}::${stableStringify(params ?? null)}::${stableStringify(normalizedOptions)}`;

  if (raw.length <= MAX_RAW_KEY_LENGTH) return raw;

  // Compact: use hash to keep the map bounded
  return `__h:${simpleHash(raw)}:${raw.length}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch data from Sanity with typed results and in-flight deduplication.
 *
 * Identical concurrent calls (same query + params) share a single network
 * request. The dedup entry is removed once the promise settles, so the map
 * stays bounded even in long-lived processes.
 *
 * Defaults to `useCdn: false` for SSR/build freshness. Override per-call
 * via `options.useCdn` or globally via the client config.
 *
 * @example
 *   const posts = await fetchSanity<Post[]>('*[_type == "post"]{ title, slug }');
 *   const post  = await fetchSanity<Post>(
 *     '*[_type == "post" && slug.current == $slug][0]',
 *     { slug: "hello-world" },
 *   );
 */
export async function fetchSanity<T>(
  query: string,
  params?: FetchParams,
  options?: FetchOptions,
): Promise<T | null> {
  const key = buildCacheKey({ query, params, options });

  // Return existing in-flight promise if one exists
  if (inFlight.has(key)) {
    return (await inFlight.get(key)!) as T | null;
  }

  const promise = (async (): Promise<T | null> => {
    // Default useCdn to false for SSR/build — fresh content matters more than speed
    const client: SanityClient = getSanityClient({
      useCdn: options?.useCdn ?? false,
      ...options?.clientOverrides,
    });

    const result =
      params && Object.keys(params).length > 0
        ? await client.fetch<T>(query, params)
        : await client.fetch<T>(query);

    // Sanity returns null for empty results — preserve that
    return (result ?? null) as T | null;
  })();

  inFlight.set(key, promise);

  try {
    return (await promise) as T | null;
  } finally {
    // Always clean up to prevent unbounded growth
    inFlight.delete(key);
  }
}

export const __test = {
  buildCacheKey,
  stableStringify,
};

// ---------------------------------------------------------------------------
// Dev utilities
// ---------------------------------------------------------------------------

/**
 * Log only in development. Silent in production builds.
 * Safe across runtimes (checks import.meta.env.PROD, falls back to NODE_ENV).
 */
export function devLog(...args: unknown[]): void {
  let isProd = false;

  try {
    const meta = import.meta as unknown as { env?: Record<string, unknown> };
    if (typeof meta.env?.PROD === "boolean") {
      isProd = meta.env.PROD;
    }
  } catch {
    // import.meta may not exist
  }

  if (!isProd && typeof process !== "undefined" && process.env?.NODE_ENV === "production") {
    isProd = true;
  }

  if (!isProd) {
    console.info("[sanity]", ...args);
  }
}
