import { ComposeIcon, CreditCardIcon, HomeIcon, PinIcon } from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'
import { SINGLETON_TYPES } from './lib/singletons'

const singletonItem = (
  S: Parameters<StructureResolver>[0],
  id: string,
  title: string,
  icon: typeof ComposeIcon = ComposeIcon,
) =>
  S.listItem()
    .title(title)
    .id(id)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(id).title(title))

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

      S.listItem()
        .title('Disponibilités')
        .id('availability')
        .icon(ComposeIcon)
        .child(S.documentTypeList('availability').title('Disponibilités par mois')),

      S.divider(),

      singletonItem(S, 'foldContent', 'Accueil - Fold', ComposeIcon),
      singletonItem(S, 'headlineContent', 'Accueil - Headline', ComposeIcon),
      singletonItem(S, 'locationPageContent', 'Page - Localisation', PinIcon),
      singletonItem(S, 'locationSectionContent', 'Section - Localisation', PinIcon),
      singletonItem(S, 'practicalInfoContent', 'Page - Infos pratiques', ComposeIcon),
      singletonItem(S, 'roomPageContent', 'Page - La chambre', HomeIcon),
      singletonItem(S, 'surroundingsPageContent', 'Page - Bons plans', ComposeIcon),

      S.divider(),

      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId() ?? ''
        return id !== 'availability' && !SINGLETON_TYPES.has(id)
      }),
    ])
