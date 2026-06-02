import type { JsonLdNode } from "@config/types/page-meta";

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
  const pageUrl = new URL(pagePath, siteUrl).href;

  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: new URL(item.path, siteUrl).href } : {}),
    })),
  } as JsonLdNode;
}
