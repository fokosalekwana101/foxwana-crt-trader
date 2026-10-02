import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  createChart,
  createSeriesMarkers,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { Maximize2, Minimize2 } from "lucide-react";
import type { AnalysisResult } from "@/lib/engines/analysis";
import { getSeries } from "@/lib/market/series";
import { formatPrice, getSymbol } from "@/lib/market/symbols";
import { MODE_TIMEFRAMES, type Candle, type Timeframe } from "@/lib/market/types";
import { useTheme } from "@/lib/theme";

/**
 * Interactive candle chart (drag, zoom, crosshair, scales, fullscreen).
 * Every overlay is derived from the AnalysisResult — nothing decorative.
 * Data comes from getSeries() (demo); a live provider can replace it.
 */
export const CHART_TFS: Timeframe[] = ["5M", "15M", "30M", "1H", "4H", "1D", "1W"];

const TF_MS: Record<Timeframe, number> = {
  "5M": 3e5, "15M": 9e5, "30M": 18e5, "1H": 36e5, "4H": 144e5, "1D": 864e5, "1W": 6048e5, "1M": 2592e6,
};

type Layer = "crt" | "ob" | "fvg" | "liquidity" | "structure" | "levels" | "plan";
const LAYERS: { key: Layer; label: string }[] = [
  { key: "crt", label: "CRT" },
  { key: "ob", label: "Order block" },
  { key: "fvg", label: "FVG" },
  { key: "liquidity", label: "Liquidity sweeps" },
  { key: "structure", label: "BOS / CHoCH" },
  { key: "levels", label: "Historical levels" },
  { key: "plan", label: "Entry / SL / Target" },
];

type Tone = "bullish" | "bearish" | "warning" | "neutral" | "primary";
type Box = { layer: Layer; from: number; to: number | null; top: number; bottom: number; tone: Tone; label: string };
type Line = { layer: Layer; price: number; tone: Tone; title: string; dashed?: boolean };
type Mark = { layer: Layer; time: number; above: boolean; tone: Tone; text: string };

/** Resolve a CSS colour token (oklch) to rgb() that canvas libraries understand. */
function resolveColor(token: string, alpha = 1): string {
  if (typeof document === "undefined") return "#888";
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim() || "#888";
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = raw;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r},${g},${b},${alpha})`;
}
const TOKEN: Record<Tone, string> = {
  bullish: "--bullish", bearish: "--bearish", warning: "--warning", neutral: "--muted-foreground", primary: "--primary",
};

export function buildOverlays(a: AnalysisResult) {
  const boxes: Box[] = [];
  const lines: Line[] = [];
  const marks: Mark[] = [];
  const entryTf = MODE_TIMEFRAMES[a.mode].confirm.at(-1)!;
  const entryCandles = getSeries(a.symbol, entryTf, 120);
  const t = (i: number) => entryCandles[i]?.time ?? entryCandles[0]!.time;

  const { crt } = a;
  if (crt.previous && crt.current && crt.previousRange) {
    const end = crt.current.time + TF_MS[a.crtTimeframe];
    boxes.push({ layer: "crt", from: crt.previous.time, to: end, top: crt.previousRange.high, bottom: crt.previousRange.low, tone: "primary", label: `${a.crtTimeframe} CRT range` });
    lines.push({ layer: "crt", price: crt.previousRange.high, tone: "primary", title: "CRT high" });
    lines.push({ layer: "crt", price: crt.previousRange.low, tone: "primary", title: "CRT low" });
    marks.push({ layer: "crt", time: crt.previous.time, above: true, tone: "primary", text: "CRT start" });
    if (crt.sweep) {
      const bull = crt.direction === "bullish";
      marks.push({ layer: "crt", time: crt.current.time, above: !bull, tone: "warning", text: bull ? "Sweep of CRT low" : "Sweep of CRT high" });
    }
    if (crt.target !== null) lines.push({ layer: "crt", price: crt.target, tone: "bullish", title: "CRT end / target" });
  }

  const obs = a.validatedOb ? [a.validatedOb] : [];
  for (const ob of obs)
    boxes.push({ layer: "ob", from: t(ob.index), to: null, top: ob.top, bottom: ob.bottom, tone: ob.direction === "bullish" ? "bullish" : "bearish", label: `${ob.direction} OB (${entryTf})` });
  const fvgs = a.validatedFvg ? [a.validatedFvg] : [];
  for (const f of fvgs)
    boxes.push({ layer: "fvg", from: t(f.index), to: null, top: f.top, bottom: f.bottom, tone: f.direction === "bullish" ? "bullish" : "bearish", label: `${f.direction} FVG (${entryTf})` });

  for (const l of a.liquidity.filter((x) => x.swept))
    lines.push({ layer: "liquidity", price: l.price, tone: "warning", title: `Swept ${l.type}`, dashed: true });
  if (a.structure.bos) lines.push({ layer: "structure", price: a.structure.bos.level, tone: "neutral", title: `BOS ${a.structure.bos.direction}`, dashed: true });
  if (a.structure.choch) lines.push({ layer: "structure", price: a.structure.choch.level, tone: "neutral", title: `CHoCH ${a.structure.choch.direction}`, dashed: true });

  for (const z of a.reactionZones.filter((z) => z.validated))
    boxes.push({ layer: "levels", from: 0, to: null, top: z.top, bottom: z.bottom, tone: "neutral", label: `Reaction area ×${z.touches} (${z.timeframe})` });
  for (const m of a.msnr.filter((m) => m.classification === "Major"))
    lines.push({ layer: "levels", price: m.price, tone: "neutral", title: `MSNR ${m.label}`, dashed: true });

  if (a.entryZone) boxes.push({ layer: "plan", from: entryCandles.at(-1)!.time, to: null, top: a.entryZone.top, bottom: a.entryZone.bottom, tone: "primary", label: "Entry zone" });
  if (a.stopLoss !== null) lines.push({ layer: "plan", price: a.stopLoss, tone: "bearish", title: "Stop loss" });
  if (a.crtTarget !== null && a.crtTarget !== crt.target) lines.push({ layer: "plan", price: a.crtTarget, tone: "bullish", title: "CRT target" });

  return { boxes, lines, marks, entryTf };
}

/** Snap an arbitrary timestamp onto the chart candle that contains it. */
function snap(candles: Candle[], time: number): number | null {
  if (!candles.length || time < candles[0]!.time) return candles.length && time <= 0 ? candles[0]!.time : null;
  let lo = 0, hi = candles.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (candles[mid]!.time <= time) lo = mid; else hi = mid - 1;
  }
  return candles[lo]!.time;
}

export function CrtChart({ analysis, defaultTf }: { analysis: AnalysisResult; defaultTf: Timeframe }) {
  const [tf, setTf] = useState<Timeframe>(defaultTf);
  const [hidden, setHidden] = useState<Set<Layer>>(new Set());
  const [full, setFull] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme();

  useEffect(() => setTf(defaultTf), [defaultTf]);

  const candles = useMemo(() => getSeries(analysis.symbol, tf, 400), [analysis.symbol, tf]);
  const overlays = useMemo(() => buildOverlays(analysis), [analysis]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const fg = resolveColor("--muted-foreground");
    const grid = resolveColor("--border", 0.6);
    const chart: IChartApi = createChart(el, {
      autoSize: true,
      layout: { background: { color: "transparent" }, textColor: fg, fontFamily: "inherit" },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      rightPriceScale: { borderColor: grid },
      timeScale: { borderColor: grid, timeVisible: true, rightOffset: 8 },
      crosshair: { mode: 0 },
    });
    const up = resolveColor("--bullish");
    const down = resolveColor("--bearish");
    const series: ISeriesApi<"Candlestick"> = chart.addSeries(CandlestickSeries, {
      upColor: up, downColor: down, wickUpColor: up, wickDownColor: down, borderVisible: false,
      priceFormat: { type: "price", precision: getSymbol(analysis.symbol).digits, minMove: 10 ** -getSymbol(analysis.symbol).digits },
    });
    series.setData(candles.map((c) => ({ time: (c.time / 1000) as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close })));

    for (const l of overlays.lines.filter((l) => !hidden.has(l.layer)))
      series.createPriceLine({
        price: l.price, color: resolveColor(TOKEN[l.tone]), lineWidth: 1,
        lineStyle: l.dashed ? LineStyle.Dashed : LineStyle.Solid, axisLabelVisible: true,
        title: `${l.title} ${formatPrice(analysis.symbol, l.price)}`,
      });

    const markers: SeriesMarker<Time>[] = overlays.marks
      .filter((m) => !hidden.has(m.layer))
      .map((m) => ({ ...m, s: snap(candles, m.time) }))
      .filter((m) => m.s !== null)
      .sort((a, b) => a.s! - b.s!)
      .map((m) => ({
        time: (m.s! / 1000) as UTCTimestamp,
        position: m.above ? "aboveBar" : "belowBar",
        color: resolveColor(TOKEN[m.tone]),
        shape: m.above ? "arrowDown" : "arrowUp",
        text: m.text,
      }));
    createSeriesMarkers(series, markers);
    chart.timeScale().setVisibleLogicalRange({ from: candles.length - 90, to: candles.length + 6 });

    // ---- Boxes (OB / FVG / CRT range / entry zone) drawn in an SVG overlay ----
    const boxes = overlays.boxes.filter((b) => !hidden.has(b.layer));
    const svg = svgRef.current!;
    svg.innerHTML = "";
    const ns = "http://www.w3.org/2000/svg";
    const nodes = boxes.map((b) => {
      const r = document.createElementNS(ns, "rect");
      r.setAttribute("fill", resolveColor(TOKEN[b.tone], 0.13));
      r.setAttribute("stroke", resolveColor(TOKEN[b.tone], 0.7));
      r.setAttribute("stroke-width", "1");
      const tx = document.createElementNS(ns, "text");
      tx.setAttribute("fill", resolveColor(TOKEN[b.tone]));
      tx.setAttribute("font-size", "10");
      tx.textContent = `${b.label} ${formatPrice(analysis.symbol, b.bottom)}–${formatPrice(analysis.symbol, b.top)}`;
      svg.append(r, tx);
      return { b, r, tx };
    });
    let raf = 0;
    const draw = () => {
      const width = el.clientWidth - chart.priceScale("right").width();
      for (const { b, r, tx } of nodes) {
        const y1 = series.priceToCoordinate(b.top);
        const y2 = series.priceToCoordinate(b.bottom);
        const fromSnap = b.from === 0 ? candles[0]!.time : snap(candles, b.from);
        let x1 = fromSnap === null ? 0 : chart.timeScale().timeToCoordinate((fromSnap / 1000) as UTCTimestamp) ?? 0;
        let x2 = width;
        if (b.to !== null) {
          const toSnap = snap(candles, b.to - 1);
          const c = toSnap === null ? null : chart.timeScale().timeToCoordinate((toSnap / 1000) as UTCTimestamp);
          if (c !== null) x2 = c + chart.timeScale().options().barSpacing / 2;
        }
        x1 = Math.max(0, x1 - chart.timeScale().options().barSpacing / 2);
        x2 = Math.min(width, x2);
        const show = y1 !== null && y2 !== null && x2 > x1;
        r.style.display = tx.style.display = show ? "" : "none";
        if (!show) continue;
        r.setAttribute("x", String(x1));
        r.setAttribute("width", String(x2 - x1));
        r.setAttribute("y", String(Math.min(y1!, y2!)));
        r.setAttribute("height", String(Math.max(1, Math.abs(y2! - y1!))));
        tx.setAttribute("x", String(x1 + 4));
        tx.setAttribute("y", String(Math.min(y1!, y2!) - 3));
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      chart.remove();
    };
  }, [candles, overlays, hidden, theme, analysis.symbol]);

  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void wrapRef.current?.requestFullscreen?.();
  };

  return (
    <div ref={wrapRef} className="space-y-3 bg-card">
      <div className="flex flex-wrap items-center gap-1.5">
        {CHART_TFS.map((t) => (
          <button key={t} type="button" onClick={() => setTf(t)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium ${tf === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
        <button type="button" onClick={toggleFull} aria-label="Toggle fullscreen"
          className="ml-auto inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground">
          {full ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      </div>
      <div className={`relative w-full ${full ? "h-[calc(100vh-140px)]" : "h-[380px] sm:h-[460px]"}`}>
        <div ref={elRef} className="absolute inset-0" />
        <svg ref={svgRef} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {LAYERS.map((l) => {
          const on = !hidden.has(l.key);
          return (
            <button key={l.key} type="button"
              onClick={() => setHidden((h) => { const n = new Set(h); if (on) n.add(l.key); else n.delete(l.key); return n; })}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${on ? "border-primary/50 bg-bullish-soft text-foreground" : "border-border text-muted-foreground line-through"}`}>
              {l.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Drag to scroll, wheel/pinch to zoom, hover for the crosshair. Order block and FVG come from the {overlays.entryTf} layer and
        are snapped onto the selected timeframe. Demo candles — not a live feed; nothing is drawn on TradingView automatically.
      </p>
    </div>
  );
}
