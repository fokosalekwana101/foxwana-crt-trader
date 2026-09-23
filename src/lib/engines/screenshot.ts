/**
 * SCREENSHOT ANALYSIS MODULE.
 *
 * No OCR/vision provider is connected in this build. Rather than inventing
 * values that cannot actually be read from an image, this module models the
 * upload workflow honestly: the user labels what the system cannot reliably
 * detect, and every field is marked as either read or user-supplied.
 *
 * A vision/OCR provider can later fill `extract()` without changing the UI.
 */
import type { Timeframe } from "../market/types";

export type ChartUpload = {
  id: string;
  fileName: string;
  dataUrl: string;
  /** User-labelled or (later) detected. */
  timeframe: Timeframe | null;
  symbol: string | null;
  note: string;
  detectionConfidence: "unknown" | "user-labelled";
};

export type NewsUpload = {
  id: string;
  fileName: string;
  dataUrl: string;
  currency: string;
  eventName: string;
  previous: string;
  forecast: string;
  actual: string;
  time: string;
};

/** Ordered screenshot hierarchy prompts per analysis type. */
export const SCREENSHOT_HIERARCHY: Record<"intraday" | "longterm", Timeframe[]> = {
  intraday: ["1D", "1H", "15M"],
  longterm: ["1W", "1D", "4H", "1H", "15M"],
};

export function missingLabels(uploads: ChartUpload[]): string[] {
  const issues: string[] = [];
  uploads.forEach((u, i) => {
    if (!u.timeframe) issues.push(`Screenshot ${i + 1} (${u.fileName}) needs a timeframe label.`);
    if (!u.symbol) issues.push(`Screenshot ${i + 1} (${u.fileName}) needs a symbol label.`);
  });
  return issues;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
