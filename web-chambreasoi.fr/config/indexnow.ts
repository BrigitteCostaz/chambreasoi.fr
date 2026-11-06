import { normalizeBaseUrl, toAbsoluteUrls } from "@config/public-routes";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export function getIndexNowKeyLocation(baseUrl: string, key: string): string {
  return `${normalizeBaseUrl(baseUrl)}/${key}.txt`;
}

export function getIndexNowHost(baseUrl: string): string {
  return new URL(normalizeBaseUrl(baseUrl)).hostname;
}

export function buildIndexNowPayload(
  host: string,
  key: string,
  keyLocation: string,
  urlList: string[]
) {
  return {
    host,
    key,
    keyLocation,
    urlList,
  };
}

export type SubmitIndexNowOptions = {
  key: string;
  baseUrl: string;
  urlList: string[];
  fetchImpl?: typeof fetch;
};

export async function submitIndexNow({
  key,
  baseUrl,
  urlList,
  fetchImpl = fetch,
}: SubmitIndexNowOptions): Promise<boolean> {
  if (urlList.length === 0) {
    return false;
  }

  const host = getIndexNowHost(baseUrl);
  const keyLocation = getIndexNowKeyLocation(baseUrl, key);
  const payload = buildIndexNowPayload(host, key, keyLocation, urlList);

  try {
    const response = await fetchImpl(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 200 || response.status === 202) {
      return true;
    }

    const body = (await response.text()).slice(0, 300);
    console.error("[indexnow] Submission rejected", {
      status: response.status,
      body,
      urlCount: urlList.length,
    });
    return false;
  } catch (error) {
    console.error("[indexnow] Submission failed", error);
    return false;
  }
}

export { toAbsoluteUrls };
