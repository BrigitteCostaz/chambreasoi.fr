# Tech Debt Audit — chambreasoi.fr
Generated: 2026-05-28

## Executive summary
- 3 Critical, 12 High, 14 Medium, 3 Low findings (32 total); debt is concentrated in `web-chambreasoi.fr`.
- Highest-risk issues are in webhook verification (`revalidate.ts`) and oversized Astro files mixing data/domain/UI concerns.
- Repeat-run result: some prior dependency/config issues are improved (root `.npmrc` removal), but core architecture/test/security debt remains.
- Type safety gates are currently broken (`tsc --noEmit` fails on deprecated `baseUrl`).
- Testing debt is severe across all workspaces (no effective test harness on critical paths).
- Environment/config resolution remains duplicated across multiple modules, causing drift and hidden runtime behavior differences.
- Shared Sanity package contains a correctness bug in request dedupe keying that can merge semantically different requests.
- Documentation remains materially stale versus actual architecture/workflows.
- Most ROI: secure webhook path, split god files, centralize env contract, add first test suite around adapters + fetch wrappers.

## Architectural mental model
This repo is a PNPM monorepo with three active code domains: `web-chambreasoi.fr` (Astro app deployed to Workers), `studio-chambreasoi.fr` (Sanity Studio/editor contract), and `packages/sanity` (shared read-only client/config/query package). In practice, the web app is "fallback-first": if Sanity fetches or config resolution fail, pages generally degrade to in-code defaults so rendering continues.

The README-level docs do not describe this architecture; actual behavior is encoded directly in large component/page files and config utilities. This creates hidden coupling between CMS schemas, adapter logic, and Astro rendering paths, with little test coverage to detect drift.

## Orientation evidence (Phase 1)
- Top-level modules: `web-chambreasoi.fr`, `studio-chambreasoi.fr`, `packages/sanity`, plus root configs and lockfiles.
- 20 largest files include: `web-chambreasoi.fr/src/pages/la-chambre.astro`, `packages/sanity/src/queries.ts`, `web-chambreasoi.fr/src/components/availabily-page/PracticalInfoSection.astro`, `web-chambreasoi.fr/src/components/fold/Fold.astro`, `web-chambreasoi.fr/src/components/location-page/OpMap.astro`.
- 20 highest churn files in last 6 months include: `web-chambreasoi.fr/package.json`, `pnpm-lock.yaml`, `web-chambreasoi.fr/astro.config.mjs`, `web-chambreasoi.fr/src/lib/sanity.ts`, `web-chambreasoi.fr/src/components/fold/Fold.astro`, `packages/sanity/src/queries.ts`, `web-chambreasoi.fr/src/pages/la-chambre.astro`.
- Intersection (large + high churn): `pnpm-lock.yaml`, `web-chambreasoi.fr/package.json`, `web-chambreasoi.fr/src/components/fold/Fold.astro`, `packages/sanity/src/queries.ts`, `web-chambreasoi.fr/src/pages/la-chambre.astro`.

## Findings table
| ID | Category | File:Line | Severity | Effort | Description | Recommendation |
|----|----------|-----------|----------|--------|-------------|----------------|
| F001 | Architectural decay | web-chambreasoi.fr/src/pages/la-chambre.astro:1 | Critical | L | `[NEW]` `la-chambre.astro` is a monolith (~600 LOC) mixing data fetch, mapping, rendering, and client script. | Split into page orchestration + section components + mappers. |
| F002 | Architectural decay | web-chambreasoi.fr/src/components/surroundings-page/SurroundingsPageSection.astro:95 | Critical | L | `[NEW]` One component combines fallback data, resolution logic, markup, styling, and script in one file. | Extract adapter + fixture + UI subcomponents. |
| F003 | Security hygiene | web-chambreasoi.fr/src/pages/api/revalidate.ts:40 | Critical | S | `[NEW]` Webhook signature verification does not enforce timestamp freshness, allowing replay of captured valid payloads. | Reject signatures older than strict TTL (e.g. 5 minutes). |
| F004 | Security hygiene | web-chambreasoi.fr/src/pages/api/revalidate.ts:47 | High | S | `[NEW]` Signature comparison uses plain string equality, not timing-safe compare. | Use constant-time byte comparison helper. |
| F005 | Security hygiene | web-chambreasoi.fr/src/components/availabily-page/PracticalInfoSection.astro:32 | High | S | `[NEW]` Committed localhost telemetry call in component path can leak internals and fail unpredictably. | Remove or gate behind explicit local debug flag. |
| F006 | Test debt | web-chambreasoi.fr/package.json:8 | High | M | `[NEW]` No `test` script for web workspace despite high logic complexity in adapters/config/security endpoints. | Add minimal test runner and first critical tests. |
| F007 | Test debt | studio-chambreasoi.fr/package.json:7 | High | M | `[NEW]` Studio workspace has no `test` or `typecheck` scripts for schema and custom input logic. | Add `typecheck` + focused schema validation tests. |
| F008 | Test debt | packages/sanity/package.json:1 | High | M | `[NEW]` Shared package lacks verification scripts and tests for dedupe/query/image logic. | Add package-level `typecheck` + unit tests. |
| F009 | Type & contract debt | packages/sanity/src/fetch.ts:78 | High | M | `[NEW]` In-flight dedupe key omits request options (`useCdn`, overrides), causing semantic request collisions. | Include normalized options in cache key construction. |
| F010 | Type & contract debt | web-chambreasoi.fr/tsconfig.json:14 | High | S | `[NEW]` Type gate is broken: deprecated `baseUrl` fails `pnpm -r exec tsc --noEmit`. | Migrate TS config or temporarily set `ignoreDeprecations`. |
| F011 | Consistency rot | web-chambreasoi.fr/src/lib/config-resolvers.ts:1 | High | S | `[NEW]` Duplicate resolver module exists in both `src/lib` and `src/utils` with same purpose. | Keep one canonical resolver and migrate imports. |
| F012 | Consistency rot | web-chambreasoi.fr/src/utils/config-resolvers.ts:1 | Medium | S | `[NEW]` Duplicate implementation increases divergence risk over time. | Delete duplicate after call-site consolidation. |
| F013 | Architectural decay | web-chambreasoi.fr/src/components/fold/Fold.astro:232 | High | M | `[NEW]` Desktop block logic duplicated while `FoldDesktopBlock.astro` remains unused. | Integrate extracted component or remove dead file. |
| F014 | Architectural decay | web-chambreasoi.fr/src/components/fold/FoldDesktopBlock.astro:49 | Medium | S | `[NEW]` Unused component adds maintenance burden and false abstraction. | Remove or wire into `Fold.astro` now. |
| F015 | Dependency & config debt | web-chambreasoi.fr/tsconfig.json:20 | Medium | M | `[NEW]` Alias mapping duplicated across TS and Astro config. | Generate aliases from single source map. |
| F016 | Dependency & config debt | web-chambreasoi.fr/astro.config.mjs:166 | Medium | M | `[NEW]` Resolver duplication invites drift between IDE and runtime behavior. | Consume centralized alias config. |
| F017 | Type & contract debt | web-chambreasoi.fr/src/data/adapters/surroundings.ts:117 | Medium | S | `[NEW]` Resolver discards accordions unless count equals exactly 3, hardcoding content cardinality. | Merge by available items with explicit min/max constraints. |
| F018 | Type & contract debt | web-chambreasoi.fr/src/components/surroundings-page/types.ts:93 | Medium | S | `[NEW]` `reservationLabels` exists in contract but not used in adapter implementation. | Remove unused contract field or implement it. |
| F019 | Error handling & observability | web-chambreasoi.fr/src/pages/api/revalidate.ts:82 | High | S | `[NEW]` Cloudflare purge failures return generic errors without structured diagnostics. | Log status + bounded response snippet. |
| F020 | Error handling & observability | web-chambreasoi.fr/src/components/location-page/OpMap.astro:324 | Medium | S | `[NEW]` Map boundary fetch errors are swallowed silently. | Add sampled logs/metrics for repeated failure visibility. |
| F021 | Performance & resource hygiene | web-chambreasoi.fr/src/utils/imageUtils.ts:14 | Medium | M | `[NEW]` `import.meta.glob(..., eager: true)` loads all images at module init. | Switch to lazy manifest/loading strategy. |
| F022 | Performance & resource hygiene | web-chambreasoi.fr/src/pages/la-chambre.astro:267 | Low | S | `[NEW]` Derived gallery calculations recompute in render loops. | Precompute image model once before rendering. |
| F023 | Documentation drift | README.md:1 | Medium | S | `[NEW]` Root README has no install/runtime/architecture guidance for this monorepo. | Replace with project-specific architecture and commands. |
| F024 | Documentation drift | web-chambreasoi.fr/README.md:1 | Medium | S | `[NEW]` Web README is starter boilerplate, not actual app docs. | Document env matrix, deploy flow, and data path. |
| F025 | Documentation drift | studio-chambreasoi.fr/README.md:1 | Medium | S | `[NEW]` Studio README is boilerplate; missing content model/editor ops guidance. | Add schema, singleton, validation, and publish docs. |
| F026 | Type & contract debt | studio-chambreasoi.fr/schemaTypes/documents/headlineContent.ts:25 | High | S | `[NEW]` Preview selects `headline` while actual field is `headLineText`, causing broken preview title mapping. | Align `preview.select` with real field name. |
| F027 | Architectural decay | studio-chambreasoi.fr/schemaTypes/lib/singletons.ts:7 | High | M | `[NEW]` “Single-instance” docs are not consistently in singleton enforcement list. | Add all singleton-intended types to central set/structure. |
| F028 | Architectural decay | studio-chambreasoi.fr/schemaTypes/structure.ts:47 | Medium | M | `[NEW]` Generic document listing still exposes singleton-intended content for duplicate creation. | Route singleton types through fixed `documentId` panes only. |
| F029 | Security hygiene | studio-chambreasoi.fr/sanity.config.ts:18 | High | S | `[NEW]` Vision tool is always enabled in Studio configuration. | Gate Vision to development/admin-only contexts. |
| F030 | Dependency & config debt | studio-chambreasoi.fr/sanity.cli.ts:5 | Medium | S | `[NEW]` CLI defaults to production project/dataset when env missing, risking wrong-target ops. | Fail fast on missing env in CI/local scripts. |
| F031 | Type & contract debt | studio-chambreasoi.fr/schemaTypes/documents/availability.ts:32 | Medium | S | `[NEW]` `as never` cast hides input component contract mismatch. | Replace with proper typed Sanity input props. |
| F032 | Dependency & config debt | studio-chambreasoi.fr/package.json:19 | Medium | S | `[NEW]` Manifest and lockfile versions drift for Sanity packages, reducing reproducibility. | Regenerate lockfile from current manifest and pin intent. |

## Top 5 "if you fix nothing else, fix these"
1. **F003 + F004 (webhook hardening)**  
   Add timestamp TTL and timing-safe comparison in `web-chambreasoi.fr/src/pages/api/revalidate.ts`.
2. **F001 + F002 (decompose god files)**  
   Split `la-chambre` and `SurroundingsPageSection` into adapters/mappers/presentation components.
3. **F009 (shared fetch correctness bug)**  
   Fix dedupe keying in `packages/sanity/src/fetch.ts` to include request options; add tests.
4. **F006/F007/F008 (first test baseline)**  
   Add minimal tests on webhook verification, surroundings adapters, and fetch dedupe behavior.
5. **F010 + F015/F016 (restore quality gates)**  
   Unblock TS check and remove config alias duplication to reduce tooling drift.

### Diff sketch: webhook replay-safe verification
```ts
const maxAgeSeconds = 300;
const now = Math.floor(Date.now() / 1000);
if (Math.abs(now - Number(timestamp)) > maxAgeSeconds) return unauthorized("stale signature");

const expectedBytes = Buffer.from(expectedSigHex, "hex");
const providedBytes = Buffer.from(providedSigHex, "hex");
if (
  expectedBytes.length !== providedBytes.length ||
  !timingSafeEqual(expectedBytes, providedBytes)
) return unauthorized("invalid signature");
```

## Quick wins
- [x] F003: Add timestamp freshness check in `revalidate`.
- [x] F004: Switch signature compare to timing-safe bytes.
- [x] F010: Restore `tsc --noEmit` by TS config migration.
- [x] F011/F012: Remove duplicate config resolver module pair.
- [x] F026: Fix `headlineContent` preview mapping bug.
- [x] F029: Gate Vision plugin to dev/admin only.

## Remediation status
### Planned
- F001, F002, F017, F018, F020, F022, F023, F032

### In progress
- F019

### Done
- F003, F004, F005, F006, F007, F008, F009, F010, F011, F012, F013, F014, F015, F016, F021, F024, F025, F026, F027, F028, F029, F030, F031, R001

## Things that look bad but are actually fine
- `packages/sanity/src/fetch.ts:140` removes in-flight cache entries in `finally`; the dedupe map is not an unbounded leak by itself.
- `packages/sanity/src/config.ts:98` catches `import.meta` access to preserve runtime portability across Node/Vite/Workers.
- `web-chambreasoi.fr/src/components/button/Button.astro:65` enforces `noopener noreferrer` on `_blank` links; this is security-positive.
- `web-chambreasoi.fr/src/pages/debug/env.astro:23` uses a key allowlist instead of dumping all env bindings.
- `studio-chambreasoi.fr/schemaTypes/documents/surroundingsPageContent.ts:26` allows relative links intentionally for internal content links.

## Resolved since previous audit
- **R001 RESOLVED** — Root `.npmrc` warning-prone config debt appears removed (`.npmrc` deleted in current git status). Keep it removed and document pnpm-only expectations.

## Open questions for the maintainer
- Is fallback-to-hardcoded-content a strict uptime requirement, or should some routes fail closed when CMS is unavailable?
- Do you intentionally keep workspace-level lockfiles in subprojects, or should repo converge to a single root lockfile?
- Should webhook revalidation remain path-limited, or evolve to tag/path-scoped invalidation?
- Are singleton document types intentionally editable as multi-doc lists in Studio right now?

## Tooling notes
- `npm audit --json`: failed with `ENOLOCK` (repo uses pnpm, no `package-lock.json`).
- Added workspace tests (`vitest`) for webhook signature and Sanity fetch dedupe keying.
- Added CI workflow `.github/workflows/security-ci.yml` with test + typecheck gates.
- `pnpm ci:verify` now passes locally (`pnpm test` + `pnpm typecheck`).
