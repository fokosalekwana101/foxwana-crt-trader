import { HelpCircle } from "lucide-react";
import type { ReactNode } from "react";

/** Plain-language glossary — simple meaning first, technical detail second. */
export const GLOSSARY: Record<string, { name: string; simple: string; technical: string }> = {
  CRT: {
    name: "CRT — Candle Range Theory",
    simple: "Price pokes outside the previous candle's range, then comes back inside. FOXWANA treats that as a sign price may travel to the other side of the range.",
    technical: "Previous candle range → liquidity sweep beyond its high/low → opposite-coloured close back inside the range. The opposite extreme of the previous range is the CRT target.",
  },
  FVG: {
    name: "FVG — Fair Value Gap",
    simple: "A fast move that left a 'gap' where price barely traded. Price often comes back to it, so FOXWANA treats it as a possible reaction area.",
    technical: "Three-candle imbalance where candle 1's high and candle 3's low (bullish) do not overlap. Strength is graded on displacement and mitigation.",
  },
  OB: {
    name: "OB — Order Block",
    simple: "The last candle before a strong move. Large orders may still sit there, so price can react when it returns.",
    technical: "Last opposite candle before displacement that contributed to a break of structure, unmitigated and not invalidated.",
  },
  BOS: {
    name: "BOS — Break of Structure",
    simple: "Price broke past a recent high or low in the direction of the trend — the trend is continuing.",
    technical: "Close beyond the most recent swing point in the direction of the prevailing structure.",
  },
  CHoCH: {
    name: "CHoCH — Change of Character",
    simple: "Price broke a key level against the trend — a first sign the direction may be changing.",
    technical: "Close beyond the last protected swing point opposite the prevailing structure.",
  },
  SWEEP: {
    name: "Liquidity sweep",
    simple: "Price briefly moved past an obvious high or low (where many stop orders sit) and then returned.",
    technical: "Wick beyond a previous high/low, equal highs/lows or swing point with a close back on the original side.",
  },
  MSNR: {
    name: "MSNR — Malaysian Support & Resistance",
    simple: "Important price levels taken from candle opens/closes on bigger timeframes that price has respected before.",
    technical: "Body-based levels (A/V shapes, gaps) classified as Major, Intermediate or Entry by timeframe.",
  },
  SPIKE: {
    name: "Spike risk",
    simple: "How likely news is to cause a sudden, violent price jump. Higher means wider, faster moves and more danger.",
    technical: "Derived from agreement between simultaneous releases: full agreement = LOW, split = VERY HIGH.",
  },
};

export function Explain({ term, children }: { term: keyof typeof GLOSSARY; children?: ReactNode }) {
  const g = GLOSSARY[term]!;
  return (
    <details className="group rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2 font-medium text-foreground">
        <HelpCircle className="size-3.5 text-muted-foreground" />
        {children ?? g.name}
        <span className="ml-auto text-xs font-normal text-muted-foreground group-open:hidden">What does this mean?</span>
      </summary>
      <p className="mt-2 text-muted-foreground">{g.simple}</p>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs font-medium text-primary">Technical details ▸</summary>
        <p className="mt-1 text-xs text-muted-foreground">{g.technical}</p>
      </details>
    </details>
  );
}

/** Collapsible section for progressive disclosure (Why? / Evidence / Conflicts / Technical details). */
export function Disclosure({ title, children, defaultOpen }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-display text-sm font-semibold text-foreground sm:px-5">
        {title}
        <span className="text-muted-foreground transition-transform group-open:rotate-90">▸</span>
      </summary>
      <div className="space-y-4 border-t border-border p-4 sm:p-5">{children}</div>
    </details>
  );
}
