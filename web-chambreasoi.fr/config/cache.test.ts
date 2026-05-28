import { describe, expect, it, vi } from "vitest";
import {
  getCmsCacheEpoch,
  invalidateCmsCache,
  registerCmsCacheResetter,
} from "./cache";

describe("cms cache invalidation", () => {
  it("increments epoch on each invalidation", () => {
    const start = getCmsCacheEpoch();

    const next = invalidateCmsCache();
    const after = invalidateCmsCache();

    expect(next).toBe(start + 1);
    expect(after).toBe(start + 2);
    expect(getCmsCacheEpoch()).toBe(start + 2);
  });

  it("calls registered resetters when invalidating cache", () => {
    const resetter = vi.fn();
    const unregister = registerCmsCacheResetter(resetter);

    invalidateCmsCache();

    expect(resetter).toHaveBeenCalledTimes(1);

    unregister();
  });

  it("does not call resetter after unregister", () => {
    const resetter = vi.fn();
    const unregister = registerCmsCacheResetter(resetter);

    unregister();
    invalidateCmsCache();

    expect(resetter).not.toHaveBeenCalled();
  });
});
