/**
 * Placeholder / mock data for Deal Detail Page features that
 * are NOT yet supported by the backend.
 *
 * These are used ONLY for demo / visual purposes and are clearly
 * marked as placeholder in the UI. Once the backend adds support,
 * each section should switch to real API data and the corresponding
 * block here can be removed.
 */

// ─── Reviews (Backend: ❌ No Review model) ─────────────────────
export interface PlaceholderReview {
  id: number;
  userName: string;
  avatarUrl: string;
  isVerified: boolean;
  date: string;
  rating: number;
  text: string;
  purchases?: string[];
  purchaseImages?: string[];
}

export const placeholderReviews: PlaceholderReview[] = [
  {
    id: 1,
    userName: 'Pete W.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    isVerified: true,
    date: '2 days ago',
    rating: 5,
    text: 'Absolutely stunned by the ambiance and service. The truffle risotto was the best I\'ve had outside of Italy. Will be back next weekend for sure.',
    purchases: ['Truffle Risotto', 'Signature Steak', 'Old Fashioned'],
    purchaseImages: [
      'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop',
    ],
  },
  {
    id: 2,
    userName: 'Maria S.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face',
    isVerified: true,
    date: '5 days ago',
    rating: 4,
    text: 'Great food, great vibes. The DJ set on Friday nights is incredible. Only reason for 4 stars is the wait time — book a table in advance!',
    purchases: ['Lobster Pasta'],
  },
  {
    id: 3,
    userName: 'Jason K.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
    isVerified: false,
    date: '1 week ago',
    rating: 5,
    text: 'The happy hour deal through Yohop saved me nearly $40. Food quality was top-notch and the staff were super friendly.',
  },
  {
    id: 4,
    userName: 'Aisha T.',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
    isVerified: true,
    date: '2 weeks ago',
    rating: 4,
    text: 'Perfect spot for a date night. The chocolate soufflé is a must-try. Hoping they add outdoor seating soon.',
  },
];

export const placeholderRatingsSummary = {
  average: 4.7,
  totalReviews: 842,
  verifiedCount: 8,
  unverifiedCount: 2,
  distribution: { 5: 520, 4: 210, 3: 72, 2: 28, 1: 12 },
};

// ─── Media / News / PR (Backend: ❌ No News model) ─────────────
export interface PlaceholderArticle {
  id: number;
  source: string;
  sourceLogoUrl?: string;
  headline: string;
  excerpt: string;
  date: string;
  url: string;
  imageUrl?: string;
  type: 'news' | 'pr' | 'tv';
}

export const placeholderArticles: PlaceholderArticle[] = [
  {
    id: 1,
    source: 'Atlanta Magazine',
    headline: 'Atlanta Magazine Names Us Best Seafood Restaurant 2024',
    excerpt: 'The Oyster Bar continues to impress with its fresh daily catches and impeccable service...',
    date: 'Nov 1, 2024',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
    type: 'news',
  },
  {
    id: 2,
    source: 'Food Magazine',
    headline: 'Chef Michael on Sustainable Seafood Practices',
    excerpt: 'We sat down with Chef Michael to discuss his commitment to sustainable sourcing and ocean...',
    date: 'Oct 15, 2024',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&h=200&fit=crop',
    type: 'news',
  },
  {
    id: 3,
    source: 'Featured on TV',
    headline: 'Featured on Good Morning Atlanta',
    excerpt: 'Chef Michael demonstrates signature dishes on Good Morning Atlanta\'s cooking segment...',
    date: 'Sep 22, 2024',
    url: '#',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop',
    type: 'tv',
  },
];

// ─── Vibe Tags (Backend: ❌ No amenities/tags field) ───────────
export const placeholderVibeTags = [
  'ENERGIZED',
  'UPSCALE',
  'VALET PARKING',
  'LIVE DJ',
  'ROOFTOP',
];

// ─── Operating Hours (Backend: ❌ No hours field) ──────────────
export interface DayHours {
  day: string;
  shortDay: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export const placeholderHours: DayHours[] = [
  { day: 'Monday', shortDay: 'Mon', open: '11:00 AM', close: '10:00 PM', isClosed: false },
  { day: 'Tuesday', shortDay: 'Tue', open: '11:00 AM', close: '10:00 PM', isClosed: false },
  { day: 'Wednesday', shortDay: 'Wed', open: '11:00 AM', close: '11:00 PM', isClosed: false },
  { day: 'Thursday', shortDay: 'Thu', open: '11:00 AM', close: '11:00 PM', isClosed: false },
  { day: 'Friday', shortDay: 'Fri', open: '11:00 AM', close: '1:00 AM', isClosed: false },
  { day: 'Saturday', shortDay: 'Sat', open: '10:00 AM', close: '1:00 AM', isClosed: false },
  { day: 'Sunday', shortDay: 'Sun', open: '10:00 AM', close: '9:00 PM', isClosed: false },
];

// ─── "Things to Know" (Backend: partial — uses offerTerms + redemptionInstructions) ─
export const placeholderThingsToKnow = [
  'Reservations recommended for parties of 4+',
  'Smart casual dress code enforced after 8 PM',
  'Free valet parking available on weekends',
  'Private dining rooms available for events',
  'All menu items can be modified for dietary needs',
];
