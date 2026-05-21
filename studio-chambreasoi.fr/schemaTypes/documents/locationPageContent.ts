import {ComposeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const accentOptions = [
  {title: 'Pierre', value: 'stone'},
  {title: 'Forêt', value: 'forest'},
  {title: 'Bistre', value: 'bistre'},
]

type LocationPageItemValue = {
  text?: string
  body?: Array<{
    children?: Array<{text?: string}>
  }>
}

const hasRichTextBody = (body: LocationPageItemValue['body']) =>
  Array.isArray(body) &&
  body.some((block) =>
    block.children?.some((span) => typeof span.text === 'string' && span.text.trim().length > 0),
  )

export const locationPageContent = defineType({
  name: 'locationPageContent',
  title: 'Page Localisation',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Libellé de section',
      type: 'string',
      initialValue: 'Localisation',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'introText',
      title: 'Texte d’introduction',
      type: 'string',
      initialValue: 'Une chambre à soi est idéalement située :',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'items',
      title: 'Points de localisation',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'text',
              title: 'Texte de secours',
              type: 'text',
              description:
                'Utilisé si le texte enrichi ci-dessous est vide. À conserver pour compatibilité.',
              rows: 4,
              validation: (rule) => rule.max(420),
            }),
            defineField({
              name: 'body',
              title: 'Texte enrichi',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'block',
                  styles: [{title: 'Normal', value: 'normal'}],
                  lists: [],
                  marks: {
                    decorators: [
                      {title: 'Gras', value: 'strong'},
                      {title: 'Italique', value: 'em'},
                    ],
                    annotations: [
                      defineArrayMember({
                        name: 'link',
                        title: 'Lien',
                        type: 'object',
                        fields: [
                          defineField({
                            name: 'href',
                            title: 'URL',
                            type: 'url',
                            validation: (rule) =>
                              rule.uri({
                                allowRelative: true,
                                scheme: ['http', 'https', 'mailto', 'tel'],
                              }),
                          }),
                        ],
                      }),
                    ],
                  },
                }),
              ],
            }),
            defineField({
              name: 'accent',
              title: 'Couleur d’accent',
              type: 'string',
              options: {
                list: accentOptions,
                layout: 'radio',
              },
              initialValue: 'stone',
              validation: (rule) => rule.required(),
            }),
          ],
          validation: (rule) =>
            rule.custom((value: LocationPageItemValue | undefined) => {
              const hasText = typeof value?.text === 'string' && value.text.trim().length > 0
              if (hasText || hasRichTextBody(value?.body)) return true

              return 'Renseignez le texte enrichi ou le texte de secours.'
            }),
          preview: {
            select: {
              title: 'text',
              subtitle: 'accent',
            },
            prepare({title, subtitle}) {
              return {
                title: title || 'Point de localisation',
                subtitle: subtitle ? `Accent ${subtitle}` : 'Page localisation',
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1).max(8),
    }),
  ],
  preview: {
    select: {
      title: 'eyebrow',
      subtitle: 'introText',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Page Localisation',
        subtitle: subtitle || 'Contenu de la page localisation',
      }
    },
  },
})
