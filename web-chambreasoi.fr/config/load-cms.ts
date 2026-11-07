// config/load-cms.ts
/**
 * Load a CMS-backed value once per call. On failure, report and return the
 * TypeScript fallback. Edge Cache-Control (middleware) is the cache that
 * revalidate can purge — do not memoize across requests in isolate memory.
 */
export async function loadCms<T>(
  load: () => Promise<T>,
  fallback: T,
  onFallback: (error: unknown) => void
): Promise<T> {
  try {
    return await load();
  } catch (error) {
    onFallback(error);
    return fallback;
  }
}
