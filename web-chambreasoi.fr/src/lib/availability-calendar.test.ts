// src/lib/availability-calendar.test.ts
import { describe, expect, it } from "vitest";
import {
  buildCalendarDates,
  getAvailabilityQueryRange,
  getTodayIsoInParis,
  isIsoDate,
  resolveCalendarMinMax,
} from "./availability-calendar";
import { parseAvailabilityCalendarData } from "../components/availabily-page/availability-calendar-client";

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

  it("formats today in Europe/Paris even when UTC is still the previous day", () => {
    // 2026-06-01 00:30 in Paris is 2026-05-31 22:30 UTC.
    const justAfterMidnightParis = new Date("2026-05-31T22:30:00.000Z");
    expect(getTodayIsoInParis(justAfterMidnightParis)).toBe("2026-06-01");
  });

  it("builds the query window from the Paris calendar month", () => {
    const justAfterMidnightParis = new Date("2026-05-31T22:30:00.000Z");
    const range = getAvailabilityQueryRange(6, 18, justAfterMidnightParis);

    expect(range.minMonth).toBe("2025-12-01");
    expect(range.maxMonth).toBe("2027-12-01");
  });

  it("parses calendar payload JSON and rejects invalid shapes", () => {
    const valid = parseAvailabilityCalendarData(
      JSON.stringify({
        availableDates: ["2026-06-01"],
        unavailableDates: [],
        defaultUnavailableDates: [],
        minDate: "2026-06-01",
        maxDate: "2026-06-30",
      })
    );
    expect(valid?.minDate).toBe("2026-06-01");
    expect(parseAvailabilityCalendarData("{")).toBeNull();
    expect(parseAvailabilityCalendarData(JSON.stringify({ minDate: "x" }))).toBeNull();
  });
});
