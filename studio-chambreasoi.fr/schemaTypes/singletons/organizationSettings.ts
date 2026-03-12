import {HomeIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

const postalCodeRegex = /^\d{5}$/
const countryIsoRegex = /^[A-Z]{2}$/
const telLinkRegex = /^tel:/

export const organizationSettings = defineType({
  name: 'organizationSettings',
  title: 'Établissement',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {
      name: 'contact',
      title: 'Contact',
      default: true,
    },
    {
      name: 'adresse',
      title: 'Adresse',
    },
    {
      name: 'legal',
      title: 'Informations légales',
    },
    {
      name: 'google',
      title: 'Google Business',
    },
  ],
  fields: [
    defineField({
      name: 'contactEmail',
      title: 'Email de contact',
      type: 'string',
      group: 'contact',
      description: 'Adresse email affichée sur le site et utilisée dans les mentions de contact.',
      validation: (rule) =>
        rule.required().email().error('Une adresse email valide est requise.'),
    }),
    defineField({
      name: 'contactPhoneDisplay',
      title: 'Téléphone affiché',
      type: 'string',
      group: 'contact',
      description: 'Format conseillé : + 33 X XX XX XX XX',
      validation: (rule) => rule.required().error('Le numéro affiché est requis.'),
    }),
    defineField({
      name: 'contactPhoneLink',
      title: 'Lien téléphone',
      type: 'string',
      group: 'contact',
      description: 'Doit commencer par tel: (ex. tel:+33631988538)',
      validation: (rule) =>
        rule.required().regex(telLinkRegex, {name: 'tel link'}).error('Le lien doit commencer par tel:'),
    }),

    defineField({
      name: 'addressStreet',
      title: 'Rue / adresse',
      type: 'string',
      group: 'adresse',
      description: 'Adresse postale affichée dans les mentions légales et les données structurées.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'addressCity',
      title: 'Ville',
      type: 'string',
      group: 'adresse',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'addressPostalCode',
      title: 'Code postal',
      type: 'string',
      group: 'adresse',
      validation: (rule) =>
        rule.required().regex(postalCodeRegex, {name: 'postal code'}).error('Le code postal doit contenir 5 chiffres.'),
    }),
    defineField({
      name: 'addressDepartment',
      title: 'Département',
      type: 'string',
      group: 'adresse',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'addressDepartmentCode',
      title: 'Code département',
      type: 'string',
      group: 'adresse',
      description: 'Exemple : 73',
      validation: (rule) => rule.required().max(3),
    }),
    defineField({
      name: 'addressRegion',
      title: 'Région',
      type: 'string',
      group: 'adresse',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'addressCountry',
      title: 'Pays',
      type: 'string',
      group: 'adresse',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'addressCountryIso',
      title: 'Code ISO pays',
      type: 'string',
      group: 'adresse',
      description: 'Exemple : FR',
      validation: (rule) =>
        rule.required().regex(countryIsoRegex, {name: 'country ISO'}).error('Le code ISO doit contenir 2 lettres majuscules.'),
    }),

    defineField({
      name: 'legalName',
      title: 'Nom exploitant',
      type: 'string',
      group: 'legal',
      description: 'Nom de la personne physique ou du responsable légal.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalBrandName',
      title: 'Nom commercial',
      type: 'string',
      group: 'legal',
      description: 'Nom affiché sur le site, dans le SEO et dans les données structurées.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalEntityName',
      title: 'Raison sociale',
      type: 'string',
      group: 'legal',
      description: 'Nom juridique complet de l’activité.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalForm',
      title: 'Forme juridique',
      type: 'string',
      group: 'legal',
      description: 'Exemple : Entrepreneur individuel',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalSiret',
      title: 'SIRET',
      type: 'string',
      group: 'legal',
      description: 'Identifiant officiel de l’établissement (14 chiffres).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalSiren',
      title: 'SIREN',
      type: 'string',
      group: 'legal',
      description: 'Identifiant officiel de l’entreprise (9 chiffres).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalVatNumber',
      title: 'Numéro de TVA',
      type: 'string',
      group: 'legal',
      description: 'Laisser vide si non applicable.',
    }),
    defineField({
      name: 'legalActivityCode',
      title: 'Code activité',
      type: 'string',
      group: 'legal',
      description: 'Code NAF / APE.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'legalActivityLabel',
      title: 'Libellé activité',
      type: 'string',
      group: 'legal',
      description: 'Libellé officiel associé au code activité.',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'googleCid',
      title: 'Google CID',
      type: 'string',
      group: 'google',
      description: 'Identifiant interne Google Business Profile, si connu.',
    }),
    defineField({
      name: 'googleLatitude',
      title: 'Latitude',
      type: 'number',
      group: 'google',
      description: 'Coordonnée GPS utilisée pour les données structurées.',
      validation: (rule) => rule.required().min(-90).max(90),
    }),
    defineField({
      name: 'googleLongitude',
      title: 'Longitude',
      type: 'number',
      group: 'google',
      description: 'Coordonnée GPS utilisée pour les données structurées.',
      validation: (rule) => rule.required().min(-180).max(180),
    }),
    defineField({
      name: 'googleReviewUrl',
      title: 'Lien avis Google',
      type: 'url',
      group: 'google',
      description: 'Lien direct vers la page d’avis Google.',
    }),
    defineField({
      name: 'googleSameAs',
      title: 'Liens sameAs',
      type: 'array',
      group: 'google',
      description: 'Liens publics associés à l’établissement (Google Maps, profils officiels, etc.).',
      of: [{type: 'url'}],
    }),
    defineField({
      name: 'googlePriceRange',
      title: 'Gamme de prix',
      type: 'string',
      group: 'google',
      description: 'Exemple : €, €€, etc.',
    }),
  ],
  preview: {
    select: {
      title: 'legalBrandName',
    },
    prepare({title}) {
      return {
        title: title ?? 'Établissement',
        subtitle: 'Paramètres établissement',
      }
    },
  },
})
