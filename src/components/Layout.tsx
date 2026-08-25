import { NavLink, Outlet } from 'react-router-dom';
import {
  ChartIcon,
  GearIcon,
  HomeIcon,
  LedgerIcon,
  RepeatIcon,
  TagIcon,
  TargetIcon,
} from './Icons';
import { PremiumBadge } from './premium/PremiumBadge';
import type { ReactNode } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  premiumFeature?: 'budgets' | 'recurring' | 'advanced-reports' | 'advanced-charts';
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <HomeIcon /> },
  { to: '/transactions', label: 'Transactions', icon: <LedgerIcon /> },
  { to: '/budgets', label: 'Budgets', icon: <TargetIcon />, premiumFeature: 'budgets' },
  { to: '/recurring', label: 'Recurring', icon: <RepeatIcon />, premiumFeature: 'recurring' },
  { to: '/categories', label: 'Categories', icon: <TagIcon /> },
  { to: '/reports', label: 'Reports', icon: <ChartIcon />, premiumFeature: 'advanced-reports' },
  { to: '/settings', label: 'Settings', icon: <GearIcon /> },
];

export function Layout() {
  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 text-slate-200 md:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <LedgerIcon className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-white">PocketLedger</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800',
                ].join(' ')
              }
            >
              {item.icon}
              <span>{item.label}</span>
              {item.premiumFeature && <PremiumBadge compact feature={item.premiumFeature} />}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-slate-500">
          Offline-first · Your data stays here
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <span className="flex items-center gap-2 font-bold text-slate-900">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <LedgerIcon className="h-4 w-4" />
          </div>
          PocketLedger
        </span>
      </header>

      <main className="px-4 pb-24 pt-4 md:ml-64 md:px-8 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white px-1 py-1 md:hidden">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function NavItem(item: NavItem) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium',
          isActive ? 'text-emerald-600' : 'text-slate-500',
        ].join(' ')
      }
    >
      {item.icon}
      {item.label}
      {item.premiumFeature && <PremiumBadge feature={item.premiumFeature} compact tiny />}
    </NavLink>
  );
}
