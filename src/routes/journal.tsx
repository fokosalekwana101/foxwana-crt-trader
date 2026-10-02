import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { blankEntry, useJournal, type JournalEntry, type TradeResult } from "@/lib/store/journal";
import { SYMBOLS } from "@/lib/market/symbols";
import { MODE_LABELS, type TradingMode } from "@/lib/market/types";
import { EmptyNote, PageHeader, Panel, Tag } from "@/components/common/ui-bits";
import { useProfiles } from "@/lib/store/profile";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Trade Journal — FOXWANA" },
      { name: "description", content: "Record every trade with entry, stop, CRT target, result and lessons — kept per profile." },
      { property: "og:title", content: "Trade Journal — FOXWANA" },
      { property: "og:description", content: "A CRT-focused trade journal for disciplined review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JournalPage,
});

const input = "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground";

function JournalPage() {
  const [journal, setJournal] = useJournal();
  const { active } = useProfiles();
  const [draft, setDraft] = useState<JournalEntry | null>(null);
  const set = <K extends keyof JournalEntry>(k: K, v: JournalEntry[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  const save = () => {
    if (!draft) return;
    setJournal((j) => (j.some((x) => x.id === draft.id) ? j.map((x) => (x.id === draft.id ? draft : x)) : [draft, ...j]));
    setDraft(null);
  };

  return (
    <>
      <PageHeader title="Trade Journal" description={`Trades for profile “${active.name}” only.`}>
        <button type="button" onClick={() => setDraft(blankEntry())} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="size-4" /> New trade
        </button>
      </PageHeader>

      {draft && (
        <Panel eyebrow="Trade record" title={journal.some((x) => x.id === draft.id) ? "Edit trade" : "New trade"}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs text-muted-foreground">Date<input type="date" className={input} value={draft.date} onChange={(e) => set("date", e.target.value)} /></label>
            <label className="text-xs text-muted-foreground">Market
              <select className={input} value={draft.symbol} onChange={(e) => set("symbol", e.target.value)}>
                {SYMBOLS.map((s) => <option key={s.symbol}>{s.symbol}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">Mode
              <select className={input} value={draft.mode} onChange={(e) => set("mode", e.target.value as TradingMode)}>
                {Object.entries(MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">Direction
              <select className={input} value={draft.direction} onChange={(e) => set("direction", e.target.value as JournalEntry["direction"])}>
                <option value="bullish">Buy</option><option value="bearish">Sell</option>
              </select>
            </label>
            {(["entry", "stopLoss", "takeProfit", "positionSize", "pnl", "rewardRisk"] as const).map((k) => (
              <label key={k} className="text-xs text-muted-foreground">
                {{ entry: "Entry", stopLoss: "Stop loss", takeProfit: "Target", positionSize: "Size (lots)", pnl: "P/L", rewardRisk: "R:R achieved" }[k]}
                <input type="number" step="any" className={input} value={draft[k]} onChange={(e) => set(k, Number(e.target.value))} />
              </label>
            ))}
            <label className="text-xs text-muted-foreground">Result
              <select className={input} value={draft.result} onChange={(e) => set("result", e.target.value as TradeResult)}>
                <option value="open">Open</option><option value="win">Win</option><option value="loss">Loss</option><option value="breakeven">Breakeven</option>
              </select>
            </label>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["reasonForEntry", "reasonForExit", "whatWentWrong", "postTradeAnalysis"] as const).map((k) => (
              <label key={k} className="text-xs text-muted-foreground">
                {{ reasonForEntry: "Reason for entry", reasonForExit: "Reason for exit", whatWentWrong: "What went wrong", postTradeAnalysis: "Post-trade analysis" }[k]}
                <textarea rows={2} className={input} value={draft[k]} onChange={(e) => set(k, e.target.value)} />
              </label>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={save} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Save</button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground">Cancel</button>
          </div>
        </Panel>
      )}

      <Panel bodyClassName="p-0 sm:p-0">
        {journal.length === 0 ? (
          <div className="p-5"><EmptyNote>No trades recorded for this profile yet.</EmptyNote></div>
        ) : (
          <ul className="divide-y divide-border">
            {journal.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <button type="button" onClick={() => setDraft(t)} className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{t.symbol} · {t.direction === "bullish" ? "Buy" : "Sell"} <span className="text-xs text-muted-foreground">{MODE_LABELS[t.mode]}</span></p>
                  <p className="truncate text-xs text-muted-foreground">{t.date} · {t.reasonForEntry || "No notes"}</p>
                </button>
                <Tag tone={t.result === "win" ? "bullish" : t.result === "loss" ? "bearish" : "neutral"}>{t.result}</Tag>
                <span className={`price-figure w-20 text-right text-sm font-medium ${t.pnl > 0 ? "text-bullish" : t.pnl < 0 ? "text-bearish" : "text-muted-foreground"}`}>
                  {t.pnl > 0 ? "+" : ""}{t.pnl.toFixed(2)}
                </span>
                <button type="button" aria-label="Delete trade" onClick={() => setJournal((j) => j.filter((x) => x.id !== t.id))} className="text-muted-foreground hover:text-bearish">
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
