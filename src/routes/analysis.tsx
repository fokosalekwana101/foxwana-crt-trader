import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CrtChart } from "@/components/analysis/CrtChart";
import { Disclosure, Explain } from "@/components/common/Explain";
import { TradeProposal, CrtLevels, SavedAnalyses } from "@/components/analysis/AnalysisExtras";
import { Upload, X } from "lucide-react";
import { z } from "zod";
import { buildAnalysis } from "@/lib/engines/analysis";
import { calculateRisk } from "@/lib/engines/risk";
import { formatPrice, SYMBOLS } from "@/lib/market/symbols";
import { getSeries } from "@/lib/market/series";
import {
  MODE_LABELS,
  MODE_DURATION,
  MODE_TIMEFRAMES,
  TIMEFRAMES,
  TIMEFRAME_LABELS,
  type Timeframe,
  type TradingMode,
} from "@/lib/market/types";
import { useSettings } from "@/lib/store/settings";
import { readFileAsDataUrl, missingLabels, type ChartUpload } from "@/lib/engines/screenshot";
import {
  CheckLine,
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
  WarnLine,
} from "@/components/common/ui-bits";

const searchSchema = z.object({
  symbol: z.string().optional(),
  mode: z.enum(["scalping", "intraday", "swing", "longterm"]).optional(),
});

export const Route = createFileRoute("/analysis")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Market Analysis — FOXWANA" },
      {
        name: "description",
        content:
          "Full CRT analysis workspace: multi-timeframe CRT, validated order blocks, fair value gaps, historical reaction areas, entry zone, stop loss and CRT target.",
      },
      { property: "og:title", content: "Market Analysis — FOXWANA" },
      {
        property: "og:description",
        content: "CRT-first multi-timeframe analysis with transparent confluence and no forced trades.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalysisPage,
});

const MODES: TradingMode[] = ["scalping", "intraday", "swing", "longterm"];

function AnalysisPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/analysis" });
  const [settings] = useSettings();

  const symbol = search.symbol ?? settings.watchlist[0] ?? "XAUUSD";
  const mode = search.mode ?? settings.defaultMode;

  const [uploads, setUploads] = useState<ChartUpload[]>([]);

  const analysis = useMemo(
    () => buildAnalysis(symbol, mode, { signalThreshold: settings.signalThreshold }),
    [symbol, mode, settings.signalThreshold],
  );

  const risk = useMemo(() => {
    if (!analysis.entryZone || analysis.stopLoss === null) return null;
    return calculateRisk({
      symbol,
      accountSize: settings.accountSize,
      riskPercent: settings.riskPercent,
      fixedRisk: settings.fixedRisk,
      entry: analysis.entryZone.preferred,
      stopLoss: analysis.stopLoss,
      takeProfit: analysis.crtTarget,
    });
  }, [analysis, symbol, settings]);

  const chartCandles = getSeries(symbol, MODE_TIMEFRAMES[mode].context[0]!, 48);
  const labelIssues = missingLabels(uploads);

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const next: ChartUpload[] = [];
    for (const file of Array.from(files).slice(0, 5)) {
      next.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        fileName: file.name,
        dataUrl: await readFileAsDataUrl(file),
        timeframe: null,
        symbol,
        note: "",
        detectionConfidence: "unknown",
      });
    }
    setUploads((u) => [...u, ...next].slice(0, 5));
  }

  return (
    <>
      <PageHeader title="Market Analysis" description="CRT identifies the opportunity. Everything else confirms where and whether.">
        <DataBadge kind="demo" />
      </PageHeader>

      {/* ---- Controls ---- */}
      <Panel eyebrow="Analysis input" title="Market and mode">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="label-eyebrow">Market</span>
            <select
              value={symbol}
              onChange={(e) => navigate({ search: { symbol: e.target.value, mode } })}
              className="mt-1.5 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
            >
              {SYMBOLS.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} — {s.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="label-eyebrow">Trading mode</span>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => navigate({ search: { symbol, mode: m } })}
                  className={`rounded-md border px-2 py-2 text-xs font-medium transition-colors ${
                    m === mode
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {MODE_LABELS[m].split(" / ")[0]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {MODE_DURATION[mode]} · context {MODE_TIMEFRAMES[mode].context.join(" → ")} · confirmation{" "}
              {MODE_TIMEFRAMES[mode].confirm.join(" / ")}
              {mode === "longterm" && " (long-term confirmation is only 1H and 15M)"}
            </p>
          </div>
        </div>
      </Panel>

      {/* ---- Headline result ---- */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" eyebrow={`${symbol} · ${TIMEFRAME_LABELS[analysis.crtTimeframe]} CRT`} title="Final status">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={analysis.status} size="lg" />
            <StrengthTag strength={analysis.strength} score={analysis.score} max={analysis.maxScore} />
            <SpikeRiskTag risk={analysis.spikeRisk} />
            <DirectionTag direction={analysis.direction} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{analysis.statusReason}</p>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Price" value={formatPrice(symbol, analysis.price)} />
            <Field
              label="Entry zone"
              value={
                analysis.entryZone
                  ? `${formatPrice(symbol, analysis.entryZone.bottom)} – ${formatPrice(symbol, analysis.entryZone.top)}`
                  : "No valid zone"
              }
            />
            <Field label="Stop loss" value={analysis.stopLoss ? formatPrice(symbol, analysis.stopLoss) : "—"} tone="bearish" />
            <Field label="CRT target" value={analysis.crtTarget ? formatPrice(symbol, analysis.crtTarget) : "—"} tone="bullish" />
          </div>
          {analysis.entryZone && (
            <p className="mt-3 text-xs text-muted-foreground">
              Preferred entry {formatPrice(symbol, analysis.entryZone.preferred)} · basis: {analysis.entryZone.basis.join(", ")}
              {analysis.rewardRisk ? ` · R:R ${analysis.rewardRisk.toFixed(2)}` : ""}
            </p>
          )}
          <div className="mt-5">
            <MiniCandles
              candles={chartCandles}
              height={120}
              levels={[
                ...(analysis.crtTarget ? [{ price: analysis.crtTarget, tone: "bullish" as const }] : []),
                ...(analysis.stopLoss ? [{ price: analysis.stopLoss, tone: "bearish" as const }] : []),
              ]}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {TIMEFRAME_LABELS[MODE_TIMEFRAMES[mode].context[0]!]} candle structure with CRT target and stop level.
            </p>
          </div>
        </Panel>

        <Panel eyebrow={analysis.direction === "bearish" ? "Why sell" : "Why buy"} title="Reasoning">
          {analysis.direction ? (
            <ul className="space-y-2">
              {analysis.confirmations.map((c) => (
                <CheckLine key={c.label} met={c.met}>
                  <span className="font-medium">{c.label}</span>
                  <span className="block text-xs text-muted-foreground">{c.detail}</span>
                </CheckLine>
              ))}
            </ul>
          ) : (
            <EmptyNote>No directional CRT structure — nothing to justify.</EmptyNote>
          )}

          <p className="label-eyebrow mt-5">Blockers</p>
          {analysis.blockers.length === 0 ? (
            <p className="mt-1.5 text-sm text-muted-foreground">None identified.</p>
          ) : (
            <ul className="mt-1.5 space-y-2">
              {analysis.blockers.map((b) => (
                <WarnLine key={b}>{b}</WarnLine>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Confluence is a transparent count of confirmations — never a probability or certainty of winning.
          </p>
        </Panel>
      </div>

      {/* ---- Chart with exact analysed objects ---- */}
      <Panel eyebrow={`${symbol} chart`} title="What FOXWANA is looking at" action={<DataBadge kind="demo" />}>
        <CrtChart analysis={analysis} defaultTf={analysis.crtTimeframe === "1M" ? "1W" : analysis.crtTimeframe} />
      </Panel>

      <CrtLevels analysis={analysis} />

      {/* ---- Secondary: plain-language building blocks ---- */}
      <Panel eyebrow="In plain words" title="The building blocks of this analysis">
        <div className="grid gap-2 md:grid-cols-2">
          <Explain term="CRT">CRT — {analysis.crt.state === "none" ? "none found" : analysis.crt.state === "developing" ? "forming" : `${analysis.direction} on ${analysis.crtTimeframe}`}</Explain>
          <Explain term="BOS">Structure — {analysis.structure.bos ? `BOS ${analysis.structure.bos.direction}` : "no break of structure"}</Explain>
          <Explain term="SWEEP">Liquidity — {analysis.liquidity.filter((l) => l.swept).length} sweep(s)</Explain>
          <Explain term="FVG">FVG — {analysis.validatedFvg ? `${analysis.validatedFvg.direction} gap validated` : "none validated"}</Explain>
          <Explain term="OB">Order block — {analysis.validatedOb ? `${analysis.validatedOb.direction} OB validated` : "none validated"}</Explain>
          <Explain term="MSNR">MSNR — {analysis.msnr.length} level(s)</Explain>
          <Explain term="CHoCH" />
          <Explain term="SPIKE">Spike risk — {analysis.spikeRisk}</Explain>
        </div>
      </Panel>

      <Disclosure title={`Conflicts (${analysis.conflicts.length})`}>
        {analysis.conflicts.length === 0 ? <EmptyNote>No conflicts detected.</EmptyNote> : (
          <ul className="space-y-2">{analysis.conflicts.map((c) => <WarnLine key={c.type}><strong>{c.type}:</strong> {c.detail}</WarnLine>)}</ul>
        )}
      </Disclosure>

      <Disclosure title="Evidence & technical details">
      {/* ---- CRT detail ---- */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel eyebrow="CRT engine" title={`${TIMEFRAME_LABELS[analysis.crtTimeframe]} CRT conditions`}>
            <ul className="space-y-2">
              {analysis.crt.conditions.map((c) => (
                <CheckLine key={c.label} met={c.met}>
                  {c.label}
                </CheckLine>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field
                label="Previous range"
                value={
                  analysis.crt.previousRange
                    ? `${formatPrice(symbol, analysis.crt.previousRange.low)} – ${formatPrice(symbol, analysis.crt.previousRange.high)}`
                    : "—"
                }
              />
              <Field
                label="Invalidation"
                value={analysis.crt.invalidation ? formatPrice(symbol, analysis.crt.invalidation) : "—"}
                tone="bearish"
              />
            </div>
          </Panel>
  
          <Panel eyebrow="Multi-timeframe CRT" title="Nested structure">
            <ul className="space-y-2">
              {analysis.mtf.layers.map((l) => (
                <li key={l.timeframe} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{TIMEFRAME_LABELS[l.timeframe]}</span>
                  <DirectionTag
                    direction={l.state === "none" ? null : l.direction}
                    label={l.state === "developing" ? `${l.direction} developing` : l.state === "none" ? "None" : l.direction!}
                  />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">{analysis.mtf.summary}</p>
            {analysis.conflicts.map((c) => (
              <div key={c.type} className="mt-3 rounded-md bg-warning-soft px-3 py-2.5">
                <p className="font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-warning">{c.type}</p>
                <p className="mt-1 text-sm text-foreground">{c.detail}</p>
              </div>
            ))}
          </Panel>
        </div>
  
        {/* ---- Validated areas ---- */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel eyebrow="Order blocks" title="Accepted or rejected">
            {analysis.orderBlocks.length === 0 ? (
              <EmptyNote>No order block candidates near price.</EmptyNote>
            ) : (
              <ul className="space-y-3">
                {analysis.orderBlocks.map((ob, i) => (
                  <li key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="price-figure text-sm">
                        {formatPrice(symbol, ob.bottom)} – {formatPrice(symbol, ob.top)}
                      </span>
                      <Tag tone={ob.valid ? (ob.direction === "bullish" ? "bullish" : "bearish") : "neutral"}>
                        {ob.valid ? "Valid" : "Rejected"}
                      </Tag>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {(ob.valid ? ob.reasons : ob.rejections).join("; ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
  
          <Panel eyebrow="Fair value gaps" title="Strength assessment">
            {analysis.fvgs.length === 0 ? (
              <EmptyNote>No imbalance near price.</EmptyNote>
            ) : (
              <ul className="space-y-3">
                {analysis.fvgs.map((f, i) => (
                  <li key={i} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="price-figure text-sm">
                        {formatPrice(symbol, f.bottom)} – {formatPrice(symbol, f.top)}
                      </span>
                      <Tag tone={f.strong ? (f.direction === "bullish" ? "bullish" : "bearish") : "neutral"}>
                        {f.strong ? "Strong" : "Not qualified"}
                      </Tag>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {(f.strong ? f.reasons : f.rejections).join("; ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
  
          <Panel eyebrow="Historical reaction" title="Repeated reaction areas">
            {analysis.reactionZones.length === 0 ? (
              <EmptyNote>No repeated historical reaction identified.</EmptyNote>
            ) : (
              <ul className="space-y-2.5">
                {analysis.reactionZones.map((z, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-sm">
                    <span className="price-figure">
                      {formatPrice(symbol, z.bottom)} – {formatPrice(symbol, z.top)}
                    </span>
                    <Tag tone={z.validated ? "bullish" : "neutral"}>{z.touches} touches</Tag>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Measured on {TIMEFRAME_LABELS[MODE_TIMEFRAMES[mode].context[MODE_TIMEFRAMES[mode].context.length - 1]!]} history.
            </p>
          </Panel>
        </div>
  
        {/* ---- Structure / liquidity / MSNR / fib / fundamentals ---- */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel eyebrow="Market structure & liquidity" title="Supporting context">
            <p className="text-sm text-foreground">{analysis.structure.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {analysis.structure.labels.slice(-4).map((l, i) => (
                <Tag key={i} tone={l.label.startsWith("H") ? "bullish" : "bearish"}>
                  {l.label} {formatPrice(symbol, l.price)}
                </Tag>
              ))}
            </div>
            <p className="label-eyebrow mt-4">Liquidity</p>
            <ul className="mt-1.5 space-y-2">
              {analysis.liquidity.slice(0, 5).map((l, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="capitalize text-muted-foreground">{l.type}</span>
                  <span className="flex items-center gap-2">
                    <span className="price-figure">{formatPrice(symbol, l.price)}</span>
                    <Tag tone={l.swept ? "warning" : "neutral"}>{l.swept ? "Swept" : "Resting"}</Tag>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">{analysis.session.note}</p>
          </Panel>
  
          <Panel eyebrow="MSNR & fundamentals" title="Levels and directional context">
            <ul className="space-y-2">
              {analysis.msnr.slice(0, 6).map((l) => (
                <li key={l.label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">{l.label}</span>
                  <span className="flex items-center gap-2">
                    <span className="price-figure">{formatPrice(symbol, l.price)}</span>
                    <Tag tone="neutral">{l.classification}</Tag>
                  </span>
                </li>
              ))}
            </ul>
  
            {analysis.fib && (
              <>
                <p className="label-eyebrow mt-4">Fibonacci 50%–75%</p>
                <p className="mt-1.5 text-sm text-foreground">
                  {formatPrice(symbol, analysis.fib.zoneBottom)} – {formatPrice(symbol, analysis.fib.zoneTop)} ·{" "}
                  {analysis.fib.inZone ? "price inside the band" : "price outside the band"}
                </p>
              </>
            )}
  
            <p className="label-eyebrow mt-4">Fundamental bias</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <DirectionTag direction={analysis.fundamentalBias.bias} />
              <SpikeRiskTag risk={analysis.spikeRisk} />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{analysis.fundamentalBias.reason}</p>
          </Panel>
        </div>
  
        </Disclosure>

      {/* ---- Risk ---- */}
      <Panel eyebrow="Risk management" title="Position sizing from your settings">
        {risk ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Risk amount" value={risk.riskAmount.toFixed(2)} />
              <Field label="Stop distance" value={`${risk.stopPips.toFixed(1)} pips`} />
              <Field label="Suggested size" value={risk.lots ? `${risk.lots.toFixed(2)} lots` : "—"} />
              <Field label="R:R to CRT target" value={risk.rewardRisk ? risk.rewardRisk.toFixed(2) : "—"} tone="bullish" />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {risk.note} Account {settings.accountSize.toLocaleString()} at {settings.riskPercent}% risk — change this in
              Settings.
            </p>
          </>
        ) : (
          <EmptyNote>Position sizing appears once a validated entry zone and technical stop loss exist.</EmptyNote>
        )}
      </Panel>

      <TradeProposal analysis={analysis} risk={risk} />
      <SavedAnalyses analysis={analysis} />

      {/* ---- Screenshots ---- */}
      <Panel eyebrow="Screenshot analysis" title="Upload chart screenshots">
        <p className="text-sm text-muted-foreground">
          Upload 2–3 charts for intraday analysis (Daily/4H → 1H/30M → 15M/5M), or up to 5 for long-term
          (Weekly → Daily → 4H → 1H → 15M). No image-reading provider is connected yet, so FOXWANA asks you to label
          each chart instead of inventing values it cannot see.
        </p>

        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-center transition-colors hover:bg-accent/40">
          <Upload className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Choose chart screenshots</span>
          <span className="text-xs text-muted-foreground">PNG or JPG · up to 5 images</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>

        {uploads.length > 0 && (
          <div className="mt-4 space-y-3">
            {uploads.map((u) => (
              <div key={u.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-3">
                  <img src={u.dataUrl} alt={u.fileName} className="h-16 w-24 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{u.fileName}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <select
                        value={u.timeframe ?? ""}
                        onChange={(e) =>
                          setUploads((list) =>
                            list.map((x) =>
                              x.id === u.id
                                ? {
                                    ...x,
                                    timeframe: (e.target.value || null) as Timeframe | null,
                                    detectionConfidence: e.target.value ? "user-labelled" : "unknown",
                                  }
                                : x,
                            ),
                          )
                        }
                        className="rounded-md border border-input bg-card px-2 py-1.5 text-xs"
                      >
                        <option value="">Label timeframe…</option>
                        {TIMEFRAMES.map((t) => (
                          <option key={t} value={t}>
                            {TIMEFRAME_LABELS[t]}
                          </option>
                        ))}
                      </select>
                      <select
                        value={u.symbol ?? ""}
                        onChange={(e) =>
                          setUploads((list) => list.map((x) => (x.id === u.id ? { ...x, symbol: e.target.value } : x)))
                        }
                        className="rounded-md border border-input bg-card px-2 py-1.5 text-xs"
                      >
                        {SYMBOLS.map((s) => (
                          <option key={s.symbol} value={s.symbol}>
                            {s.symbol}
                          </option>
                        ))}
                      </select>
                      <DataBadge kind="screenshot" />
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove screenshot"
                    onClick={() => setUploads((list) => list.filter((x) => x.id !== u.id))}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
            ))}

            {labelIssues.length > 0 ? (
              <ul className="space-y-2">
                {labelIssues.map((i) => (
                  <WarnLine key={i}>{i}</WarnLine>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-foreground">
                All screenshots labelled. Labelled charts are held for this analysis session and read alongside the
                market data above.
              </p>
            )}
          </div>
        )}
      </Panel>
    </>
  );
}
