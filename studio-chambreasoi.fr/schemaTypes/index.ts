import { foldContent } from './documents/foldContent'
import { headlineContent } from './documents/headlineContent'
import { accommodationSettings } from './singletons/accommodationSettings'
import { organizationSettings } from './singletons/organizationSettings'
import { pricingSettings } from './singletons/pricingSettings'

export const schemaTypes = [
  foldContent,
  headlineContent,
  organizationSettings,
  pricingSettings,
  accommodationSettings,
]
