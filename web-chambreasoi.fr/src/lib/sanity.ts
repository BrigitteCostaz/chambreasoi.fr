/**
 * Sanity helpers for the Astro web app.
 *
 * Re-exports everything from the shared `@chambreasoi/sanity` workspace package
 * and bridges the `sanity:client` virtual module provided by `@sanity/astro`.
 *
 * Import from here (`~/lib/sanity`) in Astro pages and components — it gives
 * you both the shared SDK utilities and the Astro-specific client binding.
 */

// ---------------------------------------------------------------------------
// Astro-specific: virtual module client provided by @sanity/astro integration
// ---------------------------------------------------------------------------

import { sanityClient } from "sanity:client";

/**
 * The Sanity client instance configured by `@sanity/astro`.
 * Use this when you need the Astro-managed client (e.g. for preview mode,
 * Visual Editing, or any integration-specific feature).
 */
export { sanityClient };

// ---------------------------------------------------------------------------
// Shared package re-exports (workspace: @chambreasoi/sanity)
// ---------------------------------------------------------------------------

// Config
export {
  sanityConfig,
  type SanityPublicConfig,
} from "@chambreasoi/sanity/config";

// Client factory (standalone — for scripts, API routes, etc.)
export { getSanityClient } from "@chambreasoi/sanity/client";

// Fetch wrapper with in-flight deduplication
export { fetchSanity, devLog } from "@chambreasoi/sanity/fetch";

// Image URL helpers
export {
  sanityImageUrl,
  buildSanityImageUrl,
  buildSanityDprSrcSet,
  type SanityImageFormat,
} from "@chambreasoi/sanity/image";

// GROQ query constants
export * from "@chambreasoi/sanity/queries";
