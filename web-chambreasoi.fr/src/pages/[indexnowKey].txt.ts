import type { APIRoute } from "astro";
import { getCloudflareBindings, getRuntimeEnv } from "@utils/runtime-env";

export const prerender = false;

type IndexNowKeyBindings = Partial<{
  INDEXNOW_KEY: string;
}>;

export const GET: APIRoute = async ({ params }) => {
  const runtimeEnv = getRuntimeEnv(await getCloudflareBindings()) as IndexNowKeyBindings;
  const key = runtimeEnv.INDEXNOW_KEY;

  if (!key || params.indexnowKey !== key) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
