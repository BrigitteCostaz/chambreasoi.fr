// src/data/adapters/fold.ts
import { defaultFoldContent } from "../fallback/fold";

export type FoldDisplayContent = {
  seoTitle: string;
  mosaicTile1Text: string;
  mosaicTile2Line1: string;
  mosaicTile2Line2: string;
  amenitiesLabel: string;
  amenities: readonly string[];
  bookingNote: string;
};

type FoldTextSource = Partial<{
  seoTitle: string | null;
  mosaicTile1Text: string | null;
  mosaicTile2Line1: string | null;
  mosaicTile2Line2: string | null;
  amenitiesLabel: string | null;
  amenities: string[] | null;
  bookingNote: string | null;
}> | null;

/**
 * Merge CMS fold copy with TypeScript defaults. Images stay on the page props.
 */
export function mergeFoldContent(fold: FoldTextSource): FoldDisplayContent {
  const amenities =
    Array.isArray(fold?.amenities) && fold.amenities.length > 0
      ? fold.amenities.filter((item): item is string => typeof item === "string" && item.trim() !== "")
      : defaultFoldContent.amenities;

  return {
    seoTitle: fold?.seoTitle?.trim() || defaultFoldContent.seoTitle,
    mosaicTile1Text: fold?.mosaicTile1Text?.trim() || defaultFoldContent.mosaicTile1Text,
    mosaicTile2Line1: fold?.mosaicTile2Line1?.trim() || defaultFoldContent.mosaicTile2Line1,
    mosaicTile2Line2: fold?.mosaicTile2Line2?.trim() || defaultFoldContent.mosaicTile2Line2,
    amenitiesLabel: fold?.amenitiesLabel?.trim() || defaultFoldContent.amenitiesLabel,
    amenities: amenities.length > 0 ? amenities : defaultFoldContent.amenities,
    bookingNote: fold?.bookingNote?.trim() || defaultFoldContent.bookingNote,
  };
}
