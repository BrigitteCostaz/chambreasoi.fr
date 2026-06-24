import { describe, expect, it } from "vitest";
import { toCanonicalPageUrl } from "../canonical-url";
import { buildBreadcrumbList } from "./breadcrumbs";

const SITE_URL = "https://chambreasoi.fr";

describe("buildBreadcrumbList", () => {
  it("uses trailing-slash @id matching WebPage breadcrumb reference", () => {
    const breadcrumb = buildBreadcrumbList(SITE_URL, "/legales/mentions-legales", [
      { name: "Accueil", path: "/" },
      { name: "Mentions légales" },
    ]);

    const pageUrl = toCanonicalPageUrl(SITE_URL, "/legales/mentions-legales/");

    expect(breadcrumb["@id"]).toBe(`${pageUrl}#breadcrumb`);
    expect(breadcrumb.itemListElement).toHaveLength(2);
    expect(breadcrumb.itemListElement).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Mentions légales",
          item: pageUrl,
        }),
      ])
    );
  });

  it("includes item URLs for every breadcrumb level", () => {
    const breadcrumb = buildBreadcrumbList(SITE_URL, "/la-chambre", [
      { name: "Accueil", path: "/" },
      { name: "La chambre" },
    ]);

    const pageUrl = toCanonicalPageUrl(SITE_URL, "/la-chambre");

    expect(breadcrumb.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://chambreasoi.fr/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "La chambre",
        item: pageUrl,
      },
    ]);
  });
});
