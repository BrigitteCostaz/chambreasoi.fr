/**
 * Sanity image URL helpers.
 *
 * Uses `@sanity/image-url` to build optimised CDN URLs with transforms
 * (width, height, quality, format, DPR, fit).
 *
 * The image builder is memoized per projectId+dataset pair so it is
 * created once and reused across calls — safe for SSR, build, and edge.
 *
 * Public config only (projectId, dataset). No tokens, no secrets.
 */

import { createImageUrlBuilder } from "@sanity/image-url";
import type { ImageUrlBuilder } from "@sanity/image-url";
import { sanityConfig } from "./config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SanityImageFormat = "webp" | "jpg" | "png";

export type SanityFitMode =
  | "clip"
  | "crop"
  | "fill"
  | "fillmax"
  | "max"
  | "min"
  | "scale";

/** Anything the Sanity image pipeline can resolve — image field, asset ref, etc. */
export type SanityImageLike = Parameters<ImageUrlBuilder["image"]>[0];

interface BuildUrlOptions {
  source: unknown;
  width?: number;
  height?: number;
  quality?: number;
  format?: SanityImageFormat;
  /** Sanity fit mode. Default: "crop". */
  fit?: SanityFitMode;
  /** Device pixel ratio (e.g. 2 for retina). */
  dpr?: number;
}

interface BuildSrcSetOptions {
  source: unknown;
  width: number;
  height: number;
  dprs?: number[];
  quality?: number;
  format?: SanityImageFormat;
  fit?: SanityFitMode;
}

interface BuildWidthSrcSetOptions {
  source: unknown;
  /** Largest 1x CSS-pixel design width (also used as the `src` fallback size). */
  width: number;
  height: number;
  /** Explicit candidate widths in CSS pixels. Defaults to a ladder up to `width * 2`. */
  widths?: number[];
  quality?: number;
  format?: SanityImageFormat;
  fit?: SanityFitMode;
}

/** Default width ladder for fluid `sizes`-aware srcsets (CSS pixels). */
const DEFAULT_WIDTH_LADDER = [
  320, 480, 640, 768, 800, 960, 1024, 1200, 1280, 1440, 1600, 1920,
] as const;

/**
 * Build candidate widths for a fluid srcset.
 *
 * Caps at `width * 2` so a 2x DPR device can still fill the declared design
 * width without emitting absurdly large Sanity URLs.
 */
export function resolveSrcSetWidths(width: number, widths?: number[]): number[] {
  const max = Math.max(1, Math.round(width * 2));
  const ladder = widths?.length ? widths : [...DEFAULT_WIDTH_LADDER];
  const filtered = ladder.filter((w) => w > 0 && w <= max);
  if (!filtered.includes(width)) filtered.push(width);
  if (!filtered.includes(max)) filtered.push(max);
  return [...new Set(filtered)].sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// Memoized builder
// ---------------------------------------------------------------------------

let cachedBuilder: ImageUrlBuilder | null = null;
let cachedBuilderKey: string | null = null;

/**
 * Return a memoized `ImageUrlBuilder` instance.
 *
 * The builder is recreated only when the resolved projectId or dataset
 * changes (practically never in production).
 */
function getBuilder(): ImageUrlBuilder {
  const config = sanityConfig();
  const key = `${config.projectId}:${config.dataset}`;

  if (cachedBuilder && cachedBuilderKey === key) {
    return cachedBuilder;
  }

  cachedBuilder = createImageUrlBuilder({
    projectId: config.projectId,
    dataset: config.dataset,
  });
  cachedBuilderKey = key;

  return cachedBuilder;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a chainable Sanity image URL builder for `source`.
 *
 * Returns `null` if `source` is falsy (missing image field, etc.).
 *
 * @example
 *   const url = sanityImageUrl(doc.image)?.width(400).format("webp").url();
 */
export function sanityImageUrl(source: unknown): ImageUrlBuilder | null {
  if (!source) return null;

  return getBuilder().image(source as SanityImageLike);
}

/**
 * Build a single optimised image URL.
 *
 * Applies `auto("format")` by default so Sanity picks the best format
 * for the requesting browser. Pass `format` explicitly to override.
 *
 * Returns `null` if source is missing or the URL could not be built.
 *
 * @example
 *   const url = buildSanityImageUrl({ source: doc.image, width: 800 });
 */
export function buildSanityImageUrl({
  source,
  width,
  height,
  quality = 80,
  format,
  fit = "crop",
  dpr,
}: BuildUrlOptions): string | null {
  const b = sanityImageUrl(source);
  if (!b) return null;

  let chain = b.auto("format").quality(quality).fit(fit);

  if (typeof width === "number") chain = chain.width(width);
  if (typeof height === "number") chain = chain.height(height);
  if (typeof dpr === "number") chain = chain.dpr(dpr);
  if (format) chain = chain.format(format);

  const url = chain.url();
  return typeof url === "string" && url.length > 0 ? url : null;
}

/**
 * Build a DPR-based srcset for a fixed CSS-pixel size.
 *
 * Generates entries like `url 1x, url 1.5x, url 2x` — typically a better
 * mental model than varying widths for fixed-dimension images.
 *
 * Returns `null` if source is missing or no valid entries could be produced.
 *
 * @example
 *   <img
 *     src={buildSanityImageUrl({ source: img, width: 400, height: 300 })}
 *     srcset={buildSanityDprSrcSet({ source: img, width: 400, height: 300 })}
 *   />
 */
export function buildSanityDprSrcSet({
  source,
  width,
  height,
  dprs = [1, 1.5, 2],
  quality = 80,
  format = "webp",
  fit = "crop",
}: BuildSrcSetOptions): string | null {
  if (!source) return null;

  const entries: string[] = [];

  for (const dpr of dprs) {
    const url = buildSanityImageUrl({
      source,
      width,
      height,
      dpr,
      quality,
      format,
      fit,
    });
    if (url) {
      entries.push(`${url} ${dpr}x`);
    }
  }

  return entries.length > 0 ? entries.join(", ") : null;
}

/**
 * Build a width-descriptor (`w`) srcset for use with the HTML `sizes` attribute.
 *
 * Unlike {@link buildSanityDprSrcSet}, candidates do **not** set Sanity's `dpr`
 * parameter — each URL is a distinct pixel width. Browsers then combine
 * `sizes` + device DPR to pick the right file. Prefer this whenever `sizes`
 * is set on the `<img>`.
 *
 * Returns `null` if source is missing or no valid entries could be produced.
 *
 * @example
 *   <img
 *     src={buildSanityImageUrl({ source: img, width: 800, height: 1200 })}
 *     srcset={buildSanityWidthSrcSet({ source: img, width: 800, height: 1200 })}
 *     sizes="(max-width: 1024px) 100vw, 40vw"
 *   />
 */
export function buildSanityWidthSrcSet({
  source,
  width,
  height,
  widths,
  quality = 80,
  format = "webp",
  fit = "crop",
}: BuildWidthSrcSetOptions): string | null {
  if (!source) return null;

  const aspect = height / width;
  const candidates = resolveSrcSetWidths(width, widths);
  const entries: string[] = [];

  for (const w of candidates) {
    const h = Math.max(1, Math.round(w * aspect));
    const url = buildSanityImageUrl({
      source,
      width: w,
      height: h,
      quality,
      format,
      fit,
    });
    if (url) {
      entries.push(`${url} ${w}w`);
    }
  }

  return entries.length > 0 ? entries.join(", ") : null;
}
