# Tech Debt Audit — chambreasoi.fr
Generated: 2026-11-07
Updated: 2026-11-07 (top-five remediation pass)
Previous run: 2026-05-28

## Executive summary
- 33 open findings: 0 Critical in application code, 1 High, 20 Medium, 12 Low. Twenty-one previous findings are resolved (ten from May, eleven from the 2026-11-07 top-five pass).
- The previous freshness bug is fixed. Isolate CMS memoization is gone (`config/cache.ts` deleted). `getPricing` / `getOrgData` / `getAccommodation` go through `config/load-cms.ts` once per call. Worker HTML sets `Cache-Control` in `src/middleware.ts` (`s-maxage=3600, stale-while-revalidate=86400`; `/tarifs-et-reservation` is `no-store`). `public/_headers` remains for static assets only.
- Dependency posture improved on the pins that mattered for the public app. Root overrides are `tar@7.5.22` and `undici@7.30.1`. Web is on Astro `7.4.7` and Sharp `0.35.5` (past GHSA-26w7-cxv4-gfx2). `pnpm audit` is still noisy on transitive toolchain (1 critical / 36 high at last check, mostly Studio / eslint / adm-zip / DOMPurify).
- Homepage fold is fetched once in `index.astro` and passed as props. Merge rules live in `src/data/adapters/fold.ts` with unit tests.
- Availability calendar was split: Astro shell (~81 lines), `availability-calendar-client.ts`, and `availability-calendar.css`. Server query window and client “today” both use Europe/Paris.
- Still open and worth the next pass: la-chambre / LocationSection size, `queries.ts` as a single catalog, untested la-chambre adapter (F015, only remaining High), reveal CSS / observer drift, unused React/Studio deps on the public package, prerendered legales vs purge map, and the small leftovers (`tel:` space, headline `_id` comment, stray IndexNow file).

## Architectural mental model
Three workspaces. `web-chambreasoi.fr` is an Astro 7 server app on Cloudflare Workers (`output: "server"`, `@astrojs/cloudflare` in production, `@astrojs/node` only when `NODE_ENV !== "production"`). `studio-chambreasoi.fr` is the Sanity Studio deployed to Cloudflare Pages at `studio.chambreasoi.fr`. `packages/sanity` is the shared read client, GROQ strings, and image URL builders. The web app does not embed Studio unless `ENABLE_SANITY_STUDIO=true`.

A request enters `src/middleware.ts`, which copies Worker bindings into a module-level `workerEnv` on `@chambreasoi/sanity` and sets HTML `Cache-Control` / `Link` / `No-Vary-Search` on document responses. Pages then call `fetchSanity` (no CDN, in-flight dedupe only) or one of `getPricing` / `getOrgData` / `getAccommodation`, which load through `loadCms` with TypeScript fallbacks and bump isolate-local counters exposed at `GET /api/health/fallbacks`. Editorial publish hits `POST /api/revalidate`: signature check, targeted Cloudflare purge, then `waitUntil` warm + optional IndexNow. There is no isolate catalog epoch to bump.

That is more machinery than the root README describes, and less shared than the code looks. Page sections still fetch their own documents (except homepage fold). Reveal behavior was extracted to `src/utils/reveal.ts`, then copied again in `HeadlineSection.astro`, and the CSS that makes `[data-reveal]` visible is still pasted in five files with two different travel distances. Legal pages are prerendered, so the webhook's "purge these URLs" map cannot refresh SIRET, phone, or address on `/legales/*` until the next build.

The README in `packages/sanity` still describes a package this repo no longer has: `TEST_CONTENT_*` queries, and a web `sanity.config.ts` that imports Studio schemas. The live stub config has an empty schema and a hardcoded project id fallback.

## Orientation evidence (Phase 1)
- Source size is about 17k lines across the three workspaces. Not large enough to split the audit across subagents.
- Largest source files (post top-five pass): `packages/sanity/src/queries.ts` (676), `web-chambreasoi.fr/src/components/price-section/PriceSection.astro` (506), `web-chambreasoi.fr/src/pages/la-chambre.astro` (483), `web-chambreasoi.fr/src/components/location-page/OpMap.astro` (479), `web-chambreasoi.fr/src/components/availabily-page/PracticalInfoSection.astro` (465), `studio-chambreasoi.fr/schemaTypes/documents/surroundingsPageContent.ts` (403). `AvailabilityCalendar.astro` is no longer in that set (~81 lines after the script/CSS split).
- Six-month churn is bursty, not broad: 37 commits since 2026-05-07, then a long quiet stretch, then work on 2026-11-06/07. Pre-remediation hot files included `PriceSection.astro` and `AvailabilityCalendar.astro`.
- `tsc --noEmit` across workspaces exits 0. `madge --circular` on web `src`/`config`, `packages/sanity/src`, and the studio reports no cycles. `knip` reports unused files / exports (see F014, F022–F024, F037).

## Findings table
Status is `NEW`, `UPDATED` (still open, citation or severity changed), or carried with no status word when the May finding is unchanged. Resolved rows are listed under **Repeat-run status**, not here.

| ID | Category | File:Line | Severity | Effort | Description | Recommendation |
|----|----------|-----------|----------|--------|-------------|----------------|
| F001 | Architectural decay | web-chambreasoi.fr/src/pages/la-chambre.astro:27 | Medium | L | UPDATED. Down from ~600 lines to 483. Mapping moved to `src/data/adapters/la-chambre.ts`, but the page is still the layout, the gallery branching, the reveal CSS, and the reveal script. | Keep splitting sections (private / shared / service) into components. Leave the adapter as the only place that merges CMS and fallback. |
| F003 | Architectural decay | web-chambreasoi.fr/src/components/location-section/LocationSection.astro:15 | Medium | M | UPDATED. 342 lines. The section fetches CMS copy, renders two layouts, owns reveal CSS (`translateY(40px)` at line 206), and attaches a scroll parallax listener at line 299. | Pass copy in from the page. Move the parallax script next to `src/utils/reveal.ts`. |
| F004 | Architectural decay | packages/sanity/src/queries.ts:13 | Medium | M | UPDATED. Grew to 676 lines. Every result type and every GROQ string for organization, pricing, rooms, surroundings, and availability lives in one module. The file's own header says it is the single shared catalog. | Split by document type (`organization.ts`, `room.ts`, `surroundings.ts`, …) and re-export from `queries.ts` so existing imports keep working. |
| F011 | Type & contract debt | web-chambreasoi.fr/src/pages/api/revalidate.ts:103 | Medium | S | `getRuntimeEnv(...) as RevalidateBindings` then hand-checks three strings. Bindings outside that cast are unchecked. The same cast pattern is repeated in `src/pages/[indexnowKey].txt.ts:11`. | Parse bindings with the `zod` already in the web package. One schema for the Worker secrets. |
| F012 | Type & contract debt | web-chambreasoi.fr/config/organization.ts:17 | Low | S | Fallback phone link is `tel:+ 33631988538` (space after `+`). Studio field help at `studio-chambreasoi.fr/schemaTypes/singletons/organizationSettings.ts:60` shows the form without the space. | Use `tel:+33631988538` in the fallback. |
| F014 | Type & contract debt | web-chambreasoi.fr/src/lib/sanity.ts:22 | Medium | S | UPDATED. `knip` still flags the barrel. `sanityClient` is re-exported and has no importer. Also unused from this barrel: `getSanityClient`, `setWorkerEnv`, `fetchSanity`, `resolveSrcSetWidths`, `sanityImageUrl`, `SanityPublicConfig`. Call sites import `@chambreasoi/sanity/*` or the named getters below. | Stop re-exporting the world. Export the getters this app actually calls. |
| F015 | Test debt | web-chambreasoi.fr/src/data/adapters/la-chambre.ts:29 | High | M | The page's merge rules (`normalizeCards` falls back per index, image resolution) have no test. `gallery-layout.test.ts` covers classnames only. Surroundings and fold have adapter tests; this one does not. | Test card fallback, missing asset, and srcset selection. Do not snapshot the Astro markup. |
| F017 | Test debt | web-chambreasoi.fr/src/components/location-section/LocationSection.astro:17 | Medium | M | Copy fallback and the parallax progress math are untested. | Extract the progress function and test the 0..1 clamp. Leave the SVG alone. |
| F018 | Test debt | studio-chambreasoi.fr/package.json:7 | Medium | S | Studio scripts are `dev`, `build`, `deploy`, `typecheck`. No test script. Singleton id rules in `schemaTypes/lib/singletons.ts` can drift from GROQ `_id` filters with only a typecheck to notice. | A small node test that the singleton id list equals the `_id` literals in `queries.ts`. |
| F019 | Test debt | .github/workflows/security-ci.yml:31 | Medium | S | UPDATED. CI runs `pnpm test` and `pnpm typecheck`. It does not run `pnpm --filter web-chambreasoi-fr lint`, studio eslint, or an audit. Root `package.json` matches that gap. | Add lint. Add `pnpm audit --audit-level=high` once the remaining critical/high noise is acceptable or scoped. |
| F022 | Dependency & config debt | web-chambreasoi.fr/package.json:48 | Low | S | `@astrojs/check` is still declared. No script calls `astro check`. The `check` script is Biome. `knip` confirms it is unused. | Remove it, or add an `astro check` CI step and then it is not debt. |
| F023 | Dependency & config debt | web-chambreasoi.fr/package.json:54 | Low | S | UPDATED. `@unocss/preset-web-fonts` is unused. `uno.config.ts:3` imports `presetWebFonts` from `unocss/preset-web-fonts`, which ships inside `unocss`. | Remove the extra package. |
| F024 | Dependency & config debt | studio-chambreasoi.fr/package.json:32 | Low | S | `prettier` is a devDependency and there is a prettier block in the same file, but no script runs it. `knip` flags it. | Wire `format` or drop the dependency and the config block together. |
| F025 | Dependency & config debt | package.json:22 | Medium | S | UPDATED. Still no `audit` script. Overrides for `tar` / `undici` are patched; remaining audit noise is mostly transitive Studio / tooling. | Add the script and run it in CI with an agreed `--audit-level` or allowlist. |
| F031 | Documentation drift | studio-chambreasoi.fr/schemaTypes/documents/headlineContent.ts:11 | Medium | S | The seed comment still says `_id: "foldContent"` for `headlineContent`. The GROQ filter is `_id == "headlineContent"` (`queries.ts:244`). The same comment says "healine section". | Fix the id and the typos. Editors copying the comment will create the wrong document. |
| F035 | Consistency rot | web-chambreasoi.fr/src/components/headline-section/HeadlineSection.astro:74 | Medium | S | NEW. Homepage reveal was centralized, then this component grew its own `IntersectionObserver` with the same body as `src/utils/reveal.ts:18`. It queries every `[data-reveal]` on the page, so on `/` it double-observes LocationSection nodes that `LocationSection.astro:307` already registers at threshold `0.15`. | Call `initRevealOnIntersect`. Delete the local script. |
| F036 | Consistency rot | web-chambreasoi.fr/src/components/location-section/LocationSection.astro:206 | Medium | S | NEW. The same `[data-reveal]` rule is copied in this file (`translateY(40px)`), `HeadlineSection.astro:45` (`20px`), `la-chambre.astro:459` (`20px`), `CalendarDisplay.astro:114`, and `PracticalInfoSection.astro:436`. | One global stylesheet. Pick one distance. |
| F037 | Architectural decay | web-chambreasoi.fr/src/utils/env.ts:1 | Low | S | NEW. `knip` unused files: `src/utils/env.ts` (parallel env reader, superseded by `src/utils/runtime-env.ts`), `src/lib/config-resolvers.ts` (re-export nobody imports; callers use `@utils/config-resolvers`), `config/index.ts` (type barrel nobody imports). | Delete all three. |
| F038 | Dependency & config debt | web-chambreasoi.fr/astro.config.mjs:133 | Medium | M | NEW. `react()` is unconditional. Web dependencies include `react`, `react-dom`, `styled-components`, and `sanity`. There is no `.tsx` and no `client:*` island. Studio on the public host is opt-in at `astro.config.mjs:111` and the stub `sanity.config.ts` has `schema.types: []`. | Gate `react()` on `ENABLE_SANITY_STUDIO`. Move Studio-only packages out of the default web install if the embedded route is no longer a goal. |
| F039 | Dependency & config debt | web-chambreasoi.fr/wrangler.jsonc:21 | Medium | S | UPDATED. KV binding `SESSION` is declared. After Astro 7 / `@astrojs/cloudflare` 14, the adapter enables sessions with that binding. `preview_id` still equals the production namespace id, so a future `wrangler` preview write can hit production data. | Give preview its own namespace. Do not delete the binding while the adapter expects it. |
| F041 | Architectural decay | web-chambreasoi.fr/src/pages/legales/mentions-legales.astro:7 | Medium | S | NEW. `prerender = true`, and the page bakes `getOrgData()` into the HTML. `config/cms-route-map.ts:7` maps `organizationSettings` to every public route, including both legal pages. Purge cannot change a prerendered asset. A published SIRET or phone number stays stale until the next web deploy. Same for `politique-confidentialite.astro`. | Either render legal pages on demand, or stop listing them in the webhook map and say so in the Studio README. |
| F042 | Error handling & observability | web-chambreasoi.fr/src/pages/api/health/fallbacks.ts:6 | Medium | S | NEW. Unauthenticated `GET` returns `fallbackMetrics.ts` counters. Those counters are process-local, never reset, and do not include fold, headline, room, or location misses (`tarifs-et-reservation.astro:19` increments `practical-info` ad hoc). A healthy isolate and a stale isolate both look plausible. | Document the body as isolate-local, or drop the route until the counter lives somewhere shared. Do not alert on it. |
| F043 | Performance & resource hygiene | web-chambreasoi.fr/src/lib/sanity.ts:122 | Medium | S | NEW. Availability fetch is raced against a 12s `setTimeout` that always rejects. `Promise.race` swallows the late rejection, so this is not an unhandled-rejection bug. The Sanity request is not aborted, and the timer is not cleared on the fast path. Every tarifs render schedules a throw 12 seconds later. | `AbortSignal.timeout`, or `clearTimeout` in `finally`. |
| F044 | Type & contract debt | web-chambreasoi.fr/sanity.config.ts:33 | Medium | S | NEW. Missing `PUBLIC_SANITY_PROJECT_ID` silently becomes `"vq8mnl17"`. The comment says that is intentional so Studio hydration does not throw. A mis-set build therefore talks to production content with no error. `wrangler.jsonc:16` repeats the same id, which is fine as an explicit var and bad as a hidden fallback. | Fail the build when the env var is missing. Keep the id in wrangler vars only. |
| F045 | Documentation drift | packages/sanity/README.md:51 | Medium | S | NEW. Docs import `TEST_CONTENT_LIST_QUERY`, which does not exist (removed when test content types left). Line 137 says the web app's `sanity.config.ts` imports `../studio-chambreasoi.fr/schemaTypes`. The stub config does not. | Rewrite the examples against `FOLD_CONTENT_QUERY` and point schemas at the Studio package only. |
| F048 | Consistency rot | web-chambreasoi.fr/src/components/availabily-page/AvailabilityCalendar.astro:1 | Low | L | NEW. The directory is `availabily-page`. The config module is `accomodation.ts`. Both spellings are now in imports, tests, and Studio-adjacent copy. | Rename only as a dedicated change with a full import update. Until then, do not "fix" one call site. |
| F049 | Security hygiene | ce5fcf93dc58469ba4c9c04b58fbf0b0.txt:1 | Low | S | NEW. Tracked at the repo root. The file body is the filename. The live verification route is `src/pages/[indexnowKey].txt.ts`, which reads `INDEXNOW_KEY` from the Worker env and 404s otherwise. This file is not that route. An earlier commit added the same kind of file and a later commit deleted two of them. This one survived. | Delete it. IndexNow keys are public once served; a copy that is not the served key is just clutter, and it will be mistaken for the live secret. |
| F050 | Documentation drift | web-chambreasoi.fr/astro.config.mjs:78 | Low | S | NEW. The missing-env error tells you to set variables "in Cloudflare Pages". The web app deploys with `wrangler deploy` to Workers (`package.json` script `deploy`, `wrangler.jsonc` name `chambreasoi-web`). `config/public-routes.ts:31` also calls `_redirects` a "Cloudflare Pages" file. Workers static assets do read that file. The platform name is still wrong. | Say Workers. |
| F052 | Dependency & config debt | web-chambreasoi.fr/wrangler.jsonc:5 | Low | S | NEW. `compatibility_date` is `2024-12-01`. | Bump it on a deploy you are already watching. Read the Workers compatibility changelog between that date and the bump. |
| F053 | Error handling & observability | web-chambreasoi.fr/src/pages/api/revalidate.ts:155 | Low | S | NEW. Purge failure returns `Cloudflare cache purge failed: ${purgeResult.error}` to the webhook caller. `purge.ts:34` puts the API error string, or the first 200 characters of the raw body, into that message. | Log it. Return a fixed `Bad gateway` body. |
| F054 | Architectural decay | web-chambreasoi.fr/src/components/location-page/OpMap.astro:160 | Medium | M | NEW. 479 lines. Marker popups, SVG fetches, and GeoJSON boundary loading are an inline script. Boundary failures are logged and swallowed (`line 324`), which is reasonable. The script is not reusable and not tested. | Move the script to a module. Keep the Astro file as the marker markup. |
| F055 | Test debt | studio-chambreasoi.fr/eslint.config.mjs:1 | Low | S | NEW. Studio eslint config exists. No `lint` script. CI never runs it. | Add `lint` and call it from `ci:verify`, or delete the config. |
| F056 | Documentation drift | web-chambreasoi.fr/src/lib/sanity.ts:100 | Low | S | NEW. Comments on `getLocationPageContent`, `getPracticalInfoContent`, `getRoomPageContent`, and `getSurroundingsPageContent` say "the first" document. The queries filter `_id == "<singleton>"` (`queries.ts:311`, `395`, `505`, `621`). | Say singleton id. The `[0]` is only there because GROQ filters return arrays. |

## Top 5 "if you fix nothing else, fix these"
The previous top five were implemented on 2026-11-07. Next priority among what remains:

1. **F015 — Test the la-chambre adapter.** Only remaining High. Surroundings and fold already have adapter tests; card fallback / missing asset / srcset selection do not.
2. **F041 — Legal pages vs purge map.** Prerendered `/legales/*` cannot pick up organization publishes. Either SSR them or stop listing them in `cms-route-map`.
3. **F035 + F036 — Reveal once.** Delete the HeadlineSection observer duplicate and collapse the five `[data-reveal]` CSS copies.
4. **F038 — Gate or drop embedded Studio deps.** `react()` and the Studio packages ride on every public build for a route production does not mount.
5. **F004 — Split `queries.ts`.** Still the largest shared contract file; every domain change edits the same module.

## Quick wins (Low effort × Medium+ severity)
- [x] F032: Raise the `tar` and `undici` overrides and refresh the lockfile.
- [x] F040: Set HTML `Cache-Control` in middleware. Keep `/tarifs-et-reservation` as `no-store`.
- [x] F030 / F008 / F009 / F010: Drop isolate catalog cache; use `loadCms`.
- [x] F033: Upgrade Astro 7 + Sharp past GHSA-26w7-cxv4-gfx2.
- [x] F002 / F016: One fold fetch + `mergeFoldContent` tests.
- [x] F046 / F051: Split calendar script/CSS; Europe/Paris clock.
- [ ] F031: Correct the `headlineContent` `_id` comment.
- [ ] F043: Abort or clear the availability timeout.
- [ ] F044: Remove the silent `"vq8mnl17"` fallback in `sanity.config.ts`.
- [ ] F011: Validate webhook bindings with zod instead of a cast.
- [ ] F035: Replace the HeadlineSection observer with `initRevealOnIntersect`.
- [ ] F036: Deduplicate the `[data-reveal]` CSS.
- [ ] F041: Take prerendered legal URLs out of the organization purge map, or render them on demand.
- [ ] F045: Fix `packages/sanity/README.md` so it does not import `TEST_CONTENT_LIST_QUERY`.
- [ ] F012: Remove the space in the fallback `tel:` URI.
- [ ] F049: Delete `ce5fcf93dc58469ba4c9c04b58fbf0b0.txt`.
- [ ] F022 / F023 / F024: Remove unused `@astrojs/check`, `@unocss/preset-web-fonts`, and studio `prettier` (or actually call them).
- [ ] F037: Delete `src/utils/env.ts`, `src/lib/config-resolvers.ts`, and `config/index.ts`.
- [ ] F039: Give the `SESSION` preview KV its own namespace (binding stays for Astro 7 sessions).
- [ ] F053: Stop returning Cloudflare's purge body to the webhook caller.

## Things that look bad but are actually fine
- `webhookSignature.ts` timestamp window and the XOR compare are real checks, with tests. The custom compare is constant-time for equal lengths. Length mismatch returns early, which is the usual tradeoff and is fine for this header.
- `packages/sanity/src/fetch.ts` deletes the in-flight entry in `finally`. The map does not grow with traffic. It is not a response cache.
- `getSanityClient` defaults `useCdn` from `sanityConfig`, which defaults to `true`. The only caller is `fetchSanity`, which always passes `useCdn: false`. The default is unused on the request path.
- `setWorkerEnv` stores bindings on the module. The comment overstates request isolation (an `await` can interleave another request). Every request writes the same deployment bindings. That is safe here. It would not be safe if the value were per-user.
- GROQ `[0]` after `_id == "roomPageContent"` is how you unwrap a filter, not "whatever document happens to be first". The data README is right about legacy duplicates. F056 is only the comment.
- Internal paths omit the trailing slash (`/la-chambre`). `toCanonicalPageUrl` adds it before purge. `purge.test.ts` asserts `https://chambreasoi.fr/la-chambre/`. The slash is not a purge miss.
- Two rich-text renderers in `SurroundingsCard.astro` match two shapes: GROQ portable text when Sanity returned blocks, hand-written fallback blocks when it did not. Collapsing them means inventing a third shape.
- `Button.astro` is long because of variants, not because it fetches data or owns a state machine.
- The scroll listener in `LocationSection.astro:299` is never removed. There is one `[data-parallax]` and no `ClientRouter`. The listener's lifetime is the page. `MobileNav.astro:346` listens for `astro:after-swap`, which nothing fires. That listener is dead, not a leak.
- `public/_headers` asset `Cache-Control` rules are valid on Workers static assets. Worker HTML headers live in middleware (resolved F040).
- `knip`'s "unlisted binary `tsc`" at the repo root is a false positive. `package.json` runs `pnpm -r exec tsc`, and TypeScript is a devDependency of each workspace.
- The public Sanity project id in `wrangler.jsonc` vars is not a secret. Sanity project ids are client-side. The problem is the silent fallback (F044), not the var.
- `Image` from `astro:assets` is only given local `ImageMetadata` (glob fallbacks and imported files). Remote Sanity URLs use a plain `<img>`. That remains the safe pattern after the Sharp upgrade.
- Fallback-first rendering for a brochure site is a product choice. Pricing and organization log `criticality: "high"` and still serve defaults. That is coherent as long as the health route is not treated as a paging signal (F042).
- Astro 7 / `@astrojs/cloudflare` 14 enabling Sessions on the existing `SESSION` KV binding is expected. The remaining risk on that binding is preview sharing the production namespace id (F039), not that the binding exists.

## Open questions for the maintainer
- Is there a Cloudflare cache rule in the dashboard, outside the repo, that caches HTML from the Worker? Middleware now emits `Cache-Control`; confirm whether Workers CDN / Cache Rules actually honor it, or whether `cacheCloudflare()` route caching is still needed.
- Is the embedded `/studio` route still wanted? If not, F038 is a deletion, not a flag.
- Should `/legales/*` keep being prerendered? If editors expect a publish to update SIRET and phone, the answer is no.
- `GET /api/health/fallbacks` is public. Is that a deliberate probe for you, or an accident?
- Does production need an `IMAGES` Cloudflare Images binding? The Astro 7 Cloudflare adapter logs that it enables image processing with that binding; the app config still points the image service at Sharp for compile-time work.

## Repeat-run status
### RESOLVED since 2026-11-07 (top-five pass)
- **F002** `index.astro` fetches fold, pricing, and org once and passes props. `Fold.astro` no longer calls Sanity.
- **F008 / F009 / F010** Shared `loadCms` helper in `config/load-cms.ts`. Epoch / isolate memoization removed from organization, pricing, and accommodation. Spelling of `accomodation.ts` intentionally left (F048).
- **F016** Fold CMS-vs-default merge covered by `src/data/adapters/fold.test.ts`.
- **F030** `config/cache.ts` and `invalidateCmsCache()` deleted. Revalidate no longer bumps an isolate epoch.
- **F032** Overrides pin `tar@7.5.22` and `undici@7.30.1`.
- **F033** Web on Astro `^7.4.7` and Sharp `^0.35.5`; GHSA-26w7-cxv4-gfx2 no longer applies to the direct pins.
- **F040** Middleware sets HTML `Cache-Control` / `Link` / `No-Vary-Search`. `_headers` documents that it covers static assets only.
- **F046** Calendar script and theme extracted; payload JSON parse is guarded; Astro file is markup + boot only.
- **F051** Server query range and client “today” both use Europe/Paris via `getTodayIsoInParis`.

### RESOLVED since 2026-05-28
- **F005** `la-chambre.astro` no longer inlines an `IntersectionObserver`. It calls `initRevealOnIntersect` at line 480.
- **F006** `CalendarDisplay.astro` no longer has its own observer. The tarifs page calls the shared helper at line 41.
- **F007** `LocationSection.astro:307` calls the shared helper. Remaining drift is CSS (F036) and the parallax listener, which is not a leak (see above).
- **F013** `.env.example` no longer claims the dataset is forced to `"xxxxxxxx"`. It matches `astro.config.mjs`, which forces `production` in local dev.
- **F020 / F021** No import of an npm package named `cloudflare`. Runtime bindings come from `import("cloudflare:workers")` in `runtime-env.ts:39`. `knip` does not report an unlisted `cloudflare` dependency.
- **F026** `imageUtils.ts:14` uses `import.meta.glob` without `eager: true`. Loaders run on demand. `resolveImage` is async, which matches that.
- **F027** Availability is no longer "every month the API might return". `getAvailabilityQueryRange` asks for 6 months back and 18 forward (Paris calendar month), and the GROQ query takes `$minMonth` / `$maxMonth`.
- **F028** Reclassified. The scroll listener is correct for a full page load without view transitions.
- **F029** Superseded by F030. There is no in-memory CMS catalog left to invalidate after purge; edge purge + warm remain.

Still resolved from the run before May, and still true: webhook timestamp freshness, timing-safe compare, and the unit tests around purge and signature. The old cms-cache unit file was removed with the cache module; `load-cms.test.ts` covers the replacement helper.

### Still open
Decomposition of la-chambre / location, the query module, la-chambre adapter tests (F015), unused React/Studio deps, reveal CSS/observer drift, prerendered legales vs purge map, unused/misnamed leftovers (`tel:` space, headline comment, IndexNow file, `availabily` / `accomodation` spellings), and CI lint/audit gaps.

## Tooling notes
- `pnpm -r exec tsc --noEmit`: exit 0 (rechecked after the top-five pass).
- `pnpm test` (web + `@chambreasoi/sanity`) and studio typecheck: green after the pass.
- `npx madge --circular --extensions ts,tsx,mjs,astro` on `web-chambreasoi.fr/src`, `web-chambreasoi.fr/config`, `packages/sanity/src`, `studio-chambreasoi.fr`: no cycles (from the morning audit).
- `npx knip --reporter compact`: exit 1. Unused files and exports are cited above. It did not report a missing `cloudflare` dependency.
- `pnpm audit` after the pin/Astro bump: still noisy (last check ~1 critical / 36 high / 21 moderate / 10 low). Most highs remain transitive Studio / eslint / adm-zip / DOMPurify / tooling. The public-app pins from F032 / F033 are addressed.
- `npm audit` was not used. The repo is pnpm-only (`pnpm-lock.yaml` at the root). May's note about `ENOLOCK` still applies.
- `depcheck` was not run. `knip` already covered unused dependencies, and a second unused-dep tool would mostly disagree about Astro virtual imports.
