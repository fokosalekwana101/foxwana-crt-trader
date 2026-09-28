import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { buildAnalysis } from "@/lib/engines/analysis";
import { SYMBOLS, formatPrice } from "@/lib/market/symbols";
import { dayChangePercent, getSeries } from "@/lib/market/series";
import { useSettings } from "@/lib/store/settings";
import {
  DataBadge,
  DirectionTag,
  MiniCandles,
  PageHeader,
  Panel,
  SpikeRiskTag,
  StatusPill,
  Tag,
} from "@/components/common/ui-bits";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — FOXWANA" },
      {
        name: "description",
        content: "Major FX pairs, metals and indices with CRT direction, status and event risk at a glance.",
      },
      { property: "og:title", content: "Markets — FOXWANA" },
      { property: "og:description", content: "CRT status across major FX pairs, metals and indices." },
    ],
  }),
  component: MarketsPage,
});

const GROUPS = [
  { key: "fx-major", label: "Major FX" },
  { key: "fx-cross", label: "FX Crosses" },
  { key: "metal", label: "Metals" },
  { key: "index", label: "Indices" },
] as const;

function MarketsPage() {
  const [settings] = useSettings();
  const [group, setGroup] = useState<(typeof GROUPS)[number]["key"] | "all">("all");

  const rows = useMemo(
    () =>
      SYMBOLS.filter((s) => group === "all" || s.group === group).map((s) => ({
        spec: s,
        analysis: buildAnalysis(s.symbol, settings.defaultMode, { signalThreshold: settings.signalThreshold }),
        change: dayChangePercent(s.symbol),
        candles: getSeries(s.symbol, "4H", 30),
      })),
    [group, settings.defaultMode, settings.signalThreshold],
  );

  return (
    <>
      <PageHeader title="Markets" description="Every tracked market with its current CRT reading.">
        <DataBadge kind="demo" />
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setGroup("all")}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
            group === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
          }`}
        >
          All
        </button>
        {GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setGroup(g.key)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
              group === g.key ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <Panel bodyClassName="p-0 sm:p-0">
        <ul className="divide-y divide-border">
          {rows.map(({ spec, analysis, change, candles }) => (
            <li key={spec.symbol}>
              <Link
                to="/analysis"
                search={{ symbol: spec.symbol, mode: settings.defaultMode }}
                className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-accent/50 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold text-foreground">{spec.symbol}</p>
                  <p className="truncate text-xs text-muted-foreground">{spec.name}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <DirectionTag
                      direction={analysis.direction}
                      label={
                        analysis.crt.state === "none"
                          ? "No CRT"
                          : `${analysis.crtTimeframe} ${analysis.crt.state === "developing" ? "developing" : analysis.direction}`
                      }
                    />
                    {analysis.fundamentalBias.bias !== "neutral" && (
                      <Tag tone={analysis.fundamentalBias.bias === "bullish" ? "bullish" : "bearish"}>
                        Fundamental {analysis.fundamentalBias.bias}
                      </Tag>
                    )}
                    {analysis.spikeRisk !== "LOW" && <SpikeRiskTag risk={analysis.spikeRisk} />}
                  </div>
                </div>
                <div className="hidden w-32 sm:block">
                  <MiniCandles candles={candles} height={44} />
                </div>
                <div className="text-right">
                  <p className="price-figure text-sm font-medium text-foreground">
                    {formatPrice(spec.symbol, analysis.price)}
                  </p>
                  <p className={`price-figure text-xs ${change >= 0 ? "text-bullish" : "text-bearish"}`}>
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}%
                  </p>
                  <div className="mt-2">
                    <StatusPill status={analysis.status} size="sm" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
