import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BigNumber, CardFrame, CardHeader, Delta, InfoTip, MetaRow } from "./primitives";
import { fields, fmt, pctChange, type Basis, type Totals } from "@/lib/analytics-data";
import { cn } from "@/lib/utils";

export type ReceivedView = "all" | "junk" | "valid";
export type AddedSource = "all" | "whois" | "journey" | "hotel";

export const TIPS = {
  bookings: "Total OTA booking records analyzed during the selected period.",
  junk: "Guest information requiring cleanup or improvement before it can be considered usable.",
  valid: "Guest information that is already usable based on the platform's validation criteria.",
  added:
    "Additional guest information introduced through enrichment, guest interaction, or hotel collection.",
  enrichment:
    "Additional information made usable through OTA Buster's enrichment and collection processes.",
  improved:
    "The resulting usable information pool after existing valid information and additional enriched information are combined.",
  completeness:
    "The percentage of final guest information that contains the required information fields.",
};

function scale(v: number, days: number, basis: Basis) {
  return basis === "avg" ? v / days : v;
}

function useValue(cur: Totals, prev: Totals, basis: Basis) {
  return (key: keyof Totals) => {
    const c = scale(cur[key] as number, cur.days, basis);
    const p = scale(prev[key] as number, prev.days, basis);
    return { value: c, delta: pctChange(c, p) };
  };
}

const basisNote = (basis: Basis) => (basis === "avg" ? "Daily average" : "Period total");

/* ---------------- Card 1 — OTA Information Received ---------------- */

export function ReceivedCard({
  cur,
  prev,
  basis,
  view,
  onView,
  active,
  onSelect,
}: {
  cur: Totals;
  prev: Totals;
  basis: Basis;
  view: ReceivedView;
  onView: (v: ReceivedView) => void;
  active: boolean;
  onSelect: () => void;
}) {
  const v = useValue(cur, prev, basis);
  const main = view === "all" ? v("bookings") : view === "junk" ? v("junk") : v("valid");
  const f = fields(main.value);
  const label =
    view === "all" ? "Bookings analyzed" : view === "junk" ? "Junk guest info" : "Valid guest info";
  const tip = view === "all" ? TIPS.bookings : view === "junk" ? TIPS.junk : TIPS.valid;
  const description =
    view === "valid"
      ? "Guest information that is already usable."
      : view === "junk"
        ? "Information that requires cleanup before it can be used."
        : "Booking information received from OTA engines during the selected period.";

  return (
    <CardFrame tone="dark" active={active} onSelect={onSelect}>
      <CardHeader
        title="OTA Information Received"
        description={description}
        action={
          <Select value={view} onValueChange={(x) => onView(x as ReceivedView)}>
            <SelectTrigger className="h-8 w-[132px] border-white/15 bg-white/10 text-xs text-current">
              <span className="text-current/55">View:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="junk">Junk info</SelectItem>
              <SelectItem value="valid">Valid info</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <BigNumber
        value={fmt(main.value)}
        label={label}
        tip={tip}
        delta={main.delta}
        basisNote={basisNote(basis)}
      />

      {view === "all" ? (
        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
          {[
            { k: "Junk info", d: v("junk") },
            { k: "Valid info", d: v("valid") },
          ].map((x) => (
            <div key={x.k} className="space-y-1">
              <p className="text-xs text-current/55">{x.k}</p>
              <p className="text-lg font-semibold tabular-nums">{fmt(x.d.value)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-auto border-t border-white/10 pt-4">
          <MetaRow
            items={[
              { label: "Email", value: fmt(f.email) },
              { label: "Phone", value: fmt(f.phone) },
              { label: "Address", value: fmt(f.address) },
            ]}
          />
        </div>
      )}

      {view === "all" ? (
        <MetaRow
          items={[
            { label: "Email", value: fmt(f.email) },
            { label: "Phone", value: fmt(f.phone) },
            { label: "Address", value: fmt(f.address) },
          ]}
          className="text-current/70"
        />
      ) : null}
    </CardFrame>
  );
}

/* ---------------- Card 2 — Guest Information Added ---------------- */

export function AddedCard({
  cur,
  prev,
  basis,
  source,
  onSource,
  active,
  onSelect,
}: {
  cur: Totals;
  prev: Totals;
  basis: Basis;
  source: AddedSource;
  onSource: (s: AddedSource) => void;
  active: boolean;
  onSelect: () => void;
}) {
  const v = useValue(cur, prev, basis);
  const map = {
    all: { d: v("added"), label: "Total guest information added", tip: TIPS.added },
    whois: { d: v("whois"), label: "Whois AI", tip: TIPS.added },
    journey: { d: v("journey"), label: "Guest Journey", tip: TIPS.added },
    hotel: { d: v("hotel"), label: "Hotel Collection", tip: TIPS.added },
  } as const;
  const cardDescription = {
    all: "Additional guest information added beyond the original OTA booking data.",
    whois:
      "Guest information made usable through AI-powered cleanup and enrichment of junk information.",
    journey:
      "Guest information provided through OTA Buster guest messaging and landing experiences.",
    hotel: "Guest information collected on property by your team.",
  }[source];
  const current = map[source];

  return (
    <CardFrame active={active} onSelect={onSelect}>
      <CardHeader
        title="Guest Information Added"
        description={cardDescription}
        action={
          <Select value={source} onValueChange={(x) => onSource(x as AddedSource)}>
            <SelectTrigger className="h-8 w-[168px] text-xs">
              <span className="text-muted-foreground">Source:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="whois">Whois AI</SelectItem>
              <SelectItem value="journey">Guest Journey</SelectItem>
              <SelectItem value="hotel">Hotel Collection</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <BigNumber
        value={`+${fmt(current.d.value)}`}
        label={current.label}
        tip={current.tip}
        delta={current.d.delta}
        basisNote={basisNote(basis)}
      />

      {source === "all" ? (
        <div className="mt-auto space-y-2.5 border-t border-border pt-4">
          {[
            { k: "Whois AI", d: v("whois") },
            { k: "Guest Journey", d: v("journey") },
            { k: "Hotel Collection", d: v("hotel") },
          ].map((x) => {
            const pct = current.d.value ? (x.d.value / current.d.value) * 100 : 0;
            return (
              <div key={x.k} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{x.k}</span>
                  <span className="font-semibold tabular-nums">+{fmt(x.d.value)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-auto border-t border-border pt-4">
          <MetaRow
            items={
              source === "hotel"
                ? [
                    { label: "Staff collection", value: fmt(scale(cur.staff, cur.days, basis)) },
                    { label: "ID scan", value: fmt(scale(cur.idScan, cur.days, basis)) },
                  ]
                : [
                    { label: "Email", value: fmt(fields(current.d.value).email) },
                    { label: "Phone", value: fmt(fields(current.d.value).phone) },
                    { label: "Address", value: fmt(fields(current.d.value).address) },
                  ]
            }
          />
        </div>
      )}
    </CardFrame>
  );
}

/* ---------------- Card 3 — Information Improvement (rising funnel) --------------- */

export function ImprovementCard({
  cur,
  prev,
  basis,
  active,
  onSelect,
}: {
  cur: Totals;
  prev: Totals;
  basis: Basis;
  active: boolean;
  onSelect: () => void;
}) {
  const v = useValue(cur, prev, basis);
  const enrichment = v("enrichment");
  const existing = v("valid");
  const improved = v("improvedValid");
  const f = fields(improved.value);
  const max = Math.max(enrichment.value, existing.value, improved.value) || 1;

  const stages = [
    {
      key: "existing",
      label: "Existing valid info",
      value: existing.value,
      tip: TIPS.valid,
      cls: "bg-brand-soft text-primary-foreground",
    },
    {
      key: "enrichment",
      label: "Information enrichment",
      value: enrichment.value,
      tip: TIPS.enrichment,
      cls: "bg-brand-softer text-brand-deep",
    },
    {
      key: "improved",
      label: "Improved valid info",
      value: improved.value,
      tip: TIPS.improved,
      cls: "bg-brand text-primary-foreground",
    },
  ];

  return (
    <CardFrame active={active} onSelect={onSelect}>
      <CardHeader
        title="Information Improvement"
        description="How enrichment increased the amount of usable guest information."
        tip={TIPS.improved}
      />

      <div className="flex flex-col items-center gap-1.5 py-2">
        {stages.map((s, i) => {
          const width = 42 + Math.max(0.3, s.value / max) * 58;
          return (
            <div key={s.key} className="flex w-full flex-col items-center gap-1.5">
              {i > 0 ? (
                <span className="text-xs font-medium text-muted-foreground">
                  {i === 1 ? "+" : "="}
                </span>
              ) : null}
              <div
                className={cn(
                  "flex h-11 items-center justify-center gap-2 px-4 transition-all",
                  s.cls,
                  i === 2 && "shadow-[var(--shadow-card)]",
                )}
                style={{
                  width: `${width}%`,
                  clipPath: `polygon(${(i * 3).toFixed(1)}% 0, ${(100 - i * 3).toFixed(1)}% 0, 100% 100%, 0 100%)`,
                  borderRadius: "0.5rem",
                }}
              >
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    i === 2 ? "text-xl" : i === 1 ? "text-base" : "text-sm",
                  )}
                >
                  {i === 1 ? "+" : ""}
                  {fmt(s.value)}
                </span>
                <span
                  className={cn(
                    "hidden items-center gap-1 text-[0.68rem] tracking-wide uppercase sm:flex",
                    i === 1 ? "text-brand-deep/70" : "text-primary-foreground/70",
                  )}
                >
                  {s.label}
                  <InfoTip text={s.tip} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto space-y-2 border-t border-border pt-4">
        <p className="text-[0.7rem] text-muted-foreground">
          Enrichment sources: Whois AI · Guest Journey · Hotel Collection
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <MetaRow
            items={[
              { label: "Email", value: fmt(f.email) },
              { label: "Phone", value: fmt(f.phone) },
              { label: "Address", value: fmt(f.address) },
            ]}
          />
          <Delta value={improved.delta} showMomentum />
        </div>
      </div>
    </CardFrame>
  );
}

/* ---------------- Card 4 — Information Completeness ---------------- */

export function CompletenessCard({
  cur,
  prev,
  active,
  onSelect,
}: {
  cur: Totals;
  prev: Totals;
  active: boolean;
  onSelect: () => void;
}) {
  const pct = cur.completeness;
  const deltaPts = pct - prev.completeness;
  const contributions = [
    { k: "Whois AI", v: cur.whois },
    { k: "Guest Journey", v: cur.journey },
    { k: "Staff Collection", v: cur.staff },
    { k: "ID Scan", v: cur.idScan },
  ];
  const maxC = Math.max(...contributions.map((c) => c.v)) || 1;
  const r = 54;
  const circ = 2 * Math.PI * r;

  return (
    <CardFrame tone="dark" active={active} onSelect={onSelect}>
      <CardHeader
        title="Information Completeness"
        description="How complete the final guest information is after enrichment and collection."
        tip={TIPS.completeness}
      />

      <div className="flex flex-1 flex-wrap items-center gap-6">
        <div className="relative size-[148px] shrink-0">
          <svg viewBox="0 0 140 140" className="size-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-white/10"
            />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              strokeLinecap="round"
              className="text-brand-soft"
              strokeDasharray={`${((pct / 100) * circ).toFixed(2)} ${circ.toFixed(2)}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">{pct.toFixed(1)}%</span>
            <span className="text-[0.65rem] tracking-wide text-current/55 uppercase">Complete</span>
          </div>
        </div>

        <div className="min-w-[180px] flex-1 space-y-2.5">
          {contributions.map((c) => (
            <div key={c.k} className="space-y-1">
              <div className="flex items-center justify-between text-[0.7rem] text-current/55">
                <span>{c.k}</span>
                <span className="tabular-nums">{fmt(c.v)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-soft"
                  style={{ width: `${(c.v / maxC) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-xs text-current/55">
          {fmt(cur.improvedValid * (pct / 100))} of {fmt(cur.improvedValid)} guest info complete
        </span>
        <Delta value={deltaPts} unit="pts" showMomentum />
      </div>
    </CardFrame>
  );
}
