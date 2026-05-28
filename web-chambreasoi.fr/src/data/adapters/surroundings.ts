import type {
  ResolvedSurroundingsAccordion,
  ResolvedSurroundingsItem,
  ResolvedSurroundingsPageContent,
  RichTextListSlot,
  RichTextSlot,
  SurroundingsContentInput,
  SurroundingsItem,
} from "@components/surroundings-page/types";
import type {
  SurroundingsAccordionItemResult,
  SurroundingsAccordionResult,
  SurroundingsTextBlockResult,
} from "@lib/sanity";

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
    accordions,
  };
};
