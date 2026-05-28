/**
 * Image utilities for resolving dynamic local image paths to ImageMetadata.
 *
 * Uses Vite's import.meta.glob to lazily load images from /src/assets/images/.
 * This is useful for:
 * - Fallback images when Sanity images are unavailable
 * - Static assets referenced dynamically (e.g., from config files)
 *
 * For Sanity-hosted images, use `@lib/sanity` exports:
 *   import { buildSanityImageUrl, buildSanityDprSrcSet } from "@lib/sanity";
 */

// Lazy image modules keyed by absolute source path.
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,gif,svg}"
);

// Cache for resolved images to avoid repeated lookups
const imageCache = new Map<string, Promise<ImageMetadata | null>>();

/**
 * Normalize an image path from @images alias to absolute path.
 * @internal
 */
function normalizePath(imagePath: string): string {
  return imagePath.replace(/^@images\//, "/src/assets/images/");
}

/**
 * Resolve an image path (with @images alias) to ImageMetadata.
 *
 * @param imagePath - Path to the image (e.g., "@images/hero.jpg" or "/src/assets/images/hero.jpg")
 * @returns ImageMetadata object or null if not found
 *
 * @example
 * ```ts
 * import { resolveImage } from "@utils/imageUtils";
 * import { Image } from "astro:assets";
 *
 * const heroImage = resolveImage("@images/hero.jpg");
 * if (heroImage) {
 *   <Image src={heroImage} alt="Hero" />
 * }
 * ```
 */
export async function resolveImage(
  imagePath: string | null | undefined
): Promise<ImageMetadata | null> {
  if (!imagePath) return null;

  // Check cache first
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath)!;
  }

  // Normalize the path
  const normalizedPath = normalizePath(imagePath);

  // Look up the image in our glob map
  const imageModuleLoader = imageModules[normalizedPath];
  const imagePromise = (async () => {
    if (!imageModuleLoader) {
      console.warn(
        `[resolveImage] Image not found: "${imagePath}"\n` +
          `  Resolved to: "${normalizedPath}"\n` +
          `  Available paths: ${Object.keys(imageModules).length} images indexed`
      );
      return null;
    }

    const imageModule = await imageModuleLoader();
    return imageModule.default ?? null;
  })();

  imageCache.set(imagePath, imagePromise);
  return imagePromise;
}

/**
 * Resolve multiple image paths at once.
 *
 * @param imagePaths - Array of image paths
 * @returns Array of ImageMetadata objects (null for not found images)
 *
 * @example
 * ```ts
 * const [hero, thumbnail] = resolveImages([
 *   "@images/hero.jpg",
 *   "@images/thumb.jpg"
 * ]);
 * ```
 */
export function resolveImages(
  imagePaths: (string | null | undefined)[]
): Promise<(ImageMetadata | null)[]> {
  return Promise.all(imagePaths.map((imagePath) => resolveImage(imagePath)));
}

/**
 * Check if an image path exists.
 *
 * @param imagePath - Path to check
 * @returns true if the image exists
 *
 * @example
 * ```ts
 * if (imageExists("@images/optional-banner.jpg")) {
 *   // Show banner
 * }
 * ```
 */
export async function imageExists(imagePath: string | null | undefined): Promise<boolean> {
  return (await resolveImage(imagePath)) !== null;
}

/**
 * Resolve an image with a fallback.
 *
 * @param imagePath - Primary image path
 * @param fallbackPath - Fallback image path if primary not found
 * @returns ImageMetadata object or null if neither found
 *
 * @example
 * ```ts
 * const image = resolveImageWithFallback(
 *   dynamicImagePath,
 *   "@images/placeholder.jpg"
 * );
 * ```
 */
export async function resolveImageWithFallback(
  imagePath: string | null | undefined,
  fallbackPath: string
): Promise<ImageMetadata | null> {
  return (await resolveImage(imagePath)) ?? (await resolveImage(fallbackPath));
}

/**
 * Get all available image paths.
 * Useful for debugging or generating image listings.
 *
 * @returns Array of all loaded image paths with @images alias
 */
export function getAllImagePaths(): string[] {
  return Object.keys(imageModules).map((path) =>
    path.replace(/^\/src\/assets\/images\//, "@images/")
  );
}

/**
 * Clear the image resolution cache.
 * Useful in development if you're adding images dynamically.
 */
export function clearImageCache(): void {
  imageCache.clear();
}
