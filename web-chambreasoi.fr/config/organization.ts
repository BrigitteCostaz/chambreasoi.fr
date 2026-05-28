// ./config/organization.ts
import { devLog, fetchSanity } from "@chambreasoi/sanity/fetch";
import {
  ORGANIZATION_SETTINGS_QUERY,
  type OrganizationSettingsResult,
} from "@chambreasoi/sanity/queries";
import type { OrganizationConfig } from "@config/types";
import { incrementFallbackCounter } from "@lib/observability/fallbackMetrics";
import { resolveNumber, resolveString, resolveStringArray } from "@utils/config-resolvers";

const ORG_DEFAULTS: OrganizationConfig = {
  contact: {
    email: "contact@chambreasoi.fr",
    phone: {
      display: "+ 33 6 31 98 85 38",
      link: "tel:+ 33631988538",
    },
  },

  address: {
    street: "90 Chem. du Burdet",
    city: "Challes-les-Eaux",
    postalCode: "73190",
    department: "Savoie",
    departmentCode: "73",
    region: "Auvergne-Rhône-Alpes",
    country: "France",
    countryIso: "FR",
  },

  legal: {
    name: "BRIGITTE COSTAZ",
    brandName: "UNE CHAMBRE À SOI",
    legalName: "COSTAZ BRIGITTE EI",
    legalForm: "Entrepreneur individuel",

    siret: "100 235 191 00010",
    siren: "100 235 191",
    vatNumber: "FR56100235191",

    startYear: 2026,

    activityCode: "5520Z",
    activityLabel: "Hébergement touristique et autre hébergement de courte durée",
  },

  website: {
    url: "https://chambreasoi.fr",
    developer: {
      name: "Baptiste Chénin",
      url: "https://baptistechenin.com",
      email: "contact@baptistechenin.com",
      siret: "792 564 1140 0025",
    },
    hosting: {
      name: "Cloudflare, Inc.",
      address: "101 Townsend St, San Francisco, CA 94107, États-Unis",
      url: "https://www.cloudflare.com",
      privacyPolicyUrl: "https://www.cloudflare.com/privacypolicy/",
    },
  },

  googleBusiness: {
    cid: "",
    location: {
      latitude: 45.55001398762779,
      longitude: 5.979481402978714,
    },

    reviewUrl: "",
    sameAs: ["GoogleMapslink"],
    priceRange: "€",
  },
};

function mapSanityToOrgData(
  cms: OrganizationSettingsResult | null,
  fallback: OrganizationConfig
): OrganizationConfig {
  if (!cms) return fallback;

  return {
    contact: {
      email: resolveString(fallback.contact.email, cms.contactEmail),
      phone: {
        display: resolveString(fallback.contact.phone.display, cms.contactPhoneDisplay),
        link: resolveString(fallback.contact.phone.link, cms.contactPhoneLink),
      },
    },
    address: {
      street: resolveString(fallback.address.street, cms.addressStreet),
      city: resolveString(fallback.address.city, cms.addressCity),
      postalCode: resolveString(fallback.address.postalCode, cms.addressPostalCode),
      department: resolveString(fallback.address.department, cms.addressDepartment),
      departmentCode: resolveString(fallback.address.departmentCode, cms.addressDepartmentCode),
      region: resolveString(fallback.address.region, cms.addressRegion),
      country: resolveString(fallback.address.country, cms.addressCountry),
      countryIso: resolveString(fallback.address.countryIso, cms.addressCountryIso),
    },
    legal: {
      name: resolveString(fallback.legal.name, cms.legalName),
      brandName: resolveString(fallback.legal.brandName, cms.legalBrandName),
      legalName: resolveString(fallback.legal.legalName, cms.legalEntityName),
      legalForm: resolveString(fallback.legal.legalForm, cms.legalForm),
      siret: resolveString(fallback.legal.siret, cms.legalSiret),
      siren: resolveString(fallback.legal.siren, cms.legalSiren),
      vatNumber: resolveString(fallback.legal.vatNumber ?? "", cms.legalVatNumber),
      rcsNumber: fallback.legal.rcsNumber,
      tradeRegistry: fallback.legal.tradeRegistry,
      startYear: fallback.legal.startYear,
      activityCode: resolveString(fallback.legal.activityCode, cms.legalActivityCode),
      activityLabel: resolveString(fallback.legal.activityLabel, cms.legalActivityLabel),
    },
    website: fallback.website,
    googleBusiness: {
      cid: resolveString(fallback.googleBusiness.cid ?? "", cms.googleCid),
      location: {
        latitude: resolveNumber(fallback.googleBusiness.location.latitude, cms.googleLatitude),
        longitude: resolveNumber(fallback.googleBusiness.location.longitude, cms.googleLongitude),
      },
      reviewUrl: resolveString(fallback.googleBusiness.reviewUrl ?? "", cms.googleReviewUrl),
      sameAs: resolveStringArray(fallback.googleBusiness.sameAs, cms.googleSameAs),
      priceRange: resolveString(fallback.googleBusiness.priceRange ?? "", cms.googlePriceRange),
    },
  };
}

let orgDataCache: OrganizationConfig | null = null;

function reportOrganizationFallback(
  reason: "missing-document" | "fetch-error",
  details?: unknown
): void {
  incrementFallbackCounter("organization");
  console.warn("[fallback:organization]", {
    criticality: "high",
    reason,
    hasCachedValue: Boolean(orgDataCache),
    details: details instanceof Error ? details.message : details,
  });
}

export async function getOrgData(): Promise<OrganizationConfig> {
  if (orgDataCache) return orgDataCache;

  try {
    const cms = await fetchSanity<OrganizationSettingsResult>(ORGANIZATION_SETTINGS_QUERY);
    const merged = mapSanityToOrgData(cms, ORG_DEFAULTS);

    if (!cms) {
      devLog("[orgData] Using TS fallback (document missing or empty).");
      reportOrganizationFallback("missing-document");
    }

    orgDataCache = merged;
    return merged;
  } catch (error) {
    devLog("[orgData] Sanity fetch failed, using TS fallback.", error);
    reportOrganizationFallback("fetch-error", error);
    orgDataCache = ORG_DEFAULTS;
    return orgDataCache;
  }
}

/** Synchronous fallback — use only when await is impossible. Prefer getOrgData(). */
export const orgDataDefaults: OrganizationConfig = ORG_DEFAULTS;
