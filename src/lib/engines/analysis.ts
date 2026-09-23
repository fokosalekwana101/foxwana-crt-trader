/**
 * ANALYSIS ORCHESTRATOR — the confluence engine.
 *
 * Pipeline: market data -> historical engine -> CRT engine -> liquidity ->
 * structure -> FVG -> OB -> MSNR -> fibonacci -> fundamentals -> confluence ->
 * signal strength -> conflict detector -> entry zone -> SL -> CRT target.
 *
 * Each stage lives in its own module; this file only composes them.
 */
import { getSeries } from "../market/series";
import { getSymbol } from "../market/symbols";
import { MODE_TIMEFRAMES, type Direction, type FinalStatus, type SignalStrength, type Timeframe, type TradingMode } from "../market/types";
import { crtForTimeframe, multiTimeframeCrt, type CrtResult, type MultiTimeframeCrt } from "./crt";
import {
  analyseStructure,
  fibConfirmation,
  findFVGs,
  findLiquidity,
  findOrderBlocks,
  findReactionZones,
  msnrLevels,
  sessionContext,
  type FairValueGap,
  type FibCheck,
  type LiquidityItem,
  type MarketStructure,
  type MsnrLevel,
  type OrderBlock,
  type ReactionZone,
} from "./structure";
import { currencyBias, pairBias, symbolSpikeRisk, type CurrencyBias, type PairBias, type SpikeRisk } from "./fundamentals";
import { DEMO_EVENTS } from "../data/calendar";
import { CURRENCIES } from "../market/symbols";

export type Confirmation = {
  label: string;
  weight: "strong" | "supporting";
  met: boolean;
  detail: string;
};

export type Conflict = {
  type: "MULTI-TIMEFRAME CONFLICT" | "TECHNICAL / FUNDAMENTAL CONFLICT" | "TARGET OBSTRUCTION";
  detail: string;
};

export type EntryZone = {
  top: number;
  bottom: number;
  preferred: number;
  basis: string[];
} | null;

export type AnalysisResult = {
  symbol: string;
  mode: TradingMode;
  price: number;
  session: { active: string[]; note: string };

  crt: CrtResult;
  crtTimeframe: Timeframe;
  mtf: MultiTimeframeCrt;
  direction: Direction | null;

  structure: MarketStructure;
  liquidity: LiquidityItem[];
  orderBlocks: OrderBlock[];
  fvgs: FairValueGap[];
  reactionZones: ReactionZone[];
  msnr: MsnrLevel[];
  fib: FibCheck | null;

  validatedOb: OrderBlock | null;
  validatedFvg: FairValueGap | null;
  validatedReaction: ReactionZone | null;
  entryValid: boolean;
  entryValidationReason: string;

  entryZone: EntryZone;
  stopLoss: number | null;
  crtTarget: number | null;
  rewardRisk: number | null;

  fundamentalBias: PairBias;
  spikeRisk: SpikeRisk;
  currencyBiases: CurrencyBias[];

  confirmations: Confirmation[];
  score: number;
  maxScore: number;
  strength: SignalStrength;
  conflicts: Conflict[];
  reasons: string[];
  blockers: string[];
  status: FinalStatus;
  statusReason: string;
};

function pickContextTimeframe(symbol: string, context: Timeframe[]): { crt: CrtResult; tf: Timeframe } {
  for (const tf of context) {
    const r = crtForTimeframe(symbol, tf);
    if (r.state === "bullish" || r.state === "bearish") return { crt: r, tf };
  }
  for (const tf of context) {
    const r = crtForTimeframe(symbol, tf);
    if (r.state === "developing") return { crt: r, tf };
  }
  const tf = context[0]!;
  return { crt: crtForTimeframe(symbol, tf), tf };
}

export function buildAnalysis(
  symbol: string,
  mode: TradingMode,
  options: { signalThreshold?: number; now?: Date } = {},
): AnalysisResult {
  const threshold = options.signalThreshold ?? 5;
  const now = options.now ?? new Date();
  const { context, confirm } = MODE_TIMEFRAMES[mode];
  const spec = getSymbol(symbol);

  // ---- CRT ----
  const mtf = multiTimeframeCrt(symbol, context, confirm);
  const { crt, tf: crtTimeframe } = pickContextTimeframe(symbol, context);
  const direction: Direction | null = crt.direction ?? mtf.contextDirection;

  // ---- Structure / liquidity / OB / FVG on the primary confirmation layer ----
  const entryTf = confirm[confirm.length - 1]!;
  const entryCandles = getSeries(symbol, entryTf, 120);
  const price = entryCandles[entryCandles.length - 1]!.close;
  const structure = analyseStructure(entryCandles);
  const liquidity = findLiquidity(entryCandles);
  const orderBlocks = findOrderBlocks(entryCandles, structure);
  const fvgs = findFVGs(entryCandles, structure);
  const reactionZones = findReactionZones(symbol, context[context.length - 1]!);
  const msnr = msnrLevels(symbol);
  const fib = direction ? fibConfirmation(entryCandles, direction, price) : null;

  // ---- HARD CRT ENTRY RULE ----
  const validatedOb =
    (direction && orderBlocks.find((o) => o.valid && o.direction === direction)) || null;
  const validatedFvg =
    (direction && fvgs.find((f) => f.strong && f.direction === direction)) || null;
  const validatedReaction =
    reactionZones.find((z) => z.validated && price >= z.bottom * 0.995 && price <= z.top * 1.005) ??
    reactionZones.find((z) => z.validated) ??
    null;

  const entryValid = !!(validatedOb || validatedFvg || validatedReaction);
  const entryValidationReason = entryValid
    ? `Entry sits at a technically validated area: ${[
        validatedOb && "confirmed order block",
        validatedFvg && "strong fair value gap",
        validatedReaction && "historically validated reaction area",
      ]
        .filter(Boolean)
        .join(", ")}.`
    : "No confirmed order block, strong fair value gap or historically validated reaction area at this price — a CRT signal alone is not an entry.";

  // ---- Entry zone / SL / CRT target ----
  let entryZone: EntryZone = null;
  const basis: string[] = [];
  if (direction && entryValid) {
    const candidates: { top: number; bottom: number; label: string }[] = [];
    if (validatedOb) candidates.push({ top: validatedOb.top, bottom: validatedOb.bottom, label: "Confirmed order block" });
    if (validatedFvg) candidates.push({ top: validatedFvg.top, bottom: validatedFvg.bottom, label: "Strong fair value gap" });
    if (validatedReaction)
      candidates.push({ top: validatedReaction.top, bottom: validatedReaction.bottom, label: `Historical reaction area (${validatedReaction.touches} touches)` });

    const top = Math.min(...candidates.map((c) => c.top));
    const bottom = Math.max(...candidates.map((c) => c.bottom));
    const zoneTop = top > bottom ? top : Math.max(...candidates.map((c) => c.top));
    const zoneBottom = top > bottom ? bottom : Math.min(...candidates.map((c) => c.bottom));
    candidates.forEach((c) => basis.push(c.label));
    if (structure.bos) basis.push(`Market structure (${structure.bos.direction} BOS)`);
    basis.push(`CRT location on ${crtTimeframe}`);

    entryZone = {
      top: zoneTop,
      bottom: zoneBottom,
      preferred: direction === "bullish" ? zoneBottom + (zoneTop - zoneBottom) * 0.35 : zoneTop - (zoneTop - zoneBottom) * 0.35,
      basis,
    };
  }

  const buffer = spec.pipSize * (mode === "scalping" ? 8 : mode === "intraday" ? 15 : 35);
  let stopLoss: number | null = null;
  if (direction && entryZone) {
    // SL is placed beyond the technical invalidation of the entry zone, not a fixed pip count.
    stopLoss =
      direction === "bullish"
        ? Math.min(entryZone.bottom, crt.invalidation ?? entryZone.bottom) - buffer
        : Math.max(entryZone.top, crt.invalidation ?? entryZone.top) + buffer;
  }

  const crtTarget = crt.target;
  const rewardRisk =
    entryZone && stopLoss !== null && crtTarget !== null
      ? Math.abs(crtTarget - entryZone.preferred) / Math.max(Math.abs(entryZone.preferred - stopLoss), 1e-9)
      : null;

  // ---- Fundamentals ----
  const currencyBiases = CURRENCIES.map((c) => currencyBias(c, DEMO_EVENTS, now)).filter((b) => b.total > 0);
  const fundamentalBias = pairBias(symbol, currencyBiases);
  const spikeRisk = symbolSpikeRisk(symbol, currencyBiases);

  // ---- Conflict detector ----
  const conflicts: Conflict[] = [];
  if (mtf.conflict) conflicts.push({ type: "MULTI-TIMEFRAME CONFLICT", detail: mtf.summary });
  if (direction && fundamentalBias.bias !== "neutral" && fundamentalBias.bias !== direction)
    conflicts.push({
      type: "TECHNICAL / FUNDAMENTAL CONFLICT",
      detail: `CRT is ${direction} while fundamentals read ${fundamentalBias.bias}. ${fundamentalBias.reason} CRT remains the primary methodology — but this setup is not automatic.`,
    });

  if (direction && crtTarget !== null) {
    const blocking = msnr.filter((l) =>
      direction === "bullish" ? l.price > price && l.price < crtTarget : l.price < price && l.price > crtTarget,
    );
    const major = blocking.filter((l) => l.classification === "Major");
    if (major.length)
      conflicts.push({
        type: "TARGET OBSTRUCTION",
        detail: `${major.length} major level(s) sit between price and the CRT target — closest: ${major[0]!.label}.`,
      });
  }

  // ---- Confluence / signal strength ----
  const confirmations: Confirmation[] = [
    {
      label: "CRT detected",
      weight: "strong",
      met: crt.state === "bullish" || crt.state === "bearish",
      detail: crt.state === "developing" ? `CRT developing on ${crtTimeframe}` : `${crtTimeframe} CRT ${crt.state}`,
    },
    {
      label: "Higher timeframe CRT alignment",
      weight: "supporting",
      met: !!mtf.contextDirection && mtf.contextDirection === direction && !mtf.conflict,
      detail: mtf.summary,
    },
    { label: "Confirmed order block", weight: "strong", met: !!validatedOb, detail: validatedOb ? validatedOb.reasons.join("; ") : "No order block passed validation" },
    { label: "Strong fair value gap", weight: "strong", met: !!validatedFvg, detail: validatedFvg ? validatedFvg.reasons.join("; ") : "No gap qualified as a strong FVG" },
    {
      label: "Historical reaction area",
      weight: "supporting",
      met: !!validatedReaction,
      detail: validatedReaction ? `${validatedReaction.touches} historical reactions on ${validatedReaction.timeframe}` : "No repeated historical reaction at this price",
    },
    { label: "Liquidity sweep", weight: "supporting", met: crt.sweep || liquidity.some((l) => l.swept), detail: crt.sweep ? "CRT sweep of the previous range" : liquidity.find((l) => l.swept) ? `${liquidity.find((l) => l.swept)!.type} swept` : "No sweep detected" },
    { label: "BOS", weight: "supporting", met: !!structure.bos && structure.bos.direction === direction, detail: structure.bos ? `${structure.bos.direction} break of structure` : "No break of structure yet" },
    { label: "CHoCH", weight: "supporting", met: !!structure.choch && structure.choch.direction === direction, detail: structure.choch ? `${structure.choch.direction} change of character` : "No change of character" },
    {
      label: "MSNR level",
      weight: "supporting",
      met: msnr.some((l) => Math.abs(l.price - price) < spec.pipSize * 40),
      detail: "Price interacting with a classified support/resistance level",
    },
    { label: "Fibonacci 50%-75%", weight: "supporting", met: !!fib?.inZone, detail: fib ? (fib.inZone ? "Price inside the 50%-75% retracement band" : "Price outside the 50%-75% band") : "No clean leg to measure" },
    {
      label: "Fundamental alignment",
      weight: "supporting",
      met: !!direction && fundamentalBias.bias === direction,
      detail: fundamentalBias.reason,
    },
  ];

  const score = confirmations.reduce((sum, c) => (c.met ? sum + (c.weight === "strong" ? 2 : 1) : sum), 0);
  const maxScore = confirmations.reduce((sum, c) => sum + (c.weight === "strong" ? 2 : 1), 0);
  const strength: SignalStrength = score >= threshold + 3 ? "STRONG" : score >= threshold ? "MEDIUM" : "WEAK";

  const reasons = confirmations.filter((c) => c.met).map((c) => `${c.label} — ${c.detail}`);
  const blockers: string[] = [];
  if (!entryValid) blockers.push(entryValidationReason);
  conflicts.forEach((c) => blockers.push(`${c.type}: ${c.detail}`));
  if (spikeRisk === "HIGH" || spikeRisk === "VERY HIGH")
    blockers.push(`Spike risk ${spikeRisk} — conflicting simultaneous events around this symbol.`);
  if (mode === "longterm" && (crt.state === "none" || mtf.contextDirection === null))
    blockers.push("Long-term analysis requires CRT-dominant higher timeframe context — it is currently weak.");

  // ---- Final status ----
  let status: FinalStatus;
  let statusReason: string;

  if (!direction || crt.state === "none") {
    status = "NO TRADE";
    statusReason = "No valid CRT structure on the context timeframes for this mode.";
  } else if (mtf.conflict) {
    status = "NO TRADE";
    statusReason = `${mtf.summary} Lower timeframe signals do not override higher timeframe context.`;
  } else if (!entryValid) {
    status = "NO VALID ENTRY";
    statusReason = entryValidationReason;
  } else if (crt.state === "developing") {
    const missing = crt.missing[0] ?? "final CRT condition";
    status = score >= threshold ? "TRIGGER WATCH" : "DEVELOPING";
    statusReason = `Waiting for ${missing.toLowerCase()}.`;
  } else if (mode === "scalping" && !(structure.bos && structure.bos.direction === direction)) {
    status = "TRIGGER WATCH";
    statusReason = "CRT and validated entry area in place — waiting for BOS confirmation.";
  } else if (strength === "WEAK") {
    status = "DEVELOPING";
    statusReason = `Confluence score ${score}/${maxScore} is below the configured threshold of ${threshold}.`;
  } else {
    status = direction === "bullish" ? "BUY" : "SELL";
    statusReason = `${crtTimeframe} CRT ${direction}, validated entry area, confluence ${score}/${maxScore}.`;
  }

  return {
    symbol,
    mode,
    price,
    session: sessionContext(now),
    crt,
    crtTimeframe,
    mtf,
    direction,
    structure,
    liquidity,
    orderBlocks,
    fvgs,
    reactionZones,
    msnr,
    fib,
    validatedOb,
    validatedFvg,
    validatedReaction,
    entryValid,
    entryValidationReason,
    entryZone,
    stopLoss,
    crtTarget,
    rewardRisk,
    fundamentalBias,
    spikeRisk,
    currencyBiases,
    confirmations,
    score,
    maxScore,
    strength,
    conflicts,
    reasons,
    blockers,
    status,
    statusReason,
  };
}

export type WatchlistRow = {
  symbol: string;
  price: number;
  changePercent: number;
  crtState: CrtResult["state"];
  crtDirection: Direction | null;
  status: FinalStatus;
  spikeRisk: SpikeRisk;
  fundamental: PairBias["bias"];
};
