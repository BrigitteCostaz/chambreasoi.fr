import { sanityClient } from "sanity:client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const client = sanityClient;

const builder = createImageUrlBuilder(client);

export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

export async function fetchSanity<T>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return client.fetch<T>(query, params ?? {});
}
