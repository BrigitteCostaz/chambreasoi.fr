/**
 * Centralised GROQ query constants.
 *
 * Keep all queries here so they are shared across the Astro web app
 * and any other consumer (scripts, previews, tests…).
 *
 * Rules:
 * - Export plain strings only — no execution, no client imports.
 * - Name queries with a consistent pattern: `<TYPE>_QUERY` / `<TYPE>_BY_SLUG_QUERY`.
 * - Use GROQ parameter placeholders ($slug, $id, etc.) for dynamic values.
 */

export interface OrganizationSettingsResult {
  contactEmail: string | null
  contactPhoneDisplay: string | null
  contactPhoneLink: string | null
  addressStreet: string | null
  addressCity: string | null
  addressPostalCode: string | null
  addressDepartment: string | null
  addressDepartmentCode: string | null
  addressRegion: string | null
  addressCountry: string | null
  addressCountryIso: string | null
  legalName: string | null
  legalBrandName: string | null
  legalEntityName: string | null
  legalForm: string | null
  legalSiret: string | null
  legalSiren: string | null
  legalVatNumber: string | null
  legalActivityCode: string | null
  legalActivityLabel: string | null
  googleCid: string | null
  googleLatitude: number | null
  googleLongitude: number | null
  googleReviewUrl: string | null
  googleSameAs: string[] | null
  googlePriceRange: string | null
}

export interface PricingSettingsResult {
  baseNightly1Person: number | null
  baseNightly2Person: number | null
  breakfastSurchargeCents: number | null
}

export interface AccommodationSettingsResult {
  checkinTime: string | null
  checkoutTime: string | null
  amenities: string[] | null
}

// ---------------------------------------------------------------------------
// Singleton settings
// ---------------------------------------------------------------------------

export const ORGANIZATION_SETTINGS_QUERY = /* groq */ `
  *[_type == "organizationSettings" && _id == "organizationSettings"][0]{
    contactEmail,
    contactPhoneDisplay,
    contactPhoneLink,
    addressStreet,
    addressCity,
    addressPostalCode,
    addressDepartment,
    addressDepartmentCode,
    addressRegion,
    addressCountry,
    addressCountryIso,
    legalName,
    legalBrandName,
    legalEntityName,
    legalForm,
    legalSiret,
    legalSiren,
    legalVatNumber,
    legalActivityCode,
    legalActivityLabel,
    googleCid,
    googleLatitude,
    googleLongitude,
    googleReviewUrl,
    googleSameAs,
    googlePriceRange
  }
`

export const PRICING_SETTINGS_QUERY = /* groq */ `
  *[_type == "pricingSettings" && _id == "pricingSettings"][0]{
    baseNightly1Person,
    baseNightly2Person,
    breakfastSurchargeCents
  }
`

export const ACCOMMODATION_SETTINGS_QUERY = /* groq */ `
  *[_type == "accommodationSettings" && _id == "accommodationSettings"][0]{
    checkinTime,
    checkoutTime,
    amenities
  }
`

// ---------------------------------------------------------------------------
// foldContent
// ---------------------------------------------------------------------------

export interface FoldContentResult {
  seoTitle: string | null
  mosaicTile1Text: string | null
  mosaicTile2Line1: string | null
  mosaicTile2Line2: string | null
  amenitiesLabel: string | null
  amenities: string[] | null
  bookingNote: string | null
}

export const FOLD_CONTENT_QUERY = /* groq */ `
  *[_type == "foldContent"][0]{
    seoTitle,
    mosaicTile1Text,
    mosaicTile2Line1,
    mosaicTile2Line2,
    amenitiesLabel,
    amenities,
    bookingNote
  }
`
// ---------------------------------------------------------------------------
// headlineContent
// ---------------------------------------------------------------------------

export interface HeadlineContentResult {
  headLineText: string | null
}

export const HEADLINE_CONTENT_QUERY = /* groq */ `
    *[_type == "headlineContent"][0]{
    headLineText,
    }
`
