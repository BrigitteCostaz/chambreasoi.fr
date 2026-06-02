import { describe, expect, it, vi } from "vitest";
import { ALL_PUBLIC_ROUTES, buildCloudflarePurgePayload, purgeCloudflareCache } from "./purge";

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

  it("builds cloudflare file purge payload with absolute URLs only", () => {
    expect(buildCloudflarePurgePayload()).toEqual({
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
      files: ["https://chambreasoi.fr/la-chambre"],
    });
  });
});

describe("purgeCloudflareCache", () => {
  it("returns ok when Cloudflare API succeeds", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true, result: { id: "purge-id" } }),
    });

    await expect(
      purgeCloudflareCache({
        zoneId: "zone123",
        apiToken: "token123",
        paths: ["/la-chambre"],
        fetchImpl,
      })
    ).resolves.toEqual({ ok: true });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/zones/zone123/purge_cache",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ files: ["https://chambreasoi.fr/la-chambre"] }),
      })
    );
  });

  it("returns Cloudflare error message on failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () =>
        JSON.stringify({
          success: false,
          errors: [{ code: 9109, message: "Invalid purge URL" }],
        }),
    });

    await expect(
      purgeCloudflareCache({
        zoneId: "zone123",
        apiToken: "token123",
        paths: ["/la-chambre"],
        fetchImpl,
      })
    ).resolves.toEqual({
      ok: false,
      status: 403,
      error: "Invalid purge URL",
    });
  });
});
