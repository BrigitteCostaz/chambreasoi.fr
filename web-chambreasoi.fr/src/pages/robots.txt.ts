import type { APIRoute } from "astro";
import { buildRobotsTxt } from "@config/robots";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://chambreasoi.fr");
  return new Response(buildRobotsTxt(origin), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
