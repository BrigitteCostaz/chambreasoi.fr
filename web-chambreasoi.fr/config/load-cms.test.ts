// config/load-cms.test.ts
import { describe, expect, it, vi } from "vitest";
import { loadCms } from "./load-cms";

describe("loadCms", () => {
  it("returns the loaded value on success", async () => {
    const onFallback = vi.fn();
    const value = await loadCms(async () => "live", "fallback", onFallback);

    expect(value).toBe("live");
    expect(onFallback).not.toHaveBeenCalled();
  });

  it("returns the fallback and reports when load throws", async () => {
    const onFallback = vi.fn();
    const error = new Error("network");
    const value = await loadCms(
      async () => {
        throw error;
      },
      "fallback",
      onFallback
    );

    expect(value).toBe("fallback");
    expect(onFallback).toHaveBeenCalledTimes(1);
    expect(onFallback).toHaveBeenCalledWith(error);
  });
});
