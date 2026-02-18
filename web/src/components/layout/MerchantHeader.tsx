import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { PATHS } from '@/routing/paths';
import { PlusCircle, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { to: PATHS.MERCHANT_DASHBOARD, label: 'Dashboard' },
  { to: PATHS.MERCHANT_MENU, label: 'My Menu' },
  { to: PATHS.MERCHANT_DEALS, label: 'My Deals' },
  { to: PATHS.MERCHANT_EVENTS, label: 'My Events' },
  { to: PATHS.MERCHANT_STORES, label: 'My Stores' },
  { to: PATHS.MERCHANT_ANALYTICS, label: 'Analytics' },
  { to: PATHS.MERCHANT_LOYALTY_ANALYTICS, label: 'Loyalty' },
  { to: PATHS.PROFILE, label: 'My Profile' },
] as const;

export const MerchantHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll active nav link into view on mount / route change
  useEffect(() => {
    if (!scrollRef.current) return;
    const active = scrollRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'whitespace-nowrap px-3 py-2 rounded-md text-sm font-semibold transition-colors',
      isActive
        ? 'bg-brand-primary-500/10 text-brand-primary-600'
        : 'text-neutral-600 hover:bg-neutral-100',
    );

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-colors',
      isActive
        ? 'bg-brand-primary-500/10 text-brand-primary-600'
        : 'text-neutral-600 hover:bg-neutral-50',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 lg:h-20 lg:px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Desktop nav — horizontally scrollable, hidden below lg */}
        <div
          ref={scrollRef}
          className="scrollbar-hide mx-4 hidden flex-1 overflow-x-auto lg:block"
        >
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={navLinkClass}
                data-active={location.pathname.startsWith(to)}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <Link to={PATHS.HOME} className="hidden lg:block">
            <Button variant="secondary" size="md" className="rounded-full text-sm">
              Switch to Browsing
            </Button>
          </Link>
          <Link to={PATHS.MERCHANT_DEALS_CREATE} className="hidden sm:block">
            <Button size="md" className="rounded-full text-sm">
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Create Deal
            </Button>
          </Link>

          {/* Mobile / Tablet menu toggle — shown below lg */}
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet slide-down menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-neutral-200 bg-white transition-all duration-300 ease-in-out lg:hidden',
          isMobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 border-t-0',
        )}
      >
        <nav className="mx-auto max-w-screen-2xl px-4 py-3">
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink key={to} to={to} className={mobileNavLinkClass}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile action buttons */}
          <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
            <Link to={PATHS.HOME} className="block">
              <Button variant="secondary" size="md" className="w-full rounded-lg">
                Switch to Browsing
              </Button>
            </Link>
            <Link to={PATHS.MERCHANT_DEALS_CREATE} className="block sm:hidden">
              <Button size="md" className="w-full rounded-lg">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Deal
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
