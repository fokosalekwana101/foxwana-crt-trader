import { getSymbol } from "../market/symbols";

export type RiskInput = {
  symbol: string;
  accountSize: number;
  riskPercent: number;
  /** Optional fixed monetary risk — overrides the percentage when set. */
  fixedRisk?: number | null;
  entry: number;
  stopLoss: number;
  takeProfit?: number | null;
  manualLots?: number | null;
};

export type RiskResult = {
  riskAmount: number;
  stopDistance: number;
  stopPips: number;
  pipValuePerLot: number;
  lots: number | null;
  rewardRisk: number | null;
  note: string;
};

/**
 * Position sizing from the symbol specification. Quote-currency pip value is
 * used, which is exact for USD-quoted symbols and an approximation elsewhere —
 * stated in `note` rather than presented as precise.
 */
export function calculateRisk(input: RiskInput): RiskResult {
  const spec = getSymbol(input.symbol);
  const riskAmount =
    input.fixedRisk && input.fixedRisk > 0
      ? input.fixedRisk
      : (input.accountSize * input.riskPercent) / 100;

  const stopDistance = Math.abs(input.entry - input.stopLoss);
  const stopPips = spec.pipSize > 0 ? stopDistance / spec.pipSize : 0;
  const pipValuePerLot = spec.pipSize * spec.contractSize;

  const lots =
    input.manualLots && input.manualLots > 0
      ? input.manualLots
      : stopPips > 0 && pipValuePerLot > 0
        ? riskAmount / (stopPips * pipValuePerLot)
        : null;

  const rewardRisk =
    input.takeProfit && stopDistance > 0
      ? Math.abs(input.takeProfit - input.entry) / stopDistance
      : null;

  const note =
    spec.quote === "USD"
      ? "Pip value calculated from contract specification in the quote currency (USD)."
      : `Pip value calculated in the quote currency (${spec.quote}); convert to your account currency for exact sizing.`;

  return { riskAmount, stopDistance, stopPips, pipValuePerLot, lots, rewardRisk, note };
}
