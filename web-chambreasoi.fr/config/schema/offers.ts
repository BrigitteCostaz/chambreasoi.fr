import type {Offer, UnitPriceSpecification} from 'schema-dts'
import type {PricingCatalog, PublicRate} from '@config/types/pricing'
import {formatMoneyCentsForSchema} from '@config/pricing'

/**
 * Builds schema.org Offer nodes from the centralized pricing catalog.
 *
 * - Output is designed to be plugged into `BedAndBreakfast.makesOffer`.
 * - Keeps stable `@id` (Offer IDs) defined in pricing.
 * - References the canonical room via `itemOffered: { "@id": roomId }`.
 *
 * Returns schema-dts `Offer[]` (strict typing compatible with `BedAndBreakfast.makesOffer`).
 */
export function buildOffersFromPricing(params: {
  pricing: PricingCatalog
  /**
   * Canonical booking URL for offers (where you want Google/users to end up).
   * Example: "https://chambreasoi.fr/tarifs-et-reservation"
   */
  bookingUrl: string
}): readonly Offer[] {
  const {pricing, bookingUrl} = params

  return pricing.publicRates.map((rate) =>
    publicRateToOffer({
      rate,
      roomId: pricing.roomId,
      bookingUrl,
    }),
  )
}

function publicRateToOffer(params: {
  rate: PublicRate
  roomId: PricingCatalog['roomId']
  bookingUrl: string
}): Offer {
  const {rate, roomId, bookingUrl} = params

  const price = formatMoneyCentsForSchema(rate.priceCents)

  const priceSpecification: UnitPriceSpecification = {
    '@type': 'UnitPriceSpecification',
    priceCurrency: rate.currency,
    price,
    unitText: 'Nuit',
  }

  const offer: Offer = {
    '@type': 'Offer',
    '@id': rate.offerId,
    name: rate.name,
    priceCurrency: rate.currency,
    price,
    itemOffered: {'@id': roomId},
    url: bookingUrl,
    priceSpecification,
  }

  return offer
}
