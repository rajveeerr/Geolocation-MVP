// web/src/data/deals-placeholder.ts
import type { DealWithLocation } from './deals';

// This ApiDeal shape mirrors the backend payload used elsewhere in the app
export type ApiDeal = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  images?: string[];
  merchant: {
    businessName: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  discountPercentage?: number | null;
  discountAmount?: number | null;
  category: string;
  dealType?: 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING'; // Backend enum values
  startTime?: string;
  endTime?: string;
  offerDisplay?: string; // "FREE" | "50% OFF" | etc from backend
  offerTerms?: string; // fine print
  claimedBy?: { totalCount: number; visibleUsers: { avatarUrl: string }[] };
  rating?: number;
  price?: '$$' | '$$$' | '$';
  bookingInfo?: string;
  offers?: { title: string; time: string }[];
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

// Adapter function to convert an API deal into the format our components expect
export const adaptApiDealToUi = (apiDeal: ApiDeal): DealWithLocation => {
  // --- NEW: Dynamic Deal Value Logic ---
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
    // Handle category object with name, label, or value property
    categoryString = (apiDeal.category as any).name || 
                     (apiDeal.category as any).label || 
                     (apiDeal.category as any).value || 
                     'Restaurant';
  }

  return {
  id: apiDeal.id,
  name: apiDeal.title,
  image:
    apiDeal.imageUrl ||
    'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
  images:
    apiDeal.images && apiDeal.images.length > 0
      ? apiDeal.images
      : [apiDeal.imageUrl || 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80'],
  rating: apiDeal.rating ?? 4.2,
  category: categoryString,

  // Map required DealWithLocation fields
  price: apiDeal.price || '$$',
  location: apiDeal.merchant.address,
  description: apiDeal.description || '',
  position: [
    apiDeal.merchant.latitude ?? 40.7128,
    apiDeal.merchant.longitude ?? -74.006,
  ],

  // Add merchant information for dynamic display
  merchantName: apiDeal.merchant.businessName,
  merchantAddress: apiDeal.merchant.address,
  merchantLogo: apiDeal.merchant.logoUrl,

  // Map deal type from backend enum to frontend format
  dealType:
    apiDeal.dealType === 'HAPPY_HOUR'
      ? 'Happy Hour'
      : apiDeal.dealType === 'RECURRING'
        ? 'Recurring'
        : 'Discount',

  // Set expiration for happy hour deals - use endTime if it's a happy hour deal
  expiresAt:
    apiDeal.dealType === 'HAPPY_HOUR' && apiDeal.endTime
      ? apiDeal.endTime
      : undefined,

  // Map discount value for display
  // prefer explicit `offerDisplay` when provided by backend
  // Use the dynamically computed dealValue and also pass through raw discount fields
  dealValue: dealValue,
  discountPercentage: apiDeal.discountPercentage ?? null,
  discountAmount: apiDeal.discountAmount ?? null,

  // new fine-print + social proof passthrough
  offerTerms: apiDeal.offerTerms,
  claimedBy: apiDeal.claimedBy,
  // passthrough offers array when backend provides it, adapt to frontend Offer shape
  offers: apiDeal.offers
    ? apiDeal.offers.map((o) => ({ title: o.title, time: o.time, category: 'Drinks' as const }))
    : undefined,

  // Pricing fallbacks: if backend provides discountAmount/percentage try to use it
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
