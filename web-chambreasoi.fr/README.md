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

## Aliases and config
- Runtime alias source: `config/aliases.mjs` (consumed by `astro.config.mjs`)
- Keep TS alias config in sync with `tsconfig.json`.
