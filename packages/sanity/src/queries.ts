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
  websiteDeveloper: {
    name: string | null
    url: string | null
    email: string | null
    siret: string | null
  } | null
  websiteHosting: {
    name: string | null
    address: string | null
    url: string | null
    privacyPolicyUrl: string | null
  } | null
  mentionsLastUpdated: string | null
  mentionsLastUpdatedIso: string | null
  photoCredits: Array<{
    name: string | null
    description: string | null
    url: string | null
    licenseUrl: string | null
    licenseLabel: string | null
  }> | null
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

export interface AvailabilityDateResult {
  date: string
  available?: boolean
}

export interface AvailabilityMonthResult {
  month: string
  dates?: AvailabilityDateResult[]
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
    googlePriceRange,
    websiteDeveloper{
      name,
      url,
      email,
      siret
    },
    websiteHosting{
      name,
      address,
      url,
      privacyPolicyUrl
    },
    mentionsLastUpdated,
    mentionsLastUpdatedIso,
    photoCredits[]{
      name,
      description,
      url,
      licenseUrl,
      licenseLabel
    }
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

export const AVAILABILITY_MONTHS_QUERY = /* groq */ `
  *[
    _type == "availability"
    && !(_id in path("drafts.**"))
    && month >= $minMonth
    && month <= $maxMonth
  ] | order(month asc){
    month,
    dates[]{ date, available }
  }
`

// ---------------------------------------------------------------------------
// Shared CMS image projection
// ---------------------------------------------------------------------------

export interface CmsImageResult {
  asset: {
    _ref?: string
    _id?: string
    url?: string
    metadata?: {
      dimensions?: {
        width?: number
        height?: number
      } | null
    } | null
  } | null
  alt: string | null
}

const CMS_IMAGE_PROJECTION = /* groq */ `
  "asset": asset.asset->{
    _id,
    url,
    metadata{
      dimensions{
        width,
        height
      }
    }
  },
  alt
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
  coverImage: CmsImageResult | null
  priceCoverImage: CmsImageResult | null
}

export const FOLD_CONTENT_QUERY = /* groq */ `
  *[_type == "foldContent" && _id == "foldContent"][0]{
    seoTitle,
    mosaicTile1Text,
    mosaicTile2Line1,
    mosaicTile2Line2,
    amenitiesLabel,
    amenities,
    bookingNote,
    coverImage{
      ${CMS_IMAGE_PROJECTION}
    },
    priceCoverImage{
      ${CMS_IMAGE_PROJECTION}
    }
  }
`
// ---------------------------------------------------------------------------
// headlineContent
// ---------------------------------------------------------------------------

export interface HeadlineContentResult {
  headLineText: string | null
}

export const HEADLINE_CONTENT_QUERY = /* groq */ `
    *[_type == "headlineContent" && _id == "headlineContent"][0]{
    headLineText,
    }
`
// ---------------------------------------------------------------------------
// locationSectionContent
// ---------------------------------------------------------------------------

export interface LocationSectionContentResult {
  introText: string | null
  mapLabel1: string | null
  mapLabel2: string | null
  mapLabel3: string | null
  mapCta: string | null
}

export const LOCATIONSECTION_CONTENT_QUERY = /* groq */ `
    *[_type == "locationSectionContent" && _id == "locationSectionContent"][0]{
    introText,
    mapLabel1,
    mapLabel2,
    mapLabel3,
    mapCta,
    }
`

// ---------------------------------------------------------------------------
// locationPageContent
// ---------------------------------------------------------------------------

export type LocationPageAccent = "stone" | "forest" | "bistre"

export interface LocationPageLinkMarkDefResult {
  _key: string
  _type: string
  href: string | null
}

export interface LocationPageTextSpanResult {
  _key: string
  _type: string
  text: string | null
  marks: string[] | null
}

export interface LocationPageTextBlockResult {
  _key: string
  _type: string
  style: string | null
  markDefs: LocationPageLinkMarkDefResult[] | null
  children: LocationPageTextSpanResult[] | null
}

export interface LocationPageItemResult {
  _key: string
  text: string | null
  body: LocationPageTextBlockResult[] | null
  accent: LocationPageAccent | null
}

export interface LocationPageContentResult {
  eyebrow: string | null
  introText: string | null
  items: LocationPageItemResult[] | null
}

export const LOCATION_PAGE_CONTENT_QUERY = /* groq */ `
  *[_type == "locationPageContent" && _id == "locationPageContent"][0]{
    eyebrow,
    introText,
    items[]{
      _key,
      text,
      body[]{
        _key,
        _type,
        style,
        markDefs[]{
          _key,
          _type,
          href
        },
        children[]{
          _key,
          _type,
          text,
          marks
        }
      },
      accent
    }
  }
`

// ---------------------------------------------------------------------------
// practicalInfoContent
// ---------------------------------------------------------------------------

export type PracticalInfoAccent = "stone" | "forest" | "bistre"

export type PracticalInfoImageResult = CmsImageResult

export interface PracticalInfoTextSpanResult {
  _key: string
  _type: string
  text: string | null
  marks: string[] | null
}

export interface PracticalInfoTextBlockResult {
  _key: string
  _type: string
  style: string | null
  children: PracticalInfoTextSpanResult[] | null
}

export interface PracticalInfoCardResult {
  _key: string
  title: string | null
  body: PracticalInfoTextBlockResult[] | null
  secondaryText?: string | null
  accent: PracticalInfoAccent | null
}

export interface PracticalInfoServiceCardResult {
  _key: string
  category: string | null
  title: string | null
  body: PracticalInfoTextBlockResult[] | null
  accent: PracticalInfoAccent | null
}

export interface PracticalInfoContentResult {
  availabilityEyebrow: string | null
  availabilityHeading: string | null
  availabilityIntro: string | null
  reservationIntro: string | null
  eyebrow: string | null
  tariffsHeading: string | null
  kitchenImage: PracticalInfoImageResult | null
  bookingHeading: string | null
  bookingEyebrow: string | null
  bookingImage: PracticalInfoImageResult | null
  bookingCards: PracticalInfoCardResult[] | null
  servicesEyebrow: string | null
  servicesHeading: string | null
  serviceCards: PracticalInfoServiceCardResult[] | null
  serviceImages: PracticalInfoImageResult[] | null
}

export const PRACTICAL_INFO_CONTENT_QUERY = /* groq */ `
  *[_type == "practicalInfoContent" && _id == "practicalInfoContent"][0]{
    availabilityEyebrow,
    availabilityHeading,
    availabilityIntro,
    reservationIntro,
    eyebrow,
    tariffsHeading,
    kitchenImage{
      ${CMS_IMAGE_PROJECTION}
    },
    bookingHeading,
    bookingEyebrow,
    bookingImage{
      ${CMS_IMAGE_PROJECTION}
    },
    bookingCards[]{
      _key,
      title,
      body[]{
        _key,
        _type,
        style,
        children[]{
          _key,
          _type,
          text,
          marks
        }
      },
      secondaryText,
      accent
    },
    servicesEyebrow,
    servicesHeading,
    serviceCards[]{
      _key,
      category,
      title,
      body[]{
        _key,
        _type,
        style,
        children[]{
          _key,
          _type,
          text,
          marks
        }
      },
      accent
    },
    serviceImages[]{
      ${CMS_IMAGE_PROJECTION}
    }
  }
`

// ---------------------------------------------------------------------------
// roomPageContent
// ---------------------------------------------------------------------------

export type RoomPageAccent = "stone" | "forest" | "bistre"

export type RoomPageImageResult = CmsImageResult

export interface RoomPageCardResult {
  _key: string
  title: string | null
  body: string | null
  accent: RoomPageAccent | null
}

export interface RoomPageSectionResult {
  eyebrow: string | null
  heading: string | null
  introText: string | null
  featureImage: RoomPageImageResult | null
  cards: RoomPageCardResult[] | null
  galleryImages: RoomPageImageResult[] | null
}

export interface RoomPageContentResult {
  heroEyebrow: string | null
  heroTitle: string | null
  privateSection: RoomPageSectionResult | null
  sharedSection: RoomPageSectionResult | null
  serviceSection: RoomPageSectionResult | null
}

const ROOM_PAGE_IMAGE_PROJECTION = CMS_IMAGE_PROJECTION

const ROOM_PAGE_SECTION_PROJECTION = /* groq */ `
  eyebrow,
  heading,
  introText,
  featureImage{
    ${ROOM_PAGE_IMAGE_PROJECTION}
  },
  cards[]{
    _key,
    title,
    body,
    accent
  },
  galleryImages[]{
    ${ROOM_PAGE_IMAGE_PROJECTION}
  }
`

export const ROOM_PAGE_CONTENT_QUERY = /* groq */ `
  *[_type == "roomPageContent" && _id == "roomPageContent"][0]{
    heroEyebrow,
    heroTitle,
    privateSection{
      ${ROOM_PAGE_SECTION_PROJECTION}
    },
    sharedSection{
      ${ROOM_PAGE_SECTION_PROJECTION}
    },
    serviceSection{
      ${ROOM_PAGE_SECTION_PROJECTION}
    }
  }
`

// ---------------------------------------------------------------------------
// surroundingsPageContent
// ---------------------------------------------------------------------------

export type SurroundingsReservationStatus = "obligatoire" | "conseillee"

export interface SurroundingsLinkMarkDefResult {
  _key: string
  _type: string
  href: string | null
}

export interface SurroundingsTextSpanResult {
  _key: string
  _type: string
  text: string | null
  marks: string[] | null
}

export interface SurroundingsTextBlockResult {
  _key: string
  _type: string
  style: string | null
  listItem?: string | null
  level?: number | null
  markDefs: SurroundingsLinkMarkDefResult[] | null
  children: SurroundingsTextSpanResult[] | null
}

export interface SurroundingsAccordionItemResult {
  _key: string
  title: string | null
  category: string | null
  body: SurroundingsTextBlockResult[] | null
  url: string | null
  note: SurroundingsTextBlockResult[] | null
  reservationRequired: SurroundingsReservationStatus | null
}

export interface SurroundingsAccordionResult {
  _key: string
  title: string | null
  description: SurroundingsTextBlockResult[] | null
  galleryImages: SurroundingsGalleryImageResult[] | null
  items: SurroundingsAccordionItemResult[] | null
}

export interface SurroundingsGalleryPhotoCreditResult {
  commonsFileUrl: string | null
  title: string | null
  author: string | null
  licenseUrl: string | null
  licenseLabel: string | null
}

export interface SurroundingsGalleryImageResult {
  _key: string
  asset: CmsImageResult["asset"]
  alt: string | null
  photoCredit: SurroundingsGalleryPhotoCreditResult | null
}

export interface SurroundingsIntroImageResult {
  asset: CmsImageResult["asset"]
  alt: string | null
  caption: string | null
  photoCredit: SurroundingsGalleryPhotoCreditResult | null
}

export interface SurroundingsPageContentResult {
  heroEyebrow: string | null
  heroTitle: string | null
  proximityStatement: SurroundingsTextBlockResult[] | null
  proximityIntro: SurroundingsTextBlockResult[] | null
  proximityReassurance: SurroundingsTextBlockResult[] | null
  editorialLead: SurroundingsTextBlockResult[] | null
  introImage: SurroundingsIntroImageResult | null
  galleryImages: SurroundingsGalleryImageResult[] | null
  accordions: SurroundingsAccordionResult[] | null
}

const SURROUNDINGS_PORTABLE_TEXT_PROJECTION = /* groq */ `
  _key,
  _type,
  style,
  listItem,
  level,
  markDefs[]{
    _key,
    _type,
    href
  },
  children[]{
    _key,
    _type,
    text,
    marks
  }
`

export const SURROUNDINGS_PAGE_CONTENT_QUERY = /* groq */ `
  *[_type == "surroundingsPageContent" && _id == "surroundingsPageContent"][0]{
    heroEyebrow,
    heroTitle,
    proximityStatement[]{${SURROUNDINGS_PORTABLE_TEXT_PROJECTION}},
    proximityIntro[]{${SURROUNDINGS_PORTABLE_TEXT_PROJECTION}},
    proximityReassurance[]{${SURROUNDINGS_PORTABLE_TEXT_PROJECTION}},
    editorialLead[]{${SURROUNDINGS_PORTABLE_TEXT_PROJECTION}},
    introImage{
      ${CMS_IMAGE_PROJECTION},
      caption,
      photoCredit{
        commonsFileUrl,
        title,
        author,
        licenseUrl,
        licenseLabel
      }
    },
    galleryImages[]{
      _key,
      ${CMS_IMAGE_PROJECTION},
      photoCredit{
        commonsFileUrl,
        title,
        author,
        licenseUrl,
        licenseLabel
      }
    },
    accordions[]{
      _key,
      title,
      description[]{${SURROUNDINGS_PORTABLE_TEXT_PROJECTION}},
      galleryImages[]{
        _key,
        ${CMS_IMAGE_PROJECTION},
        photoCredit{
          commonsFileUrl,
          title,
          author,
          licenseUrl,
          licenseLabel
        }
      },
      items[]{
        _key,
        title,
        category,
        body[]{${SURROUNDINGS_PORTABLE_TEXT_PROJECTION}},
        url,
        note[]{${SURROUNDINGS_PORTABLE_TEXT_PROJECTION}},
        reservationRequired
      }
    }
  }
`
