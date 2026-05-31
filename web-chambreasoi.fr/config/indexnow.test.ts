import { describe, expect, it, vi } from "vitest";
import {
  buildIndexNowPayload,
  getIndexNowHost,
  getIndexNowKeyLocation,
  submitIndexNow,
} from "./indexnow";

describe("indexnow", () => {
  it("builds key location at site root", () => {
    expect(getIndexNowKeyLocation("https://chambreasoi.fr", "abc123")).toBe(
      "https://chambreasoi.fr/abc123.txt"
    );
  });

  it("builds payload with host and url list", () => {
    expect(
      buildIndexNowPayload(
        "chambreasoi.fr",
        "abc123",
        "https://chambreasoi.fr/abc123.txt",
        ["https://chambreasoi.fr/la-chambre"]
      )
    ).toEqual({
      host: "chambreasoi.fr",
      key: "abc123",
      keyLocation: "https://chambreasoi.fr/abc123.txt",
      urlList: ["https://chambreasoi.fr/la-chambre"],
    });
  });

  it("derives host from base URL", () => {
    expect(getIndexNowHost("https://chambreasoi.fr/")).toBe("chambreasoi.fr");
  });

  it("returns true on 202 Accepted", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 202, text: async () => "" });

    await expect(
      submitIndexNow({
        key: "abc123",
        baseUrl: "https://chambreasoi.fr",
        urlList: ["https://chambreasoi.fr/"],
        fetchImpl,
      })
    ).resolves.toBe(true);
  });

  it("returns false on rejection without throwing", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 403, text: async () => "forbidden" });

    await expect(
      submitIndexNow({
        key: "abc123",
        baseUrl: "https://chambreasoi.fr",
        urlList: ["https://chambreasoi.fr/"],
        fetchImpl,
      })
    ).resolves.toBe(false);
  });
});
