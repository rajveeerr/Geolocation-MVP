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
      "px-3 py-2 rounded-md text-sm font-semibold transition-colors",
      isActive ? "bg-brand-primary-500/10 text-brand-primary-600" : "text-neutral-600 hover:bg-neutral-100"
    );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="container mx-auto max-w-screen-xl px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to={PATHS.MERCHANT_DASHBOARD} className={navLinkClass}>Dashboard</NavLink>
            <NavLink to="/merchant/deals" className={navLinkClass}>My Deals</NavLink>
            <NavLink to="/merchant/analytics" className={navLinkClass}>Analytics</NavLink>
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
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Deal
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
