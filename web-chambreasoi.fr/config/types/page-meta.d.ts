import type { Thing } from "schema-dts";

export type JsonLdNode = Thing & Record<string, unknown>;

export interface PageMeta {
  key: string;
  path: `/${string}`;

  title: string;
  description: string;

  /**
   * Short label for navigation menus. Falls back to title when omitted.
   */
  titleNav?: string;

  /**
   * Structured data.
   *
   * Must be compatible with `schema-dts` `Thing` because `astro-seo-schema`
   * types `Schema` props in terms of `Thing` / `Graph`.
   */
  jsonLd?: JsonLdNode[] | JsonLdNode;

  /**
   * Optional overrides
   */
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;

  /**
   * Override the mainEntity @id for this page's WebPage node.
   * Example: "https://chambreasoi.fr/#room-1" for the room page
   * Default: "https://chambreasoi.fr/#bedandbreakfast"
   */
  mainEntityId?: string;

  /**
   * Optional design overrides
   */
  colorMode?: "light" | "dark";

  /**
   * Optional contact reference
   */
  contactKey?: string;
}
