// Core market/analysis domain types. Kept free of UI concerns so engines can be
// reused by a future native app or server-side data pipeline.

export type Timeframe = "1M" | "1W" | "1D" | "4H" | "1H" | "30M" | "15M" | "5M";

export const TIMEFRAMES: Timeframe[] = ["1M", "1W", "1D", "4H", "1H", "30M", "15M", "5M"];

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "1M": "Monthly",
  "1W": "Weekly",
  "1D": "Daily",
  "4H": "4H",
  "1H": "1H",
  "30M": "30M",
  "15M": "15M",
  "5M": "5M",
};

export type Candle = {
  time: number; // epoch ms of candle open
  open: number;
  high: number;
  low: number;
  close: number;
};

export type Direction = "bullish" | "bearish";

export type TradingMode = "scalping" | "intraday" | "swing" | "longterm";

export const MODE_LABELS: Record<TradingMode, string> = {
  scalping: "Scalping",
  intraday: "Intraday",
  swing: "Swing",
  longterm: "Long-Term / Position",
};

export const MODE_DURATION: Record<TradingMode, string> = {
  scalping: "~5 minutes to 1 hour",
  intraday: "~1 hour to several hours",
  swing: "Days to weeks",
  longterm: "Weeks to months",
};

/** Timeframe layers per mode. context = higher timeframe, confirm = confirmation only. */
export const MODE_TIMEFRAMES: Record<TradingMode, { context: Timeframe[]; confirm: Timeframe[] }> = {
  scalping: { context: ["4H", "1H"], confirm: ["30M", "15M", "5M"] },
  intraday: { context: ["1D", "4H"], confirm: ["1H", "30M", "15M"] },
  swing: { context: ["1M", "1W", "1D"], confirm: ["4H", "1H"] },
  // CRITICAL RULE: long-term confirmation is ONLY 1H and 15M. Never 5M or lower.
  longterm: { context: ["1W", "1D", "4H"], confirm: ["1H", "15M"] },
};

export type FinalStatus =
  | "BUY"
  | "SELL"
  | "DEVELOPING"
  | "TRIGGER WATCH"
  | "NO TRADE"
  | "NO VALID ENTRY";

export type SignalStrength = "STRONG" | "MEDIUM" | "WEAK";

export type DataSource = "demo" | "screenshot" | "live-market" | "live-news";

export type SymbolSpec = {
  symbol: string;
  name: string;
  group: "fx-major" | "fx-cross" | "metal" | "index";
  base: string;
  quote: string;
  digits: number;
  pipSize: number;
  contractSize: number;
  /** Approximate seed price for demo series generation. */
  seedPrice: number;
  volatility: number;
};
