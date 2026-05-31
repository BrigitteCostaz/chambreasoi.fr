import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "./llms";

describe("buildLlmsTxt", () => {
  it("includes required llms.txt sections and public URLs", () => {
    const content = buildLlmsTxt({
      site: new URL("https://chambreasoi.fr/"),
      brandName: "UNE CHAMBRE À SOI",
      tagline: "Chambre d'hôtes à Challes-les-Eaux.",
    });

    expect(content).toContain("# UNE CHAMBRE À SOI");
    expect(content).toContain("> Chambre d'hôtes à Challes-les-Eaux.");
    expect(content).toContain("## Pages");
    expect(content).toContain("## Optional");
    expect(content).toContain("[La chambre](https://chambreasoi.fr/la-chambre)");
    expect(content).toContain("https://chambreasoi.fr/sitemap-index.xml");
  });
});
