// packages/sanity/src/imageUrl.widthSrcSet.test.ts
import { describe, expect, it } from "vitest";
import { resolveSrcSetWidths } from "./imageUrl";

describe("resolveSrcSetWidths", () => {
  it("caps the ladder at width * 2 and always includes the design width", () => {
    expect(resolveSrcSetWidths(800)).toEqual([
      320, 480, 640, 768, 800, 960, 1024, 1200, 1280, 1440, 1600,
    ]);
  });

  it("accepts an explicit widths list and still includes width and max", () => {
    expect(resolveSrcSetWidths(400, [200, 400, 900])).toEqual([200, 400, 800]);
  });
});
