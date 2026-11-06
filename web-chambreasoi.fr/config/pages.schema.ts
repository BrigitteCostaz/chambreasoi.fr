import type { PageMeta } from "@config/types/page-meta";
import { z } from "zod";

export const pageMetaSchema = z.object({
  key: z.string().min(1),
  path: z.custom<`/${string}`>(
    (value) => typeof value === "string" && value.startsWith("/"),
    "Path must start with /"
  ),
  title: z.string().min(30).max(65),
  description: z.string().min(70).max(200),
  titleNav: z.string().min(1).optional(),
  jsonLd: z.custom<PageMeta["jsonLd"]>().optional(),
  ogImage: z.string().min(1).optional(),
  canonical: z.string().url().optional(),
  noindex: z.boolean().optional(),
  mainEntityId: z.string().min(1).optional(),
  colorMode: z.enum(["light", "dark"]).optional(),
  contactKey: z.string().min(1).optional(),
}) satisfies z.ZodType<PageMeta>;

export const pagesSitemapSchema = z.record(z.string(), pageMetaSchema);

export function parsePagesSitemap(raw: Record<string, PageMeta>): Record<string, PageMeta> {
  return pagesSitemapSchema.parse(raw);
}
