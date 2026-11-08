// src/components/availabily-page/availability-calendar-client.ts
import { getTodayIsoInParis } from "@lib/availability-calendar";
import { Calendar, annotations } from "vanilla-calendar-pro";

export type AvailabilityCalendarData = {
  availableDates: string[];
  unavailableDates: string[];
  defaultUnavailableDates: string[];
  minDate: string;
  maxDate: string;
};

export function parseAvailabilityCalendarData(raw: string): AvailabilityCalendarData | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AvailabilityCalendarData>;
    if (
      !Array.isArray(parsed.availableDates) ||
      !Array.isArray(parsed.unavailableDates) ||
      !Array.isArray(parsed.defaultUnavailableDates) ||
      typeof parsed.minDate !== "string" ||
      typeof parsed.maxDate !== "string"
    ) {
      return null;
    }

    return {
      availableDates: parsed.availableDates,
      unavailableDates: parsed.unavailableDates,
      defaultUnavailableDates: parsed.defaultUnavailableDates,
      minDate: parsed.minDate,
      maxDate: parsed.maxDate,
    };
  } catch {
    return null;
  }
}

function scrollAgendaTarget(calendarEl: HTMLElement) {
  const agendaEl =
    document.getElementById("agenda") ??
    document.querySelector<HTMLElement>("[data-agenda-anchor]");

  const restoreAgendaId = () => {
    if (!agendaEl || agendaEl.id === "agenda") return;
    agendaEl.id = "agenda";
    agendaEl.removeAttribute("data-agenda-anchor");
  };

  const scrollToCalendar = () => {
    const rect = calendarEl.getBoundingClientRect();
    const pageY = window.scrollY + rect.top;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const headerOffset = isDesktop
      ? Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--header-height")
        ) || 0
      : 0;
    const mobileNav = document.querySelector<HTMLElement>("[data-mobile-nav] nav");
    const mobileNavHeight = !isDesktop && mobileNav ? mobileNav.getBoundingClientRect().height : 0;
    const freeHeight = window.innerHeight - headerOffset - mobileNavHeight;

    const top =
      rect.height >= freeHeight
        ? pageY - headerOffset
        : pageY - headerOffset - (freeHeight - rect.height) / 2;

    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
  };

  const finishAgendaScroll = () => {
    scrollToCalendar();
    // Re-attaching id can trigger a native hash jump — re-center after restore.
    restoreAgendaId();
    scrollToCalendar();
  };

  scrollToCalendar();
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToCalendar);
  });
  window.addEventListener("load", finishAgendaScroll, { once: true });
  window.setTimeout(finishAgendaScroll, 150);
}

function initOneCalendar(element: HTMLElement) {
  const rawData = element.dataset.availabilityCalendar;
  if (!rawData) return;

  const data = parseAvailabilityCalendarData(rawData);
  if (!data) {
    console.warn("[availability-calendar] Invalid calendar payload; skipping init");
    return;
  }

  const { availableDates, unavailableDates, defaultUnavailableDates, minDate, maxDate } = data;

  if (!minDate || !maxDate || minDate > maxDate) {
    console.warn("[availability-calendar] Invalid date range; skipping calendar init", {
      minDate,
      maxDate,
    });
    return;
  }

  const availableIcon =
    document.querySelector<HTMLTemplateElement>("#availability-icon-available")?.innerHTML ??
    "✅ Disponible";
  const unavailableIcon =
    document.querySelector<HTMLTemplateElement>("#availability-icon-unavailable")?.innerHTML ??
    "🔴 Complet";
  const defaultUnavailableIcon =
    document.querySelector<HTMLTemplateElement>("#availability-icon-default-unavailable")
      ?.innerHTML ?? "✖️​ Non disponible";
  const popups = Object.fromEntries([
    ...availableDates.map((date) => [
      date,
      { modifier: "vc-date__btn--available", html: availableIcon },
    ]),
    ...unavailableDates.map((date) => [
      date,
      { modifier: "vc-date__btn--unavailable", html: unavailableIcon },
    ]),
    ...defaultUnavailableDates.map((date) => [
      date,
      { modifier: "vc-date__btn--default-unavailable", html: defaultUnavailableIcon },
    ]),
  ]);
  const todayDate = getTodayIsoInParis();

  const calendarOptions = {
    type: "default",
    dateMin: minDate,
    dateMax: maxDate,
    dateToday: "today",
    displayDateMin: minDate,
    displayDateMax: maxDate,
    selectionDatesMode: false,
    selectionMonthsMode: "only-arrows",
    selectionYearsMode: "only-arrows",
    extensions: [annotations],
    popups,
    locale: "fr-FR",
    onCreateDateEls: (_calendar: Calendar, dateEl: HTMLElement) => {
      const date = dateEl.dataset.vcDate;

      if (date && date < todayDate) {
        dateEl.classList.add("vc-date--past");
      }
    },
  } as ConstructorParameters<typeof Calendar>[1];

  const calendar = new Calendar(element, calendarOptions);
  calendar.init();

  /** Center #calendar in the free viewport when arriving via #agenda. */
  if (location.hash === "#agenda") {
    history.scrollRestoration = "manual";
    const calendarEl = document.getElementById("calendar") ?? element;
    scrollAgendaTarget(calendarEl);
  }
}

/** Boot every `[data-availability-calendar]` root on the page. */
export function initAvailabilityCalendars() {
  document
    .querySelectorAll<HTMLElement>("[data-availability-calendar]")
    .forEach((element) => initOneCalendar(element));
}
