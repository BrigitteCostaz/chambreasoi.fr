import { describe, expect, it } from "vitest";
import { isCmsSsrPath } from "./cms-cache-headers";

describe("isCmsSsrPath", () => {
  it("matches CMS SSR routes with or without trailing slash", () => {
    expect(isCmsSsrPath("/")).toBe(true);
    expect(isCmsSsrPath("/la-chambre")).toBe(true);
    expect(isCmsSsrPath("/la-chambre/")).toBe(true);
    expect(isCmsSsrPath("/tarifs-et-reservation/")).toBe(true);
  });

  it("does not match prerendered legal pages", () => {
    expect(isCmsSsrPath("/legales/mentions-legales/")).toBe(false);
    expect(isCmsSsrPath("/legales/politique-confidentialite/")).toBe(false);
  });
});
