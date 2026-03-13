/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare-only env access.
 *
 * IMPORTANT
 * - This module MUST NOT be imported statically by code that runs in Node (local dev),
 *   because `cloudflare:workers` is only available in the Workers runtime.
 * - Only load it via dynamic import from Cloudflare-only entrypoints/paths.
 *
 * Usage (Cloudflare runtime only):
 *   const { getCloudflareEnv } = await import("@utils/cf-env");
 *   const env = getCloudflareEnv();
 */
import { env } from "cloudflare:workers";

export type CfRuntimeEnv = typeof env;

export function getCloudflareEnv(): CfRuntimeEnv {
  return env;
}
