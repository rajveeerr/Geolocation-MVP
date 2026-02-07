// web/src/data/deals-placeholder.ts
import type { DealWithLocation } from './deals';

// This ApiDeal shape mirrors the backend payload used elsewhere in the app
// The backend `formatDealForFrontend` passes dealType as the full Prisma
// relation object: { id, name, description, active }.  We accept either
// the object form or a plain string for backwards-compat with mock data.
export type ApiDeal = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  images?: string[];
  merchantId?: number | null;
  merchant: {
    id?: number | null;
    businessName: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    logoUrl?: string | null;
    phoneNumber?: string | null;
  };
  discountPercentage?: number | null;
  discountAmount?: number | null;
  category: string | { name: string; label?: string; value?: string };
  // Backend sends the full DealTypeMaster relation object
  dealType?: string | { id?: number; name: string; description?: string; active?: boolean };
  startTime?: string | null;
  endTime?: string | null;
  offerDisplay?: string;
  offerTerms?: string | null;
  claimedBy?: { totalCount: number; visibleUsers: { avatarUrl: string }[] };
  rating?: number;
  price?: '$$' | '$$$' | '$';
  bookingInfo?: string;
  offers?: { title: string; time: string }[];
  // Bounty / Hidden / Redeem fields the backend may include
  bountyRewardAmount?: number | null;
  minReferralsRequired?: number | null;
  accessCode?: string | null;
  recurringDays?: string | null;
  distance?: number;
  redemptionInstructions?: string;
};

// A small set of high-quality placeholder deals
export const placeholderDeals: DealWithLocation[] = [
  {
    id: 'ph1',
    name: 'The Corner Bistro (Sample)',
    image:
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&q=80',
    rating: 4.5,
    category: 'Cafe',
    price: '$$',
    location: 'Times Square, New York',
    position: [40.7589, -73.9851], // Centered on Times Square
    description:
      "This is a sample deal. Try searching for 'pizza' or changing your category to find live deals near you!",
    originalPrice: 100,
    discountedPrice: 80,
    bookingInfo: 'Call to reserve',
  },
  {
    id: 'ph2',
    name: 'Downtown Grille (Sample)',
    image:
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    rating: 4.8,
    category: 'Restaurant',
    price: '$$$',
    location: 'Broadway, New York',
    position: [40.7614, -73.9776],
    description:
      'A placeholder for a great happy hour special. Real deals will appear here when available.',
    originalPrice: 150,
    discountedPrice: 120,
    bookingInfo: 'Online booking available',
  },
];

// ── Helper: normalise the dealType from backend to a frontend-friendly string ──
function normalizeDealType(
  dt: ApiDeal['dealType'],
): string {
  if (!dt) return 'Discount';
  // Object form from Prisma relation
  const raw = typeof dt === 'string' ? dt : dt.name;
  const upper = raw.toUpperCase().replace(/\s+/g, '_');
  const map: Record<string, string> = {
    STANDARD: 'Discount',
    HAPPY_HOUR: 'Happy Hour',
    RECURRING: 'Recurring',
    BOUNTY_DEAL: 'Bounty Deal',
    BOUNTY: 'Bounty Deal',
    HIDDEN_DEAL: 'Hidden Deal',
    HIDDEN: 'Hidden Deal',
    REDEEM_NOW: 'Redeem Now',
  };
  return map[upper] || raw; // fall back to original name
}

// Adapter function to convert an API deal into the format our components expect
export const adaptApiDealToUi = (apiDeal: ApiDeal): DealWithLocation => {
  // --- Dynamic Deal Value Logic ---
  let dealValue: string | undefined = 'Special Offer';
  if (apiDeal.offerDisplay) {
    dealValue = apiDeal.offerDisplay;
  } else if (apiDeal.discountPercentage) {
    dealValue = `${apiDeal.discountPercentage}% OFF`;
  } else if (apiDeal.discountAmount) {
    dealValue = `$${apiDeal.discountAmount} OFF`;
  }

  // Handle category - can be string or object
  let categoryString: string = 'Restaurant';
  if (typeof apiDeal.category === 'string') {
    categoryString = apiDeal.category;
  } else if (apiDeal.category && typeof apiDeal.category === 'object') {
    categoryString = (apiDeal.category as any).name || 
                     (apiDeal.category as any).label || 
                     (apiDeal.category as any).value || 
                     'Restaurant';
  }

  // Handle images - backend returns both `images` array and `imageUrl` (singular)
  let imagesArray: string[] = [];
  if (apiDeal.images && Array.isArray(apiDeal.images) && apiDeal.images.length > 0) {
    imagesArray = apiDeal.images;
  } else if (apiDeal.imageUrl) {
    imagesArray = [apiDeal.imageUrl];
  } else {
    imagesArray = ['https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80'];
  }

  const normalizedType = normalizeDealType(apiDeal.dealType);

  // Parse recurringDays from comma-separated string to array
  let recurringDays: string[] | undefined;
  if (apiDeal.recurringDays) {
    recurringDays = apiDeal.recurringDays.split(',').map(s => s.trim().toUpperCase());
  }

  return {
    id: apiDeal.id,
    name: apiDeal.title,
    image: imagesArray[0] || 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    images: imagesArray,
    rating: apiDeal.rating ?? 4.2,
    category: categoryString,

    price: apiDeal.price || '$$',
    location: apiDeal.merchant.address,
    description: apiDeal.description || '',
    position: [
      apiDeal.merchant.latitude ?? 40.7128,
      apiDeal.merchant.longitude ?? -74.006,
    ],

    merchantId: apiDeal.merchantId ?? apiDeal.merchant.id ?? undefined,
    merchantName: apiDeal.merchant.businessName,
    merchantAddress: apiDeal.merchant.address,
    merchantLogo: apiDeal.merchant.logoUrl,

    dealType: normalizedType,

    // Set expiration / time window
    startTime: apiDeal.startTime ?? undefined,
    endTime: apiDeal.endTime ?? undefined,
    expiresAt: apiDeal.endTime ?? undefined,

    dealValue: dealValue,
    discountPercentage: apiDeal.discountPercentage ?? null,
    discountAmount: apiDeal.discountAmount ?? null,

    offerTerms: apiDeal.offerTerms ?? undefined,
    claimedBy: apiDeal.claimedBy,
    offers: apiDeal.offers
      ? apiDeal.offers.map((o) => ({ title: o.title, time: o.time, category: 'Drinks' as const }))
      : undefined,

    // Bounty / Hidden / Redeem extras
    bountyRewardAmount: apiDeal.bountyRewardAmount ?? null,
    minReferralsRequired: apiDeal.minReferralsRequired ?? null,
    recurringDays,

    // Pricing fallbacks
    originalPrice: 100,
    discountedPrice:
      apiDeal.discountAmount ??
      (apiDeal.discountPercentage
        ? Math.round(100 * (1 - apiDeal.discountPercentage / 100))
        : 80),
    bookingInfo: apiDeal.bookingInfo || 'Reservations available',
  };
};

// New universal adapter name for clarity across the app. Keep the old name for
// backwards compatibility.
export const adaptApiDealToFrontend = adaptApiDealToUi;

// Merge backend data into placeholders: replace existing ids, otherwise append.
export const mergeBackendDeals = (
  apiDeals: ApiDeal[] | undefined,
): DealWithLocation[] => {
  // If no backend deals provided, just return placeholders
  if (!Array.isArray(apiDeals) || apiDeals.length === 0)
    return placeholderDeals;

  const adapted = apiDeals.map(adaptApiDealToFrontend);

  // We want backend deals to render on top, so put adapted backend deals first
  // and then append placeholders that weren't replaced by backend entries.
  const backendIds = new Set(adapted.map((d) => d.id));
  const remainingPlaceholders = placeholderDeals.filter(
    (p) => !backendIds.has(p.id),
  );

  return [...adapted, ...remainingPlaceholders];
};
