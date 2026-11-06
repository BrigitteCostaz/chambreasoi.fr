import type {
  DocumentActionComponent,
  DocumentActionsResolver,
  NewDocumentOptionsResolver,
} from 'sanity'

export const SINGLETON_TYPES = new Set([
  'organizationSettings',
  'pricingSettings',
  'accommodationSettings',
  'foldContent',
  'headlineContent',
  'locationPageContent',
  'locationSectionContent',
  'practicalInfoContent',
  'roomPageContent',
  'surroundingsPageContent',
])

export const singletonDocumentActions: DocumentActionsResolver = (prev, context) => {
  if (!SINGLETON_TYPES.has(context.schemaType)) return prev

  const allowed = new Set(['publish', 'discardChanges', 'restore'])

  return prev.filter((item) => {
    if (typeof item === 'string') return allowed.has(item)

    const action = (item as DocumentActionComponent & {action?: string}).action
    return typeof action === 'string' ? allowed.has(action) : true
  })
}

export const singletonNewDocumentFilter: NewDocumentOptionsResolver = (prev) =>
  prev.filter((item) => {
    const templateId = 'templateId' in item ? item.templateId : undefined
    return typeof templateId === 'string' ? !SINGLETON_TYPES.has(templateId) : true
  })
