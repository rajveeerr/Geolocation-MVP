import type { DealWithLocation } from './deals';

// ApiDeal shape mirrors the backend payload used elsewhere in the app
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

// A small set of placeholder deals (lightweight copy of existing app mock data)
export const placeholderDeals: DealWithLocation[] = [
  {
    id: 'ph1',
    name: 'Placeholder Cafe',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&q=80',
    rating: 4.1,
    category: 'Cafe',
    price: '$$',
    location: 'Sample Neighborhood',
    position: [40.7128, -74.006],
    description: "Today's sample deal: 20% off",
    originalPrice: 100,
    discountedPrice: 80,
    bookingInfo: "Call to reserve",
  },
  {
    id: 'ph2',
    name: 'Placeholder Bistro',
    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    rating: 4.3,
    category: 'Restaurant',
    price: '$$$',
    location: 'Sample Street',
    position: [40.7145, -74.0082],
    description: 'Sample happy hour special',
    originalPrice: 150,
    discountedPrice: 120,
    bookingInfo: "Online booking available",
  },
];

// Adapter reused to convert ApiDeal -> DealWithLocation
export const adaptApiDealToUi = (apiDeal: ApiDeal): DealWithLocation => ({
  id: apiDeal.id,
  name: apiDeal.title,
  image: apiDeal.imageUrl || 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
  rating: apiDeal.rating ?? 4.2,
  category: apiDeal.category || 'Restaurant',
  price: apiDeal.price || '$$',
  location: apiDeal.merchant.address,
  description: apiDeal.description,
  position: [apiDeal.merchant.latitude ?? 40.7128, apiDeal.merchant.longitude ?? -74.006],
  originalPrice: 100,
  discountedPrice: 80,
  bookingInfo: apiDeal.bookingInfo || 'Reservations available',
});

// Merge backend data into placeholders: replace existing ids, otherwise append.
export const mergeBackendDeals = (apiDeals: ApiDeal[] | undefined): DealWithLocation[] => {
  // If no backend deals provided, just return placeholders
  if (!Array.isArray(apiDeals) || apiDeals.length === 0) return placeholderDeals;

  const adapted = apiDeals.map(adaptApiDealToUi);

  // We want backend deals to render on top, so put adapted backend deals first
  // and then append placeholders that weren't replaced by backend entries.
  const backendIds = new Set(adapted.map((d) => d.id));
  const remainingPlaceholders = placeholderDeals.filter((p) => !backendIds.has(p.id));

  return [...adapted, ...remainingPlaceholders];
};
