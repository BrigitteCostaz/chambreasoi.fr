/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

// ---------------------------------------------------------------------------
// Cloudflare Worker environment bindings
// ---------------------------------------------------------------------------

interface CfEnvBindings {
  readonly SANITY_PROJECT_ID: string;
  readonly SANITY_DATASET: string;
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly SANITY_WEBHOOK_SECRET: string;
  readonly CF_ZONE_ID: string;
  readonly CF_API_TOKEN: string;
  readonly ASSETS: Fetcher;
}

// Astro v6: read bindings via `import { env } from "cloudflare:workers"` (see runtime-env.ts).
declare module "cloudflare:workers" {
  interface Env extends CfEnvBindings {}
}

// ---------------------------------------------------------------------------
// Vite / Astro build-time env (import.meta.env)
// ---------------------------------------------------------------------------

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_PROJECT_ID: string;
  readonly PUBLIC_SANITY_DATASET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
