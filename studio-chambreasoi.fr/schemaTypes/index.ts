import {availability} from './documents/availability'
import {foldContent} from './documents/foldContent'
import {headlineContent} from './documents/headlineContent'
import {locationSectionContent} from './documents/locationSectionContent'
import {practicalInfoContent} from './documents/practicalInfoContent'
import {accommodationSettings} from './singletons/accommodationSettings'
import {organizationSettings} from './singletons/organizationSettings'
import {pricingSettings} from './singletons/pricingSettings'

export const schemaTypes = [
  availability,
  foldContent,
  headlineContent,
  locationSectionContent,
  practicalInfoContent,
  organizationSettings,
  pricingSettings,
  accommodationSettings,
]
