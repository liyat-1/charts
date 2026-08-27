import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart3, Building2, Database, Sparkles, Users } from "lucide-react";

import { AnalyticsControls, type DateRangeState } from "@/components/analytics/controls";
import {
  AddedCard,
  CompletenessCard,
  ImprovementCard,
  ReceivedCard,
  type AddedSource,
  type ReceivedView,
} from "@/components/analytics/kpi-cards";
import {
  TrendChart,
  type ActiveCard,
  type CompletenessMetric,
  type FieldKey,
  type ReceivedMetric,
} from "@/components/analytics/trend-chart";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  daysBetween,
  seriesFor,
  totalsOf,
  type Basis,
  type Granularity,
} from "@/lib/analytics-data";
import {
  compareRange,
  defaultCustom,
  periodRange,
  rangeLabel,
  type CompareKey,
  type PeriodKey,
} from "@/lib/analytics-ranges";
import { cn } from "@/lib/utils";

const TITLE = "OTA Buster — Guest Information Analytics";
const DESCRIPTION =
  "Track OTA booking information received, guest data enriched by Whois AI, Guest Journey and hotel collection, and overall information completeness.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const NAV = [
  { icon: BarChart3, label: "Information Received", active: true },
  { icon: Sparkles, label: "Enrichment" },
  { icon: Users, label: "Guest Journey" },
  { icon: Database, label: "Data Sources" },
  { icon: Building2, label: "Properties" },
];

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col gap-8 border-r border-border bg-card px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-primary-foreground">
          <Sparkles className="size-4.5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">OTA Buster</p>
          <p className="text-[0.7rem] text-muted-foreground">Guest data platform</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <span
            key={item.label}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              item.active
                ? "bg-brand-softer/60 font-medium text-brand-deep"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </span>
        ))}
      </nav>

      <div className="mt-auto rounded-xl bg-brand-softer/50 p-4">
        <p className="text-xs font-semibold text-brand-deep">Demo workspace</p>
        <p className="mt-1 text-[0.7rem] leading-relaxed text-brand-deep/75">
          Figures shown are illustrative sample data for the selected period.
        </p>
      </div>
    </aside>
  );
}

function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [compare, setCompare] = useState<CompareKey>("previous_period");
  const [basis, setBasis] = useState<Basis>("total");
  const [activeCard, setActiveCard] = useState<ActiveCard>("received");
  const [view, setView] = useState<ReceivedView>("all");
  const [source, setSource] = useState<AddedSource>("all");
  const [field, setField] = useState<FieldKey>("all");
  const [metric, setMetric] = useState<ReceivedMetric>("total");
  const [completenessMetric, setCompletenessMetric] = useState<CompletenessMetric>("all");

  const handleView = (v: ReceivedView) => {
    setView(v);
    setMetric(v === "all" ? "total" : v);
    setField("all");
  };
  const [granularity, setGranularity] = useState<Granularity | "auto">("auto");

  const [analyzeRange, setAnalyzeRange] = useState<DateRangeState>(() => defaultCustom(0, 30));
  const [compareRangeState, setCompareRange] = useState<DateRangeState>(() =>
    defaultCustom(30, 30),
  );

  const base = useMemo(() => periodRange(period, analyzeRange), [period, analyzeRange]);
  const comp = useMemo(
    () => compareRange(compare, base, compareRangeState),
    [compare, base, compareRangeState],
  );

  const compareOn = compare !== "none";

  const baseRows = useMemo(() => seriesFor(base.start, base.end), [base]);
  const compRows = useMemo(() => seriesFor(comp.start, comp.end), [comp]);

  const cur = useMemo(() => totalsOf(baseRows), [baseRows]);
  const prev = useMemo(() => totalsOf(compRows), [compRows]);

  const unequal =
    compareOn && daysBetween(base.start, base.end) !== daysBetween(comp.start, comp.end);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border bg-card px-6 py-5">
            <div className="space-y-1">
              <p className="text-[0.7rem] font-semibold tracking-wide text-brand uppercase">
                Analytics
              </p>
              <h1 className="text-xl font-semibold tracking-tight">Information Received</h1>
              <p className="text-xs text-muted-foreground">
                {rangeLabel(base)}
                {compareOn ? (
                  <>
                    {" "}
                    <span className="text-border">|</span> compared with {rangeLabel(comp)}
                  </>
                ) : null}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Seaside Group</p>
              <p>12 properties connected</p>
            </div>
          </header>

          <div className="flex flex-col gap-5 p-6">
            <AnalyticsControls
              period={period}
              onPeriod={setPeriod}
              compare={compare}
              onCompare={setCompare}
              analyzeRange={analyzeRange}
              onAnalyzeRange={setAnalyzeRange}
              compareRangeState={compareRangeState}
              onCompareRange={setCompareRange}
              base={base}
              comp={comp}
              unequal={unequal}
              basis={basis}
              onBasis={setBasis}
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <ReceivedCard
                cur={cur}
                prev={prev}
                basis={basis}
                view={view}
                onView={handleView}
                active={activeCard === "received"}
                onSelect={() => setActiveCard("received")}
              />
              <AddedCard
                cur={cur}
                prev={prev}
                basis={basis}
                source={source}
                onSource={setSource}
                active={activeCard === "added"}
                onSelect={() => setActiveCard("added")}
              />
              <ImprovementCard
                cur={cur}
                prev={prev}
                basis={basis}
                active={activeCard === "improvement"}
                onSelect={() => setActiveCard("improvement")}
              />
              <CompletenessCard
                cur={cur}
                prev={prev}
                active={activeCard === "completeness"}
                onSelect={() => setActiveCard("completeness")}
              />
            </div>

            <TrendChart
              card={activeCard}
              rows={baseRows}
              compareRows={compRows}
              compareOn={compareOn}
              base={base}
              comp={comp}
              granularity={granularity}
              onGranularity={setGranularity}
              metric={metric}
              onMetric={setMetric}
              source={source}
              onSource={setSource}
              field={field}
              onField={setField}
              completenessMetric={completenessMetric}
              onCompletenessMetric={setCompletenessMetric}
              basis={basis}
              onBasis={setBasis}
              unequal={unequal}
            />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
