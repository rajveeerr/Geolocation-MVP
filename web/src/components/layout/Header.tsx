import { Link } from 'react-router-dom';
import { Menu, X, BookOpen, Compass, Coins, Briefcase, Shield, User, Settings, LogOut, Gift, Trophy, Flame, Users, CalendarDays, Ticket, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { PATHS } from '@/routing/paths';
import { Logo } from '../common/Logo';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/context/useAuth';
import { ProfileDropDown } from './ProfileDropDown';
import { HeaderSearchBar } from './HeaderSearchBar';
import { CitySelector } from './CitySelector';
import { useGamificationProfile } from '@/hooks/useGamification';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { useNudgeHistory } from '@/hooks/useNudges';

// Navigation items for the hamburger/mobile menu
const menuNavItems = [
  { id: 'deals', label: 'Hot Deals', path: PATHS.ALL_DEALS, icon: Flame },
  { id: 'events', label: 'Discover Events', path: PATHS.DISCOVER_EVENTS, icon: CalendarDays },
  { id: 'leaderboard', label: 'Leaderboard', path: PATHS.LEADERBOARD, icon: Trophy },
  { id: 'referral', label: 'Referrals', path: PATHS.REFERRALS, icon: Users },
  { id: 'gamification', label: 'Coins & Rewards', path: PATHS.GAMIFICATION, icon: Coins },
  { id: 'blog', label: 'Blog', path: PATHS.BLOG, icon: BookOpen },
  { id: 'cityguide', label: 'City Guide', path: PATHS.CITY_GUIDE, icon: Compass },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const hamburgerRef = useRef<HTMLDivElement>(null);
  const { user, isLoadingUser, logout } = useAuth();
  const { data: merchantData } = useMerchantStatus();
  const { isAdmin } = useAdminStatus();
  const { data: gamificationProfile } = useGamificationProfile();

  const hasMerchantProfile = !!merchantData?.data?.merchant;
  const points = gamificationProfile?.coins ?? 0;

  // Unread nudge count for bell badge
  const { data: nudgeData } = useNudgeHistory(20);
  const unreadCount = (nudgeData ?? []).filter((n) => !n.opened && !n.clicked && !n.dismissed).length;

  // Close hamburger menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (hamburgerRef.current && !hamburgerRef.current.contains(e.target as Node)) {
        setIsHamburgerMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 z-40 w-full border-b border-neutral-200/80 bg-white">
        {/* ===== DESKTOP NAVBAR ===== */}
        <div className="container mx-auto hidden h-16 max-w-screen-xl items-center gap-4 px-4 md:flex lg:px-6">
          {/* Left: Logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Search bar */}
          <div className="mx-4 flex-1 max-w-md">
            <HeaderSearchBar />
          </div>

          {/* Right section: Blog, City Guide, City Selector, Points, Profile, Hamburger */}
          <div className="flex items-center gap-1 lg:gap-2">
            {/* Blog link */}
            <Link
              to={PATHS.BLOG}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden lg:inline">Blog</span>
            </Link>

            {/* City Guide link */}
            <Link
              to={PATHS.CITY_GUIDE}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
            >
              <Compass className="h-4 w-4" />
              <span className="hidden lg:inline">City Guide</span>
            </Link>

            {/* Divider */}
            <div className="mx-1 h-6 w-px bg-neutral-200" />

            {/* City selector dropdown */}
            <CitySelector />

            {/* Divider */}
            <div className="mx-1 h-6 w-px bg-neutral-200" />

            {/* Points display */}
            {user && !isLoadingUser && (
              <Link
                to={PATHS.GAMIFICATION}
                className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 transition-colors hover:bg-amber-100"
              >
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-700">
                  {points.toLocaleString()} pts
                </span>
              </Link>
            )}

            {/* Notifications bell */}
            {user && !isLoadingUser && (
              <Link
                to={PATHS.NOTIFICATIONS}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                aria-label="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#B91C1C] ring-2 ring-white" />
                )}
              </Link>
            )}

            {/* Profile or Login */}
            {isLoadingUser ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-neutral-200" />
            ) : user ? (
              <ProfileDropDown isMerchant={hasMerchantProfile} />
            ) : (
              <Link
                to={PATHS.LOGIN}
                className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Log in
              </Link>
            )}

            {/* Hamburger menu button */}
            <div className="relative" ref={hamburgerRef}>
              <button
                onClick={() => setIsHamburgerMenuOpen(!isHamburgerMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50"
                aria-label="Menu"
              >
                {isHamburgerMenuOpen ? (
                  <X className="h-4.5 w-4.5" />
                ) : (
                  <Menu className="h-4.5 w-4.5" />
                )}
              </button>

              {/* Desktop hamburger dropdown */}
              <AnimatePresence>
                {isHamburgerMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl"
                  >
                    <div className="py-2">
                      {/* Yohop for Business CTA */}
                      {!isAdmin && (
                        <Link
                          to={hasMerchantProfile ? PATHS.MERCHANT_DASHBOARD : PATHS.MERCHANT_ONBOARDING}
                          onClick={() => setIsHamburgerMenuOpen(false)}
                          className="mx-2 mb-2 flex items-center gap-3 rounded-lg bg-brand-primary-50 px-3 py-2.5 text-sm font-semibold text-brand-primary-700 transition-colors hover:bg-brand-primary-100"
                        >
                          <Briefcase className="h-4 w-4" />
                          {hasMerchantProfile ? 'Business Dashboard' : 'Yohop for Business'}
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to={PATHS.ADMIN_DASHBOARD}
                          onClick={() => setIsHamburgerMenuOpen(false)}
                          className="mx-2 mb-2 flex items-center gap-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="my-1 border-t border-neutral-100" />

                      {/* Nav items */}
                      {menuNavItems.map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          onClick={() => setIsHamburgerMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                        >
                          <item.icon className="h-4 w-4 text-neutral-400" />
                          {item.label}
                        </Link>
                      ))}

                      {user && (
                        <>
                          <div className="my-1 border-t border-neutral-100" />
                          <Link
                            to={PATHS.PROFILE}
                            onClick={() => setIsHamburgerMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            <User className="h-4 w-4 text-neutral-400" />
                            Profile
                          </Link>
                          <Link
                            to={PATHS.LOYALTY_HISTORY}
                            onClick={() => setIsHamburgerMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            <Gift className="h-4 w-4 text-neutral-400" />
                            Loyalty Wallet
                          </Link>
                          <Link
                            to={PATHS.MY_TICKETS}
                            onClick={() => setIsHamburgerMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            <Ticket className="h-4 w-4 text-neutral-400" />
                            My Tickets
                          </Link>
                          <Link
                            to={PATHS.NOTIFICATIONS}
                            onClick={() => setIsHamburgerMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            <Bell className="h-4 w-4 text-neutral-400" />
                            Notifications
                            {unreadCount > 0 && (
                              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#B91C1C] px-1.5 text-[10px] font-bold text-white">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            to={PATHS.SETTINGS}
                            onClick={() => setIsHamburgerMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            <Settings className="h-4 w-4 text-neutral-400" />
                            Settings
                          </Link>
                          <div className="my-1 border-t border-neutral-100" />
                          <button
                            onClick={() => {
                              setIsHamburgerMenuOpen(false);
                              logout();
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Log out
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ===== MOBILE NAVBAR ===== */}
        <div className="flex h-12 items-center justify-between px-4 md:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            {/* Points on mobile */}
            {user && !isLoadingUser && (
              <Link
                to={PATHS.GAMIFICATION}
                className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1"
              >
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-700">
                  {points.toLocaleString()}
                </span>
              </Link>
            )}
            {/* Profile avatar on mobile */}
            {!isLoadingUser && user && (
              <ProfileDropDown isMerchant={hasMerchantProfile} />
            )}
            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile search bar row */}
        <div className="border-t border-neutral-100 px-4 py-1.5 md:hidden">
          <HeaderSearchBar />
        </div>
      </header>

      {/* Spacer to prevent content overlap — desktop: 64px, mobile: 14+search row ~112px */}
      {/* This is handled by padding on <main> in the layout, see DefaultLayout */}

      {/* ===== MOBILE FULL-SCREEN MENU ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile menu header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                <Logo />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* City Selector in mobile */}
              <div className="border-b border-neutral-100 px-5 py-3">
                <CitySelector />
              </div>

              {/* Yohop for Business CTA */}
              {!isAdmin && (
                <div className="border-b border-neutral-100 px-5 py-3">
                  <Link
                    to={hasMerchantProfile ? PATHS.MERCHANT_DASHBOARD : PATHS.MERCHANT_ONBOARDING}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-brand-primary-50 px-4 py-3 text-sm font-semibold text-brand-primary-700"
                  >
                    <Briefcase className="h-5 w-5" />
                    {hasMerchantProfile ? 'Business Dashboard' : 'Yohop for Business'}
                  </Link>
                </div>
              )}

              {isAdmin && (
                <div className="border-b border-neutral-100 px-5 py-3">
                  <Link
                    to={PATHS.ADMIN_DASHBOARD}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    <Shield className="h-5 w-5" />
                    Admin Dashboard
                  </Link>
                </div>
              )}

              {/* Navigation links */}
              <nav className="px-2 py-2">
                {menuNavItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    <item.icon className="h-5 w-5 text-neutral-400" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              {/* Account section */}
              {user && (
                <div className="border-t border-neutral-100 px-2 py-2">
                  <Link
                    to={PATHS.PROFILE}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <User className="h-5 w-5 text-neutral-400" />
                    Profile
                  </Link>
                  <Link
                    to={PATHS.LOYALTY_HISTORY}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Gift className="h-5 w-5 text-neutral-400" />
                    Loyalty Wallet
                  </Link>
                  <Link
                    to={PATHS.SETTINGS}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Settings className="h-5 w-5 text-neutral-400" />
                    Settings
                  </Link>
                  <Link
                    to={PATHS.NOTIFICATIONS}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Bell className="h-5 w-5 text-neutral-400" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#B91C1C] px-1.5 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Bottom actions */}
              <div className="border-t border-neutral-100 px-5 py-4">
                {!user && !isLoadingUser && (
                  <Link
                    to={PATHS.LOGIN}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full rounded-full bg-neutral-900 py-3 text-center text-sm font-semibold text-white"
                  >
                    Sign up / Log in
                  </Link>
                )}
                {user && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
