import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CandlestickChart,
  Info,
  LayoutDashboard,
  LineChart,
  Menu,
  Moon,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Settings as SettingsIcon,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { useTheme } from "@/lib/theme";
import { useProfiles } from "@/lib/store/profile";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; short: string; icon: typeof LayoutDashboard };

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { to: "/analysis", label: "Analysis", short: "Analysis", icon: CandlestickChart },
  { to: "/markets", label: "Markets", short: "Markets", icon: LineChart },
  { to: "/fundamentals", label: "Fundamentals", short: "News", icon: Newspaper },
  { to: "/journal", label: "Trade Journal", short: "Journal", icon: BookOpen },
  { to: "/statistics", label: "Statistics", short: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", short: "Settings", icon: SettingsIcon },
  { to: "/about", label: "About", short: "About", icon: Info },
];

const MOBILE_PRIMARY = NAV.slice(0, 3);
const MOBILE_SECONDARY = NAV.slice(3);

function ProfileBadge() {
  const { profiles, active, switchTo } = useProfiles();
  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs text-muted-foreground" title="Active profile">
      <UserRound className="size-3.5" />
      <select
        aria-label="Active profile"
        value={active.id}
        onChange={(e) => switchTo(e.target.value)}
        className="max-w-[110px] truncate bg-transparent font-medium text-foreground outline-none"
      >
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background">
      {/* -------- Desktop sidebar -------- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
          collapsed ? "w-[68px]" : "w-[236px]",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-5")}>
          {collapsed ? <LogoMark size={26} /> : <Wordmark />}
        </div>

        <nav className="flex-1 space-y-1 p-2.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active(to)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("size-[18px] shrink-0", active(to) && "text-sidebar-primary")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className={cn("flex items-center gap-2 border-t border-sidebar-border p-2.5", collapsed && "flex-col")}>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
          <ThemeToggle />
        </div>
      </aside>

      {/* -------- Desktop profile (discreet, top right) -------- */}
      <div className="fixed right-6 top-4 z-30 hidden lg:block">
        <ProfileBadge />
      </div>

      {/* -------- Mobile header -------- */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <span className="min-[400px]:hidden"><Wordmark compact /></span>
        <span className="hidden min-[400px]:block"><Wordmark /></span>
        <div className="flex items-center gap-2">
          <ProfileBadge />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-foreground/30"
          />
          <div className="absolute inset-x-0 top-0 rounded-b-xl border-b border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="mt-4 grid grid-cols-2 gap-2">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md border border-border px-3 py-2.5 text-sm font-medium",
                    active(to) ? "bg-accent text-accent-foreground" : "text-foreground",
                  )}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* -------- Content -------- */}
      <main className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[68px]" : "lg:pl-[236px]")}>
        <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 pb-28 pt-5 sm:px-6 lg:px-9 lg:pb-12 lg:pt-16">
          {children}
        </div>
      </main>

      {/* -------- Mobile bottom navigation -------- */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-between border-t border-border bg-card px-1 pt-1 lg:hidden">
        {MOBILE_PRIMARY.map(({ to, short, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[10px] font-medium",
              active(to) ? "text-bullish" : "text-muted-foreground",
            )}
          >
            <Icon className="size-[18px]" />
            {short}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[10px] font-medium",
            MOBILE_SECONDARY.some((n) => active(n.to)) ? "text-bullish" : "text-muted-foreground",
          )}
        >
          <Menu className="size-[18px]" />
          More
        </button>
      </nav>
    </div>
  );
}
