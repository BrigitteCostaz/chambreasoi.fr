import { getGalleryImageDimensions } from "@lib/la-chambre/gallery-layout";
import {
  buildSanityDprSrcSet,
  buildSanityImageUrl,
  type RoomPageCardResult,
  type RoomPageContentResult,
  type RoomPageImageResult,
  type RoomPageSectionResult,
} from "@lib/sanity";
import { resolveImage } from "@utils/imageUtils";
import {
  type ContentCard,
  defaultPrivateCards,
  defaultServiceCards,
  defaultSharedCards,
} from "../fallback/la-chambre";

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
  return images.map((image) => {
    const { width, height } = getGalleryImageDimensions(image);
    return withSanityImageSources(image, width, height);
  });
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

async function resolveFallbackGalleryImages() {
  const [
    room01Image,
    room02Image,
    livingroom01Image,
    livingroom02Image,
    livingroom03Image,
    bathroom01Image,
    terrace01Image,
    cuisineImage,
    gardenImage01,
    gardenImage02,
    gardenImage03,
  ] = await Promise.all([
    resolveImage("@images/chambreasoi-room-01.png"),
    resolveImage("@images/chambreasoi-room-02.png"),
    resolveImage("@images/chambreasoi-livingroom-01.png"),
    resolveImage("@images/chambreasoi-livingroom-02.png"),
    resolveImage("@images/chambreasoi-livingroom-03.png"),
    resolveImage("@images/chambreasoi-bathroom-01.png"),
    resolveImage("@images/chambreasoi-terrace-01.png"),
    resolveImage("@images/chambreasoi-cuisine.png"),
    resolveImage("@images/chambreasoi-garden-01.png"),
    resolveImage("@images/chambreasoi-garden-02.png"),
    resolveImage("@images/chambreasoi-garden-03.png"),
  ]);

  return {
    room02Image,
    defaultPrivateGalleryImages: [
      {
        image: room01Image,
        alt: "Chambre lumineuse avec lit double, linge de lit et décoration sobre",
      },
      {
        image: bathroom01Image,
        alt: "Salle de bain privative avec douche et linge de toilette",
      },
      {
        image: terrace01Image,
        alt: "Terrasse en bois accessible directement depuis la chambre",
      },
    ] satisfies GalleryImage[],
    defaultSharedGalleryImages: [
      {
        image: gardenImage01,
        alt: "Salle à manger lumineuse ouverte sur la terrasse",
      },
      {
        image: cuisineImage,
        alt: "Cuisine équipée avec réfrigérateur, évier, plaques et micro-ondes",
      },
      {
        image: livingroom02Image,
        alt: "Espace salle à manger et salon commun dans une ambiance conviviale",
      },
    ] satisfies GalleryImage[],
    defaultServiceGalleryImages: [
      {
        image: livingroom03Image,
        alt: "Chambre avec lit double, dressing et rangements",
      },
      {
        image: gardenImage02,
        alt: "Chambre avec lit double, dressing et rangements",
      },
      {
        image: gardenImage03,
        alt: "Accès extérieur pratique depuis la chambre",
      },
    ] satisfies GalleryImage[],
    livingroom01Image,
  };
}

export async function getLaChambrePageModel(roomPageContent: RoomPageContentResult | null) {
  const {
    room02Image,
    defaultPrivateGalleryImages,
    defaultSharedGalleryImages,
    defaultServiceGalleryImages,
    livingroom01Image,
  } = await resolveFallbackGalleryImages();

  const p = {
    heroEyebrow: roomPageContent?.heroEyebrow ?? "La chambre",
    heroTitle:
      roomPageContent?.heroTitle ??
      "Chambre confortable avec terrasse et accès aux espaces communs",
    privateSection: getSection(roomPageContent?.privateSection, {
      eyebrow: "Un séjour tout confort",
      heading: "Sur place, vous bénéficiez de plusieurs commodités",
      featureImage: {
        image: room02Image,
        alt: "Chambre confortable avec lit double, dressing et espace bureau",
      },
      cards: defaultPrivateCards,
      galleryImages: defaultPrivateGalleryImages,
    }),
    sharedSection: getSection(roomPageContent?.sharedSection, {
      eyebrow: "Espace commun",
      heading: "Des espaces partagés pour vos moments de détente",
      introText:
        "Un espace partagé avec l'hôte (accessible entre 18h et 22h30) qui va vous permettre de profiter de vos soirées chez nous en apportant ou achetant au bourg de quoi vous préparer un repas léger ou votre petit déjeuner.",
      featureImage: {
        image: livingroom01Image,
        alt: "Espace salon partagé pour les moments de détente",
      },
      cards: defaultSharedCards,
      galleryImages: defaultSharedGalleryImages,
    }),
    serviceSection: getSection(roomPageContent?.serviceSection, {
      eyebrow: "Confort au quotidien",
      heading: "Services et équipements",
      featureImage: {
        image: null,
        alt: "Espace bureau et rangements de la chambre",
      },
      cards: defaultServiceCards,
      galleryImages: defaultServiceGalleryImages,
    }),
  };

  const hasServiceFeatureImage = Boolean(
    p.serviceSection.featureImage.sanitySrc || p.serviceSection.featureImage.image
  );

  return { p, hasServiceFeatureImage };
}
