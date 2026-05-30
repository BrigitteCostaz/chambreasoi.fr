import { devLog, fetchSanity } from "@chambreasoi/sanity/fetch";
import { PRICING_SETTINGS_QUERY, type PricingSettingsResult } from "@chambreasoi/sanity/queries";
import { getCmsCacheEpoch, registerCmsCacheResetter } from "@config/cache";
import { incrementFallbackCounter } from "@lib/observability/fallbackMetrics";
import type {
  MoneyCents,
  MoneyFormatter,
  PricingCatalog,
  PublicRate,
  PublicRateKey,
  PublicRateOfferId,
  RoomId,
} from "@config/types/pricing";

/**
 * Format integer cents (EUR) to schema-friendly "80.00" string.
 * (No currency symbol, dot decimal separator.)
 */
export const formatMoneyCentsForSchema: MoneyFormatter = (cents) => {
  if (!Number.isFinite(cents)) {
    throw new Error(`Invalid cents value: ${String(cents)}`);
  }

  if (!Number.isInteger(cents)) {
    throw new Error(`Cents value must be an integer. Got: ${String(cents)}`);
  }

  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const remainder = abs % 100;
  return `${sign}${euros}.${String(remainder).padStart(2, "0")}`;
};

const ROOM_ID: RoomId = "https://chambreasoi.fr/#room-1";

const OFFER_IDS: Record<PublicRateKey, PublicRateOfferId> = {
  "1p-no-breakfast": "https://chambreasoi.fr/#rate-1p-no-breakfast",
  "1p-breakfast": "https://chambreasoi.fr/#rate-1p-breakfast",
  "2p-no-breakfast": "https://chambreasoi.fr/#rate-2p-no-breakfast",
  "2p-breakfast": "https://chambreasoi.fr/#rate-2p-breakfast",
} as const;

const DEFAULT_BASE_NIGHTLY: Record<1 | 2, MoneyCents> = {
  1: 8000,
  2: 12000,
} as const;

const DEFAULT_BREAKFAST_SURCHARGE: MoneyCents = 500;

function toSafeInteger(fallback: MoneyCents, value: unknown): MoneyCents {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : fallback;
}

function derivePublicRates(
  baseRates: Record<1 | 2, MoneyCents>,
  breakfastSurcharge: MoneyCents
): readonly PublicRate[] {
  const currency = "EUR" as const;
  const unit = "NIGHT" as const;

  const mk: (rate: Omit<PublicRate, "currency" | "unit">) => PublicRate = (rate) => ({
    ...rate,
    currency,
    unit,
  });

  return [
    mk({
      key: "1p-no-breakfast",
      offerId: OFFER_IDS["1p-no-breakfast"],
      name: "1 personne, sans petit-déjeuner",
      occupancy: 1,
      breakfast: "NONE",
      priceCents: baseRates[1],
    }),
    mk({
      key: "1p-breakfast",
      offerId: OFFER_IDS["1p-breakfast"],
      name: "1 personne, avec petit-déjeuner",
      occupancy: 1,
      breakfast: "INCLUDED",
      priceCents: baseRates[1] + breakfastSurcharge * 1,
    }),
    mk({
      key: "2p-no-breakfast",
      offerId: OFFER_IDS["2p-no-breakfast"],
      name: "2 personnes, sans petit-déjeuner",
      occupancy: 2,
      breakfast: "NONE",
      priceCents: baseRates[2],
    }),
    mk({
      key: "2p-breakfast",
      offerId: OFFER_IDS["2p-breakfast"],
      name: "2 personnes, avec petit-déjeuner",
      occupancy: 2,
      breakfast: "INCLUDED",
      priceCents: baseRates[2] + breakfastSurcharge * 2,
    }),
  ] as const;
}

function buildPricingCatalog(
  baseNightly: Record<1 | 2, MoneyCents>,
  breakfastSurcharge: MoneyCents
): PricingCatalog {
  return {
    currency: "EUR",
    unit: "NIGHT",
    roomId: ROOM_ID,
    baseNightlyRates: [
      { occupancy: 1, priceCents: baseNightly[1], currency: "EUR", unit: "NIGHT" },
      { occupancy: 2, priceCents: baseNightly[2], currency: "EUR", unit: "NIGHT" },
    ] as const,
    breakfast: {
      surchargeCents: breakfastSurcharge,
      currency: "EUR",
      unit: "NIGHT",
      applies: "PER_PERSON",
    },
    publicRates: derivePublicRates(baseNightly, breakfastSurcharge),
  } as const;
}

type PricingCacheEntry = {
  epoch: number;
  value: PricingCatalog;
};

let pricingCache: PricingCacheEntry | null = null;

registerCmsCacheResetter(() => {
  pricingCache = null;
});

function reportPricingFallback(
  reason: "missing-document" | "fetch-error",
  details?: unknown
): void {
  incrementFallbackCounter("pricing");
  console.warn("[fallback:pricing]", {
    criticality: "high",
    reason,
    hasCachedValue: Boolean(pricingCache?.value),
    details: details instanceof Error ? details.message : details,
  });
}

export async function getPricing(): Promise<PricingCatalog> {
  const cacheEpoch = getCmsCacheEpoch();

  if (pricingCache && pricingCache.epoch === cacheEpoch) {
    return pricingCache.value;
  }

  try {
    const cms = await fetchSanity<PricingSettingsResult>(PRICING_SETTINGS_QUERY);
    const baseNightly: Record<1 | 2, MoneyCents> = {
      1: toSafeInteger(DEFAULT_BASE_NIGHTLY[1], cms?.baseNightly1Person),
      2: toSafeInteger(DEFAULT_BASE_NIGHTLY[2], cms?.baseNightly2Person),
    };
    const breakfastSurcharge = toSafeInteger(
      DEFAULT_BREAKFAST_SURCHARGE,
      cms?.breakfastSurchargeCents
    );

    pricingCache = {
      epoch: cacheEpoch,
      value: buildPricingCatalog(baseNightly, breakfastSurcharge),
    };

    if (!cms) {
      devLog("[pricing] Using TS fallback (document missing or empty).");
      reportPricingFallback("missing-document");
    }

    return pricingCache.value;
  } catch (error) {
    devLog("[pricing] Sanity fetch failed, using TS fallback.", error);
    reportPricingFallback("fetch-error", error);
    pricingCache = {
      epoch: cacheEpoch,
      value: buildPricingCatalog(DEFAULT_BASE_NIGHTLY, DEFAULT_BREAKFAST_SURCHARGE),
    };
    return pricingCache.value;
  }
}

/** @deprecated Use `await getPricing()` instead. Sync fallback using hardcoded defaults only. */
export const pricing: PricingCatalog = buildPricingCatalog(
  DEFAULT_BASE_NIGHTLY,
  DEFAULT_BREAKFAST_SURCHARGE
);

export function getPublicRatesByKey(catalog: PricingCatalog): Record<PublicRateKey, PublicRate> {
  return catalog.publicRates.reduce(
    (acc, rate) => {
      acc[rate.key] = rate;
      return acc;
    },
    {} as Record<PublicRateKey, PublicRate>
  );
}

export function getPublicRates(catalog: PricingCatalog): readonly PublicRate[] {
  return catalog.publicRates;
}

export function getPublicRateMinMaxCents(catalog: PricingCatalog): {
  min: MoneyCents;
  max: MoneyCents;
} {
  let min = Number.POSITIVE_INFINITY as MoneyCents;
  let max = Number.NEGATIVE_INFINITY as MoneyCents;

  for (const rate of catalog.publicRates) {
    if (rate.priceCents < min) min = rate.priceCents;
    if (rate.priceCents > max) max = rate.priceCents;
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error("No public rates configured.");
  }

  return { min, max };
}
