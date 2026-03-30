import { defineArrayMember, defineField, defineType } from 'sanity'
import { ComposeIcon } from '@sanity/icons'

/*
 * headlineContent — document type
 *
 * Single-instance document that drives all editable text in the healine section) of the web app. Colors remain hardcoded in Fold.astro.
 *
 * Default / initial document values (for Sanity Studio seed):
 *
 *   _id:             "foldContent"
 *   headline:        "Dans une maison individuelle de plain-pied, au calme et dans un environnement de verdure. Vous serez  attendu.e.s et accueilli.e.s  par au moins une personne qui aura à coeur de rendre votre séjour chez nous agréable."
 */

export const headlineContent = defineType({
  name: 'headlineContent',
  title: 'Headline - Contenu',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    // -------------------------------------------------------------------------
    // HEADLINE
    // -------------------------------------------------------------------------
    defineField({
      name: 'headLineText',
      title: 'Sous-titre pricipale de la page d\'accueil',
      type: 'string',
      description: 'Ex : "Dans une maison individuelle de plain-pied, au calme et..."',
      validation: (rule) => rule.required().max(300),
    })
  ],

  preview: {
    select: {
      title: 'headline',
    },
    prepare({ title }) {
      return {
        title: title ?? 'Headline - Contenu',
        subtitle: 'Section headline principale',
      }
    },
  },
})
