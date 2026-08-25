/**
 * Central app configuration.
 *
 * The one-time Premium price and the upgrade/checkout URL are
 * configurable through Vite environment variables, with defaults
 * baked into the build. There is no fake payment flow: the Upgrade
 * modal simply links out to the configured checkout URL.
 */
export const APP_NAME = 'PocketLedger';
export const APP_VERSION = '1.0.0';

export const PREMIUM_PRICE =
  (import.meta.env.VITE_PREMIUM_PRICE as string | undefined) ?? '9.99';

export const UPGRADE_URL =
  (import.meta.env.VITE_UPGRADE_URL as string | undefined) ??
  'https://pocketledger.app/upgrade';

/** Free-plan limits. */
export const FREE_TRANSACTION_LIMIT = 150;
export const FREE_CATEGORY_LIMIT = 12;

export type Plan = 'free' | 'premium';
