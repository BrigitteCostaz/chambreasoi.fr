import { devLog, fetchSanity } from "@chambreasoi/sanity/fetch";
import {
  ACCOMMODATION_SETTINGS_QUERY,
  type AccommodationSettingsResult,
} from "@chambreasoi/sanity/queries";
import type { AccomodationConfig } from "@config/types";
import { incrementFallbackCounter } from "@lib/observability/fallbackMetrics";
import { isNonEmptyString } from "@utils/config-resolvers";

const ACCOMMODATION_DEFAULTS: AccomodationConfig = {
  checkinTime: "17:00",
  checkoutTime: "10:00",

  amenities: [
    "Wi-Fi gratuit",
    "Chauffage individuel",
    "Terrasse privative",
    "Salle de bain privative avec douche",
    "Linges de toilette fournis",
    "Draps fournis",
    "Coin cuisine (18h-20h)",
    "Espace commun avec télévision (18h-22h)",
    "Parking gratuit sur place",
    "Abri vélos sécurisé",
    "Dressing",
    "Bureau",
    "Espace fumeur terrasse",
    "Maison de plain-pied",
  ],
};

let accommodationCache: AccomodationConfig | null = null;

function reportAccommodationFallback(reason: "missing-document" | "fetch-error", details?: unknown): void {
  incrementFallbackCounter("accommodation");
  console.warn("[fallback:accommodation]", {
    criticality: "medium",
    reason,
    hasCachedValue: Boolean(accommodationCache),
    details: details instanceof Error ? details.message : details,
  });
}

export async function getAccommodation(): Promise<AccomodationConfig> {
  if (accommodationCache) return accommodationCache;

  try {
    const cms = await fetchSanity<AccommodationSettingsResult>(ACCOMMODATION_SETTINGS_QUERY);
    const cmsCheckin = cms?.checkinTime;
    const cmsCheckout = cms?.checkoutTime;
    const cmsAmenities = cms?.amenities;

    accommodationCache = {
      checkinTime: isNonEmptyString(cmsCheckin) ? cmsCheckin : ACCOMMODATION_DEFAULTS.checkinTime,
      checkoutTime: isNonEmptyString(cmsCheckout)
        ? cmsCheckout
        : ACCOMMODATION_DEFAULTS.checkoutTime,
      amenities:
        Array.isArray(cmsAmenities) && cmsAmenities.length > 0
          ? cmsAmenities.filter((value): value is string => isNonEmptyString(value))
          : ACCOMMODATION_DEFAULTS.amenities,
    };

    if (!cms) {
      devLog("[accommodation] Using TS fallback (document missing or empty).");
      reportAccommodationFallback("missing-document");
    }

    return accommodationCache;
  } catch (error) {
    devLog("[accommodation] Sanity fetch failed, using TS fallback.", error);
    reportAccommodationFallback("fetch-error", error);
    accommodationCache = ACCOMMODATION_DEFAULTS;
    return ACCOMMODATION_DEFAULTS;
  }
}

export const accommodationDefaults: AccomodationConfig = ACCOMMODATION_DEFAULTS;
