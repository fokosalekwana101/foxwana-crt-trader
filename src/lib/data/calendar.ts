import type { EconomicEvent } from "../engines/fundamentals";

/**
 * DEMO ECONOMIC CALENDAR.
 *
 * Structured exactly like a real economic-calendar feed (currency, event,
 * previous, forecast, actual, impact, release group, source) so a live
 * calendar/news provider can replace this array without touching the
 * fundamental engine or the UI.
 */
const DAY = "2026-09-22";
const NEXT = "2026-09-23";

export const DEMO_EVENTS: EconomicEvent[] = [
  // Released USD release group (Actual available) — 3 strong / 1 weak.
  { id: "usd-cpi-mm", currency: "USD", name: "Core CPI m/m", time: `${DAY}T12:30:00Z`, impact: "high", previous: 0.2, forecast: 0.2, actual: 0.3, unit: "%", source: "Investing.com (demo)", group: "US CPI release" },
  { id: "usd-cpi-yy", currency: "USD", name: "Core CPI y/y", time: `${DAY}T12:30:00Z`, impact: "high", previous: 0.5, forecast: 0.4, actual: 0.4, unit: "%", source: "Investing.com (demo)", group: "US CPI release" },
  { id: "usd-cpi-head", currency: "USD", name: "CPI m/m", time: `${DAY}T12:30:00Z`, impact: "high", previous: 0.1, forecast: 0.2, actual: 0.2, unit: "%", source: "Investing.com (demo)", group: "US CPI release" },
  { id: "usd-claims", currency: "USD", name: "Initial Jobless Claims", time: `${DAY}T12:30:00Z`, impact: "medium", previous: 219, forecast: 224, actual: null, unit: "K", source: "BLS (demo)", group: "US CPI release" },

  // Upcoming USD labour group (no Actual yet).
  { id: "usd-ahe", currency: "USD", name: "Average Hourly Earnings m/m", time: `${NEXT}T12:30:00Z`, impact: "high", previous: 0.3, forecast: 0.3, actual: null, unit: "%", source: "BLS (demo)", group: "US Labour release" },
  { id: "usd-nfp", currency: "USD", name: "Non-Farm Employment Change", time: `${NEXT}T12:30:00Z`, impact: "high", previous: 142, forecast: 160, actual: null, unit: "K", source: "BLS (demo)", group: "US Labour release" },
  { id: "usd-unemp", currency: "USD", name: "Unemployment Rate", time: `${NEXT}T12:30:00Z`, impact: "high", previous: 4.2, forecast: 4.1, actual: null, unit: "%", source: "BLS (demo)", group: "US Labour release" },

  // EUR
  { id: "eur-cpi", currency: "EUR", name: "Core CPI Flash Estimate y/y", time: `${DAY}T09:00:00Z`, impact: "high", previous: 2.8, forecast: 2.9, actual: null, unit: "%", source: "Eurostat (demo)", group: "Euro Area inflation" },
  { id: "eur-pmi", currency: "EUR", name: "Manufacturing PMI", time: `${DAY}T08:00:00Z`, impact: "medium", previous: 45.8, forecast: 46.2, actual: 46.5, unit: "", source: "HCOB (demo)", group: "Euro Area PMI" },

  // GBP — conflicting simultaneous release.
  { id: "gbp-cpi", currency: "GBP", name: "CPI y/y", time: `${DAY}T06:00:00Z`, impact: "high", previous: 2.2, forecast: 2.3, actual: null, unit: "%", source: "ONS (demo)", group: "UK inflation" },
  { id: "gbp-core", currency: "GBP", name: "Core CPI y/y", time: `${DAY}T06:00:00Z`, impact: "high", previous: 3.6, forecast: 3.5, actual: null, unit: "%", source: "ONS (demo)", group: "UK inflation" },

  // JPY
  { id: "jpy-ppi", currency: "JPY", name: "PPI y/y", time: `${DAY}T23:50:00Z`, impact: "medium", previous: 2.5, forecast: 2.3, actual: null, unit: "%", source: "BoJ (demo)", group: "Japan prices" },
  { id: "jpy-trade", currency: "JPY", name: "Trade Balance", time: `${NEXT}T23:50:00Z`, impact: "low", previous: -0.62, forecast: -0.45, actual: null, unit: "T", source: "MoF (demo)", group: "Japan trade" },

  // CAD — creator's worked example (Previous 2.0 -> Forecast 2.2 = CAD STRONG).
  { id: "cad-cpi", currency: "CAD", name: "CPI y/y", time: `${DAY}T12:30:00Z`, impact: "high", previous: 2.0, forecast: 2.2, actual: null, unit: "%", source: "StatCan (demo)", group: "Canada inflation" },
  { id: "cad-retail", currency: "CAD", name: "Core Retail Sales m/m", time: `${NEXT}T12:30:00Z`, impact: "medium", previous: 0.5, forecast: 0.6, actual: null, unit: "%", source: "StatCan (demo)", group: "Canada retail" },

  // AUD
  { id: "aud-emp", currency: "AUD", name: "Employment Change", time: `${DAY}T01:30:00Z`, impact: "high", previous: 47.5, forecast: 25.0, actual: 34.6, unit: "K", source: "ABS (demo)", group: "Australia labour" },
  { id: "aud-unemp", currency: "AUD", name: "Unemployment Rate", time: `${DAY}T01:30:00Z`, impact: "high", previous: 4.2, forecast: 4.2, actual: 4.1, unit: "%", source: "ABS (demo)", group: "Australia labour" },

  // NZD
  { id: "nzd-gdp", currency: "NZD", name: "GDP q/q", time: `${NEXT}T22:45:00Z`, impact: "high", previous: 0.2, forecast: -0.1, actual: null, unit: "%", source: "Stats NZ (demo)", group: "NZ growth" },

  // CHF
  { id: "chf-snb", currency: "CHF", name: "SNB Policy Rate", time: `${NEXT}T07:30:00Z`, impact: "high", previous: 1.25, forecast: 1.0, actual: null, unit: "%", source: "SNB (demo)", group: "SNB decision" },
  { id: "chf-trade", currency: "CHF", name: "Trade Balance", time: `${DAY}T06:00:00Z`, impact: "low", previous: 4.3, forecast: 4.5, actual: null, unit: "B", source: "FCA (demo)", group: "Swiss trade" },
];
