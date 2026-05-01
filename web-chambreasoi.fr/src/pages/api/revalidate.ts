import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

export const prerender = false;

const SIGNATURE_HEADER_NAME = "sanity-webhook-signature";
const SIGNATURE_HEADER_REGEX = /^t=(\d+)[, ]+v1=([^, ]+)$/;
const runtimeEnv = env as unknown as {
  SANITY_WEBHOOK_SECRET: string;
  CF_ZONE_ID: string;
  CF_API_TOKEN: string;
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

async function isValidSanitySignature(
  payload: string,
  signatureHeader: string | null,
  secret: string
) {
  const [, timestampValue, signature] = signatureHeader?.trim().match(SIGNATURE_HEADER_REGEX) ?? [];
  const timestamp = Number(timestampValue);

  if (!signature || !Number.isFinite(timestamp)) {
    return false;
  }

  return signature === (await createSignature(payload, timestamp, secret));
}

export const ALL: APIRoute = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const body = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const isValidSignature = await isValidSanitySignature(
    body,
    signature,
    runtimeEnv.SANITY_WEBHOOK_SECRET
  );

  if (!isValidSignature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const purgeResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${runtimeEnv.CF_ZONE_ID}/purge_cache`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${runtimeEnv.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        purge_everything: false,
        files: ["/"],
      }),
    }
  );

  if (!purgeResponse.ok) {
    return new Response("Cloudflare cache purge failed", { status: 502 });
  }

  return new Response("OK", { status: 200 });
};
