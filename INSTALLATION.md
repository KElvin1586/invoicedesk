# Installation

PocketLedger is a standard Vite + React project.

## Prerequisites

- **Node.js** 20.19+ or 22.12+ (Vite 7 requirement)
- npm (comes with Node)

## Install

```bash
git clone <this repo>
cd pocketledger
npm install
```

## Run the dev server

```bash
npm run dev
```

Open http://localhost:5173/ — the app is fully offline and works from the local dev server.

## Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview it locally:

```bash
npm run preview   # http://localhost:4173
```

## Run tests

```bash
npm test          # vitest (jsdom + fake-indexeddb)
npm run test:ui   # interactive vitest UI (optional)
```

The test suite covers money/date/calculation logic, storage & repository CRUD, CSV escaping, import/export validation, entitlement gating, and UI smoke tests.

## Configuration

Configuration lives in `src/config.ts`:

- `UPGRADE_URL` — checkout URL that the upgrade modal targets (default: example URL; point this at your real storefront).
- `PREMIUM_PRICE_USD` — one-time price displayed (default `9.99`).
- `FREE_TRANSACTION_LIMIT` — cap for the Free plan (default 150).

Environment overrides (Vite loads these if present) use `VITE_UPGRADE_URL` and `VITE_PREMIUM_PRICE_USD`. Create a `.env` file:

```
VITE_UPGRADE_URL=https://your-store.com/checkout
VITE_PREMIUM_PRICE_USD=19.99
```

## Browser requirements

IndexedDB is required — every evergreen browser (Chrome, Edge, Firefox, Safari ≥ 16) supports it. The app never touches the network except to load assets.
