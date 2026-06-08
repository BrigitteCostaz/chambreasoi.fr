import type { JsonLdNode } from "@config/types/page-meta";
import { toCanonicalPageUrl } from "../canonical-url";

type BreadcrumbItem = {
  name: string;
  path?: string;
};

export function buildBreadcrumbList(
  baseUrl: string,
  pagePath: string,
  items: readonly BreadcrumbItem[]
): JsonLdNode {
  const siteUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const pageUrl = toCanonicalPageUrl(baseUrl, pagePath);

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const itemUrl = item.path
        ? new URL(item.path, siteUrl).href
        : isLast
          ? pageUrl
          : undefined;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(itemUrl ? { item: itemUrl } : {}),
      };
    }),
  } as JsonLdNode;
}
