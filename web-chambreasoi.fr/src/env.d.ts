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
  readonly ASSETS: Fetcher;
}

// ---------------------------------------------------------------------------
// Astro × Cloudflare runtime typing
//
// The @astrojs/cloudflare adapter populates `Astro.locals.runtime` with the
// Worker's `env`, `cf`, and `ctx` objects.  Extending `App.Locals` with
// `Runtime<Env>` gives type-safe access in pages, API routes, and middleware:
//
//   const { env } = Astro.locals.runtime;
//   env.SANITY_PROJECT_ID; // ← typed as string
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
