import { CalendarIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { AvailabilityMonthInput } from '../components/availabilityMonthInput'

type AvailabilityDate = {
  date?: string
  available?: boolean
}

function getMonthStart(date?: string) {
  return date ? `${date.slice(0, 7)}-01` : undefined
}

export const availability = defineType({
  name: 'availability',
  title: 'Disponibilités',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'month',
      title: 'Mois',
      type: 'date',
      description: 'Sélectionner n\'importe quel jour du mois à gérer pour faire apparaître l\'interface de gestion.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dates',
      title: 'Dates',
      type: 'array',
      components: {
        input: AvailabilityMonthInput as never,
      },
      of: [
        defineArrayMember({
          name: 'availabilityDate',
          title: 'Date',
          type: 'object',
          fields: [
            defineField({
              name: 'date',
              title: 'Date',
              type: 'date',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'available',
              title: 'Disponible',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              date: 'date',
              available: 'available',
            },
            prepare({date, available}) {
              return {
                title: date,
                subtitle:
                  available === undefined
                    ? 'Non disponible'
                    : available
                      ? '✅ Disponible'
                      : '🔴 Complet',
              }
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((dates, context) => {
          const monthStart = getMonthStart(context.document?.month as string | undefined)

          if (!monthStart || !Array.isArray(dates)) return true

          const seenDates = new Set<string>()

          for (const item of dates as AvailabilityDate[]) {
            if (!item.date) return 'Chaque entrée doit avoir une date.'
            if (seenDates.has(item.date)) return `La date ${item.date} est présente plusieurs fois.`
            if (getMonthStart(item.date) !== monthStart) {
              return `La date ${item.date} ne correspond pas au mois sélectionné.`
            }

            seenDates.add(item.date)
          }

          return true
        }),
    }),
  ],
  preview: {
    select: {
      month: 'month',
    },
    prepare({month}) {
      return {
        title: month ? `Disponibilités — ${month.slice(0, 7)}` : 'Disponibilités',
      }
    },
  },
  validation: (rule) =>
    rule.custom(async (document, context) => {
      const month = document?.month as string | undefined

      if (!month) return true

      const documentId = document?._id?.replace(/^drafts\./, '')
      const excludedIds = documentId ? [documentId, `drafts.${documentId}`] : []
      const client = context.getClient({apiVersion: '2024-01-01'})
      const duplicateCount = await client.fetch<number>(
        `count(*[_type == "availability" && month == $month && !(_id in $excludedIds)])`,
        {month, excludedIds},
      )

      return duplicateCount === 0 || 'Un document de disponibilités existe déjà pour ce mois.'
    }),
})
