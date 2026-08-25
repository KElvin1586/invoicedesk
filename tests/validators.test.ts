import { describe, it, expect } from 'vitest';
import { validateTxInput, validateText, MAX_NOTE_LENGTH } from '../src/domain/validators';

const base = {
  type: 'expense' as const,
  amount: 1234,
  categoryId: 'c1',
  accountId: 'a1',
  date: '2025-01-01',
  note: 'lunch',
};

describe('validateTxInput', () => {
  it('accepts a good transaction', () => {
    const r = validateTxInput(base);
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('rejects bad dates', () => {
    const r = validateTxInput({ ...base, date: '2025-02-29' });
    expect(r.ok).toBe(false);
    expect(r.errors.join(',')).toMatch(/date/);
  });

  it('rejects non-positive amounts', () => {
    const r = validateTxInput({ ...base, amount: 0 });
    expect(r.ok).toBe(false);
  });

  it('rejects long notes', () => {
    const r = validateTxInput({ ...base, note: 'x'.repeat(MAX_NOTE_LENGTH + 1) });
    expect(r.ok).toBe(false);
  });

  it('rejects missing category', () => {
    const r = validateTxInput({ ...base, categoryId: '' });
    expect(r.ok).toBe(false);
  });
});

describe('validateText', () => {
  it('requires non-empty names', () => {
    expect(validateText('', 'Name')).toBeTruthy();
  });

  it('trims', () => {
    expect(validateText('  ', 'Name')).toBeTruthy();
    expect(validateText('ok', 'Name')).toBeNull();
  });
});
