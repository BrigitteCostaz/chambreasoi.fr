import { sitemap } from "@config/pages";
import { toAbsoluteUrls } from "@config/public-routes";

const MAIN_PAGE_KEYS = ["home", "room", "reservations", "location", "surroundings"] as const;
const OPTIONAL_PAGE_KEYS = ["mentionsLegales", "politiqueConfidentialite"] as const;

export type LlmsTxtInput = {
  site: URL;
  brandName: string;
  tagline: string;
};

function formatLinkList(keys: readonly (keyof typeof sitemap)[], baseUrl: string): string {
  return keys
    .map((key) => {
      const page = sitemap[key];
      const url = toAbsoluteUrls(baseUrl, [page.path])[0];
      return `- [${page.title}](${url}): ${page.description}`;
    })
    .join("\n");
}

export function buildLlmsTxt({ site, brandName, tagline }: LlmsTxtInput): string {
  const baseUrl = site.href.replace(/\/$/, "");
  const sitemapUrl = new URL("sitemap-index.xml", site).href;

  return [
    `# ${brandName}`,
    "",
    `> ${tagline}`,
    "",
    "Index des pages publiques de chambreasoi.fr (chambre d'hôtes à Challes-les-Eaux, Savoie).",
    "",
    "## Pages",
    "",
    formatLinkList(MAIN_PAGE_KEYS, baseUrl),
    "",
    "## Optional",
    "",
    formatLinkList(OPTIONAL_PAGE_KEYS, baseUrl),
    `- [Plan du site (${sitemapUrl})](${sitemapUrl})`,
    "",
  ].join("\n");
}
