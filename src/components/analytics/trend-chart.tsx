import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  autoGranularity,
  bucket,
  fmt,
  fmtCompact,
  label as fmtLabel,
  type Basis,
  type DayRow,
  type Granularity,
} from "@/lib/analytics-data";
import { rangeLabel, type Range } from "@/lib/analytics-ranges";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AddedSource } from "./kpi-cards";

export type ActiveCard = "received" | "added" | "improvement" | "completeness";
export type FieldKey = "all" | "email" | "phone" | "address";
export type ReceivedMetric = "total" | "junk" | "valid";
export type CompletenessMetric = "all" | "whois" | "journey" | "staff" | "idScan";
type Stage = "improved" | "existing" | "enrichment";

const C = {
  brand: "oklch(0.56 0.18 262)",
  soft: "oklch(0.72 0.12 262)",
  softer: "oklch(0.86 0.06 258)",
  deep: "oklch(0.42 0.11 250)",
  grid: "oklch(0.92 0.008 255)",
  axis: "oklch(0.56 0.02 260)",
};

const FIELD_RATIO: Record<FieldKey, number> = { all: 1, email: 0.63, phone: 0.52, address: 0.41 };

/** Compact labelled dropdown — the single control pattern used by the chart. */
function Picker<T extends string>({
  value,
  options,
  onChange,
  label,
  width = 176,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  width?: number;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="h-8 text-xs" style={{ width }}>
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const axisProps = {
  tick: { fontSize: 11, fill: C.axis },
  tickLine: false,
  axisLine: false,
} as const;

/** "Aug 11–15" or "Aug 28 – Sep 3" — compact, no year. */
function shortRange(r: Range) {
  const m = (d: Date) => d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const day = (d: Date) => d.getUTCDate();
  const sameMonth =
    r.start.getUTCMonth() === r.end.getUTCMonth() &&
    r.start.getUTCFullYear() === r.end.getUTCFullYear();
  const wholeMonth =
    sameMonth &&
    day(r.start) === 1 &&
    day(r.end) === new Date(Date.UTC(r.end.getUTCFullYear(), r.end.getUTCMonth() + 1, 0)).getUTCDate();
  if (wholeMonth) return r.start.toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  if (day(r.start) === day(r.end) && sameMonth) return `${m(r.start)} ${day(r.start)}`;
  if (sameMonth) return `${m(r.start)} ${day(r.start)}–${day(r.end)}`;
  return `${m(r.start)} ${day(r.start)} – ${m(r.end)} ${day(r.end)}`;
}

function yearLabel(r: Range) {
  const a = r.start.getUTCFullYear();
  const b = r.end.getUTCFullYear();
  return a === b ? String(a) : `${a}–${b}`;
}

type Point = { name: string; value: number };

export function TrendChart({
  card,
  rows,
  compareRows,
  compareOn,
  base,
  comp,
  granularity,
  onGranularity,
  metric,
  onMetric,
  source,
  onSource,
  field,
  onField,
  completenessMetric,
  onCompletenessMetric,
  basis,
  onBasis,
  unequal,
}: {
  card: ActiveCard;
  rows: DayRow[];
  compareRows: DayRow[];
  compareOn: boolean;
  base: Range;
  comp: Range;
  granularity: Granularity | "auto";
  onGranularity: (g: Granularity | "auto") => void;
  metric: ReceivedMetric;
  onMetric: (m: ReceivedMetric) => void;
  source: AddedSource;
  onSource: (s: AddedSource) => void;
  field: FieldKey;
  onField: (f: FieldKey) => void;
  completenessMetric: CompletenessMetric;
  onCompletenessMetric: (m: CompletenessMetric) => void;
  basis: Basis;
  onBasis: (b: Basis) => void;
  unequal: boolean;
}) {
  const [stage, setStage] = useState<Stage>("improved");

  const g: Granularity = granularity === "auto" ? autoGranularity(rows.length) : granularity;
  const isPercent = card === "completeness";

  const SOURCE_LABEL: Record<AddedSource, string> = {
    all: "All sources",
    whois: "Whois AI",
    journey: "Guest Journey",
    hotel: "Hotel Collection",
  };
  const COMPLETENESS_LABEL: Record<CompletenessMetric, string> = {
    all: "Overall completeness",
    whois: "Whois AI",
    journey: "Guest Journey",
    staff: "Staff Collection",
    idScan: "ID Scan",
  };

  const metricOf = (r: DayRow): number => {
    const hotel = r.staff + r.idScan;
    const added = r.whois + r.journey + hotel;
    switch (card) {
      case "received":
        if (metric === "junk") return r.junk * FIELD_RATIO[field];
        if (metric === "valid") return r.valid * FIELD_RATIO[field];
        return r.bookings;
      case "added":
        return source === "all"
          ? added
          : source === "whois"
            ? r.whois
            : source === "journey"
              ? r.journey
              : hotel;
      case "improvement":
        return stage === "existing" ? r.valid : stage === "enrichment" ? added : r.valid + added;
      case "completeness": {
        if (completenessMetric === "all") return r.completeness;
        const part =
          completenessMetric === "whois"
            ? r.whois
            : completenessMetric === "journey"
              ? r.journey
              : completenessMetric === "staff"
                ? r.staff
                : r.idScan;
        // Percentage points of the final completeness contributed by this mechanism.
        return added ? (part / added) * r.completeness : 0;
      }
    }
  };

  const metricName =
    card === "received"
      ? metric === "junk"
        ? field === "all"
          ? "Junk guest info"
          : `Junk ${field}`
        : metric === "valid"
          ? field === "all"
            ? "Valid guest info"
            : `Valid ${field}`
          : "Bookings analyzed"
      : card === "added"
        ? source === "all"
          ? "Guest information added"
          : `${SOURCE_LABEL[source]} information added`
        : card === "improvement"
          ? stage === "existing"
            ? "Existing valid info"
            : stage === "enrichment"
              ? "Information enrichment"
              : "Improved valid info"
          : completenessMetric === "all"
            ? "Information completeness"
            : `${COMPLETENESS_LABEL[completenessMetric]} contribution`;

  const yAxisLabel = isPercent
    ? completenessMetric === "all"
      ? "% Complete"
      : "% points contributed"
    : card === "received"
      ? metric === "junk"
        ? "Junk information"
        : metric === "valid"
          ? "Valid information"
          : "Bookings"
      : card === "added"
        ? "Information added"
        : stage === "enrichment"
          ? "Information enriched"
          : stage === "existing"
            ? "Existing valid information"
            : "Improved valid information";

  // ---------- Trend mode data (single period, daily/bucketed) ----------
  const curBuckets = useMemo(() => bucket(rows, g), [rows, g]);
  const trendData: Point[] = useMemo(
    () =>
      curBuckets.map((r) => ({
        name: fmtLabel(r.date, g),
        value: isPercent ? Number(metricOf(r).toFixed(1)) : Math.round(metricOf(r)),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [curBuckets, g, card, metric, source, field, stage, completenessMetric],
  );

  // ---------- Comparison mode data (two aggregate categories) ----------
  const aggregate = (rs: DayRow[]) => {
    if (!rs.length) return 0;
    const total = rs.reduce((a, r) => a + metricOf(r), 0);
    if (isPercent) return Number((total / rs.length).toFixed(1));
    return basis === "avg" ? Number((total / rs.length).toFixed(1)) : Math.round(total);
  };

  const curValue = useMemo(
    () => aggregate(rows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, card, metric, source, field, stage, completenessMetric, basis],
  );
  const cmpValue = useMemo(
    () => aggregate(compareRows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [compareRows, card, metric, source, field, stage, completenessMetric, basis],
  );

  const baseShort = shortRange(base);
  const cmpShort = shortRange(comp);

  const compareData = [
    { key: "current" as const, name: baseShort, year: yearLabel(base), value: curValue },
    { key: "comparison" as const, name: cmpShort, year: yearLabel(comp), value: cmpValue },
  ];

  const delta = curValue - cmpValue;
  const pct = cmpValue ? (delta / cmpValue) * 100 : 0;

  const fmtV = (v: number) =>
    isPercent ? `${v.toFixed(1)}%` : basis === "avg" && compareOn ? v.toLocaleString("en-US") : fmt(v);

  // ---------- Interpretation ----------
  let verdict: { label: string; detail: string; tone: "up" | "down" | "flat" } = {
    label: "Stable",
    detail: "",
    tone: "flat",
  };

  if (compareOn) {
    if (isPercent) {
      verdict = {
        label: delta > 1 ? "Building traction" : delta < -1 ? "Slowing" : "Stable",
        detail: `${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} pts`,
        tone: delta > 1 ? "up" : delta < -1 ? "down" : "flat",
      };
    } else {
      verdict = {
        label:
          pct > 12
            ? "Momentum increasing"
            : pct > 3
              ? "Building traction"
              : pct >= -3
                ? "Stable"
                : "Slowing",
        detail: `${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%`,
        tone: pct > 3 ? "up" : pct < -3 ? "down" : "flat",
      };
    }
  } else if (trendData.length > 3) {
    const vals = trendData.map((d) => d.value);
    const half = Math.floor(vals.length / 2);
    const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
    const first = avg(vals.slice(0, half));
    const second = avg(vals.slice(half));
    const p = first ? ((second - first) / first) * 100 : 0;
    verdict = {
      label: p > 5 ? "Increasing" : p < -5 ? "Declining" : "Stable",
      detail: p > 5 ? "Trending upward" : p < -5 ? "Trending downward" : "Movement within range",
      tone: p > 5 ? "up" : p < -5 ? "down" : "flat",
    };
  }

  const hasData = compareOn ? rows.length > 0 || compareRows.length > 0 : trendData.length > 0;
  const comparisonMissing = compareOn && compareRows.length === 0;

  const title = compareOn ? `${metricName} by period` : `${metricName} over time`;
  const subtitle =
    card === "received"
      ? metric === "total"
        ? "OTA booking volume over time"
        : "Guest information quality over time"
      : card === "added"
        ? "Additional guest information created over time"
        : card === "improvement"
          ? "How the usable information pool grows over time"
          : "Share of guest profiles with the required fields";

  return (
    <section className="card-surface flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {card === "received" ? (
            <>
              <Picker
                label="Metric"
                value={metric}
                onChange={onMetric}
                width={150}
                options={[
                  { value: "total", label: "Total" },
                  { value: "junk", label: "Junk" },
                  { value: "valid", label: "Valid" },
                ]}
              />
              {metric !== "total" ? (
                <Picker
                  label="Breakdown"
                  value={field}
                  onChange={onField}
                  width={168}
                  options={[
                    { value: "all", label: "All" },
                    { value: "email", label: "Email" },
                    { value: "phone", label: "Phone" },
                    { value: "address", label: "Address" },
                  ]}
                />
              ) : null}
            </>
          ) : null}
          {card === "added" ? (
            <Picker
              label="Source"
              value={source}
              onChange={onSource}
              options={[
                { value: "all", label: "All" },
                { value: "whois", label: "Whois AI" },
                { value: "journey", label: "Guest Journey" },
                { value: "hotel", label: "Hotel Collection" },
              ]}
            />
          ) : null}
          {card === "improvement" ? (
            <Picker
              label="Metric"
              value={stage}
              onChange={setStage}
              width={198}
              options={[
                { value: "improved", label: "Improved Valid Info" },
                { value: "enrichment", label: "Information Enrichment" },
                { value: "existing", label: "Existing Valid Info" },
              ]}
            />
          ) : null}
          {card === "completeness" ? (
            <Picker
              label="Metric"
              value={completenessMetric}
              onChange={onCompletenessMetric}
              options={[
                { value: "all", label: "All" },
                { value: "whois", label: "Whois AI" },
                { value: "journey", label: "Guest Journey" },
                { value: "staff", label: "Staff Collection" },
                { value: "idScan", label: "ID Scan" },
              ]}
            />
          ) : null}
          {compareOn ? (
            !isPercent ? (
              <Picker
                label="Compare by"
                value={basis}
                onChange={onBasis}
                width={188}
                options={[
                  { value: "total", label: "Total" },
                  { value: "avg", label: "Daily average" },
                ]}
              />
            ) : null
          ) : (
            <Picker
              label="Granularity"
              value={granularity}
              onChange={onGranularity}
              width={172}
              options={[
                { value: "auto", label: "Auto" },
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
              ]}
            />
          )}
        </div>
      </div>

      {/* Interpretation + comparison summary */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-border py-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            {compareOn ? "Comparison result" : "Momentum"}
          </span>
          <span
            className={cn(
              "text-sm font-semibold",
              verdict.tone === "up"
                ? "text-brand"
                : verdict.tone === "down"
                  ? "text-destructive"
                  : "text-foreground",
            )}
          >
            {verdict.label}
          </span>
          {verdict.detail ? (
            <span
              className={cn(
                "text-xs font-medium tabular-nums",
                compareOn
                  ? verdict.tone === "up"
                    ? "text-brand"
                    : verdict.tone === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                  : "text-muted-foreground",
              )}
            >
              {verdict.detail}
            </span>
          ) : null}
        </div>

        {compareOn ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: C.brand }} />
              <span className="text-muted-foreground">{baseShort}</span>
              <span className="font-semibold tabular-nums">{fmtV(curValue)}</span>
            </span>
            <span className="text-border">vs</span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: C.softer }} />
              <span className="text-muted-foreground">{cmpShort}</span>
              <span className="font-semibold tabular-nums">{fmtV(cmpValue)}</span>
            </span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                delta > 0 ? "text-brand" : delta < 0 ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {delta >= 0 ? "+" : "−"}
              {isPercent
                ? `${Math.abs(delta).toFixed(1)} pts`
                : `${fmtV(Math.abs(delta))} · ${pct >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%`}
            </span>
          </div>
        ) : null}
      </div>

      {compareOn && unequal && basis === "total" && !isPercent ? (
        <p className="rounded-lg bg-brand-softer/60 px-3 py-2 text-xs text-brand-deep">
          These periods have different lengths — switch “Compare by” to Daily average for a
          like-for-like comparison.
        </p>
      ) : null}

      {comparisonMissing ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Comparison unavailable</span> — no historical
          data is available for the selected comparison period.
        </p>
      ) : null}

      {!hasData ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-center">
          <p className="text-sm font-medium">No data available</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            There isn't enough activity to display this metric for the selected period.
          </p>
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {compareOn ? (
              <BarChart
                data={compareData}
                margin={{ top: 8, right: 8, left: 4, bottom: 12 }}
                barCategoryGap="35%"
              >
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis
                  dataKey="name"
                  {...axisProps}
                  tick={({ x, y, payload }) => {
                    const row = compareData[payload.index];
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          textAnchor="middle"
                          dy={14}
                          style={{ fontSize: 12, fontWeight: 500 }}
                          fill={C.deep}
                        >
                          {row?.name}
                        </text>
                      </g>
                    );
                  }}
                />
                <YAxis
                  {...axisProps}
                  domain={isPercent ? [0, 100] : [0, "auto"]}
                  tickFormatter={(v: number) => (isPercent ? `${v}%` : fmtCompact(v))}
                  label={{
                    value: yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: C.axis, textAnchor: "middle" },
                  }}
                  width={72}
                />
                <RTooltip
                  cursor={{ fill: "oklch(0.95 0.01 258 / 0.5)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload as (typeof compareData)[number] | undefined;
                    if (!row) return null;
                    const other = row.key === "current" ? compareData[1] : compareData[0];
                    return (
                      <div className="min-w-[190px] rounded-xl border border-border bg-popover p-3 text-xs shadow-lg">
                        <p className="mb-1.5 font-semibold">
                          {row.name}, {row.year}
                        </p>
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{metricName}</span>
                          <span className="font-medium tabular-nums">{fmtV(row.value)}</span>
                        </p>
                        {other ? (
                          <p className="mt-1 flex justify-between gap-4">
                            <span className="text-muted-foreground">
                              {other.name}, {other.year}
                            </span>
                            <span className="font-medium tabular-nums">{fmtV(other.value)}</span>
                          </p>
                        ) : null}
                        <p className="mt-1.5 flex justify-between gap-4 border-t border-border pt-1.5">
                          <span className="text-muted-foreground">Difference</span>
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              delta > 0 ? "text-brand" : delta < 0 ? "text-destructive" : "",
                            )}
                          >
                            {delta >= 0 ? "+" : "−"}
                            {isPercent
                              ? `${Math.abs(delta).toFixed(1)} pts`
                              : fmtV(Math.abs(delta))}
                          </span>
                        </p>
                        {!isPercent ? (
                          <p className="flex justify-between gap-4">
                            <span className="text-muted-foreground">Change</span>
                            <span
                              className={cn(
                                "font-semibold tabular-nums",
                                pct > 0 ? "text-brand" : pct < 0 ? "text-destructive" : "",
                              )}
                            >
                              {pct >= 0 ? "+" : "−"}
                              {Math.abs(pct).toFixed(1)}%
                            </span>
                          </p>
                        ) : null}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={110}>
                  {compareData.map((d) => (
                    <Cell key={d.key} fill={d.key === "current" ? C.brand : C.softer} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={trendData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={C.grid} />
                <XAxis dataKey="name" {...axisProps} minTickGap={24} />
                <YAxis
                  {...axisProps}
                  domain={isPercent ? [0, 100] : ["auto", "auto"]}
                  tickFormatter={(v: number) => (isPercent ? `${v}%` : fmtCompact(v))}
                  label={{
                    value: yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 10, fill: C.axis, textAnchor: "middle" },
                  }}
                  width={72}
                />
                <RTooltip
                  cursor={{ stroke: C.softer, strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0]?.payload as Point | undefined;
                    if (!p) return null;
                    return (
                      <div className="min-w-[170px] rounded-xl border border-border bg-popover p-3 text-xs shadow-lg">
                        <p className="mb-1.5 font-semibold">{p.name}</p>
                        <p className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{metricName}</span>
                          <span className="font-medium tabular-nums">
                            {isPercent ? `${p.value.toFixed(1)}%` : fmt(p.value)}
                          </span>
                        </p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  name={metricName}
                  stroke={C.brand}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
