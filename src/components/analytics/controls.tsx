import { CalendarDays } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMPARE_OPTIONS,
  PERIOD_OPTIONS,
  type CompareKey,
  type PeriodKey,
  type Range,
} from "@/lib/analytics-ranges";
import type { Basis } from "@/lib/analytics-data";
import { cn } from "@/lib/utils";

export type DateRangeState = { start: string; end: string };

function DateRangeField({
  title,
  value,
  onChange,
}: {
  title: string;
  value: DateRangeState;
  onChange: (v: DateRangeState) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</p>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value.start}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-muted-foreground text-xs">→</span>
        <input
          type="date"
          value={value.end}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

export function BasisToggle({ basis, onChange }: { basis: Basis; onChange: (b: Basis) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
      {(["avg", "total"] as Basis[]).map((b) => (
        <button
          key={b}
          type="button"
          onClick={() => onChange(b)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            basis === b
              ? "bg-brand text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {b === "avg" ? "Daily average" : "Total"}
        </button>
      ))}
    </div>
  );
}

export function AnalyticsControls({
  period,
  onPeriod,
  compare,
  onCompare,
  analyzeRange,
  onAnalyzeRange,
  compareRangeState,
  onCompareRange,
  base,
  comp,
  unequal,
  basis,
  onBasis,
}: {
  period: PeriodKey;
  onPeriod: (p: PeriodKey) => void;
  compare: CompareKey;
  onCompare: (c: CompareKey) => void;
  analyzeRange: DateRangeState;
  onAnalyzeRange: (r: DateRangeState) => void;
  compareRangeState: DateRangeState;
  onCompareRange: (r: DateRangeState) => void;
  base: Range;
  comp: Range;
  unequal: boolean;
  basis: Basis;
  onBasis: (b: Basis) => void;
}) {
  const showCustomFields = period === "custom" || compare === "custom";
  return (
    <div className="card-surface flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Period</span>
          <Select value={period} onValueChange={(v) => onPeriod(v as PeriodKey)}>
            <SelectTrigger className="h-10 w-[178px] bg-card">
              <CalendarDays className="size-4 text-brand" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Compare</span>
          <Select value={compare} onValueChange={(v) => onCompare(v as CompareKey)}>
            <SelectTrigger className="h-10 w-[220px] bg-card">
              <CalendarDays className="size-4 text-brand" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMPARE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <BasisToggle basis={basis} onChange={onBasis} />
        </div>
      </div>

      {showCustomFields ? (
        <div className="flex flex-wrap gap-8 border-t border-border pt-4">
          <DateRangeField title="Analyze" value={analyzeRange} onChange={onAnalyzeRange} />
          <DateRangeField
            title="Compare with"
            value={compareRangeState}
            onChange={onCompareRange}
          />
        </div>
      ) : null}

      {unequal ? (
        <p className="rounded-lg bg-brand-softer/60 px-3 py-2 text-xs text-brand-deep">
          {basis === "avg"
            ? "The selected ranges have different lengths, so volume metrics are compared as a daily average."
            : "Heads up: these ranges have different lengths — raw totals are not directly comparable."}
        </p>
      ) : null}
    </div>
  );
}
