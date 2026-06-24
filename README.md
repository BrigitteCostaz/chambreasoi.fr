# chambreasoi.fr monorepo

Production site: [https://chambreasoi.fr](https://chambreasoi.fr)

## Workspaces
- `web-chambreasoi.fr`: Astro website (Cloudflare Workers target).
- `studio-chambreasoi.fr`: Sanity Studio for editorial content.
- `packages/sanity`: shared Sanity SDK helpers used by web and studio.

## Requirements
- Node `>=22.12.0`
- pnpm `9.x`

## Setup
```bash
pnpm install
```

## Common commands (run at repo root)
```bash
pnpm dev:web
pnpm dev:studio
pnpm build:web
pnpm build:studio
pnpm test
pnpm typecheck
pnpm ci:verify
```

## Security and quality gates
- Webhook signature validation is enforced in `web-chambreasoi.fr/src/pages/api/revalidate.ts`.
- CI runs tests + typecheck (`.github/workflows/security-ci.yml`).
- Fallback health counters are exposed via `GET /api/health/fallbacks`.

## Lockfile policy
- The workspace uses a single lockfile: `pnpm-lock.yaml` at repository root.
- Do not commit nested lockfiles in subprojects.
