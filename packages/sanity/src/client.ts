/**
 * Memoized, read-only Sanity client factory.
 *
 * Uses the shared config resolver so env vars are read once and cached.
 * The client is created lazily on first call and reused thereafter.
 *
 * This module is safe for SSR, build, and edge runtimes.
 * No tokens — public dataset read access only.
 */

import { createClient, type SanityClient } from "@sanity/client";
import { sanityConfig, type SanityPublicConfig } from "./config.ts";

// ---------------------------------------------------------------------------
// Memoized client singleton
// ---------------------------------------------------------------------------

let cachedClient: SanityClient | null = null;
let cachedConfigSnapshot: string | null = null;

/**
 * Return a read-only Sanity client.
 *
 * The client is memoized: subsequent calls return the same instance unless
 * the resolved config changes (e.g. different env between test runs).
 *
 * Pass `overrides` to customise individual config fields (e.g. `useCdn`).
 */
export function getSanityClient(overrides?: Partial<SanityPublicConfig>): SanityClient {
  const config = sanityConfig(overrides);
  const snapshot = `${config.projectId}:${config.dataset}:${config.apiVersion}:${config.useCdn}`;

  // Invalidate cache if the resolved config changed
  if (cachedClient && cachedConfigSnapshot === snapshot) {
    return cachedClient;
  }

  cachedClient = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion,
    useCdn: config.useCdn,
    // No token — public read access only
    // perspective left undefined for maximum compatibility
  });

  cachedConfigSnapshot = snapshot;
  return cachedClient;
}
