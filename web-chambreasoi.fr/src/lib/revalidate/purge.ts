import { ALL_PUBLIC_ROUTES, toAbsoluteUrls } from "@config/public-routes";

export { ALL_PUBLIC_ROUTES };

const DEFAULT_BASE_URL = "https://chambreasoi.fr";
const PURGE_API = "https://api.cloudflare.com/client/v4";

type CloudflarePurgeResponse = {
  success?: boolean;
  errors?: Array<{ code?: number; message?: string }>;
};

export function buildCloudflarePurgePayload(
  paths: readonly string[] = ALL_PUBLIC_ROUTES,
  baseUrl: string = DEFAULT_BASE_URL
) {
  return {
    files: toAbsoluteUrls(baseUrl, paths),
  };
}

function formatCloudflarePurgeError(
  status: number,
  payload: CloudflarePurgeResponse | null,
  rawBody: string
): string {
  const messages = payload?.errors?.map((error) => error.message).filter(Boolean) ?? [];

  if (messages.length > 0) {
    return messages.join("; ");
  }

  if (rawBody.trim()) {
    return rawBody.slice(0, 200);
  }

  return `HTTP ${status}`;
}

export type PurgeCloudflareCacheOptions = {
  zoneId: string;
  apiToken: string;
  paths: readonly string[];
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export type PurgeCloudflareCacheResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

export async function purgeCloudflareCache({
  zoneId,
  apiToken,
  paths,
  baseUrl = DEFAULT_BASE_URL,
  fetchImpl = fetch,
}: PurgeCloudflareCacheOptions): Promise<PurgeCloudflareCacheResult> {
  const response = await fetchImpl(`${PURGE_API}/zones/${zoneId.trim()}/purge_cache`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildCloudflarePurgePayload(paths, baseUrl)),
  });

  const rawBody = await response.text();
  let payload: CloudflarePurgeResponse | null = null;

  try {
    payload = JSON.parse(rawBody) as CloudflarePurgeResponse;
  } catch {
    payload = null;
  }

  if (response.ok && payload?.success !== false) {
    return { ok: true };
  }

  return {
    ok: false,
    status: response.status,
    error: formatCloudflarePurgeError(response.status, payload, rawBody),
  };
}
