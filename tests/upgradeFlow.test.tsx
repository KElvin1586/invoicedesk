import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

beforeEach(() => {
  localStorage.clear();
});

describe('Upgrade flow & lock cycle', () => {
  it('locks premium for Free, unlocks it in test mode, locks again when reverted', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getAllByText('PocketLedger').length).toBeGreaterThan(0));

    // FREE: budgets locked
    await user.click(screen.getAllByRole('link', { name: /Budgets/ })[0]);
    expect(await screen.findByRole('button', { name: /Upgrade to unlock/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Upgrade to unlock/ }));
    expect(await screen.findByRole('dialog', { name: /Upgrade to Premium/ })).toBeInTheDocument();

    // upgrade button → internal test checkout
    await user.click(screen.getByRole('link', { name: /test checkout/ }));
    expect(await screen.findByText(/Development test checkout/)).toBeInTheDocument();

    // switch to premium
    await user.click(screen.getByRole('button', { name: /Simulate upgrade to Premium/ }));
    await user.click(screen.getAllByRole('link', { name: /Budgets/ })[0]);
    expect(await screen.findByRole('button', { name: /Add budget/ })).toBeInTheDocument();

    // revert to free via Settings test mode → locked again
    await user.click(screen.getAllByRole('link', { name: /Settings/ })[0]);
    await user.click(screen.getByRole('button', { name: /Test as Free/ }));
    await user.click(screen.getAllByRole('link', { name: /Budgets/ })[0]);
    expect(await screen.findByRole('button', { name: /Upgrade to unlock/ })).toBeInTheDocument();
  });

  it('entitlement test mode is gated by config and stays local-only', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getAllByText('PocketLedger').length).toBeGreaterThan(0));
    expect(localStorage.getItem('pocketledger-entitlement')).toBe('{"plan":"free"}');
  });
});
