import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {singletonDocumentActions, singletonNewDocumentFilter} from './schemaTypes/lib/singletons'
import {structure} from './schemaTypes/structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!
const dataset = process.env.SANITY_STUDIO_DATASET!

export default defineConfig({
  name: 'default',
  title: 'chambreasoi.fr',

  projectId,
  dataset,

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: singletonDocumentActions,
    newDocumentOptions: singletonNewDocumentFilter,
  },
})
