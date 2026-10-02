import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2 } from "lucide-react";
import type { AnalysisResult } from "@/lib/engines/analysis";
import type { RiskResult } from "@/lib/engines/risk";
import { formatPrice } from "@/lib/market/symbols";
import { MODE_LABELS } from "@/lib/market/types";
import { blankEntry, useJournal } from "@/lib/store/journal";
import { useSavedAnalyses } from "@/lib/store/analyses";
import { EmptyNote, Field, Panel, StatusPill } from "@/components/common/ui-bits";

const when = (ms: number) => new Date(ms).toISOString().replace("T", " ").slice(0, 16) + " UTC";

/** Exact CRT levels so the user can reproduce them manually on TradingView. */
export function CrtLevels({ analysis: a }: { analysis: AnalysisResult }) {
  const { crt } = a;
  const p = (v: number | null | undefined) => (v === null || v === undefined ? "—" : formatPrice(a.symbol, v));
  return (
    <Panel eyebrow="Exact levels" title={`${a.crtTimeframe} CRT — reproduce it on your own chart`}>
      {!crt.previous || !crt.current ? (
        <EmptyNote>No CRT candles to report on this timeframe.</EmptyNote>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="CRT start (range candle)" value={when(crt.previous.time)} />
          <Field label="CRT high" value={p(crt.previousRange?.high)} />
          <Field label="CRT low" value={p(crt.previousRange?.low)} />
          <Field label="Sweep candle" value={when(crt.current.time)} />
          <Field label="Sweep extreme" value={crt.sweep ? p(crt.direction === "bullish" ? crt.current.low : crt.current.high) : "No sweep"} tone="warning" />
          <Field label="CRT end / target" value={p(crt.target)} tone="bullish" />
          <Field label="Invalidation" value={p(crt.invalidation)} tone="bearish" />
          <Field label="State" value={crt.state} />
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        FOXWANA does not draw on TradingView automatically — copy these values into your own chart.
      </p>
    </Panel>
  );
}

/** TRADE PROPOSAL → REVIEW TRADE → APPROVE & SEND / CANCEL. Never executes automatically. */
export function TradeProposal({ analysis: a, risk }: { analysis: AnalysisResult; risk: RiskResult | null }) {
  const [step, setStep] = useState<"proposal" | "review">("proposal");
  const [, setJournal] = useJournal();
  const actionable = (a.status === "BUY" || a.status === "SELL") && a.entryZone && a.stopLoss !== null;
  const p = (v: number | null | undefined) => (v === null || v === undefined ? "—" : formatPrice(a.symbol, v));

  return (
    <Panel eyebrow="Trade proposal" title="A plan for you to review — never an automatic trade">
      {!actionable ? (
        <EmptyNote>No trade proposal: current status is {a.status}. An analysis result is never permission to trade.</EmptyNote>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Field label="Direction" value={a.status} tone={a.status === "BUY" ? "bullish" : "bearish"} />
            <Field label="Entry" value={p(a.entryZone!.preferred)} />
            <Field label="Stop loss" value={p(a.stopLoss)} tone="bearish" />
            <Field label="CRT target" value={p(a.crtTarget)} tone="bullish" />
            <Field label="Size" value={risk?.lots ? `${risk.lots.toFixed(2)} lots` : "—"} />
          </div>
          {step === "proposal" ? (
            <button type="button" onClick={() => setStep("review")} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Review trade
            </button>
          ) : (
            <div className="mt-4 space-y-3 rounded-lg border border-warning/40 bg-warning-soft p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="size-4 text-warning" /> Review carefully. Risk: {risk ? risk.riskAmount.toFixed(2) : "—"} · R:R {risk?.rewardRisk?.toFixed(2) ?? "—"} · Spike risk {a.spikeRisk}
              </p>
              <p className="text-xs text-muted-foreground">
                No broker or MetaTrader account is connected, so nothing can be sent. Any future connection will still require this explicit approval.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled title="No broker connected" className="cursor-not-allowed rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50">
                  Approve &amp; send
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setJournal((j) => [
                      {
                        ...blankEntry(),
                        symbol: a.symbol, mode: a.mode, direction: a.status === "BUY" ? "bullish" : "bearish",
                        entry: a.entryZone!.preferred, stopLoss: a.stopLoss!, takeProfit: a.crtTarget ?? 0,
                        positionSize: risk?.lots ?? 0, crtTimeframe: a.crtTimeframe, crtDirection: a.direction ?? "bullish",
                        strength: a.strength, confirmations: a.reasons.slice(0, 6), spikeRisk: a.spikeRisk,
                        fundamentalBias: a.fundamentalBias.reason, reasonForEntry: a.statusReason, rewardRisk: risk?.rewardRisk ?? 0,
                      },
                      ...j,
                    ]);
                    toast.success("Plan recorded in your journal as an open trade");
                    setStep("proposal");
                  }}
                  className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground"
                >
                  Record plan in journal
                </button>
                <button type="button" onClick={() => setStep("proposal")} className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

export function SavedAnalyses({ analysis: a }: { analysis: AnalysisResult }) {
  const [list, setList] = useSavedAnalyses();
  return (
    <Panel
      eyebrow="Saved analysis"
      title="Snapshots for this profile"
      action={
        <button
          type="button"
          onClick={() => {
            setList((l) => [
              { id: `a-${Date.now()}`, savedAt: new Date().toISOString(), symbol: a.symbol, mode: a.mode, status: a.status, summary: a.statusReason },
              ...l,
            ].slice(0, 30));
            toast.success("Analysis saved");
          }}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground"
        >
          Save current
        </button>
      }
    >
      {list.length === 0 ? (
        <EmptyNote>No saved analyses yet.</EmptyNote>
      ) : (
        <ul className="divide-y divide-border">
          {list.map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2.5">
              <StatusPill status={s.status} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{s.symbol} · {MODE_LABELS[s.mode]}</p>
                <p className="truncate text-xs text-muted-foreground">{s.savedAt.slice(0, 16).replace("T", " ")} — {s.summary}</p>
              </div>
              <button type="button" aria-label="Delete" onClick={() => setList((l) => l.filter((x) => x.id !== s.id))} className="text-muted-foreground hover:text-bearish">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
