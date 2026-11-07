# Weekly booking note Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fifth rates-column card that asks guests to call for a weekly stay, without treating it as a tariff, and keep that column within the kitchen photo on desktop.

**Architecture:** The note is markup in `PracticalInfoSection.astro`, after `publicRates`. The phone comes from `getOrgData()`. Desktop height comes from the photo’s `aspect-[4/3]`; the rates column is `min-h-0` / `h-full` and the five articles share the leftover space with `lg:flex-1`. The Sanity field `kitchenImage` stays; only the view names `priceImageSource` and `priceImageAlt` change.

**Tech Stack:** Astro, UnoCSS, Vitest, existing `getOrgData()` and `getPublicRates()`.

## Global Constraints

- Copy is exactly `Pour une réservation à la semaine, contactez l'hôte au ` plus a `tel:` link.
- The link text is `phone.display`, the href is `phone.link`, underlined, `text-ui-sm`.
- No price, no “TTC”, no heading on the note.
- `data-reveal-delay` is `120 + publicRates.length * 40`.
- Fifth accent is `bg-accentForest/20` at `tariffAccentClasses[publicRates.length]`.
- From `lg`: photo keeps `aspect-[4/3]` (remove `lg:aspect-auto`); column is `lg:h-0 lg:min-h-full` with `lg:overflow-hidden` only as a guard (`h-full` does not resolve, because the row height depends on the column); heading is `lg:shrink-0`; each article is `lg:flex-1 lg:min-h-0`; drop `lg:pb-[1.6rem]`; inner gap is `gap-[1.2rem] lg:gap-[0.8rem]`.
- If the sentence clips at 1024px, lower `lg` padding to `0.6rem` before accepting clipped text.
- Below `lg`, no shared height rule.
- Do not rename Sanity `kitchenImage`, `p.kitchenImage`, `fallbackKitchenImage`, or `kitchenSanitySrc`.
- Do not change `publicRates`, pricing, or schema.org offers.

---

### Task 1: Accent and view-name contract

**Files:**
- Create: `web-chambreasoi.fr/src/data/fallback/practical-info.test.ts`
- Modify: `web-chambreasoi.fr/src/data/fallback/practical-info.ts`
- Modify: `web-chambreasoi.fr/src/data/adapters/practical-info.ts`

**Interfaces:**
- Consumes: existing `tariffAccentClasses`
- Produces: five-entry `tariffAccentClasses`; `p.priceImageAlt` with fallback `Cuisine de la maison d'hôtes`

- [ ] **Step 1: Write the failing test**

```ts
// web-chambreasoi.fr/src/data/fallback/practical-info.test.ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tariffAccentClasses } from "./practical-info";

describe("weekly stay note", () => {
  it("adds a fifth forest accent after the four nightly rates", () => {
    expect([...tariffAccentClasses]).toEqual([
      "bg-accentStone/25",
      "bg-accentForest/20",
      "bg-accentBistre/25",
      "bg-accentStone/25",
      "bg-accentForest/20",
    ]);
  });

  it("renames the price image alt in the adapter", () => {
    const adapter = readFileSync(
      new URL("../adapters/practical-info.ts", import.meta.url),
      "utf8"
    );
    expect(adapter).toContain("priceImageAlt:");
    expect(adapter).toContain('?? "Cuisine de la maison d\'hôtes"');
    expect(adapter).not.toContain("kitchenImageAlt");
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `pnpm test src/data/fallback/practical-info.test.ts` from `web-chambreasoi.fr`.

Expected: FAIL because the accent list has four entries and the adapter still says `kitchenImageAlt`.

- [ ] **Step 3: Implement**

Append `"bg-accentForest/20"` to `tariffAccentClasses`. Rename `kitchenImageAlt` to `priceImageAlt` in the adapter. Leave the fallback string unchanged.

- [ ] **Step 4: Re-run the test**

Expected: PASS.

### Task 2: Note card and desktop height

**Files:**
- Modify: `web-chambreasoi.fr/src/components/availabily-page/PracticalInfoSection.astro`
- Test: `web-chambreasoi.fr/src/data/fallback/practical-info.test.ts`

**Interfaces:**
- Consumes: `tariffAccentClasses`, `getOrgData().contact.phone`, `getPublicRates()`, `p.kitchenImage`, `p.priceImageAlt`
- Produces: a fifth article and `priceImageSource`

- [ ] **Step 1: Extend the failing test** with assertions that the component source contains the weekly sentence, `priceImageSource`, `p.priceImageAlt`, `lg:min-h-0 lg:h-full`, `lg:flex-1`, and does not contain `kitchenImageSource` or `lg:aspect-auto`.

- [ ] **Step 2: Run it and confirm failure.**

- [ ] **Step 3: Implement the component**

Load the phone with `await getOrgData()`. Rename `kitchenImageSource` to `priceImageSource` (`p.kitchenImage`). Point the picture `alt` at `p.priceImageAlt`.

Rates column classes add `lg:h-0 lg:min-h-full lg:overflow-hidden`. `height: 0` keeps the column from growing the grid row; `min-height: 100%` then fills the row the photo sizes. Heading wrapper adds `lg:shrink-0`. Each rate article drops `lg:pb-[1.6rem]` and uses `gap-[1.2rem] lg:gap-[0.8rem] lg:min-h-0 lg:flex-1`.

After the rate map, render:

```astro
<article
  data-reveal
  data-reveal-delay={String(120 + publicRates.length * 40)}
  class:list={[
    "flex flex-col justify-between gap-[1.2rem] border-b border-txtPri/10 p-[0.8rem] lg:min-h-0 lg:flex-1 lg:gap-[0.8rem]",
    tariffAccentClasses[publicRates.length],
  ]}
>
  <p class="text-balance text-ui-sm leading-relaxed">
    Pour une réservation à la semaine, contactez l'hôte au{" "}
    <a class="text-ui-sm underline" href={phone.link}>{phone.display}</a>
  </p>
</article>
```

Figure: remove `lg:aspect-auto`. Keep `aspect-[4/3]`. Add `lg:h-auto lg:w-full lg:self-start` so the 4/3 ratio, not the cards, sets the row height. Keep `lg:row-span-5` and the five-column grid.

- [ ] **Step 4: Re-run the test.** Expected: PASS.

- [ ] **Step 5: Browser check** on `/tarifs-et-reservation` at 1024px and a wide viewport: heading plus five cards end level with the photo; the sentence is fully visible; the phone is a `tel:` link. On a narrow viewport the fifth card stacks under the rates and the photo stays 4/3. If the sentence clips at 1024px, change `lg` padding from `0.8rem` to `0.6rem` and re-check. Confirm offer JSON-LD still has four nightly rates.
