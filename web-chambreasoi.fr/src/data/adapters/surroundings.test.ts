import { describe, expect, it } from "vitest";
import { resolveSurroundingsPageContent } from "./surroundings";
import { fallbackContent, reservationLabels } from "../../data/fallback/surroundings";

describe("resolveSurroundingsPageContent", () => {
  it("keeps exactly three accordions from fallback model", () => {
    const resolved = resolveSurroundingsPageContent({
      sanityContent: null,
      fallbackContent,
      reservationLabels,
    });

    expect(resolved.accordions).toHaveLength(3);
  });

  it("uses sane fallback title values when Sanity content is missing", () => {
    const resolved = resolveSurroundingsPageContent({
      sanityContent: null,
      fallbackContent,
      reservationLabels,
    });

    expect(resolved.heroTitle).toBe(fallbackContent.heroTitle);
    expect(resolved.heroEyebrow).toBe(fallbackContent.heroEyebrow);
  });
});
