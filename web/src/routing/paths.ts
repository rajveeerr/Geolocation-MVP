export const PATHS = {
  HOME: '/',
  ALL_DEALS: '/deals',
  MAP: '/map',
  PRICING: '/pricing',

  FOR_BUSINESSES: '/business',
  BUSINESS_SIGNUP: '/business/signup',
  BUSINESS_DASHBOARD: '/business/dashboard',

  // Merchant paths
  MERCHANT_DASHBOARD: '/merchant/dashboard',
  MERCHANT_KICKBACKS: '/merchant/kickbacks',
  MERCHANT_ONBOARDING: '/merchant/onboarding',
  MERCHANT_DEALS_CREATE: '/merchant/deals/create',
  MERCHANT_DEALS: '/merchant/deals',
  MERCHANT_STORES: '/merchant/stores',
  MERCHANT_STORES_CREATE: '/merchant/stores/create',
  MERCHANT_STORES_EDIT: '/merchant/stores/:storeId/edit',
  MERCHANT_STORES_DETAIL: '/merchant/stores/:storeId',
  MERCHANT_MENU: '/merchant/menu',
  MERCHANT_MENU_CREATE: '/merchant/menu/create',
  MERCHANT_MENU_EDIT: '/merchant/menu/:itemId/edit',
  MERCHANT_MENU_DETAIL: '/merchant/menu/:itemId',
  MERCHANT_ANALYTICS: '/merchant/analytics',

  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  PROFILE: '/profile',
  REFERRALS: '/referrals',
  PROFILE_EDIT: '/profile/edit',
  SETTINGS: '/settings',
  LEADERBOARD: '/leaderboard',
  GAMIFICATION: '/gamification',

  // Payments
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_CANCEL: '/payment/cancel',

  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin', // This is now the overview page
  ADMIN_MERCHANTS: '/admin/merchants',
  ADMIN_CITIES: '/admin/cities', // New route for the city management table
  ADMIN_CUSTOMERS: '/admin/customers', // New route for the customer list

  DEAL_DETAIL: '/deals/:dealId',
  LOCATION_DETAIL: '/locations/:locationId',
  CATEGORY: '/category/:categoryId',

  MY_SAVED_DEALS: '/my-activity/saved-deals',
  MY_BOOKINGS: '/my-activity/bookings',
  MY_FAVORITES: '/my-activity/favorites',

  ABOUT: '/about',
  CONTACT: '/contact',
  SUPPORT: '/support',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  NOT_FOUND: '*',
} as const;
