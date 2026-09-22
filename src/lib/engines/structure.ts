/**
 * MARKET STRUCTURE / LIQUIDITY / OB / FVG / MSNR / FIBONACCI ENGINE.
 *
 * Each concept below is a supporting module for CRT — never a standalone
 * strategy. Modules are deliberately independent so they can be improved
 * without touching the analysis orchestrator.
 */
import type { Candle, Direction, Timeframe } from "../market/types";
import { getSeries } from "../market/series";

export type SwingPoint = { index: number; price: number; kind: "high" | "low" };

export type StructureLabel = "HH" | "HL" | "LH" | "LL";

export type MarketStructure = {
  bias: Direction | "ranging";
  labels: { label: StructureLabel; price: number }[];
  bos: { direction: Direction; level: number } | null;
  choch: { direction: Direction; level: number } | null;
  description: string;
};

export type OrderBlock = {
  direction: Direction;
  top: number;
  bottom: number;
  index: number;
  displacement: number;
  contributedToBos: boolean;
  mitigated: boolean;
  invalidated: boolean;
  valid: boolean;
  reasons: string[];
  rejections: string[];
};

export type FairValueGap = {
  direction: Direction;
  top: number;
  bottom: number;
  index: number;
  displacement: number;
  mitigation: number; // 0 = untouched, 1 = fully filled
  strong: boolean;
  reasons: string[];
  rejections: string[];
};

export type LiquidityItem = {
  type: "previous high" | "previous low" | "equal highs" | "equal lows" | "swing high" | "swing low";
  price: number;
  swept: boolean;
};

export type ReactionZone = {
  top: number;
  bottom: number;
  touches: number;
  timeframe: Timeframe;
  validated: boolean;
};

export type MsnrLevel = {
  label: string;
  price: number;
  classification: "Major" | "Intermediate" | "Entry";
  timeframe: Timeframe;
};

const range = (c: Candle) => c.high - c.low;
const body = (c: Candle) => Math.abs(c.close - c.open);

export function findSwings(candles: Candle[], lookback = 2): SwingPoint[] {
  const swings: SwingPoint[] = [];
  for (let i = lookback; i < candles.length - lookback; i++) {
    const win = candles.slice(i - lookback, i + lookback + 1);
    const c = candles[i]!;
    if (c.high === Math.max(...win.map((w) => w.high))) swings.push({ index: i, price: c.high, kind: "high" });
    else if (c.low === Math.min(...win.map((w) => w.low))) swings.push({ index: i, price: c.low, kind: "low" });
  }
  return swings;
}

export function analyseStructure(candles: Candle[]): MarketStructure {
  const swings = findSwings(candles);
  const highs = swings.filter((s) => s.kind === "high").slice(-4);
  const lows = swings.filter((s) => s.kind === "low").slice(-4);
  const labels: { label: StructureLabel; price: number }[] = [];

  for (let i = 1; i < highs.length; i++)
    labels.push({ label: highs[i]!.price > highs[i - 1]!.price ? "HH" : "LH", price: highs[i]!.price });
  for (let i = 1; i < lows.length; i++)
    labels.push({ label: lows[i]!.price > lows[i - 1]!.price ? "HL" : "LL", price: lows[i]!.price });

  const up = labels.filter((l) => l.label === "HH" || l.label === "HL").length;
  const down = labels.filter((l) => l.label === "LH" || l.label === "LL").length;
  const bias: MarketStructure["bias"] = up === down ? "ranging" : up > down ? "bullish" : "bearish";

  const last = candles[candles.length - 1]!;
  const lastHigh = highs[highs.length - 2]?.price;
  const lastLow = lows[lows.length - 2]?.price;

  let bos: MarketStructure["bos"] = null;
  if (lastHigh && last.close > lastHigh) bos = { direction: "bullish", level: lastHigh };
  else if (lastLow && last.close < lastLow) bos = { direction: "bearish", level: lastLow };

  let choch: MarketStructure["choch"] = null;
  if (bos && bias !== "ranging" && bos.direction !== bias) {
    choch = { direction: bos.direction, level: bos.level };
  }

  const description =
    bias === "ranging"
      ? "Structure is ranging — no clean sequence of higher or lower swings."
      : `Structure is ${bias} (${labels.slice(-3).map((l) => l.label).join(" → ") || "forming"}).`;

  return { bias, labels, bos, choch, description };
}

/**
 * Order Blocks: last opposing candle before a displacement leg that broke
 * structure. Every candidate is scored and either accepted or rejected with
 * stated reasons — we never label every rectangle an OB.
 */
export function findOrderBlocks(candles: Candle[], structure: MarketStructure): OrderBlock[] {
  const avgRange = candles.reduce((a, c) => a + range(c), 0) / candles.length;
  const blocks: OrderBlock[] = [];
  const last = candles[candles.length - 1]!;

  for (let i = 2; i < candles.length - 2; i++) {
    const c = candles[i]!;
    const next = candles[i + 1]!;
    const displacement = body(next) / avgRange;
    if (displacement < 1.3) continue;

    const bullish = next.close > next.open && c.close < c.open;
    const bearish = next.close < next.open && c.close > c.open;
    if (!bullish && !bearish) continue;

    const direction: Direction = bullish ? "bullish" : "bearish";
    const top = Math.max(c.open, c.close, bullish ? c.high : c.open);
    const bottom = Math.min(c.open, c.close, bullish ? c.low : c.close);

    const after = candles.slice(i + 2);
    const mitigated = after.some((a) => a.low <= top && a.high >= bottom);
    const deepMitigation = after.some((a) =>
      direction === "bullish" ? a.close < bottom : a.close > top,
    );
    const contributedToBos = !!structure.bos && structure.bos.direction === direction;
    const invalidated = deepMitigation;

    const reasons: string[] = [];
    const rejections: string[] = [];
    reasons.push(`Displacement ${displacement.toFixed(1)}x average range`);
    if (contributedToBos) reasons.push("Leg contributed to break of structure");
    else rejections.push("Leg did not contribute to a break of structure");
    if (!mitigated) reasons.push("Block is unmitigated");
    else if (!invalidated) reasons.push("Partially mitigated, body still respected");
    if (invalidated) rejections.push("Price closed through the block — invalidated");
    if (structure.bias !== "ranging" && structure.bias !== direction)
      rejections.push(`Against ${structure.bias} market structure`);

    const valid = !invalidated && contributedToBos && displacement >= 1.5;
    blocks.push({
      direction,
      top,
      bottom,
      index: i,
      displacement,
      contributedToBos,
      mitigated,
      invalidated,
      valid,
      reasons,
      rejections,
    });
  }

  // Keep the most recent relevant blocks near current price.
  return blocks
    .sort((a, b) => Math.abs((a.top + a.bottom) / 2 - last.close) - Math.abs((b.top + b.bottom) / 2 - last.close))
    .slice(0, 4);
}

/** Fair Value Gaps: 3-candle imbalance, scored for displacement and mitigation. */
export function findFVGs(candles: Candle[], structure: MarketStructure): FairValueGap[] {
  const avgRange = candles.reduce((a, c) => a + range(c), 0) / candles.length;
  const gaps: FairValueGap[] = [];
  const last = candles[candles.length - 1]!;

  for (let i = 1; i < candles.length - 1; i++) {
    const a = candles[i - 1]!;
    const b = candles[i]!;
    const c = candles[i + 1]!;

    let direction: Direction | null = null;
    let top = 0;
    let bottom = 0;
    if (c.low > a.high) {
      direction = "bullish";
      top = c.low;
      bottom = a.high;
    } else if (c.high < a.low) {
      direction = "bearish";
      top = a.low;
      bottom = c.high;
    }
    if (!direction) continue;

    const displacement = body(b) / avgRange;
    const size = top - bottom;
    const after = candles.slice(i + 2);
    let filled = 0;
    for (const x of after) {
      if (x.low <= top && x.high >= bottom) {
        const overlap = Math.min(top, x.high) - Math.max(bottom, x.low);
        filled = Math.max(filled, Math.min(1, overlap / size));
      }
    }

    const reasons: string[] = [];
    const rejections: string[] = [];
    if (displacement >= 1.2) reasons.push(`Strong displacement candle (${displacement.toFixed(1)}x)`);
    else rejections.push("Weak displacement — ordinary candle, not an imbalance leg");
    if (filled < 0.5) reasons.push(`Unmitigated / partially mitigated (${Math.round(filled * 100)}% filled)`);
    else rejections.push(`Largely mitigated (${Math.round(filled * 100)}% filled)`);
    if (structure.bos && structure.bos.direction === direction) reasons.push("Formed with a break of structure");
    else rejections.push("No market structure break supporting the gap");
    if (structure.bias !== "ranging" && structure.bias !== direction)
      rejections.push(`Against ${structure.bias} structure`);

    const strong =
      displacement >= 1.4 &&
      filled < 0.6 &&
      !!structure.bos &&
      structure.bos.direction === direction;

    gaps.push({ direction, top, bottom, index: i, displacement, mitigation: filled, strong, reasons, rejections });
  }

  return gaps
    .sort((a, b) => Math.abs((a.top + a.bottom) / 2 - last.close) - Math.abs((b.top + b.bottom) / 2 - last.close))
    .slice(0, 4);
}

export function findLiquidity(candles: Candle[]): LiquidityItem[] {
  const last = candles[candles.length - 1]!;
  const swings = findSwings(candles);
  const items: LiquidityItem[] = [];
  const tolerance = (Math.max(...candles.map((c) => c.high)) - Math.min(...candles.map((c) => c.low))) * 0.0015;

  const highs = swings.filter((s) => s.kind === "high").slice(-6);
  const lows = swings.filter((s) => s.kind === "low").slice(-6);

  for (let i = 1; i < highs.length; i++)
    if (Math.abs(highs[i]!.price - highs[i - 1]!.price) < tolerance)
      items.push({ type: "equal highs", price: highs[i]!.price, swept: last.high > highs[i]!.price });
  for (let i = 1; i < lows.length; i++)
    if (Math.abs(lows[i]!.price - lows[i - 1]!.price) < tolerance)
      items.push({ type: "equal lows", price: lows[i]!.price, swept: last.low < lows[i]!.price });

  const topHigh = highs[highs.length - 1];
  const bottomLow = lows[lows.length - 1];
  if (topHigh) items.push({ type: "swing high", price: topHigh.price, swept: last.high > topHigh.price });
  if (bottomLow) items.push({ type: "swing low", price: bottomLow.price, swept: last.low < bottomLow.price });

  const prev = candles[candles.length - 2];
  // prev may be undefined for a 1-candle series
  if (prev) {
    items.push({ type: "previous high", price: prev.high, swept: last.high > prev.high });
    items.push({ type: "previous low", price: prev.low, swept: last.low < prev.low });
  }
  return items;
}

/**
 * HISTORICAL DATA ENGINE — repeated reaction areas.
 * A zone only counts as validated when price reacted there more than once.
 */
export function findReactionZones(symbol: string, timeframe: Timeframe): ReactionZone[] {
  const candles = getSeries(symbol, timeframe, 120);
  const hi = Math.max(...candles.map((c) => c.high));
  const lo = Math.min(...candles.map((c) => c.low));
  const bucket = (hi - lo) / 28;
  const map = new Map<number, number>();

  for (const c of candles) {
    for (const price of [c.high, c.low]) {
      const key = Math.round((price - lo) / bucket);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return [...map.entries()]
    .filter(([, touches]) => touches >= 3)
    .map(([key, touches]) => ({
      bottom: lo + key * bucket,
      top: lo + (key + 1) * bucket,
      touches,
      timeframe,
      validated: touches >= 4,
    }))
    .sort((a, b) => b.touches - a.touches)
    .slice(0, 5);
}

/** MSNR levels: previous period highs/lows, classified by timeframe importance. */
export function msnrLevels(symbol: string): MsnrLevel[] {
  const build = (tf: Timeframe, label: string, classification: MsnrLevel["classification"]) => {
    const s = getSeries(symbol, tf, 3);
    const prev = s[s.length - 2];
    if (!prev) return [];
    return [
      { label: `Previous ${label} High`, price: prev.high, classification, timeframe: tf },
      { label: `Previous ${label} Low`, price: prev.low, classification, timeframe: tf },
    ];
  };
  return [
    ...build("1M", "Monthly", "Major"),
    ...build("1W", "Weekly", "Major"),
    ...build("1D", "Daily", "Major"),
    ...build("4H", "4H", "Intermediate"),
    ...build("1H", "1H", "Intermediate"),
    ...build("15M", "15M", "Entry"),
  ];
}

export type FibCheck = {
  legHigh: number;
  legLow: number;
  zoneTop: number;
  zoneBottom: number;
  inZone: boolean;
};

/** Fibonacci is only used as supporting confirmation over the 50%-75% band. */
export function fibConfirmation(candles: Candle[], direction: Direction, price: number): FibCheck | null {
  const swings = findSwings(candles);
  const lastHigh = swings.filter((s) => s.kind === "high").slice(-1)[0];
  const lastLow = swings.filter((s) => s.kind === "low").slice(-1)[0];
  if (!lastHigh || !lastLow) return null;

  const high = lastHigh.price;
  const low = lastLow.price;
  const size = high - low;
  if (size <= 0) return null;

  const zoneTop = direction === "bullish" ? high - size * 0.5 : low + size * 0.75;
  const zoneBottom = direction === "bullish" ? high - size * 0.75 : low + size * 0.5;
  const top = Math.max(zoneTop, zoneBottom);
  const bottom = Math.min(zoneTop, zoneBottom);

  return { legHigh: high, legLow: low, zoneTop: top, zoneBottom: bottom, inZone: price <= top && price >= bottom };
}

/** SESSION CONTEXT — light touch, used only to frame liquidity behaviour. */
export function sessionContext(now = new Date()): { active: string[]; note: string } {
  const h = now.getUTCHours();
  const active: string[] = [];
  if (h >= 0 && h < 9) active.push("Asian");
  if (h >= 7 && h < 16) active.push("London");
  if (h >= 12 && h < 21) active.push("New York");
  const note =
    active.includes("London") && active.includes("New York")
      ? "London / New York overlap — highest liquidity and most sweep activity."
      : active.length
        ? `${active.join(" + ")} session active.`
        : "Between sessions — thin liquidity, sweeps less reliable.";
  return { active, note };
}
