import { getSymbol } from "./symbols";
import type { Candle, Timeframe } from "./types";

/**
 * DEMO SERIES GENERATOR.
 *
 * No market-data provider is connected in this build, so candle series are
 * generated deterministically from a seeded PRNG. Everything downstream (CRT
 * engine, structure engine, analysis engine) reads plain `Candle[]`, so a real
 * provider only has to implement `getSeries()` to replace this module.
 *
 * Series are always labelled `demo` in the UI — see DataBadge.
 */

const MS = { "5M": 5 * 60_000 } as const;
const BASE_TF: Timeframe = "5M";

const AGGREGATION: Record<Exclude<Timeframe, "5M">, number> = {
  "15M": 3,
  "30M": 6,
  "1H": 12,
  "4H": 48,
  "1D": 288,
  "1W": 288 * 5,
  "1M": 288 * 21,
};

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Anchor so the demo dataset is stable across renders and SSR/client. */
const ANCHOR = Date.UTC(2026, 8, 22, 0, 0, 0);

const cache = new Map<string, Candle[]>();

function buildBase(symbol: string, count: number): Candle[] {
  const spec = getSymbol(symbol);
  const rand = mulberry32(hashSeed(symbol));
  const step = spec.seedPrice * (spec.volatility / 100) * 0.012;
  const candles: Candle[] = [];
  let price = spec.seedPrice * (1 - spec.volatility / 140);

  // Slow regime drift produces swings, ranges and sweeps rather than pure noise.
  let regime = rand() > 0.5 ? 1 : -1;
  let regimeLeft = 40 + Math.floor(rand() * 160);

  const start = ANCHOR - count * MS["5M"];

  for (let i = 0; i < count; i++) {
    if (regimeLeft-- <= 0) {
      regime = -regime;
      regimeLeft = 40 + Math.floor(rand() * 200);
    }
    const drift = regime * step * 0.22;
    const noise = (rand() - 0.5) * step * 2;
    const open = price;
    const close = open + drift + noise;
    const wick = step * (0.35 + rand() * 1.15);
    const high = Math.max(open, close) + wick * rand();
    const low = Math.min(open, close) - wick * rand();
    candles.push({ time: start + i * MS["5M"], open, high, low, close });
    price = close;
  }
  return candles;
}

function aggregate(base: Candle[], factor: number): Candle[] {
  const out: Candle[] = [];
  for (let i = 0; i + factor <= base.length; i += factor) {
    const slice = base.slice(i, i + factor);
    out.push({
      time: slice[0].time,
      open: slice[0].open,
      high: Math.max(...slice.map((c) => c.high)),
      low: Math.min(...slice.map((c) => c.low)),
      close: slice[slice.length - 1].close,
    });
  }
  return out;
}

/** Returns the most recent `limit` candles for a symbol/timeframe (demo data). */
export function getSeries(symbol: string, timeframe: Timeframe, limit = 120): Candle[] {
  const key = `${symbol}:${timeframe}`;
  let series = cache.get(key);
  if (!series) {
    const baseCount = 288 * 21 * 26; // ~26 monthly candles of 5M data
    const base = cache.get(`${symbol}:${BASE_TF}`) ?? buildBase(symbol, baseCount);
    cache.set(`${symbol}:${BASE_TF}`, base);
    series = timeframe === "5M" ? base : aggregate(base, AGGREGATION[timeframe]);
    cache.set(key, series);
  }
  return series.slice(-limit);
}

export function lastPrice(symbol: string): number {
  const s = getSeries(symbol, "5M", 2);
  return s[s.length - 1].close;
}

export function dayChangePercent(symbol: string): number {
  const d = getSeries(symbol, "1D", 2);
  if (d.length < 2) return 0;
  return ((d[1].close - d[0].close) / d[0].close) * 100;
}
