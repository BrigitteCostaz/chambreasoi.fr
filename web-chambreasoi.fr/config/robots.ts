export const DISALLOW_FOR_ALL = ["/api/"] as const;

export const AI_TRAINING_BOTS = [
  "Google-Extended",
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
] as const;

export function buildRobotsTxt(site: URL): string {
  const sitemapURL = new URL("sitemap-index.xml", site);

  const globalBlock = [
    "User-agent: *",
    "Allow: /",
    ...DISALLOW_FOR_ALL.map((path) => `Disallow: ${path}`),
  ].join("\n");

  const aiBlocks = AI_TRAINING_BOTS.map((bot) => `User-agent: ${bot}\nDisallow: /`).join("\n\n");

  return `${globalBlock}\n\n${aiBlocks}\n\nSitemap: ${sitemapURL.href}\n`;
}
