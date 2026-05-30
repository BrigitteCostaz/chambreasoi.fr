import type {
  ResolvedSurroundingsAccordion,
  ResolvedSurroundingsItem,
  ResolvedSurroundingsPageContent,
  RichTextListSlot,
  RichTextSlot,
  SurroundingsContentInput,
  SurroundingsGalleryImage,
  SurroundingsItem,
  WikimediaPhotoCredit,
} from "@components/surroundings-page/types";
import { buildSanityDprSrcSet, buildSanityImageUrl } from "@chambreasoi/sanity/image";
import type {
  SurroundingsAccordionItemResult,
  SurroundingsAccordionResult,
  SurroundingsGalleryImageResult,
  SurroundingsTextBlockResult,
} from "@chambreasoi/sanity/queries";

const GALLERY_WIDTH = 1400;
const GALLERY_HEIGHT = 1225;
const DEFAULT_LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
const DEFAULT_LICENSE_LABEL = "CC BY-SA 4.0";

const resolvePhotoCredit = (
  sanityCredit: SurroundingsGalleryImageResult["photoCredit"],
  fallbackCredit?: WikimediaPhotoCredit
): WikimediaPhotoCredit | undefined => {
  const commonsFileUrl = sanityCredit?.commonsFileUrl?.trim();
  const title = sanityCredit?.title?.trim();
  const author = sanityCredit?.author?.trim();

  if (commonsFileUrl && title && author) {
    return {
      commonsFileUrl,
      title,
      author,
      licenseUrl: sanityCredit?.licenseUrl?.trim() || DEFAULT_LICENSE_URL,
      licenseLabel: sanityCredit?.licenseLabel?.trim() || DEFAULT_LICENSE_LABEL,
    };
  }

  return fallbackCredit;
};

const hasSanityGalleryAsset = (image: SurroundingsGalleryImageResult | null | undefined) =>
  Boolean(image?.asset && (image.asset._ref || image.asset._id || image.asset.url));

const resolveSanityGalleryImages = (
  sanityImages: SurroundingsGalleryImageResult[] | null | undefined,
  fallback: SurroundingsGalleryImage[]
): SurroundingsGalleryImage[] => {
  const cmsImages = sanityImages?.filter(hasSanityGalleryAsset) ?? [];
  if (!cmsImages.length) {
    return fallback;
  }

  return cmsImages.flatMap((image, index) => {
    const fallbackItem =
      fallback[index] ??
      (fallback.length > 0 ? fallback[index % fallback.length] : undefined) ??
      fallback[0];
    const source = { asset: image.asset, alt: image.alt };
    const src = buildSanityImageUrl({
      source,
      width: GALLERY_WIDTH,
      height: GALLERY_HEIGHT,
      quality: 80,
      format: "webp",
      fit: "crop",
    });

    if (!src) {
      return fallbackItem ? [fallbackItem] : [];
    }

    const photoCredit = resolvePhotoCredit(image.photoCredit, fallbackItem?.photoCredit);

    return [
      {
        src,
        srcSet: buildSanityDprSrcSet({
          source,
          width: GALLERY_WIDTH,
          height: GALLERY_HEIGHT,
          dprs: [1, 1.5, 2],
          quality: 80,
          format: "webp",
          fit: "crop",
        }),
        alt: image.alt ?? fallbackItem?.alt ?? "",
        width: GALLERY_WIDTH,
        height: GALLERY_HEIGHT,
        ...(photoCredit ? { photoCredit } : {}),
      },
    ];
  });
};

const hasPortableTextContent = (blocks: SurroundingsTextBlockResult[] | null | undefined) =>
  Boolean(
    blocks?.some((block) =>
      block.children?.some((span) => typeof span.text === "string" && span.text.trim().length > 0)
    )
  );

const richTextSlot = (
  sanityBlocks: SurroundingsTextBlockResult[] | null | undefined,
  fallback: RichTextSlot["fallback"]
): RichTextSlot => ({
  sanityBlocks: hasPortableTextContent(sanityBlocks) ? (sanityBlocks ?? null) : null,
  fallback,
});

const richTextListSlot = (
  sanityBlocks: SurroundingsTextBlockResult[] | null | undefined,
  fallback: RichTextListSlot["fallback"]
): RichTextListSlot => ({
  sanityBlocks: hasPortableTextContent(sanityBlocks) ? (sanityBlocks ?? null) : null,
  fallback,
});

const resolveItem = (
  sanityItem: SurroundingsAccordionItemResult | null | undefined,
  fallbackItem: SurroundingsItem | ResolvedSurroundingsItem
): ResolvedSurroundingsItem => {
  const fallbackBody =
    "sanityBlocks" in fallbackItem.body ? fallbackItem.body.fallback : fallbackItem.body;
  const item: ResolvedSurroundingsItem = {
    title: sanityItem?.title ?? fallbackItem.title,
    body: richTextListSlot(sanityItem?.body, fallbackBody),
  };

  const category = sanityItem?.category ?? fallbackItem.category;
  if (category) item.category = category;

  const url = sanityItem?.url ?? fallbackItem.url;
  if (url) item.url = url;

  const reservationRequired = sanityItem?.reservationRequired ?? fallbackItem.reservationRequired;
  if (reservationRequired) item.reservationRequired = reservationRequired;

  const fallbackNote =
    typeof fallbackItem.note === "object" && fallbackItem.note && "sanityBlocks" in fallbackItem.note
      ? fallbackItem.note.fallback
      : fallbackItem.note;

  if (hasPortableTextContent(sanityItem?.note) || fallbackNote) {
    item.note = richTextSlot(sanityItem?.note, fallbackNote ?? "");
  }

  return item;
};

const resolveAccordion = (
  sanityAccordion: SurroundingsAccordionResult | null | undefined,
  fallbackAccordion: ResolvedSurroundingsPageContent["accordions"][number]
): ResolvedSurroundingsAccordion => {
  const accordion: ResolvedSurroundingsAccordion = {
    title: sanityAccordion?.title ?? fallbackAccordion.title,
    galleryImages: resolveSanityGalleryImages(
      sanityAccordion?.galleryImages,
      fallbackAccordion.galleryImages
    ),
    items: sanityAccordion?.items?.length
      ? sanityAccordion.items.map((item, index) => {
          const fallback =
            fallbackAccordion.items[index] ??
            fallbackAccordion.items[index % fallbackAccordion.items.length] ??
            fallbackAccordion.items[0];
          return resolveItem(item, fallback);
        })
      : fallbackAccordion.items.map((item) => resolveItem(null, item)),
  };

  if (hasPortableTextContent(sanityAccordion?.description) || fallbackAccordion.description) {
    const fallbackDescription =
      fallbackAccordion.description && "sanityBlocks" in fallbackAccordion.description
        ? fallbackAccordion.description.fallback
        : fallbackAccordion.description;
    accordion.description = richTextSlot(
      sanityAccordion?.description,
      fallbackDescription ?? ""
    );
  }

  return accordion;
};

const toResolvedFallbackAccordions = (
  accordions: SurroundingsContentInput["fallbackContent"]["accordions"]
): ResolvedSurroundingsPageContent["accordions"] =>
  accordions.map((accordion) => ({
    title: accordion.title,
    galleryImages: accordion.galleryImages,
    description: accordion.description
      ? { sanityBlocks: null, fallback: accordion.description }
      : undefined,
    items: accordion.items.map((item) => ({
      title: item.title,
      category: item.category,
      body: { sanityBlocks: null, fallback: item.body },
      url: item.url,
      note: item.note ? { sanityBlocks: null, fallback: item.note } : undefined,
      reservationRequired: item.reservationRequired,
    })),
  })) as ResolvedSurroundingsPageContent["accordions"];

export const resolveSurroundingsPageContent = ({
  sanityContent,
  fallbackContent,
}: SurroundingsContentInput): ResolvedSurroundingsPageContent => {
  const resolvedFallbackAccordions = toResolvedFallbackAccordions(fallbackContent.accordions);
  const sanityAccordions = sanityContent?.accordions;

  const accordions =
    sanityAccordions?.length === 3
      ? (sanityAccordions.map((accordion, index) =>
          resolveAccordion(
            accordion,
            resolvedFallbackAccordions[index] ?? resolvedFallbackAccordions[0]
          )
        ) as ResolvedSurroundingsPageContent["accordions"])
      : (resolvedFallbackAccordions.map((accordion) =>
          resolveAccordion(null, accordion)
        ) as ResolvedSurroundingsPageContent["accordions"]);

  return {
    heroEyebrow: sanityContent?.heroEyebrow ?? fallbackContent.heroEyebrow,
    heroTitle: sanityContent?.heroTitle ?? fallbackContent.heroTitle,
    editorialLead: richTextSlot(sanityContent?.editorialLead, fallbackContent.editorialLead),
    proximityStatement: richTextSlot(
      sanityContent?.proximityStatement,
      fallbackContent.proximityStatement
    ),
    proximityIntro: richTextListSlot(sanityContent?.proximityIntro, fallbackContent.proximityIntro),
    proximityReassurance: richTextSlot(
      sanityContent?.proximityReassurance,
      fallbackContent.proximityReassurance
    ),
    images: fallbackContent.images,
    galleryImages: resolveSanityGalleryImages(
      sanityContent?.galleryImages,
      fallbackContent.galleryImages
    ),
    accordions,
  };
};
