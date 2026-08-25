import { HashRouter, Routes, Route } from 'react-router-dom';
import { EntitlementProvider } from './entitlement/EntitlementContext';
import { DataProvider } from './hooks/DataProvider';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { RecurringPage } from './pages/RecurringPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PricingPage } from './pages/PricingPage';
import { CheckoutPage } from './pages/CheckoutPage';

export default function App() {
  return (
    <HashRouter>
      <EntitlementProvider>
        <DataProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="recurring" element={<RecurringPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
            </Route>
          </Routes>
        </DataProvider>
      </EntitlementProvider>
    </HashRouter>
  );
}
