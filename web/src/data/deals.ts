export interface Offer {
  title: string;
  time: string;
  category: 'Drinks' | 'Bites'; // <-- Add category
  imageUrl?: string; // <-- Add optional image
}

export interface Deal {
  id: string;
  name: string;
  image: string;
  images?: string[];
  rating: number;
  category: string;
  price: '$$' | '$$$' | '$';
  location: string;
  tag?: string;
  merchantId?: number | null;

  // --- NEW DEAL-SPECIFIC FIELDS ---
  dealType?: string | { name: string };
  dealValue?: string; // e.g., "50% OFF", "$5 Per Friend"
  offerTerms?: string; // new fine-print field from backend
  claimedBy?: {
    totalCount: number;
    visibleUsers: { avatarUrl?: string | null }[];
  };
  offers?: Offer[];
  originalValue?: number;
  discountValue?: number;
  discountPercentage?: number | null;
  discountAmount?: number | null;
  isBooking?: boolean;
  expiresAt?: string; // ISO String for countdown timer
  // Happy Hour specific fields
  startTime?: string; // ISO String for deal start time
  endTime?: string; // ISO String for deal end time
  recurringDays?: string[]; // Array of recurring days (e.g., ['MONDAY', 'TUESDAY'])
  status?: {
    isActive: boolean;
    isExpired: boolean;
    isUpcoming: boolean;
    timeRemaining?: {
      total: number;
      hours: number;
      minutes: number;
      formatted: string;
    };
  };
  
  // --- MERCHANT INFORMATION ---
  merchantId?: number;
  merchantName?: string;
  merchantAddress?: string;
  merchantLogo?: string;
  description?: string;
  
  // --- BOUNTY/REFERRAL FIELDS ---
  bountyRewardAmount?: number | null;
  minReferralsRequired?: number | null;
}

// Function to get a future date for mock data
const getFutureDate = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

// Simulate social proof for demo
const makeSocialProof = (count: number) => ({
  totalCount: count,
  visibleUsers: [
    { avatarUrl: 'https://i.pravatar.cc/80?img=12' },
    { avatarUrl: 'https://i.pravatar.cc/80?img=25' },
    { avatarUrl: 'https://i.pravatar.cc/80?img=33' },
  ],
});

// ─── 1. STANDARD DEAL ─────────────────────────────────────────────
// Classic discount deal — shows top capsule with pricing, discount pill
export const premiumDeals: Deal[] = [
  {
    id: 'pd1',
    name: 'Street Tacos Tuesday',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=80',
    ],
    rating: 4.6,
    category: 'Street Tacos',
    price: '$$',
    location: 'Midtown, Atlanta',
    dealType: 'Discount',
    dealValue: '38% OFF',
    originalValue: 4.0,
    discountPercentage: 38,
    discountAmount: null,
    expiresAt: getFutureDate(3),
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    endTime: getFutureDate(3),
    merchantId: 1,
    merchantName: 'Taco Rebellion',
    claimedBy: makeSocialProof(3),
  },

  // ─── 2. HAPPY HOUR DEAL ───────────────────────────────────────────
  // Time-limited deal — shows countdown timer, happy hour badge
  {
    id: 'pd2',
    name: '2-for-1 Craft Cocktails',
    image:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80',
    ],
    rating: 4.8,
    category: 'Cocktails',
    price: '$$$',
    location: 'Downtown, Chicago',
    dealType: 'Happy Hour',
    dealValue: '50% OFF',
    originalValue: 18.0,
    discountPercentage: 50,
    discountAmount: null,
    expiresAt: getFutureDate(2),
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: getFutureDate(2),
    merchantId: 2,
    merchantName: 'The Velvet Lounge',
    claimedBy: makeSocialProof(7),
  },

  // ─── 3. BOUNTY DEAL ──────────────────────────────────────────────
  // Referral-based deal — shows bounty badge, "$X per friend", cash reward
  {
    id: 'pd3',
    name: 'Earn Money for Every Friend',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80',
    ],
    rating: 4.5,
    category: 'Single Pass',
    price: '$$',
    location: 'Buckhead, Atlanta',
    dealType: 'Bounty Deal',
    dealValue: '$5 Per Friend',
    originalValue: 4.0,
    discountPercentage: 38,
    discountAmount: null,
    expiresAt: getFutureDate(5),
    startTime: getFutureDate(2.5),
    endTime: getFutureDate(5),
    merchantId: 3,
    merchantName: 'Bubble Salon',
    bountyRewardAmount: 80,
    minReferralsRequired: 4,
    claimedBy: makeSocialProof(3),
  },

  // ─── 4. HIDDEN DEAL ──────────────────────────────────────────────
  // Secret/mystery deal — shows SECRET badge, purple theming, surprise CTA
  {
    id: 'pd4',
    name: 'Mystery Box Surprise',
    image:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80',
    ],
    rating: 4.3,
    category: 'Mystery',
    price: '$$',
    location: 'Midtown, New York',
    dealType: 'Hidden Deal',
    dealValue: 'SURPRISE',
    expiresAt: getFutureDate(6),
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: getFutureDate(6),
    merchantId: 1,
    merchantName: 'The Vault NYC',
    claimedBy: makeSocialProof(12),
  },

  // ─── 5. REDEEM NOW DEAL ──────────────────────────────────────────
  // Flash sale — shows FLASH SALE badge, big percentage, "Treat me" CTA
  {
    id: 'pd5',
    name: 'Flash 40% Off Everything',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
    ],
    rating: 4.7,
    category: 'Brunch',
    price: '$$$',
    location: 'SoHo, New York',
    dealType: 'Redeem Now',
    dealValue: '40% OFF',
    originalValue: 25.0,
    discountPercentage: 40,
    discountAmount: 10.0,
    expiresAt: getFutureDate(1),
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    endTime: getFutureDate(1),
    merchantId: 2,
    merchantName: 'Brunch & Co.',
    claimedBy: makeSocialProof(22),
  },

  // ─── 6. RECURRING DEAL ───────────────────────────────────────────
  // Repeats on specific days — shows RECURRING badge, day chips
  {
    id: 'pd6',
    name: 'Wing Wednesday BOGO',
    image:
      'https://images.unsplash.com/photo-1527477396000-e27163b4bbed?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1527477396000-e27163b4bbed?w=800&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80',
    ],
    rating: 4.4,
    category: 'Wings',
    price: '$$',
    location: 'Decatur, Atlanta',
    dealType: 'Recurring',
    dealValue: 'BOGO',
    originalValue: 12.0,
    discountPercentage: 50,
    discountAmount: null,
    recurringDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    expiresAt: getFutureDate(48),
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    endTime: getFutureDate(48),
    merchantId: 3,
    merchantName: "Willy's Wing House",
    claimedBy: makeSocialProof(15),
  },

  // ─── 7. BOUNTY (Club variant) ────────────────────────────────────
  {
    id: 'pd7',
    name: 'Earn Money for Every Friend',
    image:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    ],
    rating: 4.2,
    category: 'Day Pass',
    price: '$$$',
    location: 'Midtown, Atlanta',
    dealType: 'Bounty Deal',
    dealValue: '$10 Per Friend',
    originalValue: 4.0,
    discountPercentage: 38,
    discountAmount: null,
    expiresAt: getFutureDate(4),
    startTime: getFutureDate(2.5),
    endTime: getFutureDate(4),
    merchantId: 1,
    merchantName: 'Club Electro',
    bountyRewardAmount: 80,
    minReferralsRequired: 8,
    claimedBy: makeSocialProof(3),
  },

  // ─── 8. STANDARD (Food variant) ──────────────────────────────────
  {
    id: 'pd8',
    name: 'Morning Rush Special',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
    ],
    rating: 4.4,
    category: 'Coffee',
    price: '$$',
    location: 'Times Square, New York',
    dealType: 'Discount',
    dealValue: '25% OFF',
    originalValue: 8.0,
    discountPercentage: 25,
    discountAmount: null,
    expiresAt: getFutureDate(6),
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: getFutureDate(6),
    merchantId: 2,
    merchantName: 'Blue Bottle Coffee',
    claimedBy: makeSocialProof(5),
  },
];

// Export arrays for homepage use
export const topRatedDeals: Deal[] = premiumDeals;
export const happyHourDeals: Deal[] = premiumDeals.filter(
  (d) => d.dealType === 'Happy Hour' || d.dealType === 'Redeem Now',
);
export const experiencesData: Deal[] = premiumDeals.filter(
  (d) => d.dealType === 'Bounty Deal' || d.dealType === 'Hidden Deal' || d.dealType === 'Recurring',
);
export const newDeals: Deal[] = premiumDeals;
export const bookTonightDeals: Deal[] = premiumDeals;

// For the /deals page - extended interface with additional fields
export interface DealWithLocation extends Deal {
  position: [number, number];
  description: string;
  originalPrice: number;
  discountedPrice: number;
  bookingInfo: string;
}

export const allDeals: DealWithLocation[] = [
  {
    id: 'ad1',
    name: 'Street Tacos Tuesday',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80',
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=900&q=80',
      'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=900&q=80',
    ],
    rating: 4.6,
    category: 'Street Tacos',
    price: '$$',
    location: 'Midtown, Atlanta',
    position: [33.7849, -84.3841],
    description: 'Authentic street tacos at 38% off — only today!',
    originalPrice: 4.0,
    discountedPrice: 2.5,
    bookingInfo: 'Walk-in only',
    dealType: 'Discount',
    dealValue: '38% OFF',
    originalValue: 4.0,
    discountPercentage: 38,
    expiresAt: getFutureDate(3),
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    endTime: getFutureDate(3),
    merchantId: 1,
    merchantName: 'Taco Rebellion',
    claimedBy: makeSocialProof(3),
  },
  {
    id: 'ad2',
    name: '2-for-1 Craft Cocktails',
    image:
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=900&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&q=80',
      'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=80',
    ],
    rating: 4.8,
    category: 'Cocktails',
    price: '$$$',
    location: 'Downtown, Chicago',
    position: [41.8781, -87.6298],
    description: 'Happy Hour specials on all craft cocktails.',
    originalPrice: 18.0,
    discountedPrice: 9.0,
    bookingInfo: 'Reservations recommended',
    dealType: 'Happy Hour',
    dealValue: '50% OFF',
    originalValue: 18.0,
    discountPercentage: 50,
    expiresAt: getFutureDate(2),
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: getFutureDate(2),
    merchantId: 2,
    merchantName: 'The Velvet Lounge',
    claimedBy: makeSocialProof(7),
  },
  {
    id: 'ad3',
    name: 'Earn Money for Every Friend',
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&q=80',
    ],
    rating: 4.5,
    category: 'Single Pass',
    price: '$$',
    location: 'Buckhead, Atlanta',
    position: [33.838, -84.3795],
    description: 'Bring friends, earn cash. $5 per qualifying friend.',
    originalPrice: 4.0,
    discountedPrice: 2.5,
    bookingInfo: 'Walk-in welcome',
    dealType: 'Bounty Deal',
    dealValue: '$5 Per Friend',
    originalValue: 4.0,
    discountPercentage: 38,
    expiresAt: getFutureDate(5),
    startTime: getFutureDate(2.5),
    endTime: getFutureDate(5),
    merchantId: 3,
    merchantName: 'Bubble Salon',
    bountyRewardAmount: 80,
    minReferralsRequired: 4,
    claimedBy: makeSocialProof(3),
  },
  {
    id: 'ad4',
    name: 'Mystery Box Surprise',
    image:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=900&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80',
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=900&q=80',
    ],
    rating: 4.3,
    category: 'Mystery',
    price: '$$',
    location: 'Midtown, New York',
    position: [40.7589, -73.9851],
    description: 'Secret deal revealed only at check-in!',
    originalPrice: 20,
    discountedPrice: 10,
    bookingInfo: 'Check in to unlock',
    dealType: 'Hidden Deal',
    dealValue: 'SURPRISE',
    expiresAt: getFutureDate(6),
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: getFutureDate(6),
    merchantId: 1,
    merchantName: 'The Vault NYC',
    claimedBy: makeSocialProof(12),
  },
  {
    id: 'ad5',
    name: 'Wing Wednesday BOGO',
    image:
      'https://images.unsplash.com/photo-1527477396000-e27163b4bbed?w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1527477396000-e27163b4bbed?w=900&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=900&q=80',
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=900&q=80',
    ],
    rating: 4.4,
    category: 'Wings',
    price: '$$',
    location: 'Decatur, Atlanta',
    position: [33.7748, -84.2963],
    description: 'Buy one get one free on all wings every Mon/Wed/Fri.',
    originalPrice: 12.0,
    discountedPrice: 6.0,
    bookingInfo: 'Walk-in welcome',
    dealType: 'Recurring',
    dealValue: 'BOGO',
    originalValue: 12.0,
    discountPercentage: 50,
    recurringDays: ['MONDAY', 'WEDNESDAY', 'FRIDAY'],
    expiresAt: getFutureDate(48),
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    endTime: getFutureDate(48),
    merchantId: 3,
    merchantName: "Willy's Wing House",
    claimedBy: makeSocialProof(15),
  },
];
