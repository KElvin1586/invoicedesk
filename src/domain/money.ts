/**
 * Money helpers by workspace — all amounts are integer cents.
 * This avoids IEEE-754 float drift when summing transactions.
 */

export const MAX_AMOUNT_CENTS = 100_000_000; // $1,000,000 per transaction

/** Format cents to a localized currency string. */
export function formatMoney(cents: number, currency: string): string {
  const value = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(value);
  } catch {
    return `${currency} ${(cents / 100).toFixed(2)}`;
  }
}

export interface AmountParse {
  ok: boolean;
  cents?: number;
  error?: string;
}

/** Strictly parse a user-entered amount string into cents. */
export function parseAmount(raw: string): AmountParse {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'Amount is required.' };
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, error: 'Enter a valid amount, e.g. 12.99.' };
  }
  const [whole, frac] = trimmed.split('.');
  const cents = Number(whole) * 100 + Number((frac ?? '').padEnd(2, '0'));
  if (cents <= 0) return { ok: false, error: 'Amount must be greater than zero.' };
  if (cents > MAX_AMOUNT_CENTS) {
    return { ok: false, error: 'Amount exceeds the maximum allowed value.' };
  }
  return { ok: true, cents };
}

/** Convert cents to an editable "N.NN" string. */
export function amountToEditable(cents: number): string {
  return (cents / 100).toFixed(2);
}
