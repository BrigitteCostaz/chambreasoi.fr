# web-chambreasoi.fr

Astro frontend for the Chambreasoi website, deployed to Cloudflare Workers.

## Local development
From repo root:
```bash
pnpm --filter web-chambreasoi-fr dev
```

## Build and deploy
```bash
pnpm --filter web-chambreasoi-fr build
pnpm --filter web-chambreasoi-fr deploy
```

## Verification
```bash
pnpm --filter web-chambreasoi-fr test
pnpm --filter web-chambreasoi-fr typecheck
pnpm --filter web-chambreasoi-fr lint
```

## Security-sensitive areas
- Webhook revalidation endpoint: `src/pages/api/revalidate.ts`
- Runtime env and workers bindings: `src/utils/runtime-env.ts`, `src/pages/api/revalidate.ts`
- Fallback observability counters: `src/lib/observability/fallbackMetrics.ts`
- Fallback health endpoint: `src/pages/api/health/fallbacks.ts`

## SEO / discovery

- **`/robots.txt`** — dynamic (`config/robots.ts`)
- **`/sitemap-index.xml`** — `@astrojs/sitemap`
- **`/llms.txt`** — LLM-friendly site index (`config/llms.ts`, prerendered)
- **`/404` metadata** — `config/pages.ts` declares `notFound` with `noindex`
- **`public/_headers`** — Cloudflare cache and discovery headers for assets, SSR pages, and `llms.txt`
- **IndexNow** — targeted URL notification after Sanity publish (see below)

Public CMS pages stay SSR so Sanity updates can be purged and warmed without a rebuild.
Legal pages are prerendered; `/tarifs-et-reservation` stays SSR because availability changes frequently.

## Sanity webhook (revalidate + IndexNow)

Configure in [manage.sanity.io](https://manage.sanity.io) → Project → API → Webhooks.

**URL:** `https://chambreasoi.fr/api/revalidate` (POST, signed)

**Projection** (GROQ, not JSON templates):

```groq
{
  _type,
  _id
}
```

**Filter:**

```
_type in ["foldContent","headlineContent","locationSectionContent","organizationSettings","pricingSettings","accommodationSettings","availability","locationPageContent","practicalInfoContent","roomPageContent","surroundingsPageContent"]
&& !(_id in path("drafts.**"))
```

On publish, the webhook:

1. Maps `_type` → public path(s) (`config/cms-route-map.ts`)
2. Purges only those paths at Cloudflare
3. Invalidates in-memory CMS cache
4. Warms URLs (no-cache fetch with retry)
5. Submits affected URLs to IndexNow (if `INDEXNOW_KEY` is set)

### IndexNow setup (one-time)

1. `openssl rand -hex 16` → set `INDEXNOW_KEY` as Cloudflare Worker **secret**
2. Deploy → verify `curl https://chambreasoi.fr/{KEY}.txt` returns the key
3. Register the key in [Bing Webmaster Tools](https://www.bing.com/webmasters/) → IndexNow

## Aliases and config
- Runtime alias source: `config/aliases.mjs` (consumed by `astro.config.mjs`)
- Keep TS alias config in sync with `tsconfig.json`.
