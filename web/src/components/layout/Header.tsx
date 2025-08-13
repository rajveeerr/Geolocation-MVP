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

// web/src/components/layout/Header.tsx

import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { Logo } from '../common/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/useAuth';
import { ProfileDropDown } from './ProfileDropDown';
import { NavbarSearch } from './NavbarSearch';

const navigationItems = [
  { id: 'deals', label: 'Hot Deals', path: PATHS.HOT_DEALS },
  { id: 'map', label: 'Map', path: PATHS.MAP },
  { id: 'pricing', label: 'Pricing', path: PATHS.PRICING },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoadingUser } = useAuth(); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const motionVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeInOut' } },
  };

  return (
    <>
      {/* <div className="h-20" /> */}
      <header
        className={`fixed top-0 z-50 w-full transition-colors duration-300 bg-white/80 border-b border-neutral-200/70 backdrop-blur-lg`}
      >
        <div className="container mx-auto max-w-screen-xl px-6 h-20 grid grid-cols-3 items-center">
          
          {/* Left: Logo */}
          <div className="flex justify-start">
            <Logo />
          </div>

          {/* Center: Dynamic Navigation/Search */}
          <div className="flex justify-center">
            <AnimatePresence mode="wait">
              {isScrolled ? (
                <motion.div key="search" {...motionVariants}>
                  <NavbarSearch />
                </motion.div>
              ) : (
                <motion.nav key="tabs" {...motionVariants}>
                  <div className="hidden lg:flex items-center gap-2 p-1 bg-white/50 border border-neutral-200/90 rounded-full shadow-sm">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        className="px-4 py-2 rounded-full text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right: Actions */}
          <div className="hidden lg:flex items-center justify-end gap-2">
            <Link to={PATHS.FOR_BUSINESSES} className="px-4 py-2 rounded-full text-sm font-semibold text-neutral-800 hover:bg-neutral-100/80 transition-colors">
                CitySpark for Business
            </Link>
            {isLoadingUser ? (
              <div className="h-10 w-24 bg-neutral-200 animate-pulse rounded-full" />
            ) : user ? (
              <ProfileDropDown />
            ) : (
              <Link to={PATHS.LOGIN}>
                <Button variant="primary" size="md" className="rounded-full">
                  Log in
                </Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 inset-x-0 p-2 transition origin-top-right lg:hidden"
            >
              <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
                <div className="px-5 pt-5 pb-6">
                  <div className="flex items-center justify-between">
                    <Logo />
                    <div className="-mr-2">
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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
                          className="-m-3 p-3 flex items-center rounded-md hover:bg-gray-50"
                        >
                          <span className="ml-3 text-base font-medium text-gray-900">{item.label}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
                <div className="py-6 px-5 space-y-6">
                  <div>
                     <Link
                        to={PATHS.LOGIN}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90"
                      >
                        Sign up / Log in
                      </Link>
                      <p className="mt-6 text-center text-base font-medium text-gray-500">
                        Are you a business owner?{' '}
                        <Link to={PATHS.FOR_BUSINESSES} className="text-primary hover:text-primary/90">
                          Get on the map
                        </Link>
                      </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};