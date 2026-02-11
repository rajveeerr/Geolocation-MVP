import { Link, NavLink } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { PATHS } from '@/routing/paths';
import { PlusCircle, Menu, X, Gift, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export const MerchantHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-md text-sm font-semibold transition-colors',
      isActive
        ? 'bg-brand-primary-500/10 text-brand-primary-600'
        : 'text-neutral-600 hover:bg-neutral-100',
    );

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'block px-4 py-3 text-base font-semibold transition-colors',
      isActive
        ? 'bg-brand-primary-500/10 text-brand-primary-600 border-r-2 border-brand-primary-500'
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
            <NavLink to={PATHS.MERCHANT_MENU} className={navLinkClass}>
              My Menu
            </NavLink>
            <NavLink to={PATHS.MERCHANT_DEALS} className={navLinkClass}>
              My Deals
            </NavLink>
            <NavLink to={PATHS.MERCHANT_EVENTS} className={navLinkClass}>
              My Events
            </NavLink>
            <NavLink to={PATHS.MERCHANT_STORES} className={navLinkClass}>
              My Stores
            </NavLink>
            <NavLink to={PATHS.MERCHANT_ANALYTICS} className={navLinkClass}>
              Analytics
            </NavLink>
            <NavLink to={PATHS.MERCHANT_LOYALTY_ANALYTICS} className={navLinkClass}>
              Loyalty
            </NavLink>
            <NavLink to={PATHS.PROFILE} className={navLinkClass}>
              My Profile
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link to={PATHS.HOME}>
            <Button variant="secondary" size="md" className="rounded-full hidden sm:inline-flex">
              Switch to Browsing
            </Button>
          </Link>
          <Link to={PATHS.MERCHANT_DEALS_CREATE}>
            <Button size="md" className="rounded-full hidden sm:inline-flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Deal
            </Button>
          </Link>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-neutral-600 hover:bg-neutral-100"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="container mx-auto max-w-screen-xl px-6 py-4">
            <div className="space-y-1">
              <NavLink 
                to={PATHS.MERCHANT_DASHBOARD} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to={PATHS.MERCHANT_DEALS} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Deals
              </NavLink>
              <NavLink 
                to={PATHS.MERCHANT_EVENTS} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Events
              </NavLink>
              <NavLink 
                to={PATHS.MERCHANT_STORES} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Stores
              </NavLink>
              <NavLink 
                to={PATHS.MERCHANT_MENU} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Menu
              </NavLink>
              <NavLink 
                to={PATHS.MERCHANT_ANALYTICS} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </NavLink>
              <NavLink 
                to={PATHS.MERCHANT_LOYALTY_ANALYTICS} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Loyalty
              </NavLink>
              <NavLink 
                to={PATHS.PROFILE} 
                className={mobileNavLinkClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Profile
              </NavLink>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link to={PATHS.HOME} className="block">
                <Button variant="secondary" size="md" className="w-full rounded-lg">
                  Switch to Browsing
                </Button>
              </Link>
              <Link to={PATHS.MERCHANT_DEALS_CREATE} className="block">
                <Button size="md" className="w-full rounded-lg">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Deal
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
