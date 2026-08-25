import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

function renderApp() {
  return render(<App />);
}

beforeEach(() => {
  localStorage.clear();
});

describe('PocketLedger UI', () => {
  it('renders the dashboard with balance, income, expense, and net cards', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText('Balance')).toBeInTheDocument();
      expect(screen.getByText('Income (month)')).toBeInTheDocument();
      expect(screen.getByText('Expenses (month)')).toBeInTheDocument();
      expect(screen.getByText('Net (month)')).toBeInTheDocument();
    });
  });

  it('shows a 🔒 PREMIUM lock on advanced charts for free users', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getAllByText(/PREMIUM/).length).toBeGreaterThan(0);
    });
  });

  it('offers an upgrade modal when a premium feature is clicked', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByText(/Balance trend/)).toBeInTheDocument();
    });
    await userEvent.click(screen.getByRole('button', { name: /Upgrade to unlock/ }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Upgrade to Premium/)).toBeInTheDocument();
  });

  it('renders the bottom navigation responsive layout', async () => {
    renderApp();
    const navLinks = await screen.findAllByRole('link', { name: /Transactions/ });
    expect(navLinks.length).toBeGreaterThan(1); // sidebar + mobile bottom nav
  });

  it('unlocks budgets for premium users', async () => {
    localStorage.setItem('pocketledger-entitlement', JSON.stringify({ plan: 'premium' }));
    renderApp();
    await waitFor(() => {
      expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    });
    await userEvent.click(screen.getAllByRole('link', { name: /Budgets/ })[0]);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add budget/ })).toBeInTheDocument();
    });
  });
});
