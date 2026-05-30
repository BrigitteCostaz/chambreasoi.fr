// @ts-check

import fs from "node:fs";
import path from "node:path";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sanity from "@sanity/astro";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import unocss from "unocss/astro";
import { appAliases } from "./config/aliases.mjs";

import sitemap from "@astrojs/sitemap";

/**
 * Load `web-chambreasoi.fr/.env` into process.env for config-time evaluation.
 *
 * Why:
 * - Astro config executes in Node.
 * - In some environments (CI, certain Node versions, or non-standard runners),
 *   `process.env` may not include `.env` at config evaluation time.
 *
 * Notes:
 * - We only parse simple KEY=VALUE lines (no export, no multiline, no interpolation).
 * - Existing process.env values win (platform-provided env should override local files).
 */
/** @param {string} filePath */
function loadDotEnvFileIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;

    const raw = fs.readFileSync(filePath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;

      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();

      // Strip surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // If dotenv loading fails, we still want config evaluation to proceed.
    // Missing required vars will be caught by requireProcessEnv().
  }
}

// Load local env for the web workspace (best-effort)
loadDotEnvFileIfExists(path.resolve(process.cwd(), ".env"));

/**
 * Astro config runs in Node.
 *
 * - In local dev: Astro loads `.env` into `process.env` automatically.
 * - In CI / Cloudflare Pages: env vars must be provided by the platform.
 *
 * We intentionally avoid hardcoded fallbacks for Sanity config so builds fail
 * fast when env is missing (prod parity).
 */
/** @param {string} key */
function requireProcessEnv(key) {
  const v = process.env[key];
  if (typeof v === "string" && v.trim() !== "") return v;
  throw new Error(
    `[astro.config] Missing required env var "${key}". ` +
      `Set it in web-chambreasoi.fr/.env for local dev and in Cloudflare Pages environment variables for builds.`
  );
}

const projectId =
  process.env.PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  requireProcessEnv("PUBLIC_SANITY_PROJECT_ID");

const isDev = process.env.NODE_ENV !== "production";
/**
 * Always use Sanity production dataset in local dev so frontend content mirrors
 * live editorial content.
 */
const dataset = isDev
  ? "production"
  : process.env.PUBLIC_SANITY_DATASET ||
    process.env.SANITY_DATASET ||
    process.env.SANITY_STUDIO_DATASET ||
    "production";

// Keep fetchSanity (@chambreasoi/sanity) on the same dataset as @sanity/astro in local dev.
if (isDev) {
  process.env.PUBLIC_SANITY_DATASET = dataset;
}
/**
 * Studio is ENABLED by default (opt-out, not opt-in).
 *
 * Why opt-out:
 * - wrangler.toml [vars] are RUNTIME bindings only — they are NOT present in
 *   process.env during `astro build`. An opt-in check (`=== "true"`) therefore
 *   always evaluates to false at build time, so the /studio route is never
 *   registered in the built artifact, causing a 404 in production.
 * - Defaulting to enabled means the route is always compiled in; you can still
 *   remove it from a specific build by explicitly passing the flag.
 *
 * To disable (e.g. in CI or lightweight preview builds):
 *   ENABLE_SANITY_STUDIO=false pnpm build
 */
const enableSanityStudio = process.env.ENABLE_SANITY_STUDIO !== "false";

export default defineConfig({
  site: "https://chambreasoi.fr",
  output: "server",
  adapter: isDev ? (await import("@astrojs/node")).default({ mode: "standalone" }) : cloudflare(),

  image: {
    // Cloudflare Workers does not support sharp at runtime.
    // Prefer compile-time optimization for prerendered pages.
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {},
    },
  },

  integrations: [unocss({
    // injectReset: true,
    configFile: "uno.config.ts",
  }), react(), // Sanity integration:
  // - Always configure the client (projectId/dataset), but only mount Studio routes when enabled.
  sanity({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: import.meta.env.PROD,
    studioBasePath: enableSanityStudio ? "/studio" : undefined,
  }), icon({
    iconDir: "src/icons",
  }), sitemap({
    filter: (page) => {
      const pathname = new URL(page).pathname;
      return !pathname.startsWith("/api/") && !pathname.startsWith("/studio/");
    },
  })],

  devToolbar: {
    enabled: false,
  },

  vite: {
    optimizeDeps: {
      include: [
        "astro-leaflet > leaflet",
        "leaflet-extra-markers",
        "leaflet-extra-markers > leaflet",
      ],
    },
    ssr: {
      resolve: {
        conditions: ["workerd", "worker", "browser"],
      },
    },
    resolve: {
      alias: {
        ...Object.fromEntries(
          Object.entries(appAliases).flatMap(([alias, relativePath]) => [
            [alias, new URL(relativePath, import.meta.url).pathname],
            [`${alias}/`, new URL(`${relativePath}/`, import.meta.url).pathname],
          ])
        ),

        ...(process.env.NODE_ENV === "production"
          ? { "react-dom/server": "react-dom/server.edge" }
          : {}),
      },
    },
  },
});