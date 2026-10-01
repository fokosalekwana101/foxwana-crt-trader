import type { FinalStatus, TradingMode } from "../market/types";
import { useLocalState } from "./local";
import { useProfileKey } from "./profile";

export type SavedAnalysis = {
  id: string;
  savedAt: string;
  symbol: string;
  mode: TradingMode;
  status: FinalStatus;
  summary: string;
};

/** Saved analyses of the active profile only. */
export function useSavedAnalyses() {
  return useLocalState<SavedAnalysis[]>(useProfileKey("analyses.v1"), []);
}
