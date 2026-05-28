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

interface Env extends CfEnvBindings {}

// ---------------------------------------------------------------------------
// Astro v6 × Cloudflare runtime typing
//
// Read bindings from `context.locals.runtime.env` in middleware/API routes.
// The `App.Locals` augmentation below keeps the runtime env typed for those
// entry points.
// ---------------------------------------------------------------------------

type Runtime = import("@astrojs/cloudflare").Runtime<CfEnvBindings>;

declare namespace App {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Locals extends Runtime {}
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
