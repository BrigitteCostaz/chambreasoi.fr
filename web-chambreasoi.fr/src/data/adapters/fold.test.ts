// src/data/adapters/fold.test.ts
import { describe, expect, it } from "vitest";
import { defaultFoldContent } from "../fallback/fold";
import { mergeFoldContent } from "./fold";

describe("mergeFoldContent", () => {
  it("returns defaults when CMS document is missing", () => {
    expect(mergeFoldContent(null)).toEqual({
      seoTitle: defaultFoldContent.seoTitle,
      mosaicTile1Text: defaultFoldContent.mosaicTile1Text,
      mosaicTile2Line1: defaultFoldContent.mosaicTile2Line1,
      mosaicTile2Line2: defaultFoldContent.mosaicTile2Line2,
      amenitiesLabel: defaultFoldContent.amenitiesLabel,
      amenities: defaultFoldContent.amenities,
      bookingNote: defaultFoldContent.bookingNote,
    });
  });

  it("prefers CMS text over defaults", () => {
    const merged = mergeFoldContent({
      seoTitle: "CMS title",
      mosaicTile1Text: "Tile 1",
      mosaicTile2Line1: "Line 1",
      mosaicTile2Line2: "Line 2",
      amenitiesLabel: "avec",
      amenities: ["un spa"],
      bookingNote: "sur demande",
    });

    expect(merged.seoTitle).toBe("CMS title");
    expect(merged.amenities).toEqual(["un spa"]);
    expect(merged.bookingNote).toBe("sur demande");
  });

  it("falls back amenities when CMS list is empty", () => {
    const merged = mergeFoldContent({
      amenities: [],
    });

    expect(merged.amenities).toEqual(defaultFoldContent.amenities);
  });
});
