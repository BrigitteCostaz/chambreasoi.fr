import {ComposeIcon, ImageIcon} from '@sanity/icons'
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

const DEFAULT_CC_BY_SA_LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/'
const DEFAULT_CC_BY_SA_LICENSE_LABEL = 'CC BY-SA 4.0'

const wikimediaPhotoCreditFields = [
  defineField({
    name: 'commonsFileUrl',
    title: 'URL du fichier Wikimedia Commons',
    description: 'Lien vers la page du fichier (https://commons.wikimedia.org/wiki/File:…).',
    type: 'url',
    validation: (rule) =>
      rule.uri({
        allowRelative: false,
        scheme: ['https'],
      }),
  }),
  defineField({
    name: 'title',
    title: 'Titre du fichier',
    description: 'Texte du lien vers le fichier (titre affiché entre guillemets).',
    type: 'string',
    validation: (rule) => rule.max(500),
  }),
  defineField({
    name: 'author',
    title: 'Auteur',
    type: 'string',
    validation: (rule) => rule.max(200),
  }),
  defineField({
    name: 'licenseUrl',
    title: 'URL de la licence',
    type: 'url',
    initialValue: DEFAULT_CC_BY_SA_LICENSE_URL,
    validation: (rule) =>
      rule.uri({
        allowRelative: false,
        scheme: ['https'],
      }),
  }),
  defineField({
    name: 'licenseLabel',
    title: 'Libellé de la licence',
    type: 'string',
    initialValue: DEFAULT_CC_BY_SA_LICENSE_LABEL,
    validation: (rule) => rule.max(80),
  }),
]

const galleryImageObject = defineArrayMember({
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Texte alternatif',
      type: 'string',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'photoCredit',
      title: 'Crédit photo (Wikimedia Commons)',
      type: 'object',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: wikimediaPhotoCreditFields,
      validation: (rule) =>
        rule.custom((value) => {
          if (!value || typeof value !== 'object') {
            return true
          }

          const credit = value as Record<string, string | undefined>
          const hasAnyField = wikimediaPhotoCreditFields.some(
            (field) => typeof credit[field.name] === 'string' && credit[field.name]!.trim().length > 0,
          )

          if (!hasAnyField) {
            return true
          }

          const requiredFields = ['commonsFileUrl', 'title', 'author'] as const
          const missing = requiredFields.filter(
            (name) => typeof credit[name] !== 'string' || credit[name]!.trim().length === 0,
          )

          if (missing.length > 0) {
            return 'Renseignez l’URL Commons, le titre du fichier et l’auteur pour le crédit photo.'
          }

          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'alt',
      media: 'asset',
      hasCredit: 'photoCredit.commonsFileUrl',
    },
    prepare({title, media, hasCredit}) {
      return {
        title: title || 'Image galerie',
        subtitle: hasCredit ? 'Crédit Wikimedia' : undefined,
        media,
      }
    },
  },
})

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
      name: 'galleryImages',
      title: 'Galerie photos (page)',
      description:
        'Images éditoriales affichées sous les accordéons, en grille sur toute la largeur (jusqu’à 4).',
      type: 'array',
      of: [galleryImageObject],
      validation: (rule) => rule.max(4),
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
            defineField({
              name: 'galleryImages',
              title: 'Galerie photos (accordéon)',
              description: 'Images affichées sous les entrées de cet accordéon (jusqu’à 4).',
              type: 'array',
              of: [galleryImageObject],
              validation: (rule) => rule.max(4),
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
