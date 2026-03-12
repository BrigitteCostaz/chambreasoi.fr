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
// testContent
// ---------------------------------------------------------------------------

/** Fetch all testContent documents (list view). */
export const TEST_CONTENT_LIST_QUERY = /* groq */ `
  *[_type == "testContent"] | order(_createdAt desc) {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    image {
      asset->,
      alt
    }
  }
`

/** Fetch a single testContent document by slug. */
export const TEST_CONTENT_BY_SLUG_QUERY = /* groq */ `
  *[_type == "testContent" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    "slug": slug.current,
    excerpt,
    body,
    image {
      asset->,
      alt
    }
  }
`

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
