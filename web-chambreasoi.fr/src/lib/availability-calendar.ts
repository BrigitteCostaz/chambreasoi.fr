import type { AvailabilityMonthResult } from "@chambreasoi/sanity/queries";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type CalendarAvailabilityDate = {
  date: string;
  available?: boolean;
};

export function isIsoDate(value: string): boolean {
  return ISO_DATE_RE.test(value);
}

export function toMonthStart(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export function getAvailabilityQueryRange(monthsBefore = 6, monthsAfter = 18) {
  const now = new Date();
  const min = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBefore, 1));
  const max = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthsAfter, 1));

  return {
    minMonth: toMonthStart(min),
    maxMonth: toMonthStart(max),
  };
}

export function getCalendarDisplayRange() {
  const { minMonth, maxMonth } = getAvailabilityQueryRange();
  const maxEnd = new Date(
    Date.UTC(Number(maxMonth.slice(0, 4)), Number(maxMonth.slice(5, 7)), 0)
  );

  return {
    minMonth,
    maxMonth,
    rangeStart: minMonth,
    rangeEnd: maxEnd.toISOString().slice(0, 10),
  };
}

export function getMonthDays(month: string) {
  if (!isIsoDate(month)) return [];

  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");

    return `${month.slice(0, 7)}-${day}`;
  });
}

export function buildCalendarDates(
  availabilityMonths: AvailabilityMonthResult[]
): CalendarAvailabilityDate[] {
  const byDate = new Map<string, CalendarAvailabilityDate>();

  for (const { month, dates = [] } of availabilityMonths) {
    if (!isIsoDate(month)) continue;

    const availabilityByDate = new Map(
      dates
        .filter((entry): entry is { date: string; available?: boolean } => isIsoDate(entry.date))
        .map(({ date, available }) => [date, available])
    );

    for (const date of getMonthDays(month)) {
      if (availabilityByDate.has(date)) {
        const available = availabilityByDate.get(date);

        byDate.set(
          date,
          typeof available === "boolean" ? { date, available } : { date }
        );
        continue;
      }

      if (!byDate.has(date)) {
        byDate.set(date, { date });
      }
    }
  }

  return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date));
}

export function resolveCalendarMinMax(
  dates: CalendarAvailabilityDate[],
  rangeStart: string,
  rangeEnd: string,
  fallbackMonthStart: string
) {
  const sortedDates = dates.map(({ date }) => date).filter(isIsoDate).sort();
  const fallbackMonthEnd = new Date(
    Date.UTC(Number(fallbackMonthStart.slice(0, 4)), Number(fallbackMonthStart.slice(5, 7)), 0)
  )
    .toISOString()
    .slice(0, 10);

  const rawMin = sortedDates[0] ?? fallbackMonthStart;
  const rawMax = sortedDates.at(-1) ?? fallbackMonthEnd;

  const minDate = rawMin < rangeStart ? rangeStart : rawMin > rangeEnd ? rangeEnd : rawMin;
  const maxDate = rawMax > rangeEnd ? rangeEnd : rawMax < rangeStart ? rangeStart : rawMax;

  return minDate <= maxDate
    ? { minDate, maxDate }
    : { minDate: rangeStart, maxDate: rangeEnd };
}
