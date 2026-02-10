import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "../studio-chambreasoi.fr/schemaTypes";

export default defineConfig({
  name: "default",
  title: "chambreasoi.fr",

  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID!,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET!,

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
});
