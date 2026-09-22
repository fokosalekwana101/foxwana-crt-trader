/**
 * FUNDAMENTAL NEWS ENGINE.
 *
 * Implements the creator's methodology exactly:
 *   FORECAST >= PREVIOUS  -> currency STRONG
 *   FORECAST <  PREVIOUS  -> currency WEAK
 * applied to ALL major currencies (not USD only).
 *
 * Direction and spike risk are kept as separate concepts. Actual is only ever
 * used once it has been released.
 */
import { SYMBOLS, type Currency } from "../market/symbols";

export type Impact = "high" | "medium" | "low";

export type EconomicEvent = {
  id: string;
  currency: Currency;
  name: string;
  /** ISO datetime of the release. */
  time: string;
  impact: Impact;
  previous: number | null;
  forecast: number | null;
  /** null until released. Never read before release. */
  actual: number | null;
  unit: string;
  source: string;
  /** Events sharing a release window are grouped. */
  group: string;
};

export type EventBias = "STRONG" | "WEAK" | "UNDETERMINED";

export type ActualStatus =
  | "FORECAST CONFIRMED"
  | "FORECAST STRONGLY CONFIRMED"
  | "FORECAST CONTRADICTED"
  | "FORECAST WEAKENED"
  | "AWAITING ACTUAL";

export type EvaluatedEvent = EconomicEvent & {
  expected: EventBias;
  actualStatus: ActualStatus;
  released: boolean;
  explanation: string;
};

export type SpikeRisk = "LOW" | "ELEVATED" | "HIGH" | "VERY HIGH";

export type CurrencyBias = {
  currency: Currency;
  direction: EventBias;
  strongCount: number;
  weakCount: number;
  total: number;
  majority: string; // e.g. "3/4"
  spikeRisk: SpikeRisk;
  agreement: string;
  events: EvaluatedEvent[];
};

export type ReleaseGroup = {
  group: string;
  time: string;
  currency: Currency;
  events: EvaluatedEvent[];
  direction: EventBias;
  majority: string;
  spikeRisk: SpikeRisk;
};

/** PREVIOUS -> FORECAST rule. */
export function expectedBias(event: EconomicEvent): EventBias {
  if (event.previous === null || event.forecast === null) return "UNDETERMINED";
  return event.forecast >= event.previous ? "STRONG" : "WEAK";
}

/** PREVIOUS -> FORECAST -> ACTUAL. Only applied after release. */
export function evaluateEvent(event: EconomicEvent, now = new Date()): EvaluatedEvent {
  const expected = expectedBias(event);
  const released = event.actual !== null && new Date(event.time).getTime() <= now.getTime();

  let actualStatus: ActualStatus = "AWAITING ACTUAL";
  let explanation: string;

  if (!released) {
    explanation =
      expected === "UNDETERMINED"
        ? "Previous or forecast value missing — no expectation can be formed."
        : `Forecast ${expected === "STRONG" ? "at or above" : "below"} previous → ${event.currency} expected ${expected}.`;
  } else {
    const actual = event.actual as number;
    const forecast = event.forecast as number;
    if (expected === "STRONG") {
      if (actual > forecast) actualStatus = "FORECAST STRONGLY CONFIRMED";
      else if (actual === forecast) actualStatus = "FORECAST CONFIRMED";
      else if (actual >= (event.previous as number)) actualStatus = "FORECAST WEAKENED";
      else actualStatus = "FORECAST CONTRADICTED";
    } else {
      if (actual < forecast) actualStatus = "FORECAST STRONGLY CONFIRMED";
      else if (actual === forecast) actualStatus = "FORECAST CONFIRMED";
      else if (actual <= (event.previous as number)) actualStatus = "FORECAST WEAKENED";
      else actualStatus = "FORECAST CONTRADICTED";
    }
    explanation = `${event.previous}${event.unit} → ${event.forecast}${event.unit} → ${actual}${event.unit} — ${actualStatus.toLowerCase()}.`;
  }

  return { ...event, expected, actualStatus, released, explanation };
}

function spikeRiskFor(strong: number, weak: number): { risk: SpikeRisk; agreement: string } {
  const total = strong + weak;
  if (total === 0) return { risk: "LOW", agreement: "No determinable events." };
  if (total === 1) return { risk: "LOW", agreement: "Single event — no internal disagreement." };
  const majority = Math.max(strong, weak);
  const ratio = majority / total;
  if (ratio === 1) return { risk: "LOW", agreement: `Full agreement ${majority}/${total} — strong fundamental agreement.` };
  if (majority === total - majority)
    return { risk: "VERY HIGH", agreement: `Split ${strong}/${total} vs ${weak}/${total} — no majority, direction is not decisive.` };
  if (ratio >= 0.7) return { risk: "ELEVATED", agreement: `Majority ${majority}/${total} with disagreement — elevated spike risk.` };
  return { risk: "HIGH", agreement: `Weak majority ${majority}/${total} — conflicting simultaneous events.` };
}

/** MAJORITY RULE across simultaneous events for one currency. */
export function currencyBias(currency: Currency, events: EconomicEvent[], now = new Date()): CurrencyBias {
  const evaluated = events
    .filter((e) => e.currency === currency)
    .map((e) => evaluateEvent(e, now))
    .sort((a, b) => a.time.localeCompare(b.time));

  const determinable = evaluated.filter((e) => e.expected !== "UNDETERMINED");
  const strongCount = determinable.filter((e) => e.expected === "STRONG").length;
  const weakCount = determinable.filter((e) => e.expected === "WEAK").length;
  const total = determinable.length;
  const { risk, agreement } = spikeRiskFor(strongCount, weakCount);

  const direction: EventBias =
    total === 0 || strongCount === weakCount ? "UNDETERMINED" : strongCount > weakCount ? "STRONG" : "WEAK";

  return {
    currency,
    direction,
    strongCount,
    weakCount,
    total,
    majority: total ? `${Math.max(strongCount, weakCount)}/${total}` : "—",
    spikeRisk: risk,
    agreement,
    events: evaluated,
  };
}

/** Groups simultaneous releases (same currency + same release window). */
export function releaseGroups(events: EconomicEvent[], now = new Date()): ReleaseGroup[] {
  const map = new Map<string, EconomicEvent[]>();
  for (const e of events) {
    const key = `${e.currency}|${e.group}`;
    map.set(key, [...(map.get(key) ?? []), e]);
  }
  return [...map.values()]
    .map((list) => {
      const evaluated = list.map((e) => evaluateEvent(e, now));
      const determinable = evaluated.filter((e) => e.expected !== "UNDETERMINED");
      const strong = determinable.filter((e) => e.expected === "STRONG").length;
      const weak = determinable.filter((e) => e.expected === "WEAK").length;
      const { risk } = spikeRiskFor(strong, weak);
      const first = list[0]!;
      return {
        group: first.group,
        time: first.time,
        currency: first.currency,
        events: evaluated,
        direction: (strong === weak ? "UNDETERMINED" : strong > weak ? "STRONG" : "WEAK") as EventBias,
        majority: determinable.length ? `${Math.max(strong, weak)}/${determinable.length}` : "—",
        spikeRisk: risk,
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));
}

export type PairBias = {
  symbol: string;
  bias: "bullish" | "bearish" | "neutral";
  reason: string;
};

/**
 * Applies currency strength to a symbol using base/quote positioning.
 * "Strong = buy" is never applied blindly to every pair.
 */
export function pairBias(symbol: string, biases: CurrencyBias[]): PairBias {
  const spec = SYMBOLS.find((s) => s.symbol === symbol);
  if (!spec) return { symbol, bias: "neutral", reason: "Unknown symbol." };

  const find = (cur: string) => biases.find((b) => b.currency === (cur as Currency) && b.direction !== "UNDETERMINED");
  const base = find(spec.base);
  const quote = find(spec.quote);

  // Gold: USD strong -> Gold bearish, USD weak -> Gold bullish.
  if (spec.group === "metal") {
    const usd = find("USD");
    if (!usd) return { symbol, bias: "neutral", reason: "No determinable USD events." };
    return usd.direction === "STRONG"
      ? { symbol, bias: "bearish", reason: `USD ${usd.majority} STRONG → ${spec.base} bearish.` }
      : { symbol, bias: "bullish", reason: `USD ${usd.majority} WEAK → ${spec.base} bullish.` };
  }

  if (!base && !quote) return { symbol, bias: "neutral", reason: "No determinable events for either currency." };

  if (base && quote && base.direction !== quote.direction) {
    return base.direction === "STRONG"
      ? { symbol, bias: "bullish", reason: `${spec.base} STRONG (${base.majority}) vs ${spec.quote} WEAK (${quote.majority}).` }
      : { symbol, bias: "bearish", reason: `${spec.base} WEAK (${base.majority}) vs ${spec.quote} STRONG (${quote.majority}).` };
  }
  if (base && quote && base.direction === quote.direction) {
    return { symbol, bias: "neutral", reason: `Both ${spec.base} and ${spec.quote} ${base.direction} — no clear fundamental edge.` };
  }
  if (base) {
    return base.direction === "STRONG"
      ? { symbol, bias: "bullish", reason: `Base currency ${spec.base} STRONG (${base.majority}) → buy bias.` }
      : { symbol, bias: "bearish", reason: `Base currency ${spec.base} WEAK (${base.majority}) → sell bias.` };
  }
  return quote!.direction === "STRONG"
    ? { symbol, bias: "bearish", reason: `Quote currency ${spec.quote} STRONG (${quote!.majority}) → sell bias.` }
    : { symbol, bias: "bullish", reason: `Quote currency ${spec.quote} WEAK (${quote!.majority}) → buy bias.` };
}

export function symbolSpikeRisk(symbol: string, biases: CurrencyBias[]): SpikeRisk {
  const spec = SYMBOLS.find((s) => s.symbol === symbol);
  if (!spec) return "LOW";
  const order: SpikeRisk[] = ["LOW", "ELEVATED", "HIGH", "VERY HIGH"];
  const relevant = biases.filter(
    (b) => b.currency === (spec.base as Currency) || b.currency === (spec.quote as Currency) || spec.group === "metal",
  );
  return relevant.reduce<SpikeRisk>(
    (worst, b) => (order.indexOf(b.spikeRisk) > order.indexOf(worst) ? b.spikeRisk : worst),
    "LOW",
  );
}
