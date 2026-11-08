import { describe, expect, it, vi } from "vitest";
import { warmPublicUrls } from "./warm-urls";

describe("warmPublicUrls", () => {
  it("returns true when all paths respond with 2xx", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });

    await expect(
      warmPublicUrls({
        baseUrl: "https://chambreasoi.fr",
        paths: ["/", "/la-chambre"],
        fetchImpl,
        maxAttempts: 1,
      })
    ).resolves.toBe(true);

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://chambreasoi.fr/",
      expect.objectContaining({ cache: "no-store" })
    );
  });

  it("retries and returns false after repeated failures", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503 });

    const resultPromise = warmPublicUrls({
      baseUrl: "https://chambreasoi.fr",
      paths: ["/la-chambre"],
      fetchImpl,
      maxAttempts: 3,
      retryDelayMs: 500,
    });

    await vi.runAllTimersAsync();
    await expect(resultPromise).resolves.toBe(false);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });
});
