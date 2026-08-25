# Commercial License Notes

The source code in this repository is released under the MIT License
(see `LICENSE.md`). Nothing here constitutes legal or financial advice — you
are responsible for the commercial side of distributing PocketLedger as a
freemium product.

## What the code handles

- A centralized Free/Premium entitlement (`src/entitlement/EntitlementContext.tsx`)
  with feature mapping between plans.
- Blocking premium actions for Free users and opening an Upgrade modal.
- A configurable, one-time price, currency, and checkout URL.
- A development-only test mode for toggling plans without real money.
- Honest behavior when no checkout URL is configured: no placeholder domain,
  no fake "payment successful" screen.

## What the code deliberately does NOT handle

- Payment processing, card capture, invoices, receipts.
- License validation, activation keys, entitlement servers, anti-fraud.
- Terms of service, refund policy, tax handling, GDPR/CCPA compliance.
- Anything that pretends a payment succeeded when none occurred.

## Connecting a real provider

The entitlement flag is stored in `localStorage` under `pocketledger-entitlement`.
A typical integration pattern:

1. Build with `VITE_UPGRADE_URL=https://your-checkout/provider` (Stripe Payment
   Link, Lemon Squeezy, Paddle, etc.).
2. Optionally require verification before unlocking (e.g., code sent by the
   provider after payment that a confirmation page you host converts into a
   local flag).
3. Keep all secrets/API keys on that confirmation page's backend — never in
   this repository.

If you distribute PocketLedger commercially you should adapt the product name,
logo, pricing copy, and plan definitions to match your own storefront.
