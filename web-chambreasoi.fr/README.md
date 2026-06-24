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
pnpm deploy:web
```

From repo root, use `pnpm deploy:web` (not `pnpm --filter web-chambreasoi-fr deploy` — pnpm needs `run` for script names: `pnpm --filter web-chambreasoi-fr run deploy`).

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

### Cache policy and publish freshness

- **CMS-backed SSR pages** (`/`, `/la-chambre`, `/acces-et-localisation`, `/decouvrir-les-environs`, `/tarifs-et-reservation`) get `Cache-Control: private, no-store` from Astro middleware (`src/middleware.ts`). On Cloudflare Workers, `public/_headers` applies to static assets only — not HTML from the Worker — so middleware is required for SSR freshness.
- **Legal pages** (`/legales/*`) are prerendered at build time and cached for 24h — CMS changes there require a redeploy.
- **Static assets** (`/_astro/*`, `/fonts/*`, etc.) stay long-lived immutable cache.

For immediate updates on CMS pages, publishing in Sanity is enough. The webhook below still purges any residual cache, invalidates in-memory Worker caches (org/pricing/accommodation), and warms URLs.

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

Structured logs (`[revalidate]` prefix in Worker observability) record webhook `_type`, `_id`, resolved paths, skip reason (draft / unmapped), purge result, cache epoch, and warm outcome. Check these if a publish does not appear on the site.

**Required Worker secrets:** `SANITY_WEBHOOK_SECRET`, `CF_ZONE_ID`, `CF_API_TOKEN` (see `.env.example`).

### IndexNow setup (one-time)

1. `openssl rand -hex 16` → set `INDEXNOW_KEY` as Cloudflare Worker **secret**
2. Deploy → verify `curl https://chambreasoi.fr/{KEY}.txt` returns the key
3. Register the key in [Bing Webmaster Tools](https://www.bing.com/webmasters/) → IndexNow

## Aliases and config
- Runtime alias source: `config/aliases.mjs` (consumed by `astro.config.mjs`)
- Keep TS alias config in sync with `tsconfig.json`.
