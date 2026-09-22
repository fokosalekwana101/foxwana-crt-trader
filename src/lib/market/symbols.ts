import type { SymbolSpec } from "./types";

export const SYMBOLS: SymbolSpec[] = [
  { symbol: "XAUUSD", name: "Gold / US Dollar", group: "metal", base: "XAU", quote: "USD", digits: 2, pipSize: 0.1, contractSize: 100, seedPrice: 2412.5, volatility: 1.9 },
  { symbol: "XAGUSD", name: "Silver / US Dollar", group: "metal", base: "XAG", quote: "USD", digits: 3, pipSize: 0.01, contractSize: 5000, seedPrice: 30.42, volatility: 2.4 },
  { symbol: "EURUSD", name: "Euro / US Dollar", group: "fx-major", base: "EUR", quote: "USD", digits: 5, pipSize: 0.0001, contractSize: 100000, seedPrice: 1.0842, volatility: 1.0 },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", group: "fx-major", base: "GBP", quote: "USD", digits: 5, pipSize: 0.0001, contractSize: 100000, seedPrice: 1.2681, volatility: 1.15 },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", group: "fx-major", base: "USD", quote: "JPY", digits: 3, pipSize: 0.01, contractSize: 100000, seedPrice: 152.36, volatility: 1.1 },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", group: "fx-major", base: "USD", quote: "CHF", digits: 5, pipSize: 0.0001, contractSize: 100000, seedPrice: 0.8934, volatility: 0.9 },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", group: "fx-major", base: "USD", quote: "CAD", digits: 5, pipSize: 0.0001, contractSize: 100000, seedPrice: 1.3612, volatility: 0.95 },
  { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", group: "fx-major", base: "AUD", quote: "USD", digits: 5, pipSize: 0.0001, contractSize: 100000, seedPrice: 0.6614, volatility: 1.05 },
  { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", group: "fx-major", base: "NZD", quote: "USD", digits: 5, pipSize: 0.0001, contractSize: 100000, seedPrice: 0.6082, volatility: 1.05 },
  { symbol: "CADJPY", name: "Canadian Dollar / Japanese Yen", group: "fx-cross", base: "CAD", quote: "JPY", digits: 3, pipSize: 0.01, contractSize: 100000, seedPrice: 111.94, volatility: 1.2 },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", group: "fx-cross", base: "EUR", quote: "JPY", digits: 3, pipSize: 0.01, contractSize: 100000, seedPrice: 165.21, volatility: 1.25 },
  { symbol: "GBPJPY", name: "British Pound / Japanese Yen", group: "fx-cross", base: "GBP", quote: "JPY", digits: 3, pipSize: 0.01, contractSize: 100000, seedPrice: 193.18, volatility: 1.45 },
  { symbol: "US30", name: "Dow Jones 30 Index", group: "index", base: "US30", quote: "USD", digits: 1, pipSize: 1, contractSize: 1, seedPrice: 39120, volatility: 1.3 },
  { symbol: "NAS100", name: "Nasdaq 100 Index", group: "index", base: "NAS100", quote: "USD", digits: 1, pipSize: 1, contractSize: 1, seedPrice: 18240, volatility: 1.6 },
  { symbol: "GER40", name: "DAX 40 Index", group: "index", base: "GER40", quote: "EUR", digits: 1, pipSize: 1, contractSize: 1, seedPrice: 18410, volatility: 1.35 },
];

export const DEFAULT_WATCHLIST = [
  "XAUUSD",
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  "USDCAD",
  "AUDUSD",
  "NAS100",
];

export function getSymbol(symbol: string): SymbolSpec {
  return SYMBOLS.find((s) => s.symbol === symbol) ?? SYMBOLS[0];
}

export function formatPrice(symbol: string, value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const spec = getSymbol(symbol);
  return value.toFixed(spec.digits);
}

export const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "NZD", "CHF"] as const;
export type Currency = (typeof CURRENCIES)[number];
