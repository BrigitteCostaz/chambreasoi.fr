import { describe, expect, it } from "vitest";
import { __test } from "./fetch";

describe("buildCacheKey", () => {
  it("changes key when useCdn changes", () => {
    const withCdn = __test.buildCacheKey({
      query: "*[_type == 'post']",
      params: { slug: "a" },
      options: { useCdn: true },
    });
    const withoutCdn = __test.buildCacheKey({
      query: "*[_type == 'post']",
      params: { slug: "a" },
      options: { useCdn: false },
    });

    expect(withCdn).not.toBe(withoutCdn);
  });

  it("changes key when client overrides differ", () => {
    const first = __test.buildCacheKey({
      query: "*[_type == 'post']",
      params: { slug: "a" },
      options: { clientOverrides: { dataset: "production" } },
    });
    const second = __test.buildCacheKey({
      query: "*[_type == 'post']",
      params: { slug: "a" },
      options: { clientOverrides: { dataset: "staging" } },
    });

    expect(first).not.toBe(second);
  });
});

describe("stableStringify", () => {
  it("distinguishes null and undefined", () => {
    expect(__test.stableStringify(null)).not.toBe(__test.stableStringify(undefined));
  });
});
