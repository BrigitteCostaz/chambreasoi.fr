import {ComposeIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const surroundingsRichTextBlock = defineArrayMember({
  type: 'block',
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [
    {title: 'Puce', value: 'bullet'},
    {title: 'Numérotée', value: 'number'},
  ],
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
})

const reservationOptions = [
  {title: 'Obligatoire', value: 'obligatoire'},
  {title: 'Conseillée', value: 'conseillee'},
]

export const surroundingsPageContent = defineType({
  name: 'surroundingsPageContent',
  title: 'Page Environs',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'Libellé de section',
      type: 'string',
      initialValue: 'Bons plans',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Titre principal',
      type: 'string',
      initialValue: 'Découvrir Challes-les-Eaux et ses environs',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'editorialLead',
      title: 'Accroche éditoriale',
      type: 'array',
      of: [surroundingsRichTextBlock],
    }),
    defineField({
      name: 'proximityStatement',
      title: 'Intro — affirmation de proximité',
      type: 'array',
      of: [surroundingsRichTextBlock],
    }),
    defineField({
      name: 'proximityIntro',
      title: 'Intro — corps de texte',
      description: 'Paragraphes et listes décrivant les services à proximité.',
      type: 'array',
      of: [surroundingsRichTextBlock],
    }),
    defineField({
      name: 'proximityReassurance',
      title: 'Intro — réassurance',
      type: 'array',
      of: [surroundingsRichTextBlock],
    }),
    defineField({
      name: 'accordions',
      title: 'Accordéons',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required().max(120),
            }),
            defineField({
              name: 'description',
              title: 'Introduction de section',
              type: 'array',
              of: [surroundingsRichTextBlock],
            }),
            defineField({
              name: 'items',
              title: 'Entrées',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Titre',
                      type: 'string',
                      validation: (rule) => rule.required().max(100),
                    }),
                    defineField({
                      name: 'category',
                      title: 'Catégorie',
                      type: 'string',
                      validation: (rule) => rule.max(60),
                    }),
                    defineField({
                      name: 'body',
                      title: 'Texte',
                      type: 'array',
                      of: [surroundingsRichTextBlock],
                      validation: (rule) => rule.required().min(1),
                    }),
                    defineField({
                      name: 'url',
                      title: 'Lien externe',
                      type: 'url',
                      validation: (rule) =>
                        rule.uri({
                          allowRelative: false,
                          scheme: ['http', 'https'],
                        }),
                    }),
                    defineField({
                      name: 'note',
                      title: 'Note',
                      type: 'array',
                      of: [surroundingsRichTextBlock],
                    }),
                    defineField({
                      name: 'reservationRequired',
                      title: 'Réservation',
                      type: 'string',
                      options: {
                        list: reservationOptions,
                        layout: 'radio',
                      },
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'title',
                      subtitle: 'category',
                    },
                    prepare({title, subtitle}) {
                      return {
                        title: title || 'Entrée',
                        subtitle: subtitle || 'Accordéon',
                      }
                    },
                  },
                }),
              ],
              validation: (rule) => rule.required().min(1),
            }),
          ],
          preview: {
            select: {
              title: 'title',
            },
            prepare({title}) {
              return {
                title: title || 'Accordéon',
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.required().length(3),
    }),
  ],
  preview: {
    select: {
      title: 'heroEyebrow',
      subtitle: 'heroTitle',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'Page Environs',
        subtitle: subtitle || 'Contenu de la page environs',
      }
    },
  },
})
