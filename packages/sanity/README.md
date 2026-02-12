# @chambreasoi/sanity

Shared Sanity SDK package for the chambreasoi.fr monorepo.

Provides centralised configuration, client factory, fetch helpers, image URL builders, and GROQ query constants — consumed by both the Astro web app and the Sanity Studio.

## Installation

This is a **private workspace package**. It is not published to npm.

Both apps reference it via `workspace:*` in their `package.json`:

```json
{
  "dependencies": {
    "@chambreasoi/sanity": "workspace:*"
  }
}
```

Run `pnpm install` at the repo root to link everything.

## Environment Variables

The package reads configuration from environment variables at runtime.
Multiple prefixes are supported so the same code works in Astro, Sanity Studio, and plain Node scripts.

| Variable | Aliases | Required | Default |
|---|---|---|---|
| `SANITY_PROJECT_ID` | `PUBLIC_SANITY_PROJECT_ID`, `SANITY_STUDIO_PROJECT_ID` | **Yes** | — |
| `SANITY_DATASET` | `PUBLIC_SANITY_DATASET`, `SANITY_STUDIO_DATASET` | No | `production` |
| `SANITY_API_VERSION` | — | No | `2024-01-01` |

**No tokens or secrets are read by this package.** It is safe for client bundles.

## Exports

### Barrel import

```ts
import { fetchSanity, buildSanityImageUrl } from "@chambreasoi/sanity";
```

### Subpath imports

```ts
import { sanityConfig } from "@chambreasoi/sanity/config";
import { getSanityClient } from "@chambreasoi/sanity/client";
import { fetchSanity, devLog } from "@chambreasoi/sanity/fetch";
import { sanityImageUrl, buildSanityImageUrl, buildSanityDprSrcSet } from "@chambreasoi/sanity/image";
import { TEST_CONTENT_LIST_QUERY } from "@chambreasoi/sanity/queries";
```

## Module Reference

### `config.ts`

Resolves `projectId`, `dataset`, `apiVersion`, and `useCdn` from environment variables with safe fallbacks. Throws immediately if `projectId` is missing.

```ts
const config = sanityConfig();
// { projectId: "abc123", dataset: "production", apiVersion: "2024-01-01", useCdn: true }
```

### `client.ts`

Memoised read-only Sanity client factory. Created lazily on first call.

```ts
const client = getSanityClient();
const freshClient = getSanityClient({ useCdn: false });
```

### `fetch.ts`

Typed fetch wrapper with in-flight request deduplication.

```ts
const posts = await fetchSanity<Post[]>('*[_type == "post"]{ title, slug }');

const post = await fetchSanity<Post>(
  '*[_type == "post" && slug.current == $slug][0]',
  { slug: "hello-world" },
  { useCdn: true },
);
```

- Identical concurrent calls share a single network request
- Cache keys are size-limited (hashed for large queries)
- Defaults to `useCdn: false` for SSR/build freshness
- Returns `T | null`

### `imageUrl.ts`

Memoised Sanity image URL builder with convenience helpers.

```ts
// Chainable builder
const url = sanityImageUrl(doc.image)?.width(400).format("webp").url();

// Single optimised URL
const url = buildSanityImageUrl({ source: doc.image, width: 800, height: 600 });

// DPR-based srcset (1x, 1.5x, 2x)
const srcset = buildSanityDprSrcSet({ source: doc.image, width: 400, height: 300 });
```

### `queries.ts`

GROQ query constants. Plain strings only — no execution, no client imports.

```ts
import { TEST_CONTENT_LIST_QUERY, TEST_CONTENT_BY_SLUG_QUERY } from "@chambreasoi/sanity/queries";
```

## Architecture

```
packages/sanity/
├── package.json          # workspace package, type: module, explicit exports
├── tsconfig.json         # strict, noEmit (bundlers compile the TS source)
├── README.md
└── src/
    ├── index.ts          # barrel re-export
    ├── config.ts         # env-based config resolver
    ├── client.ts         # memoised createClient
    ├── fetch.ts          # fetchSanity + devLog
    ├── imageUrl.ts       # image URL helpers
    └── queries.ts        # GROQ constants
```

The package exports raw TypeScript source (via the `exports` field in `package.json`). Both consuming apps use Vite, which compiles the `.ts` files at build time. No separate build step is needed for this package.

## Schemas

Schemas live in `studio-chambreasoi.fr/schemaTypes/` — **not** in this package.
The web app's `sanity.config.ts` imports them via relative path (`../studio-chambreasoi.fr/schemaTypes`).
