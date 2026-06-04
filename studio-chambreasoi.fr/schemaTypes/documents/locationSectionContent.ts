import { defineArrayMember, defineField, defineType } from 'sanity'
import { BlockElementIcon } from '@sanity/icons'

export const locationSectionContent = defineType({
  name: 'locationSectionContent',
  title: 'Accueil Localisation',
  type: 'document',
  icon: BlockElementIcon,
  fields: [
    // -------------------------------------------------------------------------
    // INTRO MAP
    // -------------------------------------------------------------------------
    defineField({
      name: 'introText',
      title: 'Texte d’introduction (carte)',
      type: 'string',
      description: 'Texte court pour situer le lieu (ex: "À 15 min de Chambéry, entre lac et montagne"). Max 80 caractères.',
      validation: (rule) => rule.required().max(80),
    }),
    // -------------------------------------------------------------------------
    // MAP LABELS
    // -------------------------------------------------------------------------
    defineField({
      name: 'mapLabel1',
      title: 'Légende 1 (haut-gauche)',
      type: 'string',
      description: 'Exemple : "Dans le Parc naturel régional du Massif des Bauges" (max 80 caractères)',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'mapLabel2',
      title: 'Légende 2 (centre)',
      type: 'string',
      description: 'Exemple : "Entre Chartreuse et lac du Bourget" (max 80 caractères)',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'mapLabel3',
      title: 'Légende 3 (bas-droite)',
      type: 'string',
      description: 'Exemple : "À proximité des stations de ski" (max 80 caractères)',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'mapCta',
      title: 'Texte du bouton "Voir la page localisation"',
      type: 'string',
      description: 'Texte court pour le bouton (ex: "Découvrir les alentours" ou "Voir la localisation"). Max 20 caractères.',
      validation: (rule) => rule.required().max(30),
    })
  ],

  preview: {
    select: {
      title: 'introText',
    },
    prepare({ title }) {
      return {
        title: title || 'Section Localisation',
        subtitle: 'Contenu de la carte',
      };
    },
  },
})
