import {
  buildSanityDprSrcSet,
  buildSanityImageUrl,
  type PracticalInfoAccent,
  type PracticalInfoContentResult,
} from "@lib/sanity";
import { resolveImage } from "@utils/imageUtils";
import {
  accentClasses,
  bookingCardPositionClasses,
  defaultBookingCards,
  defaultServiceCards,
  fallbackServiceImages,
  serviceDesktopPositionClassesByCount,
  tariffAccentClasses,
  tariffColClasses,
} from "../fallback/practical-info";

const serviceImageWidth = 1400;
const serviceImageHeight = 1000;

const hasSanityAsset = (
  image:
    | {
        asset?: { _ref?: string; _id?: string; url?: string } | null;
      }
    | null
    | undefined
) => Boolean(image?.asset && (image.asset._ref || image.asset._id || image.asset.url));

export const getPracticalInfoRenderModel = async (
  practicalInfo: PracticalInfoContentResult | null
) => {
  const [fallbackKitchenImage, fallbackBookingImage] = await Promise.all([
    resolveImage("@images/chambreasoi-home-01.png"),
    resolveImage("@images/chambreasoi-trinkets.png"),
  ]);

  const p = {
    eyebrow: practicalInfo?.eyebrow ?? "Infos pratiques",
    tariffsHeading: practicalInfo?.tariffsHeading ?? "Tarifs pour une nuitée",
    kitchenImage: practicalInfo?.kitchenImage ?? null,
    kitchenImageAlt: practicalInfo?.kitchenImage?.alt ?? "Cuisine de la maison d'hôtes",
    bookingHeading: practicalInfo?.bookingHeading ?? "Modalités de réservation",
    bookingEyebrow: practicalInfo?.bookingEyebrow ?? null,
    bookingImage: practicalInfo?.bookingImage ?? null,
    bookingImageAlt:
      practicalInfo?.bookingImage?.alt ?? "Détail de la décoration et des équipements",
    bookingCards: practicalInfo?.bookingCards?.length
      ? practicalInfo.bookingCards
      : defaultBookingCards,
    servicesEyebrow: practicalInfo?.servicesEyebrow ?? "Services",
    servicesHeading: practicalInfo?.servicesHeading ?? "Accompagnements",
    serviceCards: practicalInfo?.serviceCards?.length
      ? practicalInfo.serviceCards
      : defaultServiceCards,
  };

  const kitchenSanitySource = hasSanityAsset(p.kitchenImage) ? p.kitchenImage : null;
  const kitchenSanitySrc = buildSanityImageUrl({
    source: kitchenSanitySource,
    width: 1400,
    height: 914,
    quality: 80,
    format: "webp",
    fit: "crop",
  });
  const kitchenSanitySrcSet = buildSanityDprSrcSet({
    source: kitchenSanitySource,
    width: 1400,
    height: 914,
    dprs: [1, 1.5, 2],
    quality: 80,
    format: "webp",
    fit: "crop",
  });

  const bookingSanitySource = hasSanityAsset(p.bookingImage) ? p.bookingImage : null;
  const bookingSanitySrc = buildSanityImageUrl({
    source: bookingSanitySource,
    width: 900,
    height: 1200,
    quality: 80,
    format: "webp",
    fit: "crop",
  });
  const bookingSanitySrcSet = buildSanityDprSrcSet({
    source: bookingSanitySource,
    width: 900,
    height: 1200,
    dprs: [1, 1.5, 2],
    quality: 80,
    format: "webp",
    fit: "crop",
  });

  const serviceImages = practicalInfo?.serviceImages?.length
    ? practicalInfo.serviceImages.map((image, index) => {
        const fallback =
          fallbackServiceImages[index] ??
          fallbackServiceImages[index % fallbackServiceImages.length];
        return {
          ...fallback,
          alt: image.alt ?? fallback.alt,
          sanityImage: hasSanityAsset(image) ? image : null,
        };
      })
    : fallbackServiceImages;

  const resolvedServiceImages = await Promise.all(
    serviceImages.map(async (image) => {
      const sanityImage = hasSanityAsset(image.sanityImage) ? image.sanityImage : null;
      const sanitySrc = buildSanityImageUrl({
        source: sanityImage,
        width: serviceImageWidth,
        height: serviceImageHeight,
        quality: 80,
        format: "webp",
        fit: "crop",
      });
      const sanitySrcSet = buildSanityDprSrcSet({
        source: sanityImage,
        width: serviceImageWidth,
        height: serviceImageHeight,
        dprs: [1, 1.5, 2],
        quality: 80,
        format: "webp",
        fit: "crop",
      });
      return {
        ...image,
        sanitySrc,
        sanitySrcSet,
        fallbackImage: image.fallbackImagePath ? await resolveImage(image.fallbackImagePath) : null,
      };
    })
  );

  const displayedServiceCards = p.serviceCards.slice(0, 5);
  const serviceDesktopPositionClasses =
    serviceDesktopPositionClassesByCount[
      displayedServiceCards.length as keyof typeof serviceDesktopPositionClassesByCount
    ] ?? serviceDesktopPositionClassesByCount[5];
  const mobileServiceItemCount = Math.max(
    displayedServiceCards.length,
    Math.min(resolvedServiceImages.length, 4)
  );
  const getServiceImage = (index: number) =>
    resolvedServiceImages[index] ?? resolvedServiceImages[index % resolvedServiceImages.length];

  return {
    p,
    accentClasses: accentClasses as Record<PracticalInfoAccent, string>,
    tariffColClasses,
    tariffAccentClasses,
    bookingCardPositionClasses,
    kitchenSanitySrc,
    kitchenSanitySrcSet,
    bookingSanitySrc,
    bookingSanitySrcSet,
    fallbackKitchenImage,
    fallbackBookingImage,
    resolvedServiceImages,
    displayedServiceCards,
    serviceDesktopPositionClasses,
    mobileServiceItemCount,
    getServiceImage,
    serviceImageWidth,
    serviceImageHeight,
  };
};
