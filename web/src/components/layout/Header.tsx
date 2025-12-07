// import { Link } from 'react-router-dom';
// import { ChevronDown, Menu, X } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { Button } from '@/components/common/Button';
// import { ArrowRight } from 'lucide-react';
// import { PATHS } from '@/routing/paths';
// import { Logo } from '../common/Logo';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '@/context/useAuth';
// import { ProfileDropDown } from './ProfileDropDown';

// const navigationItems = [
//   {
//     id: 'hotDeals',
//     label: 'Hot Deals',
//     path: PATHS.HOT_DEALS,
//     hasDropdown: true,
//   },
//   {
//     id: 'map',
//     label: 'Maps',
//     path: PATHS.MAP,
//     hasDropdown: false,
//   },
//   {
//     id: 'pricing',
//     label: 'Pricing',
//     path: PATHS.PRICING,
//     hasDropdown: false,
//   },
// ];

// const ctaButtons = [
//   {
//     id: 'login',
//     label: 'Login',
//     variant: 'google' as const,
//     path: PATHS.LOGIN,
//     showOnMobile: true,
//     showOnDesktop: true,
//   },
//   {
//     id: 'business',
//     label: 'For Businesses',
//     variant: 'primary' as const,
//     path: PATHS.FOR_BUSINESSES,
//     icon: <ArrowRight className="h-4 w-4" />,
//     iconPosition: 'right' as const,
//     showOnMobile: true,
//     showOnDesktop: true,
//   },
// ];

// export const Header = () => {
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const { user, isLoadingUser } = useAuth();

//   const loginButton = ctaButtons.find(b => b.id === 'login');

//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   return (
//     <header
//       className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled || isMobileMenuOpen
//           ? 'border-b border-neutral-border-light bg-white/50 backdrop-blur-lg'
//           : 'bg-transparent'
//         }`}
//     >
//       <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
//         <Logo />

//         <nav className="hidden items-center gap-8 lg:flex">
//           {navigationItems.map((item) => (
//             <Link
//               key={item.id}
//               to={item.path}
//               className="flex items-center gap-1 text-sm font-medium text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//             >
//               {item.label}
//               {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
//             </Link>
//           ))}
//         </nav>

//         <div className="hidden items-center gap-3 lg:flex">
//           {isLoadingUser ? (
//             <div className="h-10 w-24 bg-neutral-200 animate-pulse rounded-full" />
//           ) : user ? (
//             <ProfileDropDown />
//           ) : (
//             loginButton && (
//               <Link to={loginButton.path}>
//                 <Button variant={loginButton.variant} size="md">
//                   {loginButton.label}
//                 </Button>
//               </Link>
//             )
//           )}

//           <Link to={PATHS.FOR_BUSINESSES}>
//             <Button variant="primary" size="md" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
//               For Businesses
//             </Button>
//           </Link>
//         </div>

//         <div className="lg:hidden">
//           <button
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             className="p-2"
//           >
//             {isMobileMenuOpen ? (
//               <X className="h-6 w-6 text-neutral-text-primary" />
//             ) : (
//               <Menu className="h-6 w-6 text-neutral-text-primary" />
//             )}
//           </button>
//         </div>
//       </div>

//       <AnimatePresence>
//         {isMobileMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -20 }}
//             transition={{ duration: 0.2 }}
//             className="absolute left-0 top-full w-full border-b border-neutral-border-light bg-white/95 shadow-md backdrop-blur-md lg:hidden"
//             onClick={() => setIsMobileMenuOpen(false)}
//           >
//             <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
//               <nav className="flex flex-col gap-6">
//                 {navigationItems.map((item) => (
//                   <Link
//                     key={item.id}
//                     to={item.path}
//                     className="flex items-center gap-2 text-lg font-medium text-neutral-text-primary"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     {item.label}
//                     {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
//                   </Link>
//                 ))}
//               </nav>
//               <div className="mt-6 space-y-3 border-t border-neutral-border-light/80 pt-6">
//                 {isLoadingUser ? (
//                   <div className="h-12 w-full bg-neutral-200 animate-pulse rounded-full" />
//                 ) : user ? (
//                   <ProfileDropDown />
//                 ) : (
//                   loginButton && (
//                     <Link to={loginButton.path} className="block">
//                       <Button
//                         variant={loginButton.variant}
//                         size="lg"
//                         className="w-full"
//                         onClick={() => setIsMobileMenuOpen(false)}
//                       >
//                         {loginButton.label}
//                       </Button>
//                     </Link>
//                   )
//                 )}
//                 <Link to={PATHS.FOR_BUSINESSES} className="block">
//                   <Button
//                     variant="primary"
//                     size="lg"
//                     className="w-full"
//                     icon={<ArrowRight className="h-4 w-4" />}
//                     iconPosition="right"
//                     onClick={() => setIsMobileMenuOpen(false)}
//                   >
//                     For Businesses
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </header>
// )}

import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { StreakBadge } from '@/components/gamification/streak/StreakBadge';
import { useStreak } from '@/hooks/useStreak';
import { Logo } from '../common/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/useAuth';
import { ProfileDropDown } from './ProfileDropDown';
import { NavbarSearch } from './NavbarSearch';
import { SearchModal } from './SearchModal';
import CoinDisplay from '../gamification/CoinDisplay';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { HeistTokenBadge } from '@/components/heist/HeistTokenBadge';
import { HeistNotificationBadge } from '@/components/heist/HeistNotificationBadge';

const navigationItems = [
  { id: 'deals', label: 'Hot Deals', path: PATHS.ALL_DEALS },
  { id: 'leaderboard', label: 'Leaderboard', path: PATHS.LEADERBOARD },
  { id: 'referral', label: 'Referral', path: PATHS.REFERRALS },
  { id: 'gamification', label: 'Coins', path: PATHS.GAMIFICATION },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // <-- NEW STATE
  const { user, isLoadingUser } = useAuth();
  const { data: merchantData } = useMerchantStatus();
  const { isAdmin } = useAdminStatus();

  // Check if user has a merchant profile (any status)
  const hasMerchantProfile = !!merchantData?.data?.merchant;

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => setIsSearchModalOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const motionVariants = {
    initial: { opacity: 0, y: -20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2, ease: 'easeInOut' },
    },
  };

  const { streak, isLoading: isLoadingStreak } = useStreak();

  return (
    <>
      {/* <header
        className={`fixed top-0 z-40 w-full border-b border-neutral-200/70 bg-white/80 backdrop-blur-lg transition-colors duration-300`}
      > */}
      <header
        className={`fixed top-0 z-40 w-full border-b border-neutral-200/80 bg-white/95 backdrop-blur-lg`}
      >
        <div className="container mx-auto flex h-20 max-w-screen-xl items-center justify-between px-6 lg:grid lg:grid-cols-3">
          <div className="flex justify-start">
            <Logo />
          </div>

          <div className="hidden justify-center lg:flex">
            <AnimatePresence mode="wait">
              {isScrolled ? (
                <motion.div key="search" {...motionVariants}>
                  <NavbarSearch onClick={openSearchModal} />{' '}
                  {/* <-- PASS ONCLICK */}
                </motion.div>
              ) : (
                <motion.nav key="tabs" {...motionVariants}>
                  <div className="flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/50 p-1 shadow-sm">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 whitespace-nowrap"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden items-center justify-end gap-2 lg:flex">
            {/* {!isAdmin && (
              <Link to={businessLink}>
                <Button variant="secondary" size="md" className="rounded-full">
                  {hasMerchantProfile ? 'Business Dashboard' : 'Yohop for Business'}
                </Button>
              </Link>
            )} */}
            {isLoadingUser ? (
              <div className="h-10 w-24 animate-pulse rounded-full bg-neutral-200" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {hasMerchantProfile && (
                  <Link to={PATHS.MERCHANT_DASHBOARD}>
                    <Button variant="secondary" size="md" className="rounded-full">
                      Business Dashboard
                    </Button>
                  </Link>
                )}
                {!hasMerchantProfile && (
                  <div className="flex items-center gap-2">
                    <StreakBadge streak={streak} loading={isLoadingStreak} />
                    <CoinDisplay />
                    <HeistTokenBadge />
                    <HeistNotificationBadge />
                  </div>
                )}
                <ProfileDropDown isMerchant={hasMerchantProfile} />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={PATHS.MERCHANT_ONBOARDING}>
                  <Button variant="secondary" size="md" className="rounded-full">
                    CitySpark for Business
                  </Button>
                </Link>
                <Link to={PATHS.LOGIN}>
                  <Button variant="primary" size="md" className="rounded-full">
                    Log in
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex justify-end lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="-mr-2 p-2"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="absolute inset-x-0 top-0 z-50 origin-top-right p-2 transition lg:hidden">
              <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="px-5 pb-6 pt-5">
                  <div className="flex items-center justify-between">
                    <Logo />
                    <div className="-mr-2">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                        aria-label="Close menu"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <nav className="grid gap-y-8">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.id}
                          to={item.path}
                          className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50"
                        >
                          <span className="ml-3 text-base font-medium text-gray-900">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
                <div className="space-y-6 px-5 py-6">
                  <div>
                    <Link
                      to={PATHS.LOGIN}
                      className="flex w-full items-center justify-center"
                    >
                      <Button
                        variant="primary"
                        size="md"
                        className="rounded-full"
                      >
                        Sign up / Log in
                      </Button>
                    </Link>
                    <div className="mt-3">
                      <Link
                        to={PATHS.MERCHANT_ONBOARDING}
                        className="flex w-full items-center justify-center"
                      >
                        <Button
                          variant="secondary"
                          size="md"
                          className="rounded-full w-full"
                        >
                          CitySpark for Business
                        </Button>
                      </Link>
                    </div>
                    {!isAdmin && (
                      <p className="mt-6 text-center text-base font-medium text-gray-500">
                        {hasMerchantProfile ? (
                          <>
                            Manage your business{' '}
                            <Link
                              to={PATHS.MERCHANT_DASHBOARD}
                              className="text-primary hover:text-primary/90"
                            >
                              Go to Dashboard
                            </Link>
                          </>
                        ) : (
                          <>
                            Are you a business owner?{' '}
                            <Link
                              to={PATHS.MERCHANT_ONBOARDING}
                              className="text-primary hover:text-primary/90"
                            >
                              Get on the map
                            </Link>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </header>

      <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
    </>
  );
};
