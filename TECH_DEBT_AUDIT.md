# Tech Debt Audit — chambreasoi.fr
Generated: 2026-05-28

## Executive summary
- 31 findings total: 0 Critical, 10 High, 17 Medium, 4 Low.
- Highest debt concentration is still in `web-chambreasoi.fr`, especially page/components that mix data, mapping, UI, animation, and fallback logic in single files.
- Security posture improved vs previous run (webhook signature freshness + timing-safe compare now implemented).
- Current highest-risk issue is cache invalidation ordering in webhook revalidation: in-memory cache is invalidated before Cloudflare purge success is known.
- Config/dependency hygiene is drifting: unused deps/exports are accumulating and there are undeclared `cloudflare` imports.
- Test debt remains high on high-churn files (`Fold`, `la-chambre`, `LocationSection`) despite recent unit test additions in cache/revalidate/security helpers.
- Duplicate reveal animation code appears in multiple components with slight divergence, increasing behavioral drift risk.
- Shared query contract is centralized but has become a large god-module that mixes many domain contracts and query strings.
- Repeat-run result: several previously flagged issues are resolved, but architectural decomposition and consistency debt are still largely untouched.

## Architectural mental model
This monorepo has three active domains: `web-chambreasoi.fr` (Astro frontend and webhook endpoints), `studio-chambreasoi.fr` (Sanity Studio content ops), and `packages/sanity` (shared typed query/config/client/fetch helpers). At runtime, the web app follows a fallback-first strategy: config/content fetch failures usually degrade to TypeScript defaults, with in-memory cache resetters triggered by revalidate webhooks.

Compared to repo docs, the architecture in code is more coupled than described: major page/components directly combine content-fetching and rendering concerns, and repeated in-component behavior (reveal/parallax logic) suggests cross-cutting UI concerns are not yet extracted into reusable primitives.

## Orientation evidence (Phase 1)
- Top source files by size include `web-chambreasoi.fr/src/pages/la-chambre.astro`, `packages/sanity/src/queries.ts`, `web-chambreasoi.fr/src/components/price-section/PriceSection.astro`, `web-chambreasoi.fr/src/components/location-page/OpMap.astro`, `web-chambreasoi.fr/src/components/availabily-page/PracticalInfoSection.astro`.
- Top churn files in last 6 months include `web-chambreasoi.fr/package.json`, `web-chambreasoi.fr/astro.config.mjs`, `studio-chambreasoi.fr/package.json`, `web-chambreasoi.fr/src/lib/sanity.ts`, `web-chambreasoi.fr/src/components/fold/Fold.astro`, `packages/sanity/src/queries.ts`, `web-chambreasoi.fr/src/pages/la-chambre.astro`.
- Largest/churn intersection: `packages/sanity/src/queries.ts`, `web-chambreasoi.fr/src/components/fold/Fold.astro`, `web-chambreasoi.fr/src/components/location-section/LocationSection.astro`, `web-chambreasoi.fr/src/pages/la-chambre.astro`.
- Tooling run summary: `npm audit` fails by design here (`ENOLOCK`, no npm lockfile), `pnpm audit` reports 0 vulns, `knip` reports unused files/exports/deps and unlisted dependencies.

## Findings table
| ID | Category | File:Line | Severity | Effort | Description | Recommendation |
|----|----------|-----------|----------|--------|-------------|----------------|
| F001 | Architectural decay | web-chambreasoi.fr/src/pages/la-chambre.astro:1 | High | L | `la-chambre.astro` is a god file (~600 LOC) mixing content fetch, fallback mapping, rendering, style, and client script. | Split into page orchestration + section components + shared reveal utility. |
| F002 | Architectural decay | web-chambreasoi.fr/src/components/fold/Fold.astro:1 | High | L | `Fold.astro` couples CMS fetch, pricing/org lookup, media selection, layout composition, and styling in one component. | Extract data-prep into helper and split desktop/mobile layout blocks. |
| F003 | Architectural decay | web-chambreasoi.fr/src/components/location-section/LocationSection.astro:1 | Medium | L | Location section combines fetch, map rendering, reveal/parallax JS, and large CSS animation logic in one file. | Move parallax/reveal behavior to reusable client module/component. |
| F004 | Architectural decay | packages/sanity/src/queries.ts:1 | Medium | M | Shared query module is a growing god-module (~550 LOC) holding many unrelated domain contracts and query strings. | Split by domain (`organization`, `room`, `surroundings`, etc.) and re-export via barrel. |
| F005 | Consistency rot | web-chambreasoi.fr/src/pages/la-chambre.astro:593 | Medium | S | Reveal IntersectionObserver logic is implemented inline here. | Create one shared reveal helper and consume it across pages/components. |
| F006 | Consistency rot | web-chambreasoi.fr/src/components/availabily-page/CalendarDisplay.astro:114 | Medium | S | Same reveal logic appears again with local variation. | Reuse a single utility/composable for reveal behavior. |
| F007 | Consistency rot | web-chambreasoi.fr/src/components/location-section/LocationSection.astro:303 | Medium | S | Third reveal implementation with different threshold/delay behavior increases UI drift risk. | Consolidate and parameterize reveal thresholds. |
| F008 | Consistency rot | web-chambreasoi.fr/config/pricing.ts:137 | Medium | M | Fallback telemetry/logging pattern is duplicated across config modules (`pricing`, `organization`, `accomodation`). | Introduce shared fallback reporter with typed domain tags. |
| F009 | Consistency rot | web-chambreasoi.fr/config/organization.ts:140 | Medium | M | Duplicate fallback-reporting and cache pattern in another config module. | Reuse a common config-fetch + fallback primitive. |
| F010 | Consistency rot | web-chambreasoi.fr/config/accomodation.ts:44 | Medium | M | Same control flow duplicated again, creating multi-file maintenance burden. | Abstract fetch/merge/fallback/cache lifecycle into reusable helper. |
| F011 | Type & contract debt | web-chambreasoi.fr/src/pages/api/revalidate.ts:15 | Medium | S | Runtime bindings are narrowed with `as Partial<...>` and validated manually, leaving broad unchecked boundary. | Add explicit runtime schema validator for env bindings. |
| F012 | Type & contract debt | web-chambreasoi.fr/config/organization.ts:17 | Low | S | `tel:` fallback includes whitespace (`tel:+ 33631988538`) which can break strict dialer handling. | Normalize phone URI in fallback defaults. |
| F013 | Type & contract debt | web-chambreasoi.fr/.env.example:3 | Medium | S | `.env.example` comment says dataset is forced to `"xxxxxxxx"` which is stale/misleading. | Replace with accurate production/dev dataset behavior text. |
| F014 | Type & contract debt | web-chambreasoi.fr/src/lib/sanity.ts:49 | Medium | S | Barrel re-export + local data fetch wrappers create broad import surface; `knip` reports many exports unused. | Trim exports to actual consumers; keep wrappers close to call sites. |
| F015 | Test debt | web-chambreasoi.fr/src/pages/la-chambre.astro:1 | High | M | High-complexity page has no direct behavioral tests. | Add tests for fallback mapping and section render conditions. |
| F016 | Test debt | web-chambreasoi.fr/src/components/fold/Fold.astro:1 | High | M | Core homepage fold logic lacks tests despite high churn. | Add tests for image fallback path and CMS/default merge behavior. |
| F017 | Test debt | web-chambreasoi.fr/src/components/location-section/LocationSection.astro:1 | Medium | M | Complex parallax/reveal behavior is untested. | Add component-level behavior tests (visibility/reveal/parallax guards). |
| F018 | Test debt | studio-chambreasoi.fr/package.json:7 | Medium | S | Studio has no `test` script, so schema regressions rely only on typecheck/manual QA. | Add schema-focused tests or validation smoke checks in CI. |
| F019 | Test debt | package.json:30 | Medium | S | Root `test` script runs workspace tests but no coverage thresholds or critical-path gates. | Add coverage/reporting thresholds for core domains. |
| F020 | Dependency & config debt | web-chambreasoi.fr/src/pages/api/revalidate.ts:1 | High | S | `knip` flags unlisted dependency use of `cloudflare` in runtime imports. | Declare correct dependency or adjust import strategy to platform type package. |
| F021 | Dependency & config debt | web-chambreasoi.fr/src/utils/cf-env.ts:15 | High | S | Second unlisted `cloudflare` usage indicates contract drift in dependency graph. | Align runtime env typing with declared deps and platform conventions. |
| F022 | Dependency & config debt | web-chambreasoi.fr/package.json:47 | Low | S | `@astrojs/check` is declared but unused (`knip`). | Remove or wire into scripts/CI. |
| F023 | Dependency & config debt | web-chambreasoi.fr/package.json:53 | Low | S | `@unocss/preset-web-fonts` is declared but unused (`knip`). | Remove unused dependency to reduce update surface. |
| F024 | Dependency & config debt | studio-chambreasoi.fr/package.json:30 | Low | S | `prettier` is marked unused (`knip`) in Studio package. | Remove or standardize formatter usage/scripts. |
| F025 | Dependency & config debt | package.json:23 | Medium | S | No repo script for `pnpm audit`; security audit is ad-hoc/manual. | Add `audit` script using `pnpm audit --json` for CI visibility. |
| F026 | Performance & resource hygiene | web-chambreasoi.fr/src/utils/imageUtils.ts:14 | Medium | M | `import.meta.glob(..., eager: true)` eagerly loads entire image catalog at module init. | Replace with lazy lookup/loading or precomputed manifest. |
| F027 | Performance & resource hygiene | web-chambreasoi.fr/src/components/availabily-page/CalendarDisplay.astro:32 | Medium | M | Availability path expands full month-day matrices every render request from all returned months. | Pre-trim date range and memoize server-side transformation. |
| F028 | Performance & resource hygiene | web-chambreasoi.fr/src/components/location-section/LocationSection.astro:299 | Medium | S | Scroll listener is attached per parallax element and never removed in script lifecycle. | Guard with cleanup on page transitions/view swaps. |
| F029 | Error handling & observability | web-chambreasoi.fr/src/pages/api/revalidate.ts:93 | High | S | `invalidateCmsCache()` executes before Cloudflare purge success; local cache can diverge from edge cache on purge failure. | Invalidate local cache only after successful purge response. |
| F030 | Error handling & observability | web-chambreasoi.fr/config/cache.ts:3 | Medium | M | Cache epoch/resetters are process-local; in multi-instance Workers, invalidation propagation is best-effort only. | Document limitation and consider durable/shared invalidation channel. |
| F031 | Documentation drift | studio-chambreasoi.fr/schemaTypes/documents/headlineContent.ts:11 | Medium | S | Inline schema doc still says `_id: "foldContent"` for `headlineContent`, which is wrong. | Correct docstring to prevent editor confusion. |

## Top 5 "if you fix nothing else, fix these"
1. **F029 — Revalidate ordering bug**  
   Move `invalidateCmsCache()` to run only after `purgeResponse.ok` is true.
2. **F001/F002 — Decompose `la-chambre` + `Fold`**  
   Extract data preparation and reuse section primitives; keep Astro files mostly presentational.
3. **F020/F021 — Fix unlisted `cloudflare` dependency contract**  
   Align runtime typing/import strategy so dependency graph matches actual imports.
4. **F005/F006/F007 — Consolidate reveal behavior**  
   Replace three inline observer scripts with a single utility/component.
5. **F026 — Replace eager image glob loading**  
   Introduce lazy image resolver or generated manifest to avoid loading entire image set at startup.

### Diff sketch: revalidate ordering fix
```ts
// after signature validation:
const purgeResponse = await fetch(/* ... */);
if (!purgeResponse.ok) {
  // log + return 502
}

// invalidate local caches only after edge purge succeeded
invalidateCmsCache();
return new Response("OK", { status: 200 });
```

## Quick wins (Low effort × Medium+ severity)
- [ ] F029: Move `invalidateCmsCache()` after successful purge response.
- [ ] F013: Fix stale `.env.example` dataset comment.
- [ ] F020/F021: Declare/resolve `cloudflare` import contract.
- [ ] F031: Correct stale `_id` docstring in `headlineContent`.
- [ ] F025: Add `pnpm audit` script at repo root.

## Things that look bad but are actually fine
- `web-chambreasoi.fr/src/pages/api/revalidate.ts:66` timestamp TTL validation looked suspicious at first but is now explicitly enforced and correct for replay resistance.
- `web-chambreasoi.fr/src/pages/api/revalidate.ts:72` timing-safe compare is custom, but byte-length check + XOR loop is valid constant-time style for equal-length strings.
- `packages/sanity/src/fetch.ts:149` in-flight dedupe map cleanup in `finally` prevents unbounded growth for settled promises.
- `studio-chambreasoi.fr/sanity.config.ts:19` Vision tool is dev-gated (`isDevelopment`) and no longer globally enabled.

## Open questions for the maintainer
- Is process-local cache invalidation (`config/cache.ts`) acceptable for your Cloudflare deployment topology, or do you need cross-instance consistency guarantees?
- Should availability rendering intentionally include all returned months, or should it be bounded to a rolling window (e.g., next 12 months)?
- Do you prefer fallback-first rendering for all critical content, or are there pages that should fail closed when CMS contracts break?
- Is the current giant shared query module intentional for discoverability, or are you open to domain-sliced query files with generated type surfaces?

## Repeat-run status
### RESOLVED since previous audit
- **R001** `web-chambreasoi.fr/src/pages/api/revalidate.ts:66` — timestamp freshness check exists.
- **R002** `web-chambreasoi.fr/src/pages/api/revalidate.ts:72` — timing-safe signature comparison exists.
- **R003** `web-chambreasoi.fr/config/cache.test.ts:1` — cache invalidation unit tests added.
- **R004** `web-chambreasoi.fr/src/lib/revalidate/purge.test.ts:1` — purge payload tests added.
- **R005** `web-chambreasoi.fr/src/lib/security/webhookSignature.test.ts:1` — signature parsing/freshness tests added.

### Still open (sample carry-over)
- Large component/page decomposition debt in `la-chambre`, `Fold`, and `LocationSection`.
- Config/fallback consistency debt across organization/pricing/accommodation modules.
- High-churn UI/business-critical paths still lightly tested.

## Tooling notes
- `npm audit --json` fails with `ENOLOCK` (expected in pnpm-only workspace).
- `pnpm audit --json` reports 0 known vulnerabilities.
- `npx madge --circular` reported no circular dependencies in scanned paths.
- `npx knip` reported unused files/exports/deps and unlisted `cloudflare` dependency usage.
