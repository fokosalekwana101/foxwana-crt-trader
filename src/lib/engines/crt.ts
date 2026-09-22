/**
 * CRT ENGINE — Candle Range Theory.
 *
 * The creator's original Daily CRT logic is implemented verbatim in
 * `detectCRT` and generalised to every supported timeframe without altering
 * the principles: previous range -> liquidity sweep beyond it -> directional
 * change -> close returning back inside the previous range.
 */
import type { Candle, Direction, Timeframe } from "../market/types";
import { getSeries } from "../market/series";

export type CrtCondition = { label: string; met: boolean; detail?: string };

export type CrtState = "bullish" | "bearish" | "developing" | "none";

export type CrtResult = {
  timeframe: Timeframe;
  state: CrtState;
  direction: Direction | null;
  conditions: CrtCondition[];
  /** Range of the previous candle that CRT is built on. */
  previousRange: { high: number; low: number } | null;
  sweep: boolean;
  returnedInsideRange: boolean;
  directionalChange: boolean;
  /** Primary CRT objective — where the CRT is expected to complete. */
  target: number | null;
  /** Level that invalidates the CRT. */
  invalidation: number | null;
  missing: string[];
  previous: Candle | null;
  current: Candle | null;
};

function evaluate(prev: Candle, curr: Candle, timeframe: Timeframe): CrtResult {
  const insideRange = curr.close <= prev.high && curr.close >= prev.low;

  // ---- BEARISH CRT ----
  const bearConds: CrtCondition[] = [
    { label: "Previous candle closed above its open", met: prev.close > prev.open },
    { label: "Current candle closed below its open", met: curr.close < curr.open },
    { label: "Current high swept previous high", met: curr.high > prev.high },
    { label: "Current close returned inside previous range", met: insideRange },
  ];
  // ---- BULLISH CRT ----
  const bullConds: CrtCondition[] = [
    { label: "Previous candle closed below its open", met: prev.close < prev.open },
    { label: "Current candle closed above its open", met: curr.close > curr.open },
    { label: "Current low swept previous low", met: curr.low < prev.low },
    { label: "Current close returned inside previous range", met: insideRange },
  ];

  const bearScore = bearConds.filter((c) => c.met).length;
  const bullScore = bullConds.filter((c) => c.met).length;

  const build = (
    direction: Direction,
    conds: CrtCondition[],
    state: CrtState,
  ): CrtResult => ({
    timeframe,
    state,
    direction: state === "developing" ? direction : direction,
    conditions: conds,
    previousRange: { high: prev.high, low: prev.low },
    sweep: conds[2].met,
    returnedInsideRange: insideRange,
    directionalChange: conds[0].met && conds[1].met,
    target: direction === "bearish" ? prev.low : prev.high,
    invalidation: direction === "bearish" ? curr.high : curr.low,
    missing: conds.filter((c) => !c.met).map((c) => c.label),
  previous: prev,
    current: curr,
  });

  if (bearScore === 4) return build("bearish", bearConds, "bearish");
  if (bullScore === 4) return build("bullish", bullConds, "bullish");

  // Developing: the sweep (the defining CRT event) happened but the candle has
  // not yet satisfied direction change and/or the return inside the range.
  if (bearScore === 3 && bearConds[2].met) return build("bearish", bearConds, "developing");
  if (bullScore === 3 && bullConds[2].met) return build("bullish", bullConds, "developing");

  const conds = bearScore >= bullScore ? bearConds : bullConds;
  return {
    timeframe,
    state: "none",
    direction: null,
    conditions: conds,
    previousRange: { high: prev.high, low: prev.low },
    sweep: false,
    returnedInsideRange: insideRange,
    directionalChange: false,
    target: null,
    invalidation: null,
    missing: conds.filter((c) => !c.met).map((c) => c.label),
    previous: prev,
    current: curr,
  };
}

/** Original creator logic: evaluate the previous and current candle of a timeframe. */
export function detectCRT(previous: Candle, current: Candle, timeframe: Timeframe = "1D"): CrtResult {
  return evaluate(previous, current, timeframe);
}

/** Runs CRT detection on the latest two closed candles of a timeframe (demo data). */
export function crtForTimeframe(symbol: string, timeframe: Timeframe): CrtResult {
  const series = getSeries(symbol, timeframe, 3);
  if (series.length < 2) {
    return {
      timeframe,
      state: "none",
      direction: null,
      conditions: [],
      previousRange: null,
      sweep: false,
      returnedInsideRange: false,
      directionalChange: false,
      target: null,
      invalidation: null,
      missing: ["Insufficient candle history"],
      previous: null,
      current: null,
    };
  }
  const prev = series[series.length - 2];
  const curr = series[series.length - 1];
  return evaluate(prev, curr, timeframe);
}

export type MultiTimeframeCrt = {
  layers: CrtResult[];
  contextDirection: Direction | null;
  confirmDirection: Direction | null;
  conflict: boolean;
  summary: string;
};

function dominant(results: CrtResult[]): Direction | null {
  const bull = results.filter((r) => r.direction === "bullish" && r.state !== "none").length;
  const bear = results.filter((r) => r.direction === "bearish" && r.state !== "none").length;
  if (bull === 0 && bear === 0) return null;
  if (bull === bear) return null;
  return bull > bear ? "bullish" : "bearish";
}

/**
 * Nested CRT across a mode's context and confirmation layers.
 * Higher timeframe layers intentionally carry the directional weight.
 */
export function multiTimeframeCrt(
  symbol: string,
  context: Timeframe[],
  confirm: Timeframe[],
): MultiTimeframeCrt {
  const contextLayers = context.map((tf) => crtForTimeframe(symbol, tf));
  const confirmLayers = confirm.map((tf) => crtForTimeframe(symbol, tf));
  const contextDirection = dominant(contextLayers);
  const confirmDirection = dominant(confirmLayers);
  const conflict =
    !!contextDirection && !!confirmDirection && contextDirection !== confirmDirection;

  let summary: string;
  if (conflict) {
    summary = `Higher timeframe context is ${contextDirection}, confirmation layers are ${confirmDirection}.`;
  } else if (contextDirection && confirmDirection) {
    summary = `Context and confirmation layers agree — ${contextDirection}.`;
  } else if (contextDirection) {
    summary = `Higher timeframe context is ${contextDirection}; confirmation layers are not aligned yet.`;
  } else {
    summary = "No clear CRT direction across higher timeframes.";
  }

  return {
    layers: [...contextLayers, ...confirmLayers],
    contextDirection,
    confirmDirection,
    conflict,
    summary,
  };
}
