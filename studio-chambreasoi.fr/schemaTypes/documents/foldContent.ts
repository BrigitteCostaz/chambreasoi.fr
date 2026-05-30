import { defineArrayMember, defineField, defineType } from 'sanity'
import { ComposeIcon, ImageIcon } from '@sanity/icons'

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

/*
 * foldContent — document type
 *
 * Single-instance document that drives all editable text in the fold
 * (hero section) of the web app. Colors remain hardcoded in Fold.astro.
 *
 * Default / initial document values (for Sanity Studio seed):
 *
 *   _id:             "foldContent"
 *   seoTitle:        "Une chambre d'hôtes à Challes-les-Eaux en Savoie"
 *   mosaicTile1Text: "Une chambre d'hôtes"
 *   mosaicTile2Line1: "à Challes-les-Eaux"
 *   mosaicTile2Line2: "en Savoie"
 *   amenitiesLabel:  "avec"
 *   amenities:       ["un lit double", "une salle de bain privative"]
 *   bookingNote:     "réservations par téléphone uniquement"
 */

export const foldContent = defineType({
  name: 'foldContent',
  title: 'Fold — Contenu',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    // -------------------------------------------------------------------------
    // SEO
    // -------------------------------------------------------------------------
    defineField({
      name: 'seoTitle',
      title: 'Titre SEO (H1 masqué)',
      type: 'string',
      description:
        'Contenu du <h1 class="sr-only"> — visible uniquement par les moteurs de recherche.',
      validation: (rule) => rule.required().max(120),
    }),

    // -------------------------------------------------------------------------
    // Mosaic tile 1 — top-left cell
    // -------------------------------------------------------------------------
    defineField({
      name: 'mosaicTile1Text',
      title: 'Tuile 1 — Texte principal',
      type: 'string',
      description: 'Ex : "Une chambre d\'hôtes"',
      validation: (rule) => rule.required().max(80),
    }),

    // -------------------------------------------------------------------------
    // Mosaic tile 2 — top-right cell (two lines)
    // -------------------------------------------------------------------------
    defineField({
      name: 'mosaicTile2Line1',
      title: 'Tuile 2 — Ligne 1',
      type: 'string',
      description: 'Ex : "à Challes-les-Eaux"',
      validation: (rule) => rule.required().max(80),
    }),

    defineField({
      name: 'mosaicTile2Line2',
      title: 'Tuile 2 — Ligne 2 (atténuée)',
      type: 'string',
      description: 'Ex : "(Savoie)"',
      validation: (rule) => rule.required().max(80),
    }),

    // -------------------------------------------------------------------------
    // Accommodations cell — bottom-left cell
    // -------------------------------------------------------------------------
    defineField({
      name: 'amenitiesLabel',
      title: 'Équipements — Préfixe',
      type: 'string',
      description: 'Élément introductif de la liste. Ex : "avec"',
      validation: (rule) => rule.required().max(40),
    }),

    defineField({
      name: 'amenities',
      title: 'Équipements — Liste',
      type: 'array',
      description: 'Chaque élément est affiché en atténué sous le préfixe.',
      of: [
        defineArrayMember({
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),

    // -------------------------------------------------------------------------
    // Booking note — bottom-right cell
    // -------------------------------------------------------------------------
    defineField({
      name: 'bookingNote',
      title: 'Note de réservation',
      type: 'string',
      description:
        'Texte en majuscules atténué affiché sous le tarif. Ex : "réservations par téléphone uniquement"',
      validation: (rule) => rule.required().max(120),
    }),

    // -------------------------------------------------------------------------
    // Editorial images (home page)
    // -------------------------------------------------------------------------
    defineField({
      name: 'coverImage',
      title: 'Image du fold (accueil)',
      type: 'object',
      icon: ImageIcon,
      fields: imageWithAlt,
    }),
    defineField({
      name: 'priceCoverImage',
      title: 'Image de la section tarifs (accueil)',
      type: 'object',
      icon: ImageIcon,
      fields: imageWithAlt,
    }),
  ],

  preview: {
    select: {
      title: 'seoTitle',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Fold — Contenu',
        subtitle: 'Section hero principale',
      }
    },
  },
})
