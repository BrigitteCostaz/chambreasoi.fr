import { describe, expect, it } from "vitest";
import { isTimestampFresh, parseSignatureHeader, timingSafeStringEqual } from "./webhookSignature";

describe("parseSignatureHeader", () => {
  it("parses valid signature header with millisecond timestamp", () => {
    expect(parseSignatureHeader("t=1716880000000,v1=abc123")).toEqual({
      timestamp: 1716880000000,
      signature: "abc123",
    });
  });

  it("returns null for malformed header", () => {
    expect(parseSignatureHeader("invalid")).toBeNull();
  });
});

describe("isTimestampFresh", () => {
  it("accepts Sanity millisecond timestamp within ttl", () => {
    const nowMs = 1716880000000;
    expect(isTimestampFresh(1716880000000, 300, nowMs)).toBe(true);
    expect(isTimestampFresh(1716879700000, 300, nowMs)).toBe(true);
  });

  it("rejects stale millisecond timestamp outside ttl", () => {
    const nowMs = 1716880000000;
    expect(isTimestampFresh(1716879000000, 300, nowMs)).toBe(false);
  });

  it("rejects second-precision timestamps (legacy / invalid for Sanity)", () => {
    expect(isTimestampFresh(1716880000, 300, 1716880000000)).toBe(false);
  });
});

describe("timingSafeStringEqual", () => {
  it("matches equal strings", () => {
    expect(timingSafeStringEqual("same-signature", "same-signature")).toBe(true);
  });

  it("rejects different strings", () => {
    expect(timingSafeStringEqual("same-signature", "different-signature")).toBe(false);
  });
});
