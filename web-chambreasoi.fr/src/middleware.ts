// src/middleware.ts
import { defineMiddleware } from "astro:middleware";
import { setWorkerEnv } from "@chambreasoi/sanity/config";
import { mergeSanityRuntimeEnv } from "@lib/sanity-env";
import { getCloudflareBindings, getRuntimeEnv } from "@utils/runtime-env";

const HTML_CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";
const TARIFS_CACHE_CONTROL = "private, no-store";
const HTML_NO_VARY_SEARCH =
  'key-order, params=("utm_source" "utm_medium" "utm_campaign" "utm_content" "utm_term")';
const HTML_LINK =
  '</sitemap-index.xml>; rel="sitemap", </llms.txt>; rel="alternate"; type="text/plain"';

function isTarifsPath(pathname: string): boolean {
  return pathname === "/tarifs-et-reservation" || pathname === "/tarifs-et-reservation/";
}

function isHtmlResponse(response: Response): boolean {
  const contentType = response.headers.get("Content-Type") ?? "";
  return contentType.includes("text/html");
}

/**
 * Middleware that provides a consistent env object to `@chambreasoi/sanity`
 * and sets Cache-Control on Worker-rendered HTML (public/_headers only
 * covers static assets).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const runtimeEnv = getRuntimeEnv(await getCloudflareBindings());

  const mergedEnv = mergeSanityRuntimeEnv(runtimeEnv, {
    PUBLIC_SANITY_PROJECT_ID: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
    PUBLIC_SANITY_DATASET: import.meta.env.PUBLIC_SANITY_DATASET,
  });

  setWorkerEnv(mergedEnv);

  const response = await next();

  if (!isHtmlResponse(response)) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set(
    "Cache-Control",
    isTarifsPath(context.url.pathname) ? TARIFS_CACHE_CONTROL : HTML_CACHE_CONTROL
  );
  headers.set("No-Vary-Search", HTML_NO_VARY_SEARCH);
  headers.set("Link", HTML_LINK);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
