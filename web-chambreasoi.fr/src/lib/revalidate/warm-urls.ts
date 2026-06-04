import { toAbsoluteUrls } from "@config/public-routes";

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 500;
const DEFAULT_REQUEST_TIMEOUT_MS = 25_000;

export type WarmPublicUrlsOptions = {
  baseUrl: string;
  paths: readonly string[];
  fetchImpl?: typeof fetch;
  maxAttempts?: number;
  retryDelayMs?: number;
  requestTimeoutMs?: number;
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
  retryDelayMs: number,
  requestTimeoutMs: number
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });

      if (response.ok) {
        return true;
      }

      console.warn("[revalidate] URL warm non-OK response", {
        url,
        status: response.status,
        attempt,
      });
    } catch (error) {
      console.warn("[revalidate] URL warm request failed", {
        url,
        attempt,
        error: error instanceof Error ? error.message : error,
      });
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
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
}: WarmPublicUrlsOptions): Promise<boolean> {
  if (paths.length === 0) {
    return true;
  }

  const urls = toAbsoluteUrls(baseUrl, paths);

  for (const url of urls) {
    const ok = await fetchPathWithRetry(
      url,
      fetchImpl,
      maxAttempts,
      retryDelayMs,
      requestTimeoutMs
    );
    if (!ok) {
      console.error("[revalidate] URL warm failed", { url });
      return false;
    }
  }

  return true;
}
