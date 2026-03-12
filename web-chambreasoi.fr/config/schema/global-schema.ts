// ./config/schema/global-schema.ts
import type {JsonLdNode} from '@config/types/page-meta'
import {getAccommodation} from '@config/accomodation'
import {getOrgData} from '@config/organization'
import {sitemap} from '@config/pages'
import {getPricing} from '@config/pricing'
import {buildOffersFromPricing} from '@config/schema/offers'

const normalizeBaseUrl = (url: string): string => (url.endsWith('/') ? url : `${url}/`)

export async function getGlobalSchema(): Promise<JsonLdNode[]> {
  const orgData = await getOrgData()
  const pricing = await getPricing()
  const accommodation = await getAccommodation()

  const baseUrl = normalizeBaseUrl(orgData.website.url)
  const resolveUrl = (path: string): string => new URL(path, baseUrl).href

  const amenityFeature = accommodation.amenities.map((name) => ({
    '@type': 'LocationFeatureSpecification' as const,
    name,
    value: true,
  }))

  return [
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}#website`,
      url: baseUrl,
      name: orgData.legal.brandName,
      publisher: {'@id': `${baseUrl}#organization`},
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: resolveUrl('/?s={search_term_string}'),
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${baseUrl}#organization`,
      name: orgData.legal.brandName,
      legalName: orgData.legal.legalName,
      url: baseUrl,
    },
    {
      '@type': 'BedAndBreakfast',
      '@id': `${baseUrl}#bedandbreakfast`,
      parentOrganization: {'@id': `${baseUrl}#organization`},
      name: orgData.legal.brandName,
      url: baseUrl,
      sameAs: orgData.googleBusiness.sameAs,
      priceRange: orgData.googleBusiness.priceRange,
      description: "Chambre d'hôtes avec lit double, salle de bain privative et accès terrasse.",
      image: [
        resolveUrl('/og/og-chambreasoi-placeholder-01.png'),
        resolveUrl('/og/og-chambreasoi-placeholder-02.png'),
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: orgData.address.city,
        postalCode: orgData.address.postalCode,
        addressRegion: orgData.address.department,
        addressCountry: orgData.address.countryIso,
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: orgData.googleBusiness.location.latitude,
        longitude: orgData.googleBusiness.location.longitude,
      },
      numberOfRooms: 1,
      potentialAction: {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: resolveUrl(sitemap.reservations.path),
          inLanguage: 'fr-FR',
        },
      },
      tourBookingPage: resolveUrl(sitemap.reservations.path),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'reservations',
        availableLanguage: ['fr', 'en', 'it'],
      },
      checkinTime: accommodation.checkinTime,
      checkoutTime: accommodation.checkoutTime,
      petsAllowed: false,
      smokingAllowed: false,
      amenityFeature,
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Transport - Autoroute A43',
          value: 'Sortie 20 Baldoph/Challes-les-Eaux/Myans à 3 km (8 min en voiture)',
        },
        {
          '@type': 'PropertyValue',
          name: 'Transport - Gare',
          value: 'Gare de Chambéry-Challes-les-Eaux à 8 km (10 min en voiture)',
        },
        {
          '@type': 'PropertyValue',
          name: 'Transport - Bus',
          value: 'Arrêt Eglise Challes ligne C à 400m à pied',
        },
      ],
      makesOffer: buildOffersFromPricing({
        pricing,
        bookingUrl: resolveUrl(sitemap.reservations.path),
      }),
      containsPlace: {
        '@type': 'HotelRoom',
        '@id': `${baseUrl}#room-1`,
        name: orgData.legal.brandName,
        description: 'Chambre avec lit double, dressing et petit bureau. Accès direct à la terrasse.',
        floorSize: {'@type': 'QuantitativeValue', value: 12, unitCode: 'MTK'},
        occupancy: {'@type': 'QuantitativeValue', value: 2, unitCode: 'C62'},
      },
    },
  ]
}
