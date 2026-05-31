import { describe, expect, it } from "vitest";
import { ALL_PUBLIC_ROUTES, buildCloudflarePurgePayload } from "./purge";

describe("revalidate purge payload", () => {
  it("targets all public routes by default", () => {
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

  it("builds cloudflare file purge payload with absolute URLs", () => {
    expect(buildCloudflarePurgePayload()).toEqual({
      purge_everything: false,
      files: [
        "https://chambreasoi.fr/",
        "https://chambreasoi.fr/la-chambre",
        "https://chambreasoi.fr/tarifs-et-reservation",
        "https://chambreasoi.fr/acces-et-localisation",
        "https://chambreasoi.fr/decouvrir-les-environs",
        "https://chambreasoi.fr/legales/mentions-legales",
        "https://chambreasoi.fr/legales/politique-confidentialite",
      ],
    });
  });

  it("builds targeted purge payload with absolute URLs", () => {
    expect(buildCloudflarePurgePayload(["/la-chambre"])).toEqual({
      purge_everything: false,
      files: ["https://chambreasoi.fr/la-chambre"],
    });
  });
});
