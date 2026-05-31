import { toAbsoluteUrls } from "@config/public-routes";

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 500;

export type WarmPublicUrlsOptions = {
  baseUrl: string;
  paths: readonly string[];
  fetchImpl?: typeof fetch;
  maxAttempts?: number;
  retryDelayMs?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchPathWithRetry(
  url: string,
  fetchImpl: typeof fetch,
  maxAttempts: number,
  retryDelayMs: number
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        return true;
      }
    } catch {
      // retry below
    }

    if (attempt < maxAttempts) {
      await sleep(retryDelayMs);
    }
  }

  return false;
}

export async function warmPublicUrls({
  baseUrl,
  paths,
  fetchImpl = fetch,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
}: WarmPublicUrlsOptions): Promise<boolean> {
  if (paths.length === 0) {
    return true;
  }

  const urls = toAbsoluteUrls(baseUrl, paths);

  for (const url of urls) {
    const ok = await fetchPathWithRetry(url, fetchImpl, maxAttempts, retryDelayMs);
    if (!ok) {
      console.error("[revalidate] URL warm failed", { url });
      return false;
    }
  }

  return true;
}
