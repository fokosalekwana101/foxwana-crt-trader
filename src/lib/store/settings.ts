import type { Timeframe, TradingMode } from "../market/types";
import { useLocalState } from "./local";
import { useProfileKey } from "./profile";

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
  // Never pre-filled: the user chooses their own markets.
  watchlist: [],
  preferredTimeframes: ["1W", "1D", "4H", "1H", "15M"],
  signalThreshold: 5,
  notifyHighImpact: true,
  notifyConfirmedSetups: true,
  requireScreenshotLabels: true,
  journalAutoAttach: true,
  marketDataProvider: "",
  newsDataProvider: "",
};

export function useSettings() {
  return useLocalState<Settings>(useProfileKey("settings.v1"), DEFAULT_SETTINGS);
}
