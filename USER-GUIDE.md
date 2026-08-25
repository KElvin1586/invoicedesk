# PocketLedger User Guide

Welcome! This guide walks through every screen and feature.

## Getting started

Open the app in your browser. On first launch, PocketLedger creates a local database (IndexedDB) and seeds 11 categories — 7 for expenses (Groceries, Housing, Transport, Dining, Utilities, Healthcare, Entertainment) plus 4 for income (Salary, Freelance, Investments, Other income) — and a "Cash" account.

## Dashboard

Your financial overview:

- **Balance** — all-time net (income minus expenses)
- **Income / Expenses (month)** — sums for the current month
- **Net (month)** — this month's difference
- **Monthly savings rate** — share of income saved this month
- **Income vs expenses** bar chart of the last 6 months
- **Expenses by category** pie chart for the current month
- **Balance trend** (Premium) — running net across all time
- **Recent transactions** — latest five entries

Free users see the dashboard with basic charts; premium unlocks the balance-trend chart and extra analytics directly on this screen.

## Transactions

Add, search, filter, and edit transactions.

- Click **Add transaction**, choose **Expense** or **Income**, enter amount, category, account, date, and an optional note.
- Categories are filtered to match the transaction type.
- Use **Search** to match notes and category names, and the **Period** selector (All time / This month / Last month / This year / Custom) to narrow the list.
- Edit or delete entries with the pencil/trash buttons.

**Free plan limit:** up to 150 transactions. When you reach the cap you'll see an upgrade prompt; Premium removes the limit entirely.

## Categories

Create custom categories (name, income/expense type, color), edit them, or **archive** them to hide them from new transactions while preserving history.

## Budgets 🔒 PREMIUM

Set a monthly spending limit per category. PocketLedger compares progress against today's date and marks budgets **over** when you exceed the limit, so overspending is obvious at a glance.

## Recurring 🔒 PREMIUM

Automate regular bills or paychecks:

1. Create a rule with frequency (daily/weekly/monthly/yearly) and a start date.
2. PocketLedger materializes due rules as real transactions each time the app loads.
3. Pause or delete rules anytime; historical transactions stay.

## Reports 🔒 PREMIUM

- Monthly summaries table with income, expenses, net, and savings rate
- All-time totals
- Balance trend chart
- Top expense categories bar chart

## Settings

- **Plan** — shows the current plan (Free or Premium) and a link to the Pricing page. In development builds, a clearly-labelled **Development test mode** panel appears here, letting developers toggle between Free and Premium without any payment. In production builds the panel is hidden.
- **Pricing** — the dedicated Pricing page (`#/pricing`) compares Free vs Premium and contains the upgrade call-to-action.
- **Accounts 🔒 PREMIUM** — add wallets/bank accounts.
- **Currency** — used for formatting (e.g., USD, EUR).
- **Export CSV (Free)** — plain spreadsheet list of transactions.
- **Export backup (JSON) (Premium)** — complete app state; keep copies as local backups.
- **Import JSON (Premium)** — restore a backup. Choose **Merge** to combine without clearing, or replace to overwrite. Invalid files are rejected with a clear error list. Imported references must match existing or provided categories/accounts.
- **Danger zone** — erase everything in this browser.

## Free vs Premium

| Feature | Free | Premium |
|---|---|---|
| Income / expense tracking | ✅ | ✅ |
| Categories | ✅ | ✅ (advanced) |
| Monthly totals + dashboard | ✅ | ✅ |
| Basic charts | ✅ | ✅ |
| CSV export | ✅ | ✅ |
| Unlimited transactions | — (150 cap) | ✅ |
| Budgets | 🔒 | ✅ |
| Recurring | 🔒 | ✅ |
| Multiple accounts | 🔒 | ✅ |
| Advanced reports | 🔒 | ✅ |
| JSON backup / restore | 🔒 | ✅ |
| Financial summaries | 🔒 | ✅ |

## Privacy

Everything — transactions, categories, budgets, even your plan status — stays in your browser's IndexedDB / localStorage. Clearing site data or the danger zone removes everything permanently. No servers, no cookies, no analytics.
