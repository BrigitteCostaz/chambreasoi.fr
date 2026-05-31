// ./config/head.ts

import { getOrgData } from "@config/organization";
import type { HeadConfig, OgImageAsset } from "@config/types";

export function resolveSiteAssetUrl(path: string, baseUrl: string): string {
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).href;
}

function buildOgImages(brandName: string, city: string): HeadConfig["ogImages"] {
  const primary: OgImageAsset = {
    path: "/og/og-chambreasoi-01.png",
    width: 1200,
    height: 630,
    alt: `${brandName} — chambre d'hôtes à ${city}`,
  };

  const secondary: OgImageAsset = {
    path: "/og/og-chambreasoi-02.png",
    width: 1200,
    height: 1200,
    alt: `${brandName} — vue de la chambre d'hôtes`,
  };

  return { primary, secondary };
}

export async function getHeadData(): Promise<HeadConfig> {
  const orgData = await getOrgData();
  const ogImages = buildOgImages(orgData.legal.brandName, orgData.address.city);

  return {
    meta: {
      url: orgData.website.url,
      base: "/",
      metaTitle: `${orgData.legal.brandName} - Chambre d'hôtes ${orgData.address.city}`,
      metaDescription: `Chambre d'hôtes calme à ${orgData.address.city} (${orgData.address.department}). A43 sortie 20 (3km), WiFi, terrasse, parking gratuit. Réservation ${orgData.contact.phone.display}`,
      author: orgData.legal.name,
      geoRegion: `${orgData.address.countryIso}-${orgData.address.departmentCode}`,
      geoPlaceName: orgData.address.city,
      geoPosition: `${orgData.googleBusiness.location.latitude};${orgData.googleBusiness.location.longitude}`,
      defaultOgImage: ogImages.primary.path,
    },
    ogImages,
    favicons: {
      faviconPng: "/favicons/favicon.svg",
      faviconPng96: "/favicons/favicon-96x96.png",
      faviconSvg: "/favicons/favicon.svg",
      faviconIco: "/favicons/favicon.ico",
      webManifest: "/favicons/site.webmanifest",
      appleTouchIcon: "/favicons/apple-touch-icon.png",
    },
  };
}
