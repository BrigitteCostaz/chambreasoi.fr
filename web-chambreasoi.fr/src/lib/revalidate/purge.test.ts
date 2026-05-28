import { describe, expect, it } from "vitest";
import { ALL_PUBLIC_ROUTES, buildCloudflarePurgePayload } from "./purge";

describe("revalidate purge payload", () => {
  it("targets all public routes", () => {
    expect(ALL_PUBLIC_ROUTES).toEqual([
      "/",
      "/la-chambre",
      "/tarifs-et-reservation",
      "/acces-et-localisation",
      "/decouvrir-les-environs",
      "/legales/mentions-legales",
      "/legales/politique-confidentialite",
    ]);
  });

  it("builds cloudflare file purge payload", () => {
    expect(buildCloudflarePurgePayload()).toEqual({
      purge_everything: false,
      files: [
        "/",
        "/la-chambre",
        "/tarifs-et-reservation",
        "/acces-et-localisation",
        "/decouvrir-les-environs",
        "/legales/mentions-legales",
        "/legales/politique-confidentialite",
      ],
    });
  });
});
