import {ComposeIcon, ImageIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const accentOptions = [
  {title: 'Pierre', value: 'stone'},
  {title: 'Forêt', value: 'forest'},
  {title: 'Bistre', value: 'bistre'},
]

const richTextBlock = defineArrayMember({
  type: 'block',
  styles: [{title: 'Normal', value: 'normal'}],
  lists: [],
  marks: {
    decorators: [{title: 'Gras', value: 'strong'}],
    annotations: [],
  },
})

const imageWithAlt = [
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
]

export const practicalInfoContent = defineType({
  name: 'practicalInfoContent',
  title: 'Infos pratique',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Libellé de section',
      type: 'string',
      initialValue: 'Infos pratiques',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'tariffsHeading',
      title: 'Titre des tarifs',
      type: 'string',
      initialValue: 'Tarifs pour une nuitée',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'kitchenImage',
      title: 'Image des tarifs',
      type: 'object',
      icon: ImageIcon,
      fields: imageWithAlt,
    }),
    defineField({
      name: 'bookingHeading',
      title: 'Titre des modalités',
      type: 'string',
      initialValue: 'Modalités de réservation',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'bookingEyebrow',
      title: 'Libellé de section modalités',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'bookingImage',
      title: 'Image des modalités',
      type: 'object',
      icon: ImageIcon,
      fields: imageWithAlt,
    }),
    defineField({
      name: 'bookingCards',
      title: 'Cartes des modalités',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.required().max(60),
            }),
            defineField({
              name: 'body',
              title: 'Texte',
              type: 'array',
              of: [richTextBlock],
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: 'secondaryText',
              title: 'Texte secondaire',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.max(220),
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
          preview: {
            select: {
              title: 'title',
              accent: 'accent',
            },
            prepare({title, accent}) {
              return {
                title: title || 'Carte',
                subtitle: accent ? `Accent ${accent}` : 'Infos pratiques',
              }
            },
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'servicesEyebrow',
      title: 'Libellé de section services',
      type: 'string',
      initialValue: 'Services',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'servicesHeading',
      title: 'Titre des services',
      type: 'string',
      initialValue: 'Accompagnements',
      validation: (rule) => rule.required().max(90),
    }),
    defineField({
      name: 'serviceCards',
      title: 'Cartes services',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'category',
              title: 'Catégorie',
              type: 'string',
              validation: (rule) => rule.max(40),
            }),
            defineField({
              name: 'title',
              title: 'Titre',
              type: 'string',
              validation: (rule) => rule.max(70),
            }),
            defineField({
              name: 'body',
              title: 'Texte',
              type: 'array',
              of: [richTextBlock],
              validation: (rule) => rule.required().min(1),
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
          preview: {
            select: {
              title: 'title',
              category: 'category',
            },
            prepare({title, category}) {
              return {
                title: title || category || 'Carte service',
                subtitle: title && category ? category : 'Service',
              }
            },
          },
        }),
      ],
      description: 'Ajoutez jusqu’à 5 cartes services maximum.',
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: 'serviceImages',
      title: 'Images des services',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          icon: ImageIcon,
          fields: imageWithAlt,
          preview: {
            select: {
              title: 'alt',
              media: 'asset',
            },
          },
        }),
      ],
      
    }),
  ],
  preview: {
    select: {
      title: 'eyebrow',
    },
    prepare({title}) {
      return {
        title: title || 'Infos pratique',
        subtitle: 'Contenu de la section tarifs, modalités et services',
      }
    },
  },
})
