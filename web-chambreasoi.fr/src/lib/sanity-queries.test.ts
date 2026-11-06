import {
  FOLD_CONTENT_QUERY,
  HEADLINE_CONTENT_QUERY,
  LOCATION_PAGE_CONTENT_QUERY,
  LOCATIONSECTION_CONTENT_QUERY,
  ROOM_PAGE_CONTENT_QUERY,
} from "@chambreasoi/sanity/queries";
import { describe, expect, it } from "vitest";

describe("singleton GROQ queries", () => {
  it.each([
    ["foldContent", FOLD_CONTENT_QUERY],
    ["headlineContent", HEADLINE_CONTENT_QUERY],
    ["locationSectionContent", LOCATIONSECTION_CONTENT_QUERY],
    ["locationPageContent", LOCATION_PAGE_CONTENT_QUERY],
    ["roomPageContent", ROOM_PAGE_CONTENT_QUERY],
  ])("pins %s to its Studio singleton document id", (type, query) => {
    expect(query).toContain(`_type == "${type}"`);
    expect(query).toContain(`_id == "${type}"`);
  });
});
