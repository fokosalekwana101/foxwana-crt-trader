import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useProfiles } from "@/lib/store/profile";
import { useSettings } from "@/lib/store/settings";
import { MODE_LABELS, type TradingMode } from "@/lib/market/types";
import { PageHeader, Panel, Tag } from "@/components/common/ui-bits";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FOXWANA" },
      { name: "description", content: "Manage profiles, risk defaults, trading mode and preferences in FOXWANA." },
      { property: "og:title", content: "Settings — FOXWANA" },
      { property: "og:description", content: "Profiles and preferences for FOXWANA CRT Market Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const input = "mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground";

function SettingsPage() {
  const { profiles, active, add, rename, remove, switchTo } = useProfiles();
  const [settings, setSettings] = useSettings();
  const { theme, toggle } = useTheme();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      <PageHeader title="Settings" description="Each profile keeps its own markets, journal, statistics, settings and saved analysis." />

      <Panel eyebrow="Profiles" title="Workspaces">
        <ul className="divide-y divide-border">
          {profiles.map((p) => (
            <li key={p.id} className="flex items-center gap-2 py-2.5">
              {editing?.id === p.id ? (
                <input autoFocus className={`${input} mt-0 flex-1`} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { rename(p.id, editing.name); setEditing(null); } }} />
              ) : (
                <button type="button" onClick={() => switchTo(p.id)} className="flex-1 text-left text-sm font-medium text-foreground">
                  {p.name} {p.id === active.id && <Tag tone="bullish">Active</Tag>}
                </button>
              )}
              {editing?.id === p.id ? (
                <button type="button" aria-label="Save name" onClick={() => { rename(p.id, editing.name); setEditing(null); }} className="text-primary"><Check className="size-4" /></button>
              ) : (
                <button type="button" aria-label={`Rename ${p.name}`} onClick={() => setEditing({ id: p.id, name: p.name })} className="text-muted-foreground hover:text-foreground"><Pencil className="size-4" /></button>
              )}
              <button type="button" aria-label={`Delete ${p.name}`} disabled={profiles.length <= 1}
                onClick={() => { if (confirm(`Delete profile “${p.name}” and all its data?`)) remove(p.id); }}
                className="text-muted-foreground hover:text-bearish disabled:opacity-30">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newName.trim()) { add(newName); setNewName(""); } }}>
          <input className={`${input} mt-0 flex-1`} placeholder="New profile name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button type="submit" className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"><Plus className="size-4" /> Add</button>
        </form>
      </Panel>

      <Panel eyebrow="Trading" title={`Preferences for ${active.name}`}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-muted-foreground">Default mode
            <select className={input} value={settings.defaultMode} onChange={(e) => setSettings((s) => ({ ...s, defaultMode: e.target.value as TradingMode }))}>
              {Object.entries(MODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label className="text-xs text-muted-foreground">Account size
            <input type="number" className={input} value={settings.accountSize} onChange={(e) => setSettings((s) => ({ ...s, accountSize: Number(e.target.value) }))} />
          </label>
          <label className="text-xs text-muted-foreground">Risk per trade (%)
            <input type="number" step="0.1" className={input} value={settings.riskPercent} onChange={(e) => setSettings((s) => ({ ...s, riskPercent: Number(e.target.value) }))} />
          </label>
          <label className="text-xs text-muted-foreground">Signal threshold (confluence points)
            <input type="number" className={input} value={settings.signalThreshold} onChange={(e) => setSettings((s) => ({ ...s, signalThreshold: Number(e.target.value) }))} />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {(["notifyHighImpact", "notifyConfirmedSetups", "requireScreenshotLabels"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 text-foreground">
              <input type="checkbox" checked={settings[k]} onChange={(e) => setSettings((s) => ({ ...s, [k]: e.target.checked }))} />
              {{ notifyHighImpact: "Highlight high-impact news", notifyConfirmedSetups: "Highlight confirmed setups", requireScreenshotLabels: "Require screenshot labels" }[k]}
            </label>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Appearance & data" title="Theme and data sources">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={toggle} className="rounded-md border border-border px-3 py-2 font-medium text-foreground">
            Switch to {theme === "dark" ? "light" : "dark"} mode
          </button>
          <span className="text-muted-foreground">Market data: demo · News data: demo · Broker: not connected (trades are never executed automatically).</span>
        </div>
      </Panel>
    </>
  );
}
