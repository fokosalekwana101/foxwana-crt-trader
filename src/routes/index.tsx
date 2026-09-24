import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { buildAnalysis } from "@/lib/engines/analysis";
import { currencyBias, evaluateEvent, type Impact } from "@/lib/engines/fundamentals";
import { DEMO_EVENTS } from "@/lib/data/calendar";
import { CURRENCIES, formatPrice, getSymbol } from "@/lib/market/symbols";
import { dayChangePercent, getSeries } from "@/lib/market/series";
import { useSettings } from "@/lib/store/settings";
import { useJournal } from "@/lib/store/journal";
import {
  DataBadge,
  DirectionTag,
  EmptyNote,
  Field,
  MiniCandles,
  PageHeader,
  Panel,
  SpikeRiskTag,
  StatusPill,
  StrengthTag,
  Tag,
} from "@/components/common/ui-bits";
import { MODE_LABELS } from "@/lib/market/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FOXWANA CRT Market Intelligence" },
      {
        name: "description",
        content:
          "Live market overview built on Candle Range Theory: CRT direction per market, validated setups, fundamental currency bias, spike risk and recent journal activity.",
      },
      { property: "og:title", content: "FOXWANA — CRT Market Intelligence" },
      {
        property: "og:description",
        content: "Multi-timeframe CRT analysis, fundamental bias and spike risk in one focused workspace.",
      },
    ],
  }),
  component: Dashboard,
});

const impactTone: Record<Impact, "bearish" | "warning" | "neutral"> = {
  high: "bearish",
  medium: "warning",
  low: "neutral",
};

function Dashboard() {
  const [settings] = useSettings();
  const [journal] = useJournal();

  const rows = useMemo(
    () =>
      settings.watchlist.map((symbol) => {
        const a = buildAnalysis(symbol, settings.defaultMode, { signalThreshold: settings.signalThreshold });
        return {
          analysis: a,
          change: dayChangePercent(symbol),
          candles: getSeries(symbol, settings.defaultMode === "scalping" ? "15M" : "4H", 30),
        };
      }),
    [settings.watchlist, settings.defaultMode, settings.signalThreshold],
  );

  const biases = useMemo(() => CURRENCIES.map((c) => currencyBias(c, DEMO_EVENTS)).filter((b) => b.total > 0), []);

  const events = useMemo(
    () =>
      DEMO_EVENTS.map((e) => evaluateEvent(e))
        .filter((e) => e.impact !== "low")
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 6),
    [],
  );

  const setups = rows.filter((r) => ["BUY", "SELL", "TRIGGER WATCH"].includes(r.analysis.status));
  const session = rows[0]?.analysis.session;

  return (
    <>
      <PageHeader
        title="Market Overview"
        description="What is happening right now across the watchlist — CRT direction first, detail on demand."
      >
        <DataBadge kind="demo" />
        <Tag tone="neutral">{MODE_LABELS[settings.defaultMode]} mode</Tag>
      </PageHeader>

      {session && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" />
          {session.note}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Panel eyebrow="Watchlist" title="CRT status by market" bodyClassName="p-0 sm:p-0">
            <ul className="divide-y divide-border">
              {rows.map(({ analysis, change, candles }) => (
                <li key={analysis.symbol}>
                  <Link
                    to="/analysis"
                    search={{ symbol: analysis.symbol, mode: analysis.mode }}
                    className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-semibold text-foreground">{analysis.symbol}</span>
                        <span className={`price-figure text-xs ${change >= 0 ? "text-bullish" : "text-bearish"}`}>
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <DirectionTag
                          direction={analysis.direction}
                          label={
                            analysis.crt.state === "developing"
                              ? `${analysis.crtTimeframe} CRT developing`
                              : analysis.direction
                                ? `${analysis.crtTimeframe} CRT ${analysis.direction}`
                                : "No CRT"
                          }
                        />
                        {analysis.spikeRisk !== "LOW" && <SpikeRiskTag risk={analysis.spikeRisk} />}
                      </div>
                    </div>
                    <div className="hidden w-28 sm:block">
                      <MiniCandles candles={candles} height={40} />
                    </div>
                    <div className="text-right">
                      <p className="price-figure text-sm font-medium text-foreground">
                        {formatPrice(analysis.symbol, analysis.price)}
                      </p>
                      <div className="mt-1.5">
                        <StatusPill status={analysis.status} size="sm" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            eyebrow="Current CRT setups"
            title="Markets with a validated or forming entry"
            action={
              <Link to="/analysis" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open analysis <ArrowUpRight className="size-3.5" />
              </Link>
            }
          >
            {setups.length === 0 ? (
              <EmptyNote>
                No market currently satisfies the CRT entry rule. FOXWANA reports NO TRADE rather than forcing a
                direction.
              </EmptyNote>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {setups.map(({ analysis }) => (
                  <Link
                    key={analysis.symbol}
                    to="/analysis"
                    search={{ symbol: analysis.symbol, mode: analysis.mode }}
                    className="rounded-lg border border-border p-4 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-semibold">{analysis.symbol}</span>
                      <StatusPill status={analysis.status} size="sm" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <Field
                        label="Entry"
                        value={
                          analysis.entryZone
                            ? formatPrice(analysis.symbol, analysis.entryZone.preferred)
                            : "—"
                        }
                      />
                      <Field
                        label="Stop"
                        value={analysis.stopLoss ? formatPrice(analysis.symbol, analysis.stopLoss) : "—"}
                        tone="bearish"
                      />
                      <Field
                        label="CRT target"
                        value={analysis.crtTarget ? formatPrice(analysis.symbol, analysis.crtTarget) : "—"}
                        tone="bullish"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <StrengthTag strength={analysis.strength} score={analysis.score} max={analysis.maxScore} />
                      {analysis.conflicts.map((c) => (
                        <Tag key={c.type} tone="warning">
                          {c.type}
                        </Tag>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel eyebrow="Fundamentals" title="Currency bias" action={<DataBadge kind="demo" />}>
            <ul className="space-y-2.5">
              {biases.map((b) => (
                <li key={b.currency} className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-foreground">{b.currency}</span>
                  <div className="flex items-center gap-1.5">
                    <Tag tone={b.direction === "STRONG" ? "bullish" : b.direction === "WEAK" ? "bearish" : "neutral"}>
                      {b.direction} {b.majority}
                    </Tag>
                    {b.spikeRisk !== "LOW" && <SpikeRiskTag risk={b.spikeRisk} />}
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/fundamentals" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Full event breakdown <ArrowUpRight className="size-3.5" />
            </Link>
          </Panel>

          <Panel eyebrow="Event risk" title="Important events">
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {e.currency} · {e.name}
                      </p>
                      <p className="price-figure mt-1 text-xs text-muted-foreground">
                        {new Date(e.time).toUTCString().slice(5, 22)} UTC
                      </p>
                    </div>
                    <Tag tone={impactTone[e.impact]}>{e.impact}</Tag>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Tag tone={e.expected === "STRONG" ? "bullish" : e.expected === "WEAK" ? "bearish" : "neutral"}>
                      {e.currency} {e.expected}
                    </Tag>
                    {e.released && <Tag tone="neutral">{e.actualStatus}</Tag>}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel eyebrow="Journal" title="Recent activity">
            {journal.length === 0 ? (
              <EmptyNote>No trades recorded yet.</EmptyNote>
            ) : (
              <ul className="space-y-3">
                {journal.slice(0, 4).map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t.symbol} · {t.direction === "bullish" ? "Buy" : "Sell"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.date} · {getSymbol(t.symbol).group.replace("-", " ")}
                      </p>
                    </div>
                    <span
                      className={`price-figure text-sm font-medium ${
                        t.pnl > 0 ? "text-bullish" : t.pnl < 0 ? "text-bearish" : "text-muted-foreground"
                      }`}
                    >
                      {t.pnl > 0 ? "+" : ""}
                      {t.pnl.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/journal" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open trade journal <ArrowUpRight className="size-3.5" />
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}
