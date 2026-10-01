import type { Direction, SignalStrength, Timeframe, TradingMode } from "../market/types";
import type { SpikeRisk } from "../engines/fundamentals";
import { useLocalState } from "./local";
import { useProfileKey } from "./profile";

export type TradeResult = "win" | "loss" | "breakeven" | "open";

export type JournalEntry = {
  id: string;
  date: string;
  symbol: string;
  mode: TradingMode;
  direction: Direction;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskPercent: number;
  crtTimeframe: Timeframe;
  crtDirection: Direction;
  strength: SignalStrength;
  confirmations: string[];
  fundamentalBias: string;
  spikeRisk: SpikeRisk;
  beforeScreenshot: string | null;
  afterScreenshot: string | null;
  result: TradeResult;
  pnl: number;
  rewardRisk: number;
  reasonForEntry: string;
  reasonForExit: string;
  whatWentWrong: string;
  postTradeAnalysis: string;
  aroundHighImpactNews: boolean;
  fundamentalAgreement: boolean;
};

export const JOURNAL_KEY = "foxwana.journal.v1";

export const SAMPLE_JOURNAL: JournalEntry[] = [
  {
    id: "demo-1",
    date: "2026-09-18",
    symbol: "XAUUSD",
    mode: "swing",
    direction: "bullish",
    entry: 2388.4,
    stopLoss: 2371.2,
    takeProfit: 2436.5,
    positionSize: 0.35,
    riskPercent: 1,
    crtTimeframe: "1D",
    crtDirection: "bullish",
    strength: "STRONG",
    confirmations: ["Daily CRT bullish", "Confirmed bullish OB", "Liquidity sweep", "Historical reaction area"],
    fundamentalBias: "USD weak → Gold bullish",
    spikeRisk: "LOW",
    beforeScreenshot: null,
    afterScreenshot: null,
    result: "win",
    pnl: 168.35,
    rewardRisk: 2.8,
    reasonForEntry: "Daily CRT swept the previous daily low and closed back inside the range at a 4H order block that had reacted twice before.",
    reasonForExit: "CRT target (previous daily high) reached.",
    whatWentWrong: "",
    postTradeAnalysis: "CRT completed as expected; the target was unobstructed and the London session provided the expansion.",
    aroundHighImpactNews: false,
    fundamentalAgreement: true,
  },
  {
    id: "demo-2",
    date: "2026-09-19",
    symbol: "GBPUSD",
    mode: "intraday",
    direction: "bearish",
    entry: 1.2681,
    stopLoss: 1.2712,
    takeProfit: 1.2608,
    positionSize: 0.32,
    riskPercent: 1,
    crtTimeframe: "4H",
    crtDirection: "bearish",
    strength: "MEDIUM",
    confirmations: ["4H CRT bearish", "Strong bearish FVG", "BOS"],
    fundamentalBias: "GBP majority weak",
    spikeRisk: "ELEVATED",
    beforeScreenshot: null,
    afterScreenshot: null,
    result: "loss",
    pnl: -99.2,
    rewardRisk: 2.35,
    reasonForEntry: "4H CRT with a strong bearish FVG after the sweep of equal highs.",
    reasonForExit: "Stop loss hit after the CPI release.",
    whatWentWrong: "Traded into an elevated spike-risk release window; the conflicting simultaneous events displaced price through the invalidation.",
    postTradeAnalysis: "Technically valid setup, poor timing. Spike risk was flagged as ELEVATED before entry and was ignored.",
    aroundHighImpactNews: true,
    fundamentalAgreement: true,
  },
  {
    id: "demo-3",
    date: "2026-09-21",
    symbol: "USDJPY",
    mode: "scalping",
    direction: "bullish",
    entry: 152.18,
    stopLoss: 152.02,
    takeProfit: 152.56,
    positionSize: 0.4,
    riskPercent: 0.75,
    crtTimeframe: "15M",
    crtDirection: "bullish",
    strength: "MEDIUM",
    confirmations: ["15M CRT bullish", "Confirmed bullish OB", "BOS"],
    fundamentalBias: "USD strong vs JPY",
    spikeRisk: "LOW",
    beforeScreenshot: null,
    afterScreenshot: null,
    result: "win",
    pnl: 72.4,
    rewardRisk: 2.4,
    reasonForEntry: "15M CRT swept the previous 15M low into a 1H order block during the London/NY overlap.",
    reasonForExit: "CRT target reached before the New York close.",
    whatWentWrong: "",
    postTradeAnalysis: "Session context supported the sweep; entry was taken only after BOS confirmation.",
    aroundHighImpactNews: false,
    fundamentalAgreement: true,
  },
];

/** Journal of the active profile only. Starts empty — no demo trades are counted as real performance. */
export function useJournal() {
  return useLocalState<JournalEntry[]>(useProfileKey("journal.v1"), []);
}

export function blankEntry(): JournalEntry {
  return {
    id: `t-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    symbol: "XAUUSD",
    mode: "intraday",
    direction: "bullish",
    entry: 0,
    stopLoss: 0,
    takeProfit: 0,
    positionSize: 0,
    riskPercent: 1,
    crtTimeframe: "1D",
    crtDirection: "bullish",
    strength: "MEDIUM",
    confirmations: [],
    fundamentalBias: "",
    spikeRisk: "LOW",
    beforeScreenshot: null,
    afterScreenshot: null,
    result: "open",
    pnl: 0,
    rewardRisk: 0,
    reasonForEntry: "",
    reasonForExit: "",
    whatWentWrong: "",
    postTradeAnalysis: "",
    aroundHighImpactNews: false,
    fundamentalAgreement: true,
  };
}
