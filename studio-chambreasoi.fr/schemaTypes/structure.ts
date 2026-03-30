import { CreditCardIcon, HomeIcon, PinIcon } from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'
import { SINGLETON_TYPES } from './lib/singletons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu')
    .items([
      S.listItem()
        .title('Établissement')
        .id('organizationSettings')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('organizationSettings')
            .documentId('organizationSettings')
            .title('Établissement'),
        ),

      S.listItem()
        .title('Tarifs')
        .id('pricingSettings')
        .icon(CreditCardIcon)
        .child(
          S.document().schemaType('pricingSettings').documentId('pricingSettings').title('Tarifs'),
        ),

      S.listItem()
        .title('Hébergement')
        .id('accommodationSettings')
        .icon(PinIcon)
        .child(
          S.document()
            .schemaType('accommodationSettings')
            .documentId('accommodationSettings')
            .title('Hébergement'),
        ),

      S.divider(),


      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? ''
        return !SINGLETON_TYPES.has(id)
      }),
    ])
