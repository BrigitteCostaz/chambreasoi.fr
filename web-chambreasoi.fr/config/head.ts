// ./config/head.ts
import type { HeadConfig } from '@config/types'
import { getOrgData } from '@config/organization'

export async function getHeadData(): Promise<HeadConfig> {
  const orgData = await getOrgData()

  return {
    meta: {
      url: orgData.website.url,
      base: '/',
      metaTitle: `${orgData.legal.brandName} - Chambre d'hôtes ${orgData.address.city}`,
      metaDescription: `Chambre d'hôtes calme à ${orgData.address.city} (${orgData.address.department}). A43 sortie 20 (3km), WiFi, terrasse, parking gratuit. Réservation ${orgData.contact.phone.display}`,
      author: orgData.legal.name,
      geoRegion: `${orgData.address.countryIso}-${orgData.address.departmentCode}`,
      geoPlaceName: orgData.address.city,
      geoPosition: `${orgData.googleBusiness.location.latitude};${orgData.googleBusiness.location.longitude}`,
      defaultOgImage: 'https://chambreasoi.fr/placeholder-og-image.jpg',
    },
    favicons: {
      faviconPng: '/favicons/favicon.svg',
      faviconPng96: '/favicons/favicon-96x96.png',
      faviconSvg: '/favicons/favicon.svg',
      faviconIco: '/favicons/favicon.ico',
      webManifest: '/favicons/site.webmanifest',
      appleTouchIcon: '/favicons/apple-touch-icon.png',
    },
  }
}
