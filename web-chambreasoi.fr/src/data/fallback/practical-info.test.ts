// src/data/fallback/practical-info.test.ts
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

  it("renders the weekly note in the rates column without a fifth tariff", () => {
    const section = readFileSync(
      new URL("../../components/availabily-page/PracticalInfoSection.astro", import.meta.url),
      "utf8"
    );

    expect(section).toContain("Pour une réservation à la semaine, contactez l'hôte au");
    expect(section).toContain("priceImageSource");
    expect(section).toContain("p.priceImageAlt");
    expect(section).toContain("lg:h-full");
    expect(section).not.toContain("lg:min-h-0 lg:flex-1");
    expect(section).not.toContain("kitchenImageSource");
    expect(section).not.toContain("lg:aspect-auto");
    expect(section).toContain("lg:gap-[0.8rem]");
  });
});
