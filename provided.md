```
import { createClient } from "@sanity/client";
import { SANITY_API_VERSION, SANITY_DATASET, SANITY_PROJECT_ID } from "../utils/sanityConfig";

/**
 * Minimal fetch helper for Sanity (SSR/build friendly).
 *
 * - Uses env vars when available (no hardcode of projectId/dataset).
 * - Falls back to `src/utils/sanityConfig.ts` (keeps the app working if env is missing).
 * - Memoizes the client + dedupes identical in-flight queries during a single SSR/build run.
 *
 * Notes:
 * - We intentionally set `useCdn: false` for SSR/build so published drafts / fresh content
 *   doesn't get stuck behind caching. (You can flip to true if you want faster + cached.)
 * - The dataset is public, so no token is needed for read access.
 */

type FetchParams = Record<string, unknown> | undefined;

const inFlight = new Map<string, Promise<unknown>>();

function readEnv(key: string): string | undefined {
  // In Astro SSR/build, `process.env` is available.
  // `import.meta.env` is also available but depends on Vite env parsing (KEY=VALUE).
  // We keep it defensive and do not assume a particular format.
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const fromImportMeta = metaEnv?.[key];
  return fromProcess ?? fromImportMeta;
}

function resolveSanityConfig() {
  const projectId = readEnv("SANITY_PROJECT_ID") ?? SANITY_PROJECT_ID;
  const dataset = readEnv("SANITY_DATASET") ?? SANITY_DATASET;
  const apiVersion = readEnv("SANITY_API_VERSION") ?? SANITY_API_VERSION;

  return { projectId, dataset, apiVersion };
}

let cachedClient: ReturnType<typeof createClient> | null = null;

export function getSanityClient() {
  if (cachedClient) return cachedClient;

  const { projectId, dataset, apiVersion } = resolveSanityConfig();

  cachedClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    // perspective is available in newer clients; leaving it undefined keeps compatibility
  });

  return cachedClient;
}

function stableStringify(value: unknown): string {
  if (!value || typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

function buildCacheKey(query: string, params?: FetchParams) {
  return `${query}::${params ? stableStringify(params) : ""}`;
}

/**
 * Fetch helper with:
 * - Optional params
 * - In-flight dedupe by query+params
 * - Safe generic typing
 */
export async function fetchSanity<T>(query: string, params?: FetchParams): Promise<T | null> {
  const key = buildCacheKey(query, params);

  if (inFlight.has(key)) {
    return (await inFlight.get(key)!) as T | null;
  }

  const p = (async () => {
    const client = getSanityClient();

    // Satisfy @sanity/client overloads:
    // - If params are provided => call fetch(query, params)
    // - Else => call fetch(query)
    const result =
      params && Object.keys(params).length > 0
        ? await client.fetch<T>(query, params)
        : await client.fetch<T>(query);

    // Sanity fetch returns null sometimes; keep it as-is.
    return (result ?? null) as T | null;
  })();

  inFlight.set(key, p);

  try {
    return (await p) as T | null;
  } finally {
    // remove after resolution to avoid unbounded growth across long-lived processes
    inFlight.delete(key);
  }
}

/**
 * Dev-only logger helper: keep noise out of prod builds.
 */
export function devLog(...args: unknown[]) {
  const metaEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env;
  const isProd = typeof metaEnv?.PROD === "boolean" ? metaEnv.PROD : false;

  if (!isProd) {
    console.info(...args);
  }
}
```

```
import { createImageUrlBuilder } from "@sanity/image-url";
import { SANITY_DATASET, SANITY_PROJECT_ID } from "@/utils/sanityConfig";

/**
 * Sanity image URL helper (remote optimization pipeline).
 *
 * This utility generates optimized image URLs using Sanity's image CDN
 * transformations (width/height/quality/format/etc).
 *
 * It is intentionally "public-config only" (projectId/dataset) and does not use
 * any token. Never put secrets in here.
 *
 * Usage:
 *   const url = sanityImageUrl(image).width(400).height(600).format("webp").url()
 *
 * Or use the convenience function:
 *   const url = buildSanityImageUrl({ source: image, width: 400, height: 600 })
 */

export type SanityImageFormat = "webp" | "jpg" | "png";

/**
 * Get a Sanity image URL builder for a given image `source`.
 *
 * `source` can be:
 * - the `image` field object from Sanity (recommended), or
 * - an asset reference, etc.
 *
 * Returns `null` if no `source` is provided.
 */
export function sanityImageUrl(source: unknown) {
  if (!source) return null;

  const builder = createImageUrlBuilder({
    projectId: SANITY_PROJECT_ID,
    dataset: SANITY_DATASET,
  });

  return builder.image(source);
}

/**
 * Convenience function to build a single optimized URL.
 *
 * Notes:
 * - `auto("format")` is enabled by default to let Sanity choose the best format.
 * - If you pass `format`, it will force that output format (useful for
 *   predictable caching, or when you want to generate explicit webp/avif srcsets).
 */
export function buildSanityImageUrl({
  source,
  width,
  height,
  quality = 80,
  format,
  fit = "crop",
  dpr,
}: {
  source: unknown;
  width?: number;
  height?: number;
  quality?: number;
  format?: SanityImageFormat;
  /**
   * Sanity fit mode. Common values include "crop", "clip", "fill", "min", "max", "scale".
   * "crop" is usually a good default for portraits.
   */
  fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "min" | "scale";
  /**
   * Device pixel ratio. If provided, Sanity will scale the output accordingly.
   * You can use this to produce 1x/2x URLs without changing CSS pixels.
   */
  dpr?: number;
}): string | null {
  const b = sanityImageUrl(source);
  if (!b) return null;

  let url = b.auto("format").quality(quality).fit(fit);

  if (typeof width === "number") url = url.width(width);
  if (typeof height === "number") url = url.height(height);
  if (typeof dpr === "number") url = url.dpr(dpr);
  if (format) url = url.format(format);

  const out = url.url();
  return typeof out === "string" && out.length > 0 ? out : null;
}

/**
 * Build a DPR-based srcset (e.g. 1x, 1.5x, 2x) for a fixed CSS pixel size.
 * This is often a better mental model than varying widths.
 */
export function buildSanityDprSrcSet({
  source,
  width,
  height,
  dprs = [1, 1.5, 2],
  quality = 80,
  format = "webp",
  fit = "crop",
}: {
  source: unknown;
  width: number;
  height: number;
  dprs?: number[];
  quality?: number;
  format?: SanityImageFormat;
  fit?: "clip" | "crop" | "fill" | "fillmax" | "max" | "min" | "scale";
}): string | null {
  if (!source) return null;

  const entries = dprs
    .map((dpr) => {
      const url = buildSanityImageUrl({
        source,
        width,
        height,
        dpr,
        quality,
        format,
        fit,
      });
      return url ? `${url} ${dpr}x` : null;
    })
    .filter((x): x is string => typeof x === "string" && x.length > 0);

  return entries.length > 0 ? entries.join(", ") : null;
}
```
