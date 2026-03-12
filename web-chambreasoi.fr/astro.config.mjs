// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import unocss from "unocss/astro";

// Sanity config - hardcoded with env fallback for production deployments
// In dev, these are read from .env at runtime via middleware
const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || "vq8mnl17";
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  site: "https://chambreasoi.fr",
  output: "server",
  adapter: cloudflare(),

  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {},
    },
  },

  integrations: [
    unocss({
      //injectReset: true,
      configFile: "uno.config.ts",
    }),
    react(),
    sanity({
      projectId,
      dataset,
      useCdn: false,
      apiVersion: "2024-01-01",
      studioBasePath: "/studio",
    }),
    icon(),
  ],

  experimental: {
    svgo: true,
  },
  devToolbar: {
    enabled: false,
  },

  vite: {
    ssr: {
      resolve: {
        conditions: ["workerd", "worker", "browser"],
      },
    },
    resolve: {
      alias: {
        // Mirror tsconfig paths for runtime resolution (config/ lives outside src/)
        "@layouts": new URL("./src/layouts", import.meta.url).pathname,
        "@layouts/": new URL("./src/layouts/", import.meta.url).pathname,
        "@utils": new URL("./src/utils", import.meta.url).pathname,
        "@utils/": new URL("./src/utils/", import.meta.url).pathname,
        "@config": new URL("./config", import.meta.url).pathname,
        "@config/": new URL("./config/", import.meta.url).pathname,

        ...(process.env.NODE_ENV === "production"
          ? { "react-dom/server": "react-dom/server.edge" }
          : {}),
      },
    },
  },
});
