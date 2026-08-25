import { isValidISODate } from './dates';
import { MAX_AMOUNT_CENTS } from './money';
import type { TxType } from './types';

export const MAX_NOTE_LENGTH = 200;
export const MAX_NAME_LENGTH = 60;

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateText(name: string, label: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return `${label} is required.`;
  if (trimmed.length > MAX_NAME_LENGTH) return `${label} must be ${MAX_NAME_LENGTH} characters or fewer.`;
  return null;
}

export interface TxInput {
  type: TxType;
  amount: number;
  categoryId: string;
  accountId: string;
  date: string;
  note: string;
}

export function validateTxInput(input: TxInput): ValidationResult {
  const errors: string[] = [];
  if (input.type !== 'income' && input.type !== 'expense') errors.push('Type must be income or expense.');
  if (!Number.isInteger(input.amount) || input.amount <= 0) errors.push('Amount must be positive.');
  if (input.amount > MAX_AMOUNT_CENTS) errors.push('Amount exceeds the maximum allowed.');
  if (!input.categoryId) errors.push('Pick a category.');
  if (!input.accountId) errors.push('Pick an account.');
  if (!isValidISODate(input.date)) errors.push('Pick a valid date.');
  if (input.note.length > MAX_NOTE_LENGTH) errors.push(`Note must be ${MAX_NOTE_LENGTH} characters or fewer.`);
  return { ok: errors.length === 0, errors };
}
