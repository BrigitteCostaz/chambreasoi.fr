/* config/types/pricing.d.ts
 *
 * Centralized pricing model for "UNE CHAMBRE A SOI".
 *
 * Goals:
 * - Single source of truth for tariffs used by UI components and JSON-LD schema generation.
 * - Keep stable external identifiers for schema.org Offer nodes.
 * - Support derived "public rates" (e.g. 1p/2p with/without breakfast) from composable rules.
 *
 * Notes:
 * - Currency values are stored as integer cents to avoid floating-point issues.
 * - "Public rates" are the externally visible combinations that map 1:1 to schema.org Offer nodes.
 */

export type CurrencyCode = "EUR";

/** Integer cents (e.g. 8000 = 80.00 EUR). */
export type MoneyCents = number;

/** Number of nights (unit for these tariffs). */
export type NightCount = number;

export type RateUnit = "NIGHT";

/**
 * Canonical identifier for the single room in schema and pricing.
 * Keep this stable because Offers reference it.
 */
export type RoomId = "https://chambreasoi.fr/#room-1";

/**
 * Stable Offer IDs required by schema.org graph.
 * Keep these stable forever to avoid breaking references.
 */
export type PublicRateOfferId =
  | "https://chambreasoi.fr/#rate-1p-no-breakfast"
  | "https://chambreasoi.fr/#rate-1p-breakfast"
  | "https://chambreasoi.fr/#rate-2p-no-breakfast"
  | "https://chambreasoi.fr/#rate-2p-breakfast";

/**
 * Internal key for rate combinations exposed publicly.
 * This is used in the app for lookups and UI.
 */
export type PublicRateKey = "1p-no-breakfast" | "1p-breakfast" | "2p-no-breakfast" | "2p-breakfast";

export type BreakfastMode = "NONE" | "INCLUDED";

export interface BaseNightlyRate {
  /** Occupancy (people) this base rate applies to. */
  occupancy: 1 | 2;
  /** Price per night (in cents). */
  priceCents: MoneyCents;
  currency: CurrencyCode;
  unit: RateUnit;
}

export interface BreakfastRule {
  /**
   * If breakfast is offered as a fixed surcharge, set `surchargeCents`.
   * If you later need seasonal/per-person rules, extend this interface.
   */
  surchargeCents: MoneyCents;
  currency: CurrencyCode;
  unit: RateUnit;
  /**
   * How the surcharge is applied.
   * - "PER_BOOKING": one surcharge per night booking (regardless of number of guests)
   * - "PER_PERSON": surcharge per person per night
   */
  applies: "PER_BOOKING" | "PER_PERSON";
}

export interface PricingCatalog {
  currency: CurrencyCode;
  unit: RateUnit;

  /** The room that offers are tied to (schema offer itemOffered). */
  roomId: RoomId;

  /** Base nightly prices by occupancy. */
  baseNightlyRates: readonly BaseNightlyRate[];

  /** Breakfast pricing rule used to derive "with breakfast" rates. */
  breakfast: BreakfastRule;

  /**
   * Public rates exposed by the app and by schema generation.
   * Typically derived from base + breakfast, but can be overridden if needed.
   */
  publicRates: readonly PublicRate[];
}

export interface PublicRate {
  key: PublicRateKey;

  /** Stable schema Offer @id. */
  offerId: PublicRateOfferId;

  /** Display name used for schema Offer.name and UI labels. */
  name: string;

  /** Occupancy this rate applies to. */
  occupancy: 1 | 2;

  /** Breakfast included or not. */
  breakfast: BreakfastMode;

  /** Total per-night price exposed publicly (in cents). */
  priceCents: MoneyCents;

  currency: CurrencyCode;
  unit: RateUnit;
}

/** Helper: compute cents → "80.00" for schema.org price fields. */
export type MoneyFormatter = (cents: MoneyCents) => string;
