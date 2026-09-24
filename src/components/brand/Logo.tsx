import logo from "@/assets/foxwana-logo.png";
import { cn } from "@/lib/utils";

/**
 * FOXWANA mark. Works as website logo, app icon, favicon source, loading
 * screen and watermark. The mark is a single-colour fox head whose muzzle
 * lines resolve into an ascending candlestick sequence.
 */
export function LogoMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <img
      src={logo}
      alt="FOXWANA"
      width={size}
      height={size}
      className={cn("shrink-0 select-none dark:brightness-125", className)}
    />
  );
}

export function Wordmark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={compact ? 24 : 30} />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold tracking-[0.16em] text-foreground">FOXWANA</span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.13em] text-muted-foreground">
            CRT Market Intelligence
          </span>
        </span>
      )}
    </div>
  );
}
