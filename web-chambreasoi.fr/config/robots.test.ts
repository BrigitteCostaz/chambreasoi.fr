import { describe, expect, it } from "vitest";
import { AI_TRAINING_BOTS, buildRobotsTxt, DISALLOW_FOR_ALL } from "./robots";

const SITE = new URL("https://chambreasoi.fr");

describe("buildRobotsTxt", () => {
  it("includes sitemap URL derived from site config", () => {
    const robots = buildRobotsTxt(SITE);
    expect(robots).toContain("Sitemap: https://chambreasoi.fr/sitemap-index.xml");
  });

  it("disallows API and studio paths for all crawlers", () => {
    const robots = buildRobotsTxt(SITE);
    for (const path of DISALLOW_FOR_ALL) {
      expect(robots).toContain(`Disallow: ${path}`);
    }
  });

  it("blocks AI training bots site-wide", () => {
    const robots = buildRobotsTxt(SITE);
    for (const bot of AI_TRAINING_BOTS) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
    expect(robots.match(/User-agent: Google-Extended\nDisallow: \//)).not.toBeNull();
  });

  it("allows all other paths for generic crawlers", () => {
    const robots = buildRobotsTxt(SITE);
    expect(robots).toMatch(/User-agent: \*\nAllow: \//);
  });
});
