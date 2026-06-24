import { describe, expect, it } from "vitest";
import {
  buildCalendarDates,
  isIsoDate,
  resolveCalendarMinMax,
} from "./availability-calendar";

describe("availability-calendar", () => {
  it("builds one entry per day and dedupes duplicate month documents", () => {
    const dates = buildCalendarDates([
      {
        month: "2026-06-01",
        dates: [{ date: "2026-06-01", available: false }],
      },
      {
        month: "2026-06-01",
        dates: [{ date: "2026-06-02", available: true }],
      },
    ]);

    expect(dates).toHaveLength(30);
    expect(dates.find((entry) => entry.date === "2026-06-01")?.available).toBe(false);
    expect(dates.find((entry) => entry.date === "2026-06-02")?.available).toBe(true);
    expect(dates.find((entry) => entry.date === "2026-06-03")?.available).toBeUndefined();
  });

  it("clamps calendar bounds to the configured display range", () => {
    const bounds = resolveCalendarMinMax(
      [{ date: "2010-01-01" }, { date: "2099-12-31" }],
      "2026-01-01",
      "2027-12-31",
      "2026-06-01"
    );

    expect(bounds.minDate).toBe("2026-01-01");
    expect(bounds.maxDate).toBe("2027-12-31");
  });

  it("rejects invalid date strings", () => {
    expect(isIsoDate("2026-6-01")).toBe(false);
    expect(isIsoDate("2026-06-01")).toBe(true);
  });
});
