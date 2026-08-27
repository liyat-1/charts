import { Info, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { momentum } from "@/lib/analytics-data";

export function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="About this metric"
          className="inline-flex size-4 items-center justify-center rounded-full text-current/50 transition-colors hover:text-current"
        >
          <Info className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
  );
}

export function Delta({
  value,
  unit,
  showMomentum = false,
  className,
}: {
  value: number;
  unit?: "%" | "pts" | undefined;
  showMomentum?: boolean;
  className?: string | undefined;
}) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-medium", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-1",
          up ? "text-positive" : "text-destructive",
        )}
      >
        <Icon className="size-3.5" />
        {up ? "+" : ""}
        {value.toFixed(1)}
        {unit === "pts" ? " pts" : "%"}
      </span>
      {showMomentum ? (
        <span className="text-current/50 font-normal">{momentum(value)}</span>
      ) : null}
    </span>
  );
}

export function MetaRow({
  items,
  className,
}: {
  items: { label: string; value?: string }[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs", className)}>
      {items.map((i, idx) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          {idx > 0 ? <span className="text-current/25 mr-2.5">·</span> : null}
          <span className="text-current/55">{i.label}</span>
          {i.value ? <span className="font-semibold tabular-nums">{i.value}</span> : null}
        </span>
      ))}
    </div>
  );
}

export function CardFrame({
  active,
  tone = "light",
  onSelect,
  className,
  children,
}: {
  active?: boolean;
  tone?: "light" | "dark";
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative flex h-full flex-col gap-5 p-6 transition-all duration-200",
        tone === "dark" ? "card-dark" : "card-surface",
        onSelect && "cursor-pointer hover:-translate-y-0.5",
        active && "ring-2 ring-brand ring-offset-2 ring-offset-background",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  tip,
  action,
}: {
  title: string;
  description: string;
  tip?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[0.95rem] font-semibold tracking-tight">{title}</h3>
          {tip ? <InfoTip text={tip} /> : null}
        </div>
        <p className="text-xs leading-relaxed text-current/55 max-w-[34ch]">{description}</p>
      </div>
      {action ? <div onClick={(e) => e.stopPropagation()}>{action}</div> : null}
    </div>
  );
}

export function BigNumber({
  value,
  label,
  tip,
  delta,
  deltaUnit,
  basisNote,
}: {
  value: string;
  label: string;
  tip?: string;
  delta?: number;
  deltaUnit?: "%" | "pts" | undefined;
  basisNote?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-current/55 uppercase">
        {label}
        {tip ? <InfoTip text={tip} /> : null}
      </div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-[2.6rem] leading-none font-semibold tracking-tight tabular-nums">
          {value}
        </span>
        {delta !== undefined ? <Delta value={delta} {...(deltaUnit ? { unit: deltaUnit } : {})} showMomentum /> : null}
      </div>
      {basisNote ? <p className="text-[0.7rem] text-current/45">{basisNote}</p> : null}
    </div>
  );
}
