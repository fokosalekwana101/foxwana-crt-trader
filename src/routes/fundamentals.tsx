import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
import {
  currencyBias,
  pairBias,
  releaseGroups,
  type CurrencyBias,
} from "@/lib/engines/fundamentals";
import { DEMO_EVENTS } from "@/lib/data/calendar";
import { CURRENCIES, SYMBOLS, getSymbol } from "@/lib/market/symbols";
import { useSettings } from "@/lib/store/settings";
import { Explain } from "@/components/common/Explain";
import { readFileAsDataUrl, type NewsUpload } from "@/lib/engines/screenshot";
import {
  DataBadge,
  EmptyNote,
  Field,
  PageHeader,
  Panel,
  SpikeRiskTag,
  Tag,
  WarnLine,
} from "@/components/common/ui-bits";

export const Route = createFileRoute("/fundamentals")({
  head: () => ({
    meta: [
      { title: "Fundamentals — FOXWANA" },
      {
        name: "description",
        content:
          "Economic events across USD, EUR, GBP, JPY, CAD, AUD, NZD and CHF using the Previous → Forecast → Actual method, with majority direction and spike risk kept separate.",
      },
      { property: "og:title", content: "Fundamentals — FOXWANA" },
      {
        property: "og:description",
        content: "Previous → Forecast → Actual event analysis for all major currencies, with spike-risk detection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FundamentalsPage,
});

function biasTone(direction: CurrencyBias["direction"]) {
  return direction === "STRONG" ? "bullish" : direction === "WEAK" ? "bearish" : "neutral";
}

function FundamentalsPage() {
  const [uploads, setUploads] = useState<NewsUpload[]>([]);

  const biases = useMemo(() => CURRENCIES.map((c) => currencyBias(c, DEMO_EVENTS)).filter((b) => b.total > 0), []);
  const allGroups = useMemo(() => releaseGroups(DEMO_EVENTS), []);
  const [settings] = useSettings();
  const [showPast, setShowPast] = useState(false);
  const [allImpacts, setAllImpacts] = useState(false);
  const relevant = useMemo(() => {
    const set = new Set<string>();
    for (const sym of settings.watchlist) {
      const sp = getSymbol(sym);
      set.add(sp.base);
      set.add(sp.quote);
      if (sp.group === "metal") set.add("USD");
    }
    return set;
  }, [settings.watchlist]);
  const now = Date.now();
  const groups = allGroups
    .filter((g) => relevant.size === 0 || relevant.has(g.currency))
    .filter((g) => showPast || new Date(g.time).getTime() > now)
    .map((g) => ({ ...g, events: allImpacts ? g.events : g.events.filter((e) => e.impact === "high") }))
    .filter((g) => g.events.length > 0)
    .sort((a, b) => a.time.localeCompare(b.time));
  const pairs = useMemo(
    () =>
      SYMBOLS.filter((s) => s.group !== "index" && (settings.watchlist.length === 0 || settings.watchlist.includes(s.symbol))).map((s) =>
        pairBias(s.symbol, biases),
      ),
    [biases, settings.watchlist],
  );

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const next: NewsUpload[] = [];
    for (const file of Array.from(files).slice(0, 4)) {
      next.push({
        id: `${file.name}-${Math.random().toString(16).slice(2)}`,
        fileName: file.name,
        dataUrl: await readFileAsDataUrl(file),
        currency: "USD",
        eventName: "",
        previous: "",
        forecast: "",
        actual: "",
        time: "",
      });
    }
    setUploads((u) => [...u, ...next].slice(0, 4));
  }

  return (
    <>
      <PageHeader
        title="Fundamentals"
        description="Forecast at or above previous means the currency is expected strong; below means weak. Direction and spike risk are separate readings."
      >
        <DataBadge kind="demo" />
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-muted-foreground">
          {relevant.size ? `Showing currencies in your markets: ${[...relevant].join(", ")}` : "No markets selected — showing all major currencies."}
        </span>
        <button type="button" onClick={() => setShowPast((v) => !v)} className={`rounded-md border px-3 py-1.5 font-medium ${showPast ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
          {showPast ? "Hide past events" : "Show past events"}
        </button>
        <button type="button" onClick={() => setAllImpacts((v) => !v)} className={`rounded-md border px-3 py-1.5 font-medium ${allImpacts ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
          {allImpacts ? "High impact only" : "Include medium/low impact"}
        </button>
      </div>
      <Explain term="SPIKE" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Release groups" title={showPast ? "Upcoming and past events" : "Upcoming market-moving events"} bodyClassName="p-0 sm:p-0">
          {groups.length === 0 && <div className="p-5"><EmptyNote>No upcoming high-impact events for your markets.</EmptyNote></div>}
          <ul className="divide-y divide-border">
            {groups.map((g) => (
              <li key={`${g.currency}-${g.group}`} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">
                      {g.currency} · {g.group}
                    </p>
                    <p className="price-figure mt-1 text-xs text-muted-foreground">
                      {new Date(g.time).toUTCString().slice(5, 22)} UTC
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag tone={biasTone(g.direction)}>
                      Majority {g.currency} {g.direction} {g.majority}
                    </Tag>
                    <SpikeRiskTag risk={g.spikeRisk} />
                  </div>
                </div>

                <ul className="mt-3 space-y-2.5">
                  {g.events.map((e) => (
                    <li key={e.id} className="rounded-md bg-surface px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{e.name}</span>
                        <div className="flex items-center gap-1.5">
                          <Tag tone={e.impact === "high" ? "bearish" : e.impact === "medium" ? "warning" : "neutral"}>
                            {e.impact}
                          </Tag>
                          <Tag tone={biasTone(e.expected)}>
                            {e.currency} {e.expected}
                          </Tag>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-3">
                        <Field label="Previous" value={e.previous === null ? "—" : `${e.previous}${e.unit}`} />
                        <Field label="Forecast" value={e.forecast === null ? "—" : `${e.forecast}${e.unit}`} />
                        <Field
                          label="Actual"
                          value={e.released ? `${e.actual}${e.unit}` : "—"}
                          tone={e.released ? "bullish" : undefined}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{e.explanation}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Source: {e.source}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel eyebrow="Currency bias" title="Majority per currency">
            <ul className="space-y-3">
              {biases.map((b) => (
                <li key={b.currency} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-sm font-semibold">{b.currency}</span>
                    <Tag tone={biasTone(b.direction)}>
                      {b.direction} {b.majority}
                    </Tag>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Strong {b.strongCount}/{b.total} · Weak {b.weakCount}/{b.total} — {b.agreement}
                  </p>
                  <div className="mt-1.5">
                    <SpikeRiskTag risk={b.spikeRisk} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel eyebrow="Applied to pairs" title="Base vs quote positioning">
            <ul className="space-y-2.5">
              {pairs.map((p) => (
                <li key={p.symbol} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.symbol}</p>
                    <p className="text-xs text-muted-foreground">{p.reason}</p>
                  </div>
                  <Tag tone={p.bias === "bullish" ? "bullish" : p.bias === "bearish" ? "bearish" : "neutral"}>
                    {p.bias}
                  </Tag>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel eyebrow="Calendar screenshots" title="Upload economic calendar images">
        <p className="text-sm text-muted-foreground">
          No image-reading provider is connected yet, so enter the values you can see. FOXWANA will never invent a
          Previous, Forecast or Actual value it cannot read.
        </p>
        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-center transition-colors hover:bg-accent/40">
          <Upload className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Choose calendar screenshots</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        </label>

        {uploads.length === 0 ? (
          <EmptyNote>
            <span className="mt-3 block">Nothing uploaded yet.</span>
          </EmptyNote>
        ) : (
          <div className="mt-4 space-y-3">
            {uploads.map((u) => {
              const prev = parseFloat(u.previous);
              const fc = parseFloat(u.forecast);
              const ready = !Number.isNaN(prev) && !Number.isNaN(fc);
              return (
                <div key={u.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start gap-3">
                    <img src={u.dataUrl} alt={u.fileName} className="h-16 w-24 rounded-md object-cover" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <select
                          value={u.currency}
                          onChange={(e) =>
                            setUploads((l) => l.map((x) => (x.id === u.id ? { ...x, currency: e.target.value } : x)))
                          }
                          className="rounded-md border border-input bg-card px-2 py-1.5 text-xs"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {(["eventName", "previous", "forecast"] as const).map((field) => (
                          <input
                            key={field}
                            value={u[field]}
                            placeholder={field === "eventName" ? "Event name" : field}
                            onChange={(e) =>
                              setUploads((l) => l.map((x) => (x.id === u.id ? { ...x, [field]: e.target.value } : x)))
                            }
                            className="rounded-md border border-input bg-card px-2 py-1.5 text-xs"
                          />
                        ))}
                      </div>
                      {ready ? (
                        <Tag tone={fc >= prev ? "bullish" : "bearish"}>
                          {u.currency} expected {fc >= prev ? "STRONG" : "WEAK"}
                        </Tag>
                      ) : (
                        <ul>
                          <WarnLine>Enter Previous and Forecast so the direction can be determined.</WarnLine>
                        </ul>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Remove screenshot"
                      onClick={() => setUploads((l) => l.filter((x) => x.id !== u.id))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <p className="text-xs text-muted-foreground">
        Fundamental readings never automatically override CRT. Where they disagree, the Analysis page reports a
        technical / fundamental conflict instead of creating a trade.
      </p>
    </>
  );
}
