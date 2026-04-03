# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Type-check (tsc -b) then bundle with Vite
npm run lint       # Run ESLint
npm run preview    # Serve production build locally
```

There is no test runner configured.

## Architecture

**WindfallEnergyApp** is a React 19 + TypeScript + Vite single-page application for analysing UK electricity usage and costs against the Windfall Electricity Scheme. Data never leaves the browser — all state is held in React `useState` and persisted to `localStorage` (key: `windfall-energy-dashboard-state-v3`).

### Data flow

```
CSV upload
  → parseCsvFile() [utils/parsing.ts]      — validates timestamps, reads kWh
  → getTariffForTimestamp() [utils/tariffs.ts] — resolves tariff period & peak/off-peak hours, calculates cost
  → UsageRow[]
  → App.tsx state + localStorage
  → useProcessedData() [hooks/useProcessedData.ts]  — memoised aggregation into daily, monthly, hourly, peak-split views
  → Recharts charts + summary cards
```

Export revenue follows a parallel path via `utils/exportParsing.ts` and is compared against import costs in `ExportPrepTable`.

### Key files

| File | Role |
|------|------|
| `src/App.tsx` | Main component (~46 KB). Owns all state, file upload handlers, localStorage save/restore, and renders the full layout. |
| `src/hooks/useProcessedData.ts` | Memoised derivation of `DailyDataPoint[]`, `MonthlyDataPoint[]`, hourly breakdowns, and peak splits from raw `UsageRow[]`. |
| `src/utils/tariffs.ts` | Two tariff periods (Nov 2025–Mar 2026 and Apr 2026+) with different rates and off-peak windows. Off-peak window wraps midnight for the Apr period. |
| `src/utils/parsing.ts` | Row-level CSV parsing: timestamp validation, kWh extraction, supplier-cost field. |
| `src/utils/exportParsing.ts` | Separate CSV parser for export-revenue files. |
| `src/types.ts` | Canonical type definitions (`UsageRow`, `DailyDataPoint`, `MonthlyDataPoint`, `DashboardSummary`, `ExportRow`, `ExportPreparedMonth`). |
| `src/data/` | Static data: tariff definitions and hardcoded Windfall Scheme free-electricity credits by date. |
| `src/theme/` | Pluggable theme system using CSS variables. Only one theme ("Sunset") is implemented; its tokens, chart colours, and component styles live in `src/theme/Sunset/`. |

### Conventions

- **TypeScript strict mode** — `noUnusedLocals`, `noUnusedParameters`, and all strict checks are on.
- **CSV deduplication** — duplicate timestamps overwrite existing rows; upload mode (append vs. replace) is user-controlled.
- **Tariff lookup** — always go through `getTariffForTimestamp()`; it handles period boundaries and the off-peak wraparound.
- **Charts** — all visualisations use Recharts with custom tooltips styled via the active theme's CSS variables.
- **No global state library** — keep state in `App.tsx` and pass props down; use `useProcessedData` for derived data.
