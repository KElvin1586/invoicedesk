# PocketLedger

A production-ready, offline-first personal income & expense tracker. All data lives in your browser — no accounts, no servers, no tracking.

## Features

- **Dashboard** with balance, monthly income/expense totals, savings rate, and charts
- **Transactions** with full CRUD, search, and preset/custom date filtering
- **Categories** with colors, archive states, and type filtering (income/expense)
- **Budgets** (Premium) with per-category monthly limits and live progress
- **Recurring transactions** (Premium) with daily/weekly/monthly/yearly rules
- **Multiple accounts/wallets** (Premium) — track Cash, Bank, etc.
- **Reports** (Premium): balance trend, top categories, monthly summaries
- **Export/Import**: full JSON backup/restore with referential-integrity validation + CSV export
- **Freemium model**: centralized entitlement system with a Free plan (up to 150 transactions) and Premium unlock (configurable one-time price, default $9.99)
- **Privacy**: financial data never leaves the browser; the only outbound request is the configurable upgrade URL
- **Responsive design** powered by Tailwind CSS (sidebar on desktop, bottom navigation on mobile)

## Tech stack

- React 19, TypeScript, Vite 7
- Tailwind CSS 4
- Dexie (IndexedDB) for persistence
- recharts for charts
- Vitest + Testing Library for tests

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build
npm test           # run the test suite
```

## Project layout

```
src/
├── config.ts            # entitlement, pricing, feature flags
├── domain/              # pure logic: money, dates, calculations, CSV, validators
├── data/                # Dexie database, repository, seed data, import/export
├── entitlement/         # Free/Premium context, gates, badges, upgrade modal
├── hooks/               # central data-loading provider
├── components/          # layout, modal, icons, charts, transaction form
└── pages/               # Dashboard, Transactions, Categories, Budgets,
                         # Recurring, Reports, Settings
tests/                   # unit + UI tests (vitest)
```

## Freemium gating

Premium features show a 🔒 PREMIUM badge in navigation, render a gate screen, and open an upgrade modal that links to the configurable `UPGRADE_URL` (see `src/config.ts`). Free users can never exceed `FREE_TRANSACTION_LIMIT` transactions — the gate is requested from the centralized `gate(feature)` helper in `EntitlementContext`.

## Security & privacy

- Amounts are stored as **integer cents** internally to avoid float drift; parsing/formatting lives in one module.
- All user input is validated (`domain/validators.ts`) before persistence.
- Import JSON is validated structurally, with referential-integrity checks (transactions must reference known categories/accounts).
- No analytics, tracking, or server calls.

## Documentation

- [USER-GUIDE](./USER-GUIDE.md) — how to use every feature
- [INSTALLATION](./INSTALLATION.md) — local setup guide
- [DEPLOYMENT](./DEPLOYMENT.md) — static hosting guide
- [CHANGELOG](./CHANGELOG.md) — release notes
- [LICENSE](./LICENSE) — MIT

## Pricing

Free: **$0** (limited transactions). Premium: **$9.99 one-time** (configurable in `src/config.ts`). No DRM — the premium flag lives in `localStorage`, easily resettable from Settings.
