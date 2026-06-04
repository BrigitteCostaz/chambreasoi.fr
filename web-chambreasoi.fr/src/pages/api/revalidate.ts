import { invalidateCmsCache } from "@config/cache";
import { resolvePathsFromWebhook } from "@config/cms-route-map";
import { submitIndexNow, toAbsoluteUrls } from "@config/indexnow";
import { ALL_PUBLIC_ROUTES, normalizeBaseUrl } from "@config/public-routes";
import { purgeCloudflareCache } from "@lib/revalidate/purge";
import { warmPublicUrls } from "@lib/revalidate/warm-urls";
import {
  isTimestampFresh,
  parseSignatureHeader,
  timingSafeStringEqual,
} from "@lib/security/webhookSignature";
import { getCloudflareBindings, getRuntimeEnv } from "@utils/runtime-env";
import type { APIRoute } from "astro";

export const prerender = false;

const SIGNATURE_HEADER_NAME = "sanity-webhook-signature";
const SIGNATURE_TTL_SECONDS = 300;
const SITE_BASE_URL = "https://chambreasoi.fr";

type RevalidateBindings = Partial<{
  SANITY_WEBHOOK_SECRET: string;
  CF_ZONE_ID: string;
  CF_API_TOKEN: string;
  INDEXNOW_KEY: string;
}>;

type CloudflareRuntimeLocals = {
  runtime?: {
    ctx?: {
      waitUntil?: (promise: Promise<unknown>) => void;
    };
  };
};

function toBase64Url(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createSignature(payload: string, timestamp: number, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return toBase64Url(
    await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`))
  );
}

function trimSecret(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getValidatedBindings(runtimeEnv: RevalidateBindings) {
  const secret = trimSecret(runtimeEnv.SANITY_WEBHOOK_SECRET);
  const zoneId = trimSecret(runtimeEnv.CF_ZONE_ID);
  const apiToken = trimSecret(runtimeEnv.CF_API_TOKEN);

  if (!secret || !zoneId || !apiToken) {
    return null;
  }

  return {
    secret,
    zoneId,
    apiToken,
    indexNowKey: trimSecret(runtimeEnv.INDEXNOW_KEY) || undefined,
  };
}

async function isValidSanitySignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
) {
  const parsedSignature = parseSignatureHeader(signatureHeader);

  if (!parsedSignature) {
    return false;
  }

  if (!isTimestampFresh(parsedSignature.timestamp, SIGNATURE_TTL_SECONDS)) {
    return false;
  }

  const expected = await createSignature(payload, parsedSignature.timestamp, secret);

  return timingSafeStringEqual(parsedSignature.signature, expected);
}

function resolveRevalidationPaths(body: string): {
  paths: string[];
  usedFallback: boolean;
  skipped: boolean;
} {
  try {
    const parsed: unknown = JSON.parse(body);
    const mapped = resolvePathsFromWebhook(parsed);

    if (mapped) {
      return { paths: mapped, usedFallback: false, skipped: false };
    }

    if (typeof parsed === "object" && parsed !== null && "_type" in parsed) {
      console.warn("[revalidate] Unmapped Sanity _type; skipping purge and IndexNow", {
        type: (parsed as { _type?: unknown })._type,
      });
      return { paths: [], usedFallback: false, skipped: true };
    }
  } catch {
    console.warn("[revalidate] Invalid webhook JSON; falling back to all public routes");
  }

  return { paths: [...ALL_PUBLIC_ROUTES], usedFallback: true, skipped: false };
}

export const ALL: APIRoute = async ({ request, locals }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const runtimeEnv = getRuntimeEnv(await getCloudflareBindings()) as RevalidateBindings;
  const bindings = getValidatedBindings(runtimeEnv);
  if (!bindings) {
    return new Response("Server misconfiguration", { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const isValidSignature = await isValidSanitySignature(body, signature, bindings.secret);

  if (!isValidSignature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const { paths, usedFallback, skipped } = resolveRevalidationPaths(body);

  if (skipped) {
    return new Response("OK", { status: 200 });
  }

  const baseUrl = normalizeBaseUrl(SITE_BASE_URL);

  const purgeResult = await purgeCloudflareCache({
    zoneId: bindings.zoneId,
    apiToken: bindings.apiToken,
    paths,
    baseUrl,
  });

  if (!purgeResult.ok) {
    console.error("Cloudflare cache purge failed", {
      status: purgeResult.status,
      error: purgeResult.error,
      paths,
      usedFallback,
      zoneId: bindings.zoneId,
    });
    return new Response(`Cloudflare cache purge failed: ${purgeResult.error}`, { status: 502 });
  }

  invalidateCmsCache();

  const absoluteUrls = toAbsoluteUrls(baseUrl, paths);
  const warmAndMaybeIndex = warmPublicUrls({ baseUrl, paths }).then(async (live) => {
    if (bindings.indexNowKey && live && absoluteUrls.length > 0) {
      await submitIndexNow({
        key: bindings.indexNowKey,
        baseUrl,
        urlList: absoluteUrls,
      });
      return;
    }

    if (bindings.indexNowKey && !live) {
      console.error("[revalidate] Skipping IndexNow because URL warm failed", { paths });
    }
  });

  const waitUntil = (locals as CloudflareRuntimeLocals).runtime?.ctx?.waitUntil;

  if (waitUntil) {
    waitUntil(warmAndMaybeIndex);
  } else {
    await warmAndMaybeIndex;
  }

  return new Response("OK", { status: 200 });
};
