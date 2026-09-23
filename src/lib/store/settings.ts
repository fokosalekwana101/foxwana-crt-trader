import { DEFAULT_WATCHLIST } from "../market/symbols";
import type { Timeframe, TradingMode } from "../market/types";
import { useLocalState } from "./local";

export type Settings = {
  defaultMode: TradingMode;
  accountSize: number;
  riskPercent: number;
  fixedRisk: number | null;
  watchlist: string[];
  preferredTimeframes: Timeframe[];
  /** Confluence points required before a setup can be labelled MEDIUM. */
  signalThreshold: number;
  notifyHighImpact: boolean;
  notifyConfirmedSetups: boolean;
  requireScreenshotLabels: boolean;
  journalAutoAttach: boolean;
  marketDataProvider: string;
  newsDataProvider: string;
};

export const DEFAULT_SETTINGS: Settings = {
  defaultMode: "intraday",
  accountSize: 10000,
  riskPercent: 1,
  fixedRisk: null,
  watchlist: DEFAULT_WATCHLIST,
  preferredTimeframes: ["1W", "1D", "4H", "1H", "15M"],
  signalThreshold: 5,
  notifyHighImpact: true,
  notifyConfirmedSetups: true,
  requireScreenshotLabels: true,
  journalAutoAttach: true,
  marketDataProvider: "",
  newsDataProvider: "",
};

export const SETTINGS_KEY = "foxwana.settings.v1";

export function useSettings() {
  return useLocalState<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS);
}
