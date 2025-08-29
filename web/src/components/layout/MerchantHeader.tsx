// src/components/layout/MerchantHeader.tsx
import { Link, NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { PATHS } from '@/routing/paths';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MerchantHeader = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-md text-sm font-semibold transition-colors',
      isActive
        ? 'bg-brand-primary-500/10 text-brand-primary-600'
        : 'text-neutral-600 hover:bg-neutral-100',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="container mx-auto flex h-20 max-w-screen-xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to={PATHS.MERCHANT_DASHBOARD} className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/merchant/deals" className={navLinkClass}>
              My Deals
            </NavLink>
            <NavLink to="/merchant/analytics" className={navLinkClass}>
              Analytics
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link to={PATHS.HOME}>
            <Button variant="secondary" size="md" className="rounded-full">
              Switch to Browsing
            </Button>
          </Link>
          <Link to={PATHS.MERCHANT_DEALS_CREATE}>
            <Button size="md" className="rounded-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
