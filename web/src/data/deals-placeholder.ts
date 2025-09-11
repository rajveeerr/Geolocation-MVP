// web/src/data/deals-placeholder.ts
import type { DealWithLocation } from './deals';

// This ApiDeal shape mirrors the backend payload used elsewhere in the app
export type ApiDeal = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  merchant: {
    businessName: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  discountPercentage?: number | null;
  discountAmount?: number | null;
  category: string;
  startTime?: string;
  endTime?: string;
  rating?: number;
  price?: '$$' | '$$$' | '$';
  bookingInfo?: string;
};

// A small set of high-quality placeholder deals
export const placeholderDeals: DealWithLocation[] = [
  {
    id: 'ph1',
    name: 'The Corner Bistro (Sample)',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&q=80',
    rating: 4.5,
    category: 'Cafe',
    price: '$$',
    location: 'Sample Neighborhood, USA',
    position: [40.7128, -74.006], // Centered on a default location
    description: "This is a sample deal. Try searching for 'pizza' or changing your category to find live deals near you!",
    originalPrice: 100,
    discountedPrice: 80,
    bookingInfo: "Call to reserve",
  },
  {
    id: 'ph2',
    name: 'Downtown Grille (Sample)',
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    rating: 4.8,
    category: 'Restaurant',
    price: '$$$',
    location: 'Main Street, USA',
    position: [40.7145, -74.0082],
    description: 'A placeholder for a great happy hour special. Real deals will appear here when available.',
    originalPrice: 150,
    discountedPrice: 120,
    bookingInfo: "Online booking available",
  },
];

// Adapter function to convert an API deal into the format our components expect
export const adaptApiDealToUi = (apiDeal: ApiDeal): DealWithLocation => ({
  id: apiDeal.id,
  name: apiDeal.title,
  image: apiDeal.imageUrl || 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
  rating: apiDeal.rating ?? 4.2,
  category: apiDeal.category || 'Restaurant',

  // Map required DealWithLocation fields
  price: apiDeal.price || '$$',
  location: apiDeal.merchant.address,
  description: apiDeal.description || '',
  position: [apiDeal.merchant.latitude ?? 40.7128, apiDeal.merchant.longitude ?? -74.006],

  // Pricing fallbacks: if backend provides discountAmount/percentage try to use it
  originalPrice: 100,
  discountedPrice:
    apiDeal.discountAmount ?? (apiDeal.discountPercentage ? Math.round(100 * (1 - apiDeal.discountPercentage / 100)) : 80),
  bookingInfo: apiDeal.bookingInfo || 'Reservations available',
});

// New universal adapter name for clarity across the app. Keep the old name for
// backwards compatibility.
export const adaptApiDealToFrontend = adaptApiDealToUi;

// Merge backend data into placeholders: replace existing ids, otherwise append.
export const mergeBackendDeals = (apiDeals: ApiDeal[] | undefined): DealWithLocation[] => {
  // If no backend deals provided, just return placeholders
  if (!Array.isArray(apiDeals) || apiDeals.length === 0) return placeholderDeals;

  const adapted = apiDeals.map(adaptApiDealToFrontend);

  // We want backend deals to render on top, so put adapted backend deals first
  // and then append placeholders that weren't replaced by backend entries.
  const backendIds = new Set(adapted.map((d) => d.id));
  const remainingPlaceholders = placeholderDeals.filter((p) => !backendIds.has(p.id));

  return [...adapted, ...remainingPlaceholders];
};
