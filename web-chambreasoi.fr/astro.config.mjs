// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sanity from "@sanity/astro";

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET;

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  vite: {
    ssr: {
      resolve: {
        conditions: ["workerd", "worker", "browser"],
      },
    },
    resolve: {
      alias:
        process.env.NODE_ENV === "production"
          ? { "react-dom/server": "react-dom/server.edge" }
          : {},
    },
  },
  integrations: [
    react(),
    sanity({
      projectId,
      dataset,
      useCdn: true,
      apiVersion: "2024-01-01",
      studioBasePath: "/studio",
    }),
  ],
});
