import { describe, expect, it } from "vitest";
import { resolveRevalidationPaths } from "./resolve-paths";

describe("resolveRevalidationPaths", () => {
  it("maps known Sanity types to targeted public paths", () => {
    const result = resolveRevalidationPaths(
      JSON.stringify({ _type: "roomPageContent", _id: "roomPageContent" })
    );

    expect(result).toMatchObject({
      paths: ["/la-chambre"],
      usedFallback: false,
      skipped: false,
      webhookType: "roomPageContent",
      webhookId: "roomPageContent",
    });
  });

  it("skips draft webhook payloads without purging", () => {
    const result = resolveRevalidationPaths(
      JSON.stringify({ _type: "roomPageContent", _id: "drafts.roomPageContent" })
    );

    expect(result).toMatchObject({
      paths: [],
      usedFallback: false,
      skipped: true,
      skipReason: "draft",
      webhookType: "roomPageContent",
      webhookId: "drafts.roomPageContent",
    });
  });

  it("skips unmapped Sanity types without purging", () => {
    const result = resolveRevalidationPaths(
      JSON.stringify({ _type: "unknownType", _id: "unknownType" })
    );

    expect(result).toMatchObject({
      paths: [],
      usedFallback: false,
      skipped: true,
      skipReason: "unmapped_type",
      webhookType: "unknownType",
      webhookId: "unknownType",
    });
  });

  it("falls back to all public routes when webhook JSON is invalid", () => {
    const result = resolveRevalidationPaths("{not-json");

    expect(result.usedFallback).toBe(true);
    expect(result.skipped).toBe(false);
    expect(result.paths.length).toBeGreaterThan(0);
    expect(result.paths).toContain("/");
    expect(result.paths).toContain("/la-chambre");
  });
});
