import {ComposeIcon, ImageIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const accentOptions = [
  {title: 'Pierre', value: 'stone'},
  {title: 'Forêt', value: 'forest'},
  {title: 'Bistre', value: 'bistre'},
]

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

const contentCard = defineArrayMember({
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'body',
      title: 'Texte',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(360),
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
        subtitle: accent ? `Accent ${accent}` : 'La chambre',
      }
    },
  },
})

const imageObject = defineArrayMember({
  type: 'object',
  icon: ImageIcon,
  fields: imageWithAlt,
  preview: {
    select: {
      title: 'alt',
      media: 'asset',
    },
  },
})

const contentSectionFields = [
  defineField({
    name: 'eyebrow',
    title: 'Libellé de section',
    type: 'string',
    validation: (rule) => rule.required().max(80),
  }),
  defineField({
    name: 'heading',
    title: 'Titre',
    type: 'string',
    validation: (rule) => rule.required().max(120),
  }),
  defineField({
    name: 'introText',
    title: 'Texte d’introduction',
    type: 'text',
    rows: 4,
    validation: (rule) => rule.max(420),
  }),
  defineField({
    name: 'featureImage',
    title: 'Image principale',
    type: 'object',
    icon: ImageIcon,
    fields: imageWithAlt,
  }),
  defineField({
    name: 'cards',
    title: 'Cartes',
    type: 'array',
    of: [contentCard],
    validation: (rule) => rule.required().min(1).max(3),
  }),
  defineField({
    name: 'galleryImages',
    title: 'Images de galerie',
    type: 'array',
    of: [imageObject],
    validation: (rule) => rule.required().min(1).max(3),
  }),
]

export const roomPageContent = defineType({
  name: 'roomPageContent',
  title: 'La chambre',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'Libellé du héros',
      type: 'string',
      initialValue: 'La chambre',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'heroTitle',
      title: 'Titre du héros',
      type: 'string',
      initialValue: 'Chambre confortable avec terrasse et accès aux espaces communs',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'privateSection',
      title: 'Espace privatif',
      type: 'object',
      fields: contentSectionFields,
    }),
    defineField({
      name: 'sharedSection',
      title: 'Espace commun',
      type: 'object',
      fields: contentSectionFields,
    }),
    defineField({
      name: 'serviceSection',
      title: 'Confort au quotidien',
      type: 'object',
      fields: contentSectionFields,
    }),
  ],
  preview: {
    select: {
      title: 'heroEyebrow',
      subtitle: 'heroTitle',
    },
    prepare({title, subtitle}) {
      return {
        title: title || 'La chambre',
        subtitle: subtitle || 'Contenu de la page chambre',
      }
    },
  },
})
