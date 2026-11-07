# Weekly booking note on the rates column

## Purpose

On the tarifs page, the nightly rates column gains one more card. The card tells guests to call the host for a week-long stay. It is not a tariff: it has no price, it is not a `PublicRate`, and it does not appear in schema.org offers.

## Card

Render one `article` after the `publicRates` list in `PracticalInfoSection.astro`, in the same column, with the same chrome as a rate card: bottom border, padding, and a tinted background.

Text, hardcoded in the component:

`Pour une réservation à la semaine, contactez l'hôte au `

The phone is an `<a href={phone.link}>` whose visible text is `phone.display`. Both values come from `await getOrgData()` (`contact.phone`). The link is underlined and uses the same `text-ui-sm` size as the sentence. There is no heading, no price, and no “TTC”.

`data-reveal-delay` is `120 + publicRates.length * 40`, so the note follows the last rate.

## Accent

Append `bg-accentForest/20` to `tariffAccentClasses` in `src/data/fallback/practical-info.ts`, making five entries. The note uses `tariffAccentClasses[publicRates.length]` (index 4 while four nightly rates exist).

## Desktop height

From the `lg` breakpoint upward, the rates column and the kitchen photo share one height. The five cards stay within the photo, and their text is not clipped.

- The figure keeps `aspect-[4/3]` and drops `lg:aspect-auto`. It also uses `lg:h-full`, so when the cards need more than a 4/3 box the photo stretches with them (`object-cover`). Forcing the cards into a fixed 4/3 box at 1024px clips the weekly sentence.
- The rates column is `lg:h-auto lg:min-h-full`. It does not use `overflow-hidden`.
- The heading block stays `lg:shrink-0` at its current size and counts toward the same height.
- Each article is `lg:flex-1` and is not `lg:min-h-0`. Flex can use spare photo height. It cannot shrink a card below its text.
- Vertical padding no longer grows at `lg`. `lg:pb-[1.6rem]` is removed. Padding is `p-[0.8rem]` below `lg` and `lg:p-[0.6rem]` from `lg`, which is what keeps the weekly sentence intact at 1024px. Inner gap is `gap-[1.2rem] lg:gap-[0.8rem]`.

Below `lg`, cards and photo stay stacked. The photo keeps `aspect-[4/3]`. There is no shared height rule.

Leave the five-column grid and the existing `lg:row-span-5` placement as they are.

## Rename

Two view names only:

- In `PracticalInfoSection.astro`, rename the local `kitchenImageSource` to `priceImageSource`. It still reads `p.kitchenImage`.
- In `src/data/adapters/practical-info.ts`, rename `kitchenImageAlt` to `priceImageAlt`. The fallback alt stays `Cuisine de la maison d'hôtes`. The component alt attribute uses `p.priceImageAlt`.

Do not rename the Sanity field `kitchenImage`, the `p.kitchenImage` property, `fallbackKitchenImage`, or `kitchenSanitySrc`.

## Out of scope

- A CMS field for the sentence.
- Changes to `publicRates`, pricing, or schema.org offers.
- Matching the photo height below `lg`.
- A studio schema migration.

## Verification

On `tarifs-et-reservation`, at 1024px and on a wide desktop viewport: the heading plus the five card boxes end level with the bottom of the photo, so the five cards alone stay within the photo. The weekly sentence is fully visible, and the phone is a `tel:` link using the configured number. On a narrow viewport, the fifth card appears under the rates, the link works, and the photo remains a 4/3 stack. Confirm the page’s offer schema still lists only the four nightly rates.
