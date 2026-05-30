// ./config/organization.ts
import { devLog, fetchSanity } from "@chambreasoi/sanity/fetch";
import {
  ORGANIZATION_SETTINGS_QUERY,
  type OrganizationSettingsResult,
} from "@chambreasoi/sanity/queries";
import { getCmsCacheEpoch, registerCmsCacheResetter } from "@config/cache";
import type { OrganizationConfig, PhotoCreditEntry } from "@config/types";
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

  dates: {
    lastUpdated: "30 mai 2026",
    lastUpdatedIso: "2026-05-30",
  },

  photoCredits: [
    {
      name: "Baptiste Chénin",
      description: "Photographies du site",
      url: "https://baptistechenin.com",
    },
  ],

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

function mapPhotoCredits(
  cmsCredits: OrganizationSettingsResult["photoCredits"],
  fallback: PhotoCreditEntry[]
): PhotoCreditEntry[] {
  if (!Array.isArray(cmsCredits) || cmsCredits.length === 0) {
    return fallback;
  }

  const mapped = cmsCredits
    .map((entry) => {
      const name = entry?.name?.trim();
      const description = entry?.description?.trim();
      if (!name || !description) return null;

      const credit: PhotoCreditEntry = { name, description };
      const url = entry.url?.trim();
      const licenseUrl = entry.licenseUrl?.trim();
      const licenseLabel = entry.licenseLabel?.trim();

      if (url) credit.url = url;
      if (licenseUrl) credit.licenseUrl = licenseUrl;
      if (licenseLabel) credit.licenseLabel = licenseLabel;

      return credit;
    })
    .filter((entry): entry is PhotoCreditEntry => entry !== null);

  return mapped.length > 0 ? mapped : fallback;
}

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
    website: {
      url: fallback.website.url,
      developer: {
        name: resolveString(fallback.website.developer.name, cms.websiteDeveloper?.name),
        url: resolveString(fallback.website.developer.url, cms.websiteDeveloper?.url),
        email: resolveString(fallback.website.developer.email, cms.websiteDeveloper?.email),
        siret: resolveString(fallback.website.developer.siret, cms.websiteDeveloper?.siret),
      },
      hosting: {
        name: resolveString(fallback.website.hosting.name, cms.websiteHosting?.name),
        address: resolveString(fallback.website.hosting.address, cms.websiteHosting?.address),
        url: resolveString(fallback.website.hosting.url, cms.websiteHosting?.url),
        privacyPolicyUrl: resolveString(
          fallback.website.hosting.privacyPolicyUrl,
          cms.websiteHosting?.privacyPolicyUrl
        ),
      },
    },
    dates: {
      lastUpdated: resolveString(fallback.dates.lastUpdated, cms.mentionsLastUpdated),
      lastUpdatedIso: resolveString(fallback.dates.lastUpdatedIso, cms.mentionsLastUpdatedIso),
    },
    photoCredits: mapPhotoCredits(cms.photoCredits, fallback.photoCredits),
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

type OrganizationCacheEntry = {
  epoch: number;
  value: OrganizationConfig;
};

let orgDataCache: OrganizationCacheEntry | null = null;

registerCmsCacheResetter(() => {
  orgDataCache = null;
});

function reportOrganizationFallback(
  reason: "missing-document" | "fetch-error",
  details?: unknown
): void {
  incrementFallbackCounter("organization");
  console.warn("[fallback:organization]", {
    criticality: "high",
    reason,
    hasCachedValue: Boolean(orgDataCache?.value),
    details: details instanceof Error ? details.message : details,
  });
}

export async function getOrgData(): Promise<OrganizationConfig> {
  const cacheEpoch = getCmsCacheEpoch();
  if (orgDataCache && orgDataCache.epoch === cacheEpoch) {
    return orgDataCache.value;
  }

  try {
    const cms = await fetchSanity<OrganizationSettingsResult>(ORGANIZATION_SETTINGS_QUERY);
    const merged = mapSanityToOrgData(cms, ORG_DEFAULTS);

    if (!cms) {
      devLog("[orgData] Using TS fallback (document missing or empty).");
      reportOrganizationFallback("missing-document");
    }

    orgDataCache = {
      epoch: cacheEpoch,
      value: merged,
    };
    return orgDataCache.value;
  } catch (error) {
    devLog("[orgData] Sanity fetch failed, using TS fallback.", error);
    reportOrganizationFallback("fetch-error", error);
    orgDataCache = {
      epoch: cacheEpoch,
      value: ORG_DEFAULTS,
    };
    return orgDataCache.value;
  }
}

/** Synchronous fallback — use only when await is impossible. Prefer getOrgData(). */
export const orgDataDefaults: OrganizationConfig = ORG_DEFAULTS;
