import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { Logo } from '../common/Logo';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  {
    id: 'hotDeals',
    label: 'Hot Deals',
    path: PATHS.HOT_DEALS,
    hasDropdown: true,
  },
  {
    id: 'map',
    label: 'Maps',
    path: PATHS.MAP,
    hasDropdown: false,
  },
  {
    id: 'pricing',
    label: 'Pricing',
    path: PATHS.PRICING,
    hasDropdown: false,
  },
];

// CTA buttons configuration
const ctaButtons = [
  {
    id: 'login',
    label: 'Login',
    variant: 'google' as const,
    path: PATHS.LOGIN,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    id: 'business',
    label: 'For Businesses',
    variant: 'primary' as const,
    path: PATHS.FOR_BUSINESSES,
    icon: <ArrowRight className="h-4 w-4" />,
    iconPosition: 'right' as const,
    showOnMobile: true,
    showOnDesktop: true,
  },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'border-b border-neutral-border-light bg-white/50 backdrop-blur-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to={PATHS.HOME}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="flex items-center gap-1 text-sm font-medium text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {ctaButtons
            .filter((button) => button.showOnDesktop)
            .map((button) => (
              <Link key={button.id} to={button.path}>
                <Button
                  variant={button.variant}
                  size="md"
                  icon={button.icon}
                  iconPosition={button.iconPosition}
                >
                  {button.label}
                </Button>
              </Link>
            ))}
        </div>

        <div className="lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-neutral-text-primary" />
            ) : (
              <Menu className="h-6 w-6 text-neutral-text-primary" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full w-full border-b border-neutral-border-light bg-white/95 shadow-md backdrop-blur-md lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
              <nav className="flex flex-col gap-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="flex items-center gap-2 text-lg font-medium text-neutral-text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                  </Link>
                ))}
              </nav>
              <div className="mt-6 space-y-3 border-t border-neutral-border-light/80 pt-6">
                {ctaButtons
                  .filter((button) => button.showOnMobile)
                  .map((button) => (
                    <Link key={button.id} to={button.path} className="block">
                      <Button
                        variant={button.variant}
                        size="lg"
                        className="w-full"
                        icon={button.icon}
                        iconPosition={button.iconPosition}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {button.label}
                      </Button>
                    </Link>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
