// Deterministic mock analytics data for OTA Buster - Information Received

export type DayRow = {
  date: string; // ISO yyyy-mm-dd
  bookings: number;
  junk: number;
  valid: number;
  whois: number;
  journey: number;
  staff: number;
  idScan: number;
  completeness: number; // 0-100
};

function seeded(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

/** Stable "today" so SSR and client agree. */
export const TODAY = new Date("2026-08-27T00:00:00Z");

export function buildRow(date: Date): DayRow {
  const key = Math.floor(date.getTime() / 86400000);
  const r1 = seeded(key);
  const r2 = seeded(key + 101);
  const r3 = seeded(key + 202);
  const trend = (key % 400) / 400;
  const bookings = Math.round(380 + r1 * 180 + trend * 90);
  const junk = Math.round(bookings * (0.3 + r2 * 0.08));
  const valid = bookings - junk;
  const whois = Math.round(junk * (0.62 + r3 * 0.16));
  const journey = Math.round(bookings * (0.21 + r1 * 0.07));
  const staff = Math.round(bookings * (0.1 + r2 * 0.045));
  const idScan = Math.round(bookings * (0.07 + r3 * 0.045));
  const completeness = 68 + r2 * 6 + trend * 14;
  return { date: iso(date), bookings, junk, valid, whois, journey, staff, idScan, completeness };
}

export function seriesFor(start: Date, end: Date): DayRow[] {
  const out: DayRow[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1)) out.push(buildRow(d));
  return out;
}

export type Totals = {
  days: number;
  bookings: number;
  junk: number;
  valid: number;
  whois: number;
  journey: number;
  staff: number;
  idScan: number;
  hotel: number;
  added: number;
  enrichment: number;
  improvedValid: number;
  completeness: number;
};

export function totalsOf(rows: DayRow[]): Totals {
  const sum = (k: keyof DayRow) => rows.reduce((a, r) => a + (r[k] as number), 0);
  const staff = sum("staff");
  const idScan = sum("idScan");
  const whois = sum("whois");
  const journey = sum("journey");
  const valid = sum("valid");
  const hotel = staff + idScan;
  const added = whois + journey + hotel;
  return {
    days: rows.length || 1,
    bookings: sum("bookings"),
    junk: sum("junk"),
    valid,
    whois,
    journey,
    staff,
    idScan,
    hotel,
    added,
    enrichment: added,
    improvedValid: valid + added,
    completeness: rows.length ? rows.reduce((a, r) => a + r.completeness, 0) / rows.length : 0,
  };
}

/** Field split (email / phone / address) derived deterministically from a total. */
export function fields(total: number) {
  return {
    email: Math.round(total * 0.63),
    phone: Math.round(total * 0.52),
    address: Math.round(total * 0.41),
  };
}

export function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export function fmtCompact(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(Math.round(n));
}

export type Basis = "avg" | "total";

export function pctChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export function momentum(delta: number): "Building momentum" | "Improving" | "Stable" | "Slowing" {
  if (delta > 12) return "Building momentum";
  if (delta > 3) return "Improving";
  if (delta >= -3) return "Stable";
  return "Slowing";
}

export type Granularity = "day" | "week" | "month";

export function autoGranularity(days: number): Granularity {
  if (days <= 31) return "day";
  if (days <= 180) return "week";
  return "month";
}

export function bucket(rows: DayRow[], g: Granularity): DayRow[] {
  if (g === "day") return rows;
  const size = g === "week" ? 7 : 30;
  const out: DayRow[] = [];
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const first = chunk[0];
    if (!first) continue;
    const t = totalsOf(chunk);
    out.push({
      date: first.date,
      bookings: t.bookings,
      junk: t.junk,
      valid: t.valid,
      whois: t.whois,
      journey: t.journey,
      staff: t.staff,
      idScan: t.idScan,
      completeness: t.completeness,
    });
  }
  return out;
}

export function label(dateStr: string, g: Granularity) {
  const d = new Date(dateStr + "T00:00:00Z");
  const opts: Intl.DateTimeFormatOptions =
    g === "month"
      ? { month: "short", year: "2-digit", timeZone: "UTC" }
      : { month: "short", day: "numeric", timeZone: "UTC" };
  return d.toLocaleDateString("en-US", opts);
}
