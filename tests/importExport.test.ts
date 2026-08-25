import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/data/db';
import { buildExportPayload, importJSON } from '../src/data/importExport';
import { addCategory, addAccount, addTransaction } from '../src/data/repo';

const catA = { id: 'cat-1', name: 'Food', kind: 'expense' as const, color: '#f00', archived: false, createdAt: 1 };
const accA = { id: 'acc-1', name: 'Cash', createdAt: 1 };

beforeEach(async () => {
  await Promise.all([
    db.transactions.clear(),
    db.categories.clear(),
    db.accounts.clear(),
    db.recurring.clear(),
    db.budgets.clear(),
    db.settings.clear(),
  ]);
});

async function seed() {
  await db.categories.add(catA);
  await db.accounts.add(accA);
  await db.transactions.add({
    id: 'tx-1',
    type: 'expense',
    amount: 1000,
    categoryId: 'cat-1',
    accountId: 'acc-1',
    date: '2025-01-15',
    note: 'Groceries',
    createdAt: 1,
    updatedAt: 2,
  });
}

describe('export', () => {
  it('produces a valid payload', async () => {
    await seed();
    const payload = await buildExportPayload();
    expect(payload.app).toBe('pocketledger');
    expect(payload.data.transactions).toHaveLength(1);
    expect(payload.data.categories).toHaveLength(1);
  });

  it('round-trips export → import', async () => {
    await seed();
    const exported = await buildExportPayload();
    const text = JSON.stringify(exported);
    const result = await importJSON(text, true);
    expect(result.ok).toBe(true);
    expect(result.summary?.transactions).toBe(1);
  });
});

describe('import validation', () => {
  it('rejects non-JSON input', async () => {
    expect((await importJSON('not json')).ok).toBe(false);
  });

  it('accepts an empty payload as a well-formed backup', async () => {
    expect((await importJSON('{"data":{}}')).ok).toBe(true);
  });

  it('rejects references to unknown categories', async () => {
    const p = {
      data: {
        transactions: [{ id: 't1', type: 'expense', amount: 100, categoryId: 'cat-1', accountId: 'acc-1', date: '2025-01-01', note: '', createdAt: 0, updatedAt: 0 }],
      },
    };
    // No categories/accounts → referential integrity fails
    const result = await importJSON(JSON.stringify(p));
    expect(result.ok).toBe(false);
    expect(result.errors.join(',')).toMatch(/unknown/);
  });

  it('skips duplicates in merge mode', async () => {
    await seed();
    const payload = await buildExportPayload();
    const result = await importJSON(JSON.stringify(payload), false);
    expect(result.ok).toBe(true);
    expect(result.summary?.duplicates).toBe(3); // tx + category + account
    expect(await db.transactions.count()).toBe(1);
  });
});
