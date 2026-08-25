import { describe, it, expect } from 'vitest';
import { parseAmount, formatMoney, amountToEditable } from '../src/domain/money';

describe('parseAmount', () => {
  it('parses whole dollars', () => {
    expect(parseAmount('12').ok && parseAmount('12').cents).toBe(1200);
  });

  it('parses one or two decimals', () => {
    expect(parseAmount('12.3').cents).toBe(1230);
    expect(parseAmount('12.34').cents).toBe(1234);
  });

  it('rejects non-numeric input', () => {
    expect(parseAmount('abc').ok).toBe(false);
    expect(parseAmount('12.345').ok).toBe(false);
    expect(parseAmount('').ok).toBe(false);
  });

  it('rejects zero and negative-ish inputs', () => {
    expect(parseAmount('0').ok).toBe(false);
    expect(parseAmount('0.00').ok).toBe(false);
    expect(parseAmount('-5').ok).toBe(false);
  });

  it('enforces the maximum bound', () => {
    const over = parseAmount('2000001.00');
    expect(over.ok).toBe(false);
  });

  it('accepts edge maximum', () => {
    expect(parseAmount('1000000.00').ok).toBe(true);
  });
});

describe('formatMoney', () => {
  it('formats integer cents as USD by default', () => {
    const formatted = formatMoney(12345, 'USD');
    expect(formatted).toBe('$123.45');
  });

  it('falls back gracefully when currency code is invalid', () => {
    const formatted = formatMoney(100, 'bad-code');
    expect(formatted).toContain('1.00');
  });
});

describe('amountToEditable', () => {
  it('renders cents as a 2-decimal string', () => {
    expect(amountToEditable(12345)).toBe('123.45');
  });
});
