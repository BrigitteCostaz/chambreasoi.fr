import { describe, expect, it } from "vitest";
import {
  getGalleryColumnStart,
  getGalleryImageDimensions,
  getGalleryLayoutClasses,
  getGalleryOrientation,
} from "./gallery-layout";

describe("getGalleryOrientation", () => {
  it("detects portrait from fallback image dimensions", () => {
    expect(getGalleryOrientation({ image: { width: 1560, height: 2080 } })).toBe("portrait");
  });

  it("detects landscape from fallback image dimensions", () => {
    expect(getGalleryOrientation({ image: { width: 2080, height: 1560 } })).toBe("landscape");
  });

  it("falls back to local dimensions when Sanity metadata is missing", () => {
    expect(
      getGalleryOrientation({
        sanityImage: { asset: { metadata: { dimensions: null } } },
        image: { width: 1560, height: 2080 },
      })
    ).toBe("portrait");
  });
});

describe("getGalleryImageDimensions", () => {
  it("returns portrait dimensions for portrait images", () => {
    expect(getGalleryImageDimensions({ image: { width: 1560, height: 2080 } })).toEqual({
      width: 825,
      height: 1100,
    });
  });

  it("returns landscape dimensions for landscape images", () => {
    expect(getGalleryImageDimensions({ image: { width: 2080, height: 1560 } })).toEqual({
      width: 1100,
      height: 825,
    });
  });
});

describe("getGalleryColumnStart", () => {
  const privateGallery = [
    { image: { width: 2080, height: 1386 } },
    { image: { width: 2080, height: 1560 } },
    { image: { width: 1560, height: 2080 } },
  ];

  it("places two landscapes and one portrait on columns 1, 3, and 5", () => {
    expect(getGalleryColumnStart(privateGallery, 0)).toBe(1);
    expect(getGalleryColumnStart(privateGallery, 1)).toBe(3);
    expect(getGalleryColumnStart(privateGallery, 2)).toBe(5);
  });

  it("assigns portrait layout classes to the third private gallery image", () => {
    expect(getGalleryLayoutClasses(privateGallery, 2)).toEqual([
      "aspect-[3/4]",
      "lg:col-span-1",
      "lg:col-start-5",
    ]);
  });
});
