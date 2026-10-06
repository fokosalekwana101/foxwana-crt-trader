import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, BookOpen, CandlestickChart, Info, LineChart, Newspaper, Settings as SettingsIcon } from "lucide-react";
import { useProfiles } from "@/lib/store/profile";
import { useSettings } from "@/lib/store/settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FOXWANA — CRT Market Intelligence" },
      {
        name: "description",
        content: "Your FOXWANA home: jump into CRT market analysis, your markets, upcoming news, trade journal, statistics and settings.",
      },
      { property: "og:title", content: "FOXWANA — CRT Market Intelligence" },
      { property: "og:description", content: "Candle Range Theory analysis, fundamentals and journaling in one focused workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const CARDS = [
  { to: "/analysis", title: "Market Analysis", desc: "Analyze CRT setups, structure, OB/FVG and entry validation.", icon: CandlestickChart, featured: true },
  { to: "/markets", title: "Markets", desc: "Choose and manage monitored markets.", icon: LineChart },
  { to: "/fundamentals", title: "Fundamentals / News", desc: "View important upcoming high-impact events.", icon: Newspaper },
  { to: "/journal", title: "Trade Journal", desc: "Record and review trades.", icon: BookOpen },
  { to: "/statistics", title: "Statistics", desc: "Review performance and trading statistics.", icon: BarChart3 },
  { to: "/settings", title: "Settings", desc: "Manage profile, risk and preferences.", icon: SettingsIcon },
  { to: "/about", title: "About", desc: "Learn about FOXWANA.", icon: Info },
] as const;

function Home() {
  const { active } = useProfiles();
  const [settings] = useSettings();

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--bullish-soft),transparent_60%)]" />
        <div className="relative">
          <p className="label-eyebrow">Welcome back, {active.name}</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
            CRT first. Everything else confirms.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Pick where you want to go. {settings.watchlist.length === 0
              ? "Start by choosing the markets you want to monitor."
              : `You are monitoring ${settings.watchlist.length} market${settings.watchlist.length === 1 ? "" : "s"}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <p className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">No valid setup currently detected.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map(({ to, title, desc, icon: Icon, ...rest }) => (
          <Link
            key={to}
            to={to}
            className={`group relative flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${
              "featured" in rest ? "sm:col-span-2 xl:col-span-1 xl:row-span-2 xl:flex-col xl:justify-between xl:p-7" : ""
            }`}
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-bullish-soft text-bullish transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 font-display text-base font-semibold text-foreground">
                {title}
                <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
