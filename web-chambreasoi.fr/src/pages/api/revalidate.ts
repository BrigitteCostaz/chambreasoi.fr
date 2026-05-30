import type { APIRoute } from "astro";
import { invalidateCmsCache } from "@config/cache";
import { buildCloudflarePurgePayload } from "@lib/revalidate/purge";
import {
  isTimestampFresh,
  parseSignatureHeader,
  timingSafeStringEqual,
} from "@lib/security/webhookSignature";
import { getCloudflareBindings, getRuntimeEnv } from "@utils/runtime-env";

export const prerender = false;

const SIGNATURE_HEADER_NAME = "sanity-webhook-signature";
const SIGNATURE_TTL_SECONDS = 300;
type RevalidateBindings = Partial<{
  SANITY_WEBHOOK_SECRET: string;
  CF_ZONE_ID: string;
  CF_API_TOKEN: string;
}>;

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

function getValidatedBindings(runtimeEnv: RevalidateBindings) {
  const secret = runtimeEnv.SANITY_WEBHOOK_SECRET;
  const zoneId = runtimeEnv.CF_ZONE_ID;
  const apiToken = runtimeEnv.CF_API_TOKEN;

  if (!secret || !zoneId || !apiToken) {
    return null;
  }

  return { secret, zoneId, apiToken };
}

async function isValidSanitySignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
) {
  const parsedSignature = parseSignatureHeader(signatureHeader);
  const now = Math.floor(Date.now() / 1000);

  if (!parsedSignature) {
    return false;
  }

  if (!isTimestampFresh(parsedSignature.timestamp, SIGNATURE_TTL_SECONDS, now)) {
    return false;
  }

  const expected = await createSignature(payload, parsedSignature.timestamp, secret);

  return timingSafeStringEqual(parsedSignature.signature, expected);
}

export const ALL: APIRoute = async ({ request }) => {
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

  const purgeResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${bindings.zoneId}/purge_cache`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${bindings.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildCloudflarePurgePayload()),
    }
  );

  if (!purgeResponse.ok) {
    const errorBody = (await purgeResponse.text()).slice(0, 300);
    console.error("Cloudflare cache purge failed", {
      status: purgeResponse.status,
      statusText: purgeResponse.statusText,
      body: errorBody,
    });
    return new Response("Cloudflare cache purge failed", { status: 502 });
  }

  invalidateCmsCache();

  return new Response("OK", { status: 200 });
};
