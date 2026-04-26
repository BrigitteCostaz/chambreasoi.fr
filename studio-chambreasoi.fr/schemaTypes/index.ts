import { foldContent } from './documents/foldContent'
import { headlineContent } from './documents/headlineContent'
import { locationSectionContent } from './documents/locationSectionContent'
import { accommodationSettings } from './singletons/accommodationSettings'
import { organizationSettings } from './singletons/organizationSettings'
import { pricingSettings } from './singletons/pricingSettings'

export const schemaTypes = [
  foldContent,
  headlineContent,
  locationSectionContent,
  organizationSettings,
  pricingSettings,
  accommodationSettings,
]
