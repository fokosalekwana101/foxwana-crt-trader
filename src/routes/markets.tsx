import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Minus, Plus } from "lucide-react";
import { buildAnalysis } from "@/lib/engines/analysis";
import { crtForTimeframe } from "@/lib/engines/crt";
import { SYMBOLS, formatPrice } from "@/lib/market/symbols";
import { dayChangePercent, getSeries } from "@/lib/market/series";
import { detectCRT } from "@/lib/engines/crt";
import type { SymbolSpec } from "@/lib/market/types";
import { useSettings } from "@/lib/store/settings";
import { DataBadge, DirectionTag, EmptyNote, PageHeader, Panel, SpikeRiskTag, StatusPill, Tag } from "@/components/common/ui-bits";
import { Explain } from "@/components/common/Explain";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — FOXWANA" },
      { name: "description", content: "Choose the markets you monitor and see FOXWANA suggestions based on current and historical CRT activity." },
      { property: "og:title", content: "Markets — FOXWANA" },
      { property: "og:description", content: "Your markets plus CRT-based suggestions worth watching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MarketsPage,
});

/** Counts completed CRT formations across the recent daily history (demo data). */
function historicalCrtCount(symbol: string) {
  const d = getSeries(symbol, "1D", 60);
  let n = 0;
  for (let i = 1; i < d.length; i++) {
    const r = detectCRT(d[i - 1]!, d[i]!, "1D");
    if (r.state === "bullish" || r.state === "bearish") n++;
  }
  return n;
}

function MarketRow({ spec, mine, onToggle, mode, threshold, reason }: {
  spec: SymbolSpec; mine: boolean; onToggle: () => void; mode: Parameters<typeof buildAnalysis>[1]; threshold: number; reason?: string;
}) {
  const a = useMemo(() => buildAnalysis(spec.symbol, mode, { signalThreshold: threshold }), [spec.symbol, mode, threshold]);
  const change = dayChangePercent(spec.symbol);
  return (
    <li className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
      <Link to="/analysis" search={{ symbol: spec.symbol, mode }} className="min-w-0 flex-1 rounded-md transition-colors hover:text-primary">
        <p className="font-display text-sm font-semibold text-foreground">{spec.symbol} <span className="font-sans text-xs font-normal text-muted-foreground">{spec.name}</span></p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <DirectionTag
            direction={a.direction}
            label={a.crt.state === "none" ? "No CRT" : a.crt.state === "developing" ? `${a.crtTimeframe} CRT forming` : `${a.crtTimeframe} CRT ${a.direction}`}
          />
          {a.spikeRisk !== "LOW" && <SpikeRiskTag risk={a.spikeRisk} />}
          {reason && <Tag tone="neutral">{reason}</Tag>}
        </div>
      </Link>
      <div className="text-right">
        <p className="price-figure text-sm font-medium text-foreground">{formatPrice(spec.symbol, a.price)}</p>
        <p className={`price-figure text-xs ${change >= 0 ? "text-bullish" : "text-bearish"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</p>
        {mine && <div className="mt-1"><StatusPill status={a.status} size="sm" /></div>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-label={mine ? `Remove ${spec.symbol}` : `Add ${spec.symbol} to My Markets`}
        className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
          mine ? "border-border text-muted-foreground hover:text-bearish" : "border-primary bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        {mine ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
        <span className="hidden sm:inline">{mine ? "Remove" : "Add to My Markets"}</span>
      </button>
    </li>
  );
}

function MarketsPage() {
  const [settings, setSettings] = useSettings();
  const mine = SYMBOLS.filter((s) => settings.watchlist.includes(s.symbol));

  const suggestions = useMemo(() => {
    return SYMBOLS.filter((s) => !settings.watchlist.includes(s.symbol))
      .map((s) => {
        const current = (["1D", "4H", "1H"] as const).map((tf) => crtForTimeframe(s.symbol, tf));
        const active = current.find((c) => c.state === "bullish" || c.state === "bearish" || c.state === "developing");
        const hist = historicalCrtCount(s.symbol);
        return { spec: s, active, hist, score: (active ? 10 : 0) + hist };
      })
      .filter((x) => x.active || x.hist >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [settings.watchlist]);

  const toggle = (symbol: string) =>
    setSettings((s) => ({
      ...s,
      watchlist: s.watchlist.includes(symbol) ? s.watchlist.filter((x) => x !== symbol) : [...s.watchlist, symbol],
    }));

  return (
    <>
      <PageHeader title="Markets" description="Choose what you monitor. FOXWANA suggests others worth watching — never a guarantee of profit.">
        <DataBadge kind="demo" />
      </PageHeader>

      <Panel eyebrow="My Markets" title={`Markets you selected (${mine.length})`} bodyClassName="p-0 sm:p-0">
        {mine.length === 0 ? (
          <div className="p-5"><EmptyNote>You have not chosen any markets yet. Add markets from the suggestions or the full list below.</EmptyNote></div>
        ) : (
          <ul className="divide-y divide-border">
            {mine.map((s) => (
              <MarketRow key={s.symbol} spec={s} mine onToggle={() => toggle(s.symbol)} mode={settings.defaultMode} threshold={settings.signalThreshold} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel eyebrow="FOXWANA Suggestions" title="Not in your list, but showing CRT activity" bodyClassName="p-0 sm:p-0">
        <div className="space-y-2 p-4 sm:px-5">
          <Explain term="CRT" />
          <p className="text-xs text-muted-foreground">
            “CRT forming/developing” = a CRT is visible on the latest candles now. “Historical CRT activity” = how many
            completed daily CRTs appeared in the last 60 days. Suggestions are observations, not trade signals.
          </p>
        </div>
        {suggestions.length === 0 ? (
          <div className="p-5"><EmptyNote>No notable CRT activity outside your markets right now.</EmptyNote></div>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {suggestions.map(({ spec, active, hist }) => (
              <MarketRow
                key={spec.symbol}
                spec={spec}
                mine={false}
                onToggle={() => toggle(spec.symbol)}
                mode={settings.defaultMode}
                threshold={settings.signalThreshold}
                reason={`${active ? `CRT currently ${active.state === "developing" ? "forming" : "active"} (${active.timeframe}) · ` : ""}Historical CRT activity: ${hist}`}
              />
            ))}
          </ul>
        )}
      </Panel>

      <Panel eyebrow="All markets" title="Add any market" bodyClassName="p-0 sm:p-0">
        <div className="flex flex-wrap gap-2 p-4 sm:p-5">
          {SYMBOLS.map((s) => {
            const on = settings.watchlist.includes(s.symbol);
            return (
              <button
                key={s.symbol}
                type="button"
                onClick={() => toggle(s.symbol)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  on ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {on ? "✓ " : "+ "}{s.symbol}
              </button>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
