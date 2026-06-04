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

// Client factory (standalone — for scripts, API routes, etc.)
export { getSanityClient } from "@chambreasoi/sanity/client";
// Config
export {
  type SanityPublicConfig,
  sanityConfig,
  setWorkerEnv,
} from "@chambreasoi/sanity/config";

// Fetch wrapper with in-flight deduplication
export { devLog, fetchSanity } from "@chambreasoi/sanity/fetch";

// Image URL helpers
export {
  buildSanityDprSrcSet,
  buildSanityImageUrl,
  type SanityImageFormat,
  sanityImageUrl,
} from "@chambreasoi/sanity/image";

// GROQ query constants
export * from "@chambreasoi/sanity/queries";

// ---------------------------------------------------------------------------
// Fold content
// ---------------------------------------------------------------------------

import { fetchSanity } from "@chambreasoi/sanity/fetch";
import { getAvailabilityQueryRange } from "@lib/availability-calendar";
import {
  AVAILABILITY_MONTHS_QUERY,
  type AvailabilityMonthResult,
  FOLD_CONTENT_QUERY,
  type FoldContentResult,
  HEADLINE_CONTENT_QUERY,
  type HeadlineContentResult,
  LOCATION_PAGE_CONTENT_QUERY,
  LOCATIONSECTION_CONTENT_QUERY,
  type LocationPageContentResult,
  type LocationSectionContentResult,
  PRACTICAL_INFO_CONTENT_QUERY,
  type PracticalInfoContentResult,
  ROOM_PAGE_CONTENT_QUERY,
  type RoomPageContentResult,
  SURROUNDINGS_PAGE_CONTENT_QUERY,
  type SurroundingsPageContentResult,
} from "@chambreasoi/sanity/queries";

/**
 * Fetch the single foldContent document from Sanity.
 * Returns null if the document has not been created yet — callers must
 * provide their own fallback strings.
 */
export async function getFoldContent(): Promise<FoldContentResult | null> {
  return fetchSanity<FoldContentResult>(FOLD_CONTENT_QUERY);
}
/**
 * Fetch the single headlineContent document from Sanity.
 */
export async function getHeadlineContent(): Promise<HeadlineContentResult | null> {
  return fetchSanity<HeadlineContentResult>(HEADLINE_CONTENT_QUERY);
}
/**
 * Fetch the single LocationSectionContent document from Sanity.
 */
export async function getLocationSectionContent(): Promise<LocationSectionContentResult | null> {
  return fetchSanity<LocationSectionContentResult>(LOCATIONSECTION_CONTENT_QUERY);
}

/**
 * Fetch the first locationPageContent document from Sanity.
 */
export async function getLocationPageContent(): Promise<LocationPageContentResult | null> {
  return fetchSanity<LocationPageContentResult>(LOCATION_PAGE_CONTENT_QUERY);
}

/**
 * Fetch the first practicalInfoContent document from Sanity.
 */
export async function getPracticalInfoContent(): Promise<PracticalInfoContentResult | null> {
  return fetchSanity<PracticalInfoContentResult>(PRACTICAL_INFO_CONTENT_QUERY);
}

const AVAILABILITY_FETCH_TIMEOUT_MS = 12_000;

/**
 * Availability months for the public calendar (bounded window to keep SSR fast).
 */
export async function getAvailabilityMonths(): Promise<AvailabilityMonthResult[]> {
  const { minMonth, maxMonth } = getAvailabilityQueryRange();

  try {
    const result = await Promise.race([
      fetchSanity<AvailabilityMonthResult[]>(AVAILABILITY_MONTHS_QUERY, {
        minMonth,
        maxMonth,
      }),
      new Promise<null>((_, reject) => {
        setTimeout(
          () => reject(new Error(`availability fetch timed out after ${AVAILABILITY_FETCH_TIMEOUT_MS}ms`)),
          AVAILABILITY_FETCH_TIMEOUT_MS
        );
      }),
    ]);

    return result ?? [];
  } catch (error) {
    console.error("[availability] Sanity fetch failed; rendering calendar without CMS dates", error);
    return [];
  }
}

/**
 * Fetch the first roomPageContent document from Sanity.
 */
export async function getRoomPageContent(): Promise<RoomPageContentResult | null> {
  return fetchSanity<RoomPageContentResult>(ROOM_PAGE_CONTENT_QUERY);
}

/**
 * Fetch the first surroundingsPageContent document from Sanity.
 */
export async function getSurroundingsPageContent(): Promise<SurroundingsPageContentResult | null> {
  return fetchSanity<SurroundingsPageContentResult>(SURROUNDINGS_PAGE_CONTENT_QUERY);
}
