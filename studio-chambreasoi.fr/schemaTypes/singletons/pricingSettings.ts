import {CreditCardIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const integerValidation = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value)
    ? true
    : 'Doit être un nombre entier (centimes).'

export const pricingSettings = defineType({
  name: 'pricingSettings',
  title: 'Tarifs',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'baseNightly1Person',
      title: 'Tarif 1 personne (base)',
      type: 'number',
      description: "Prix en centimes d'euro (ex : 8000 = 80,00 €)",
      validation: (rule) => rule.required().min(0).custom(integerValidation),
    }),
    defineField({
      name: 'baseNightly2Person',
      title: 'Tarif 2 personnes (base)',
      type: 'number',
      description: "Prix en centimes d'euro (ex : 12000 = 120,00 €)",
      validation: (rule) => rule.required().min(0).custom(integerValidation),
    }),
    defineField({
      name: 'breakfastSurchargeCents',
      title: 'Supplément petit-déjeuner',
      type: 'number',
      description: "Prix en centimes d'euro par personne (ex : 500 = 5,00 €)",
      validation: (rule) => rule.required().min(0).custom(integerValidation),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Tarifs',
        subtitle: 'Paramètres de tarification',
      }
    },
  },
})
