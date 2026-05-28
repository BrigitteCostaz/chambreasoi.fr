import type { APIRoute } from "astro";
import { getFallbackCounters } from "@lib/observability/fallbackMetrics";

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ fallbackCounters: getFallbackCounters() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
