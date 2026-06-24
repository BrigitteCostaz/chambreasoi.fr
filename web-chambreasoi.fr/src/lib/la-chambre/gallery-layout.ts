export type GalleryOrientation = "landscape" | "portrait";

const galleryColumnStartClasses = {
  1: "lg:col-start-1",
  2: "lg:col-start-2",
  3: "lg:col-start-3",
  4: "lg:col-start-4",
  5: "lg:col-start-5",
} as const;

export const getGalleryOrientation = (
  image: {
    sanityImage?: {
      asset?: {
        metadata?: { dimensions?: { width?: number; height?: number } | null } | null;
      } | null;
    } | null;
    image?: { width?: number; height?: number } | null;
  } | null
): GalleryOrientation => {
  const sanityDimensions = image?.sanityImage?.asset?.metadata?.dimensions ?? null;
  const sanityW = sanityDimensions?.width;
  const sanityH = sanityDimensions?.height;
  const fallbackW = image?.image?.width;
  const fallbackH = image?.image?.height;

  const width = sanityW ?? fallbackW ?? null;
  const height = sanityH ?? fallbackH ?? null;

  return width && height && height > width ? "portrait" : "landscape";
};

export const getGalleryColumnSpan = (image: Parameters<typeof getGalleryOrientation>[0]) =>
  getGalleryOrientation(image) === "portrait" ? 1 : 2;

export const getGalleryColumnStart = (
  images: Parameters<typeof getGalleryOrientation>[0][],
  index: number,
  startColumn = 1
) =>
  images
    .slice(0, index)
    .reduce((column, item) => column + (item ? getGalleryColumnSpan(item) : 0), startColumn);

export const getGalleryLayoutClasses = (
  images: Parameters<typeof getGalleryOrientation>[0][],
  index: number,
  startColumn = 1
) => {
  const image = images[index] ?? null;
  const orientation = getGalleryOrientation(image);
  const spanClass = orientation === "portrait" ? "lg:col-span-1" : "lg:col-span-2";
  const aspectClass = orientation === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]";
  const columnStart = getGalleryColumnStart(
    images,
    index,
    startColumn
  ) as keyof typeof galleryColumnStartClasses;
  return [
    aspectClass,
    spanClass,
    galleryColumnStartClasses[columnStart] ?? galleryColumnStartClasses[1],
  ];
};

export const getGalleryImageDimensions = (image: Parameters<typeof getGalleryOrientation>[0]) =>
  getGalleryOrientation(image) === "portrait"
    ? { width: 825, height: 1100 }
    : { width: 1100, height: 825 };

export const getGallerySizes = (image: Parameters<typeof getGalleryOrientation>[0]) =>
  getGalleryOrientation(image) === "portrait"
    ? "(min-width: 1024px) 20vw, 100vw"
    : "(min-width: 1024px) 40vw, 100vw";
