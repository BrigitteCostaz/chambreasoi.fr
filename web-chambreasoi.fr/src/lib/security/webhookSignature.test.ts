import { describe, expect, it } from "vitest";
import { isTimestampFresh, parseSignatureHeader, timingSafeStringEqual } from "./webhookSignature";

describe("parseSignatureHeader", () => {
  it("parses valid signature header", () => {
    expect(parseSignatureHeader("t=1716880000,v1=abc123")).toEqual({
      timestamp: 1716880000,
      signature: "abc123",
    });
  });

  it("returns null for malformed header", () => {
    expect(parseSignatureHeader("invalid")).toBeNull();
  });
});

describe("isTimestampFresh", () => {
  it("accepts timestamp within ttl", () => {
    expect(isTimestampFresh(1000, 300, 1200)).toBe(true);
  });

  it("rejects stale timestamp outside ttl", () => {
    expect(isTimestampFresh(1000, 300, 1400)).toBe(false);
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
