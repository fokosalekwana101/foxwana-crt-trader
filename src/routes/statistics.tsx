import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useJournal } from "@/lib/store/journal";
import { MODE_LABELS } from "@/lib/market/types";
import { EmptyNote, Field, PageHeader, Panel } from "@/components/common/ui-bits";
import { useProfiles } from "@/lib/store/profile";

export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "Statistics — FOXWANA" },
      { name: "description", content: "Win rate, P/L, average R:R and cumulative performance from your own trade journal." },
      { property: "og:title", content: "Statistics — FOXWANA" },
      { property: "og:description", content: "Performance statistics calculated from your journal only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatsPage,
});

const sel = "rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground";

function StatsPage() {
  const [journal] = useJournal();
  const { active } = useProfiles();
  const [market, setMarket] = useState("all");
  const [mode, setMode] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const trades = useMemo(
    () =>
      journal
        .filter((t) => t.result !== "open")
        .filter((t) => market === "all" || t.symbol === market)
        .filter((t) => mode === "all" || t.mode === mode)
        .filter((t) => (!from || t.date >= from) && (!to || t.date <= to))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [journal, market, mode, from, to],
  );

  const wins = trades.filter((t) => t.result === "win").length;
  const losses = trades.filter((t) => t.result === "loss").length;
  const total = trades.reduce((s, t) => s + t.pnl, 0);
  const avgRR = trades.length ? trades.reduce((s, t) => s + t.rewardRisk, 0) / trades.length : 0;
  const best = trades.reduce<(typeof trades)[number] | null>((b, t) => (!b || t.pnl > b.pnl ? t : b), null);
  const worst = trades.reduce<(typeof trades)[number] | null>((b, t) => (!b || t.pnl < b.pnl ? t : b), null);
  let run = 0;
  const curve = trades.map((t, i) => ({ n: i + 1, date: t.date, pnl: t.pnl, cum: +(run += t.pnl).toFixed(2) }));
  const markets = [...new Set(journal.map((t) => t.symbol))];

  return (
    <>
      <PageHeader title="Statistics" description={`Calculated only from closed trades in “${active.name}”'s journal.`} />

      <div className="flex flex-wrap gap-2">
        <select className={sel} value={market} onChange={(e) => setMarket(e.target.value)} aria-label="Market">
          <option value="all">All markets</option>
          {markets.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select className={sel} value={mode} onChange={(e) => setMode(e.target.value)} aria-label="Mode">
          <option value="all">All modes</option>
          {Object.entries(MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" className={sel} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From" />
        <input type="date" className={sel} value={to} onChange={(e) => setTo(e.target.value)} aria-label="To" />
      </div>

      {trades.length === 0 ? (
        <Panel><EmptyNote>No closed trades match. Record trades in the Trade Journal to see your real performance.</EmptyNote></Panel>
      ) : (
        <>
          <Panel>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Field label="Total trades" value={trades.length} />
              <Field label="Wins" value={wins} tone="bullish" />
              <Field label="Losses" value={losses} tone="bearish" />
              <Field label="Win rate" value={`${((wins / trades.length) * 100).toFixed(1)}%`} />
              <Field label="Total P/L" value={total.toFixed(2)} tone={total >= 0 ? "bullish" : "bearish"} />
              <Field label="Average R:R" value={avgRR.toFixed(2)} />
              <Field label="Best trade" value={best ? `${best.symbol} ${best.pnl.toFixed(2)}` : "—"} tone="bullish" />
              <Field label="Worst trade" value={worst ? `${worst.symbol} ${worst.pnl.toFixed(2)}` : "—"} tone="bearish" />
            </div>
          </Panel>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel eyebrow="Equity" title="Cumulative performance">
              <div className="h-64">
                <ResponsiveContainer>
                  <LineChart data={curve}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Line type="monotone" dataKey="cum" stroke="var(--bullish)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel eyebrow="Per trade" title="Wins vs losses (P/L)">
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={curve}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="n" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="pnl">
                      {curve.map((c) => <Cell key={c.n} fill={c.pnl >= 0 ? "var(--bullish)" : "var(--bearish)"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
