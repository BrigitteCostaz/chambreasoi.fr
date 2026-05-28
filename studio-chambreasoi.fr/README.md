# studio-chambreasoi.fr

Sanity Studio workspace for Chambreasoi editorial content.

## Local development
From repo root:
```bash
pnpm --filter chambreasoifr dev
```

## Build and deploy
```bash
pnpm --filter chambreasoifr build
pnpm --filter chambreasoifr deploy
```

## Verification
```bash
pnpm --filter chambreasoifr typecheck
```

## Environment variables
Required:
- `SANITY_STUDIO_PROJECT_ID`
- `SANITY_STUDIO_DATASET`

The CLI now fails fast if these are missing (`sanity.cli.ts`).

## Content governance
- Singleton enforcement is configured in `schemaTypes/lib/singletons.ts`.
- Desk structure routes singleton documents via fixed IDs in `schemaTypes/structure.ts`.
- Vision tool is enabled only outside production in `sanity.config.ts`.
