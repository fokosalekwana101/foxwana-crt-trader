import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Candle, Direction, FinalStatus, SignalStrength } from "@/lib/market/types";
import type { SpikeRisk } from "@/lib/engines/fundamentals";

/* ------------------------------------------------------------------ */
/* Status + direction presentation. Colour only ever carries meaning.  */
/* ------------------------------------------------------------------ */

const STATUS_TONE: Record<FinalStatus, "bullish" | "bearish" | "neutral" | "warning"> = {
  BUY: "bullish",
  SELL: "bearish",
  DEVELOPING: "neutral",
  "TRIGGER WATCH": "warning",
  "NO TRADE": "neutral",
  "NO VALID ENTRY": "neutral",
};

const TONE_SOLID = {
  bullish: "bg-bullish text-bullish-foreground",
  bearish: "bg-bearish text-bearish-foreground",
  warning: "bg-warning text-warning-foreground",
  neutral: "bg-neutral text-neutral-foreground",
} as const;

const TONE_SOFT = {
  bullish: "bg-bullish-soft text-bullish",
  bearish: "bg-bearish-soft text-bearish",
  warning: "bg-warning-soft text-warning",
  neutral: "bg-neutral-soft text-muted-foreground",
} as const;

export type Tone = keyof typeof TONE_SOLID;

export function StatusPill({
  status,
  size = "md",
  className,
}: {
  status: FinalStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-display font-semibold uppercase tracking-[0.08em]",
        TONE_SOLID[tone],
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-2.5 py-1 text-[11px]",
        size === "lg" && "px-4 py-2 text-sm",
        className,
      )}
    >
      {status}
    </span>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium",
        TONE_SOFT[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DirectionTag({ direction, label }: { direction: Direction | "ranging" | "neutral" | null; label?: string }) {
  if (!direction) return <Tag tone="neutral">{label ?? "None"}</Tag>;
  if (direction === "bullish") return <Tag tone="bullish">{label ?? "Bullish"}</Tag>;
  if (direction === "bearish") return <Tag tone="bearish">{label ?? "Bearish"}</Tag>;
  return <Tag tone="neutral">{label ?? (direction === "ranging" ? "Ranging" : "Neutral")}</Tag>;
}

export function SpikeRiskTag({ risk }: { risk: SpikeRisk }) {
  const tone: Tone = risk === "LOW" ? "neutral" : risk === "ELEVATED" ? "warning" : "bearish";
  return <Tag tone={tone}>Spike risk {risk}</Tag>;
}

export function StrengthTag({ strength, score, max }: { strength: SignalStrength; score?: number; max?: number }) {
  const tone: Tone = strength === "STRONG" ? "bullish" : strength === "MEDIUM" ? "warning" : "neutral";
  return (
    <Tag tone={tone}>
      {strength}
      {score !== undefined && max !== undefined ? ` · ${score}/${max}` : ""}
    </Tag>
  );
}

/** Makes the origin of every number explicit — demo vs live vs screenshot. */
export function DataBadge({ kind }: { kind: "demo" | "screenshot" | "live-market" | "live-news" }) {
  const label = {
    demo: "Demo data",
    screenshot: "From screenshot",
    "live-market": "Live market data",
    "live-news": "Live news data",
  }[kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
      <span className="size-1.5 rounded-full bg-neutral" />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */

export function Panel({
  title,
  eyebrow,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel", className)}>
      {(title || eyebrow || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div>
            {eyebrow && <p className="label-eyebrow">{eyebrow}</p>}
            {title && <h2 className="mt-0.5 text-[15px] font-semibold text-foreground">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className={cn("px-4 py-4 sm:px-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function Field({ label, value, tone }: { label: string; value: ReactNode; tone?: Tone | undefined }) {
  return (
    <div>
      <p className="label-eyebrow">{label}</p>
      <p
        className={cn(
          "price-figure mt-1 text-[15px] font-medium",
          tone === "bullish" && "text-bullish",
          tone === "bearish" && "text-bearish",
          tone === "warning" && "text-warning",
          !tone && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function CheckLine({ met, children }: { met: boolean; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span
        className={cn(
          "mt-[3px] inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[10px] font-bold",
          met ? "bg-bullish-soft text-bullish" : "bg-neutral-soft text-muted-foreground",
        )}
      >
        {met ? "✓" : "–"}
      </span>
      <span className={met ? "text-foreground" : "text-muted-foreground"}>{children}</span>
    </li>
  );
}

export function WarnLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className="mt-[3px] inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-warning-soft text-[10px] font-bold text-warning">
        !
      </span>
      <span className="text-foreground">{children}</span>
    </li>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

/* ------------------------------------------------------------------ */
/* Minimal candle visual — structure only, no indicators.              */
/* ------------------------------------------------------------------ */

export function MiniCandles({
  candles,
  height = 72,
  levels = [],
  className,
}: {
  candles: Candle[];
  height?: number;
  levels?: { price: number; tone: Tone }[];
  className?: string;
}) {
  if (!candles.length) return null;
  const hi = Math.max(...candles.map((c) => c.high), ...levels.map((l) => l.price));
  const lo = Math.min(...candles.map((c) => c.low), ...levels.map((l) => l.price));
  const span = hi - lo || 1;
  const w = 100 / candles.length;
  const y = (p: number) => ((hi - p) / span) * 100;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height }}
      className={cn("w-full", className)}
      role="img"
      aria-label="Candle structure"
    >
      {levels.map((l, i) => (
        <line
          key={i}
          x1={0}
          x2={100}
          y1={y(l.price)}
          y2={y(l.price)}
          strokeDasharray="2 2"
          strokeWidth={0.4}
          className={
            l.tone === "bullish"
              ? "stroke-bullish"
              : l.tone === "bearish"
                ? "stroke-bearish"
                : l.tone === "warning"
                  ? "stroke-warning"
                  : "stroke-neutral"
          }
        />
      ))}
      {candles.map((c, i) => {
        const up = c.close >= c.open;
        const cls = up ? "fill-bullish stroke-bullish" : "fill-bearish stroke-bearish";
        const x = i * w;
        const bodyTop = y(Math.max(c.open, c.close));
        const bodyBottom = y(Math.min(c.open, c.close));
        return (
          <g key={c.time} className={cls}>
            <line x1={x + w / 2} x2={x + w / 2} y1={y(c.high)} y2={y(c.low)} strokeWidth={0.35} />
            <rect
              x={x + w * 0.2}
              y={bodyTop}
              width={w * 0.6}
              height={Math.max(bodyBottom - bodyTop, 0.6)}
              strokeWidth={0.2}
            />
          </g>
        );
      })}
    </svg>
  );
}
