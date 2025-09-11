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
  MERCHANT_ONBOARDING: '/merchant/onboarding',
  MERCHANT_DEALS_CREATE: '/merchant/deals/create',

  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  SETTINGS: '/settings',
  LEADERBOARD: '/leaderboard',

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
