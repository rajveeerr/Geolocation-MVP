export const PATHS = {
  HOME: '/',
  ALL_DEALS: '/deals',
  MAP: '/map',
  PRICING: '/pricing',
  BLOG: '/blog',
  CITY_GUIDE: '/city-guide',

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
  MERCHANT_MENU_COLLECTIONS: '/merchant/menu/collections',
  MERCHANT_ANALYTICS: '/merchant/analytics',
  MERCHANT_CHECKIN_GAMES: '/merchant/check-in-games',

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
  LEADERBOARD_COMPREHENSIVE: '/leaderboard/comprehensive',
  STREAK_LEADERBOARD: '/streaks/leaderboard',
  GAMIFICATION: '/gamification',
  HEIST_HISTORY: '/heist/history',
  HEIST_NOTIFICATIONS: '/heist/notifications',
  HEIST_STATS: '/heist/stats',
  HEIST_ITEM_SHOP: '/heist/shop',

  // Loyalty (user)
  LOYALTY_WALLET: '/loyalty',
  LOYALTY_HISTORY: '/loyalty/history',

  // Loyalty (merchant)
  MERCHANT_LOYALTY_SETUP: '/merchant/loyalty/setup',
  MERCHANT_LOYALTY_PROGRAM: '/merchant/loyalty/program',
  MERCHANT_LOYALTY_ANALYTICS: '/merchant/loyalty/analytics',
  MERCHANT_LOYALTY_CUSTOMERS: '/merchant/loyalty/customers',
  MERCHANT_LOYALTY_TRANSACTIONS: '/merchant/loyalty/transactions',

  // Payments
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_CANCEL: '/payment/cancel',

  // Admin
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin', // This is now the overview page
  ADMIN_MERCHANTS: '/admin/merchants',
  ADMIN_CITIES: '/admin/cities', // New route for the city management table
  ADMIN_CUSTOMERS: '/admin/customers', // New route for the customer list
  ADMIN_NUDGES: '/admin/nudges',
  ADMIN_GAMES: '/admin/games',

  // Nudges (consumer)
  NUDGE_HISTORY: '/nudges/history',
  NOTIFICATIONS: '/notifications',

  // Merchant Events
  MERCHANT_EVENTS: '/merchant/events',
  MERCHANT_EVENTS_CREATE: '/merchant/events/create',
  MERCHANT_EVENTS_MANAGE: '/merchant/events/:eventId',
  MERCHANT_EVENTS_CHECKIN: '/merchant/events/:eventId/checkin',

  // Merchant Services
  MERCHANT_SERVICES: '/merchant/services',
  MERCHANT_SERVICES_CREATE: '/merchant/services/create',
  MERCHANT_SERVICES_MANAGE: '/merchant/services/:serviceId',
  MERCHANT_SERVICES_CHECKIN: '/merchant/services/:serviceId/checkin',

  // Merchant Surprises
  MERCHANT_SURPRISES: '/merchant/surprises',
  MERCHANT_SURPRISES_CREATE: '/merchant/surprises/create',
  MERCHANT_SURPRISES_ANALYTICS: '/merchant/surprises/:dealId/analytics',

  // Consumer Surprises
  SURPRISES: '/surprises',
  MY_REVEAL_HISTORY: '/surprises/history',

  // Events
  EVENT_DETAIL: '/events/:eventId',
  DISCOVER_EVENTS: '/discover/events',

  // Services
  DISCOVER_SERVICES: '/discover/services',
  SERVICE_DETAIL: '/services/:serviceId',
  MY_SERVICE_BOOKINGS: '/my-services/bookings',

  // My Tickets (consumer)
  MY_TICKETS: '/my-tickets',

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
