# Pricing

PocketLedger is a freemium product with two plans.

## Plans

### Free — $0

- Income & expense tracking
- Category management (up to 12 categories)
- Dashboard with monthly totals
- Basic charts (Income vs Expenses, Category pie)
- Up to 150 transactions
- CSV export
- Responsive design — fully usable on mobile and desktop

### Premium — one-time payment

- Everything in Free
- Unlimited transactions and categories
- Budget creation with live progress
- Recurring transaction rules
- Multiple accounts/wallets
- Advanced reports (monthly summaries, all-time)
- Balance trend chart on the dashboard
- Full export/import (JSON backup & restore)

## Price configuration

The one-time price, currency, and checkout URL are configured at build time
through Vite environment variables (with defaults in `src/config.ts`):

| Variable | Default | Purpose |
|---|---|---|
| `VITE_PREMIUM_PRICE` | `9.99` | Displayed price |
| `VITE_PREMIUM_CURRENCY` | `USD` | Currency label |
| `VITE_UPGRADE_URL` | *(empty)* | Checkout URL for the Upgrade modal |

If `VITE_UPGRADE_URL` is empty:

- **Development builds (`npm run dev`)** route the upgrade button to an internal
  `/checkout` page. This page is clearly labelled as a **development test
  checkout** and exists purely to exercise Free ↔ Premium entitlement flows.
  No payment is processed, requested, or simulated as successful.
- **Production builds** honestly show that no checkout URL is configured —
  the app never sends users to a placeholder domain such as example.com.

## Upgrade flow

```
Free user → 🔒 PREMIUM feature → Upgrade Modal → Upgrade button → checkout
```

The centralized entitlement lives in `src/entitlement/EntitlementContext.tsx`.
All premium actions go through `gate(feature)`; nothing is scattered across pages.

## Development test mode

`TEST_MODE_ENABLED` (in `src/config.ts`) is true only in non-production builds
(`import.meta.env.DEV`). When enabled:

- The Settings page shows a **Development Test Mode** panel with *Test as
  Premium* / *Test as Free* toggles.
- The internal `/checkout` route is available and clearly labelled as a test
  page that never handles real money.

Production builds hide both: entitlement can then only become Premium through
an externally completed purchase verifiable by whoever runs the checkout.

## Future payment integration

No payment SDK is bundled. To connect a real provider (Stripe, Lemon Squeezy,
Paddle…):

1. Set `VITE_UPGRADE_URL` to your checkout link at build time.
2. After a successful purchase, have the provider redirect the customer to a
   success page that you control; from that page, set entitlement locally,
   e.g. `localStorage.setItem('pocketledger-entitlement', '{"plan":"premium"}')`
   (or serve a "confirm" page built on top of the SDK you choose).

No license server, no payment credentials in the repo, no webhook secrets in
frontend code. All premium state stays client-side.
