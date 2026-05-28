import {
  buildSanityDprSrcSet,
  buildSanityImageUrl,
  type RoomPageCardResult,
  type RoomPageImageResult,
  type RoomPageSectionResult,
} from "@lib/sanity";
import type { ContentCard } from "../fallback/la-chambre";

export interface GalleryImage {
  image: ImageMetadata | null;
  alt: string;
  sanityImage?: RoomPageImageResult | null;
  sanitySrc?: string | null;
  sanitySrcSet?: string | null;
}

const hasSanityAsset = (image: RoomPageImageResult | null | undefined) =>
  Boolean(image?.asset && (image.asset._ref || image.asset._id || image.asset.url));

const normalizeCards = (
  sanityCards: RoomPageCardResult[] | null | undefined,
  fallbackCards: ContentCard[]
): ContentCard[] =>
  sanityCards?.length
    ? sanityCards.map((card, index) => {
        const fallback =
          fallbackCards[index] ?? fallbackCards[index % fallbackCards.length] ?? fallbackCards[0];
        return {
          _key: card._key,
          title: card.title ?? fallback.title,
          body: card.body ?? fallback.body,
          accent: card.accent ?? fallback.accent,
        };
      })
    : fallbackCards;

const withSanityImageSources = (
  image: GalleryImage,
  width: number,
  height: number
): GalleryImage => {
  const sanityImage = hasSanityAsset(image.sanityImage) ? image.sanityImage : null;
  return {
    ...image,
    sanityImage,
    sanitySrc: buildSanityImageUrl({
      source: sanityImage,
      width,
      height,
      quality: 80,
      format: "webp",
      fit: "crop",
    }),
    sanitySrcSet: buildSanityDprSrcSet({
      source: sanityImage,
      width,
      height,
      dprs: [1, 1.5, 2],
      quality: 80,
      format: "webp",
      fit: "crop",
    }),
  };
};

const resolveFeatureImage = (
  fallbackImage: ImageMetadata | null,
  fallbackAlt: string,
  sanityImage: RoomPageImageResult | null | undefined,
  loading: "eager" | "lazy"
) => ({
  ...withSanityImageSources(
    { image: fallbackImage, alt: sanityImage?.alt ?? fallbackAlt, sanityImage },
    1400,
    1000
  ),
  loading,
});

const resolveGalleryImages = (
  fallbackImages: GalleryImage[],
  sanityImages: RoomPageImageResult[] | null | undefined
) => {
  const images = sanityImages?.length
    ? sanityImages.map((sanityImage, index) => {
        const fallback =
          fallbackImages[index] ??
          fallbackImages[index % fallbackImages.length] ??
          fallbackImages[0];
        return { ...fallback, alt: sanityImage.alt ?? fallback.alt, sanityImage };
      })
    : fallbackImages;
  return images.map((image) => withSanityImageSources(image, 1100, 825));
};

export const getSection = (
  sanitySection: RoomPageSectionResult | null | undefined,
  fallback: {
    eyebrow: string;
    heading: string;
    introText?: string;
    featureImage: GalleryImage;
    cards: ContentCard[];
    galleryImages: GalleryImage[];
  }
) => ({
  eyebrow: sanitySection?.eyebrow ?? fallback.eyebrow,
  heading: sanitySection?.heading ?? fallback.heading,
  introText: sanitySection?.introText ?? fallback.introText ?? null,
  featureImage: resolveFeatureImage(
    fallback.featureImage.image,
    fallback.featureImage.alt,
    sanitySection?.featureImage,
    fallback.eyebrow === "Un séjour tout confort" ? "eager" : "lazy"
  ),
  cards: normalizeCards(sanitySection?.cards, fallback.cards),
  galleryImages: resolveGalleryImages(fallback.galleryImages, sanitySection?.galleryImages),
});
