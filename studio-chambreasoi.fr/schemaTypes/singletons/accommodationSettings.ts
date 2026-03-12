import {PinIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const timeRegex = /^\d{2}:\d{2}$/

export const accommodationSettings = defineType({
  name: 'accommodationSettings',
  title: 'Hébergement',
  type: 'document',
  icon: PinIcon,
  fields: [
    defineField({
      name: 'checkinTime',
      title: "Heure d'arrivée",
      type: 'string',
      description: 'Format HH:MM (ex : 17:00)',
      validation: (rule) =>
        rule.required().regex(timeRegex, {name: 'time'}).error('Le format attendu est HH:MM.'),
    }),
    defineField({
      name: 'checkoutTime',
      title: 'Heure de départ',
      type: 'string',
      description: 'Format HH:MM (ex : 10:00)',
      validation: (rule) =>
        rule.required().regex(timeRegex, {name: 'time'}).error('Le format attendu est HH:MM.'),
    }),
    defineField({
      name: 'amenities',
      title: 'Équipements',
      type: 'array',
      of: [{type: 'string'}],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Hébergement',
        subtitle: 'Horaires et équipements',
      }
    },
  },
})
