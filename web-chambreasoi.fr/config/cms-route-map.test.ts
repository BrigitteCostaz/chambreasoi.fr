import { describe, expect, it } from "vitest";
import { resolvePathsFromWebhook } from "./cms-route-map";

describe("cms-route-map", () => {
  it("maps roomPageContent to /la-chambre", () => {
    expect(resolvePathsFromWebhook({ _type: "roomPageContent", _id: "roomPageContent" })).toEqual([
      "/la-chambre",
    ]);
  });

  it("maps organizationSettings to all public routes", () => {
    const paths = resolvePathsFromWebhook({
      _type: "organizationSettings",
      _id: "organizationSettings",
    });

    expect(paths).toEqual([
      "/",
      "/acces-et-localisation",
      "/decouvrir-les-environs",
      "/la-chambre",
      "/legales/mentions-legales",
      "/legales/politique-confidentialite",
      "/tarifs-et-reservation",
    ]);
  });

  it("dedupes pricingSettings paths", () => {
    expect(resolvePathsFromWebhook({ _type: "pricingSettings", _id: "pricingSettings" })).toEqual([
      "/",
      "/tarifs-et-reservation",
    ]);
  });

  it("returns null for draft-only events", () => {
    expect(
      resolvePathsFromWebhook({ _type: "roomPageContent", _id: "drafts.roomPageContent" })
    ).toBeNull();
  });

  it("returns null for unknown types", () => {
    expect(resolvePathsFromWebhook({ _type: "unknownType", _id: "x" })).toBeNull();
  });
});
