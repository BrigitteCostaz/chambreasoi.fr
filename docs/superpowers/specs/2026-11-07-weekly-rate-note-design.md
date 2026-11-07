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

From the `lg` breakpoint upward, the kitchen photo sets the row height and the five cards fit inside it.

- The figure keeps `aspect-[4/3]`. Remove `lg:aspect-auto`, which currently lets the cards stretch the photo.
- The rates column is `lg:min-h-0 lg:h-full`, so its content cannot grow the grid row. `lg:overflow-hidden` is only a guard.
- The heading block stays `lg:shrink-0` at its current size and counts toward the same height.
- Each of the five articles is `lg:flex-1 lg:min-h-0`. Their boxes share the height left under the heading and end flush with the bottom of the photo.
- Vertical padding no longer grows at `lg`. Drop `lg:pb-[1.6rem]` and keep `p-[0.8rem]`. Inner gap becomes `lg:gap-[0.8rem]` (it stays `gap-[1.2rem]` below `lg`).
- If the weekly sentence is clipped at 1024px, lower the `lg` padding to `0.6rem` before accepting any clipped text.

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
