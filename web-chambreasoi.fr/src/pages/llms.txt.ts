import { getHeadData } from "@config/head";
import { buildLlmsTxt } from "@config/llms";
import { getOrgData } from "@config/organization";
import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL("https://chambreasoi.fr");
  const orgData = await getOrgData();
  const headData = await getHeadData();

  const body = buildLlmsTxt({
    site: origin,
    brandName: orgData.legal.brandName,
    tagline: headData.meta.metaDescription,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
