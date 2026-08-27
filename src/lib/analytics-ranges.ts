import { TODAY, addDays, daysBetween, iso } from "./analytics-data";

export type PeriodKey =
  | "today"
  | "yesterday"
  | "7d"
  | "15d"
  | "30d"
  | "90d"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "12m"
  | "this_year"
  | "last_year"
  | "custom";
export type CompareKey =
  | "none"
  | "previous_period"
  | "previous_month"
  | "previous_quarter"
  | "same_period_last_year"
  | "same_month_last_year"
  | "same_quarter_last_year"
  | Exclude<PeriodKey, "custom">
  | "custom";

export type Range = { start: Date; end: Date };

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "15d", label: "Last 15 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "this_week", label: "This week" },
  { value: "last_week", label: "Last week" },
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "12m", label: "Last 12 months" },
  { value: "this_year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

/** Start of the calendar week (Monday) containing d, in UTC. */
function startOfWeekUTC(d: Date) {
  const c = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (c.getUTCDay() + 6) % 7; // 0 = Monday
  return addDays(c, -dow);
}

function startOfMonthUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function startOfYearUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
}

export const COMPARE_OPTIONS: { value: CompareKey; label: string }[] = [
  { value: "none", label: "No comparison" },
  { value: "previous_period", label: "Previous period" },
  { value: "previous_month", label: "Previous month" },
  { value: "previous_quarter", label: "Previous quarter" },
  { value: "same_period_last_year", label: "Same period last year" },
  { value: "same_month_last_year", label: "Same month last year" },
  { value: "same_quarter_last_year", label: "Same quarter last year" },
  // Fixed time frames, mirroring the Period selector
  ...PERIOD_OPTIONS.filter((o) => o.value !== "custom").map((o) => ({
    value: o.value as CompareKey,
    label: o.label,
  })),
  { value: "custom", label: "Custom comparison" },
];

export function periodRange(key: PeriodKey, custom: { start: string; end: string }): Range {
  if (key === "custom") {
    return { start: new Date(custom.start + "T00:00:00Z"), end: new Date(custom.end + "T00:00:00Z") };
  }
  const end = TODAY;
  switch (key) {
    case "today":
      return { start: end, end };
    case "yesterday":
      return { start: addDays(end, -1), end: addDays(end, -1) };
    case "this_week":
      return { start: startOfWeekUTC(end), end };
    case "last_week": {
      const start = addDays(startOfWeekUTC(end), -7);
      return { start, end: addDays(start, 6) };
    }
    case "this_month":
      return { start: startOfMonthUTC(end), end };
    case "last_month": {
      const start = shiftMonths(startOfMonthUTC(end), -1);
      return { start, end: addDays(startOfMonthUTC(end), -1) };
    }
    case "this_year":
      return { start: startOfYearUTC(end), end };
    case "last_year": {
      const start = startOfYearUTC(end);
      return {
        start: new Date(Date.UTC(start.getUTCFullYear() - 1, 0, 1)),
        end: new Date(Date.UTC(start.getUTCFullYear() - 1, 11, 31)),
      };
    }
  }
  const days = key === "7d" ? 7 : key === "15d" ? 15 : key === "30d" ? 30 : key === "90d" ? 90 : 365;
  return { start: addDays(end, -(days - 1)), end };
}

function shiftMonths(d: Date, n: number) {
  const c = new Date(d);
  c.setUTCMonth(c.getUTCMonth() + n);
  return c;
}

export function compareRange(
  key: CompareKey,
  base: Range,
  custom: { start: string; end: string },
): Range {
  const len = daysBetween(base.start, base.end);
  switch (key) {
    case "none":
      return { start: addDays(base.start, -len), end: addDays(base.start, -1) };
    case "previous_period":
      return { start: addDays(base.start, -len), end: addDays(base.start, -1) };
    case "previous_month":
      return { start: shiftMonths(base.start, -1), end: shiftMonths(base.end, -1) };
    case "previous_quarter":
      return { start: shiftMonths(base.start, -3), end: shiftMonths(base.end, -3) };
    case "same_period_last_year":
    case "same_month_last_year":
      return { start: shiftMonths(base.start, -12), end: shiftMonths(base.end, -12) };
    case "same_quarter_last_year":
      return { start: shiftMonths(base.start, -15), end: shiftMonths(base.end, -15) };
    case "custom":
      return {
        start: new Date(custom.start + "T00:00:00Z"),
        end: new Date(custom.end + "T00:00:00Z"),
      };
    default:
      // Fixed time frames mirroring the Period selector (e.g. "Last 30 days").
      return periodRange(key as PeriodKey, custom);
  }
}

export function rangeLabel(r: Range) {
  const f = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit", timeZone: "UTC" });
  return `${f(r.start)} – ${f(r.end)}`;
}

export function defaultCustom(offsetDays: number, len: number) {
  const end = addDays(TODAY, -offsetDays);
  return { start: iso(addDays(end, -(len - 1))), end: iso(end) };
}
