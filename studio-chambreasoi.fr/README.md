# studio-chambreasoi.fr

Sanity Studio workspace for Chambreasoi editorial content.

**Production URL:** https://studio.chambreasoi.fr (Cloudflare Pages)

The public site (`web-chambreasoi.fr`) does not embed Studio at `/studio` — editors use this subdomain only.

## Local development

From repo root:

```bash
pnpm --filter studio-chambreasoi-fr dev
```

Studio runs at http://localhost:3333

## Build and deploy (Cloudflare Pages)

Custom domains (`studio.chambreasoi.fr`) follow **production deployments only** (`--branch=main`).
Preview URLs (e.g. `develop.chambreasoi-studio.pages.dev`) are separate branch aliases.

| Command | Target |
| --- | --- |
| `pnpm deploy:studio` | Production → `chambreasoi-studio.pages.dev` + custom domain |
| `pnpm --filter studio-chambreasoi-fr deploy:preview` | Preview → `develop.chambreasoi-studio.pages.dev` |

```bash
pnpm --filter studio-chambreasoi-fr build
pnpm --filter studio-chambreasoi-fr deploy
```

Or from repo root:

```bash
pnpm deploy:studio
```

Preview deploy (from any git branch):

```bash
pnpm --filter studio-chambreasoi-fr deploy:preview
```

Legacy Sanity-hosted deploy (optional):

```bash
pnpm --filter studio-chambreasoi-fr deploy:sanity-hosted
```

## Cloudflare Pages setup (one-time)

1. Run `pnpm deploy:studio` once to create the `chambreasoi-studio` Pages project (requires `wrangler login`).
2. In Cloudflare dashboard → Pages → `chambreasoi-studio` → Custom domains → add `studio.chambreasoi.fr`.
3. Confirm DNS (automatic if `chambreasoi.fr` zone is on Cloudflare).

### Build environment variables (Cloudflare Pages)

Set in the Pages project settings:

- `SANITY_STUDIO_PROJECT_ID=vq8mnl17`
- `SANITY_STUDIO_DATASET=production`

## Sanity CORS (one-time, manage.sanity.io)

Project `vq8mnl17` → **API → CORS origins**:

| Origin | Credentials |
| --- | --- |
| `https://studio.chambreasoi.fr` | Yes |
| `https://chambreasoi.fr` | Yes |
| `http://localhost:3333` | Yes |
| `http://localhost:4321` | Yes |

Remove `https://chambreasoi.fr/studio` if present (embedded route no longer used).

## Verification

```bash
pnpm --filter studio-chambreasoi-fr typecheck
pnpm --filter studio-chambreasoi-fr build
# dist/index.html, dist/robots.txt, dist/_redirects (copied to root after build)
curl -I https://chambreasoi-studio.pages.dev/        # production
curl -I https://studio.chambreasoi.fr/               # custom domain (prod)
curl -s https://studio.chambreasoi.fr/robots.txt       # Disallow: /
```

## Environment variables

Required locally (see `.env.example`):

- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`

The CLI fails fast if these are missing (`sanity.cli.ts`).

## Content governance

- Singleton enforcement is configured in `schemaTypes/lib/singletons.ts`.
- Desk structure routes singleton documents via fixed IDs in `schemaTypes/structure.ts`.
- Vision tool is enabled only outside production in `sanity.config.ts`.
