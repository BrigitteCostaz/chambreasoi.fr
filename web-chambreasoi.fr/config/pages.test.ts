import { describe, expect, it } from "vitest";
import { sitemap } from "./pages";
import { pageMetaSchema } from "./pages.schema";
import { PUBLIC_PAGE_KEYS } from "./public-routes";

describe("pages sitemap", () => {
  it("validates public page metadata", () => {
    for (const key of PUBLIC_PAGE_KEYS) {
      expect(() => pageMetaSchema.parse(sitemap[key])).not.toThrow();
      expect(sitemap[key].key).toBe(key);
    }
  });

  it("keeps the 404 page out of public routes", () => {
    expect(sitemap.notFound.noindex).toBe(true);
    expect(PUBLIC_PAGE_KEYS).not.toContain("notFound");
  });

  it("does not define duplicate page paths", () => {
    const paths = Object.values(sitemap).map((page) => page.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
