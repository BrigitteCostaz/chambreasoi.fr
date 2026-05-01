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
// Astro v6 removed `Astro.locals.runtime.env`.
// On Cloudflare Workers, read bindings using:
//
//   import { env } from "cloudflare:workers";
//   env.SANITY_PROJECT_ID; // ← typed as string
//
// If you want type-safety for Cloudflare bindings, prefer typing `env` from
// `cloudflare:workers` rather than relying on `Astro.locals.runtime`.
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
