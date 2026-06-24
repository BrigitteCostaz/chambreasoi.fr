import type {
  SurroundingsAccordionItemResult,
  SurroundingsAccordionResult,
  SurroundingsPageContentResult,
  SurroundingsTextBlockResult,
} from "@lib/sanity";

export type ReservationStatus = "obligatoire" | "conseillee";
export type RichTextMark = "strong" | "em";
export type RichTextSpan = {
  text: string;
  href?: string;
  marks?: RichTextMark[];
};
export type RichTextInline = string | RichTextSpan;
export type RichTextParagraphBlock = string | RichTextInline[];

export type RichTextListBlock = {
  type: "list";
  ordered?: boolean;
  items: RichTextParagraphBlock[];
};

export type RichTextBlock = RichTextParagraphBlock | RichTextListBlock;

export interface SurroundingsImage {
  src: string;
  srcSet?: string | null;
  alt: string;
  caption?: string;
  photoCredit?: WikimediaPhotoCredit;
  width?: number;
  height?: number;
}

export interface WikimediaPhotoCredit {
  commonsFileUrl?: string;
  title: string;
  author: string;
  licenseUrl: string;
  licenseLabel: string;
}

export interface SurroundingsGalleryImage {
  src: string;
  srcSet?: string | null;
  alt: string;
  width?: number;
  height?: number;
  photoCredit?: WikimediaPhotoCredit;
}

export interface SurroundingsItem {
  title: string;
  category?: string;
  body: RichTextBlock[];
  url?: string;
  note?: RichTextBlock;
  reservationRequired?: ReservationStatus;
}

export interface SurroundingsAccordion {
  title: string;
  description?: RichTextBlock;
  items: SurroundingsItem[];
  galleryImages: SurroundingsGalleryImage[];
}

export interface SurroundingsPageContent {
  heroEyebrow: string;
  heroTitle: string;
  proximityStatement: RichTextBlock;
  proximityIntro: RichTextBlock[];
  proximityReassurance: RichTextBlock;
  editorialLead: RichTextBlock;
  images: SurroundingsImage[];
  galleryImages: SurroundingsGalleryImage[];
  accordions: [SurroundingsAccordion, SurroundingsAccordion, SurroundingsAccordion];
}

export type RichTextSlot = {
  sanityBlocks: SurroundingsTextBlockResult[] | null;
  fallback: RichTextBlock;
};

export type RichTextListSlot = {
  sanityBlocks: SurroundingsTextBlockResult[] | null;
  fallback: RichTextBlock[];
};

export type ResolvedSurroundingsItem = {
  title: string;
  category?: string;
  body: RichTextListSlot;
  url?: string;
  note?: RichTextSlot;
  reservationRequired?: ReservationStatus;
};

export type ResolvedSurroundingsAccordion = {
  title: string;
  description?: RichTextSlot;
  items: ResolvedSurroundingsItem[];
  galleryImages: SurroundingsGalleryImage[];
};

export type ResolvedSurroundingsPageContent = {
  heroEyebrow: string;
  heroTitle: string;
  proximityStatement: RichTextSlot;
  proximityIntro: RichTextListSlot;
  proximityReassurance: RichTextSlot;
  editorialLead: RichTextSlot;
  galleryImages: SurroundingsGalleryImage[];
  accordions: [
    ResolvedSurroundingsAccordion,
    ResolvedSurroundingsAccordion,
    ResolvedSurroundingsAccordion,
  ];
};

export type SurroundingsContentInput = {
  sanityContent: SurroundingsPageContentResult | null;
  fallbackContent: SurroundingsPageContent;
  reservationLabels: Record<ReservationStatus, string>;
};

export type ResolveItemArgs = {
  sanityItem: SurroundingsAccordionItemResult | null | undefined;
  fallbackItem: SurroundingsItem;
};
