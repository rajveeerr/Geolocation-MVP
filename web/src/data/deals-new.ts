export interface Deal {
  id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  price: '$$' | '$$$' | '$';
  location: string;
  tag?: string;

  // --- NEW DEAL-SPECIFIC FIELDS ---
  dealType?: 'Discount' | 'Happy Hour' | 'Kickback';
  dealValue?: string; // e.g., "50% OFF", "$5 Per Friend"
  originalValue?: number;
  discountValue?: number;
  expiresAt?: string; // ISO String for countdown timer
}

// Function to get a future date for mock data
const getFutureDate = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export const premiumDeals: Deal[] = [
  {
    id: 'pd1',
    name: 'Echoes Living Room',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    rating: 4.6,
    category: 'Lounge',
    price: '$$$',
    location: 'Midtown, Atlanta',
    tag: 'Guest Favourite',
    dealType: 'Happy Hour',
    dealValue: '2-for-1 Drinks',
    expiresAt: getFutureDate(3), // Expires in 3 hours
  },
  {
    id: 'pd2',
    name: 'The Irish House',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
    rating: 4.4,
    category: 'Bar',
    price: '$$',
    location: 'Times Square, New York',
    tag: 'Top Rated',
    dealType: 'Discount',
    dealValue: '50% OFF',
    originalValue: 50,
    discountValue: 25,
    expiresAt: getFutureDate(26), // Expires in 26 hours
  },
  {
    id: 'pd3',
    name: 'Social',
    image:
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&q=80',
    rating: 4.1,
    category: 'Cafe',
    price: '$$',
    location: 'Rittenhouse Square, Philadelphia',
    dealType: 'Kickback',
    dealValue: '$5 Per Friend',
    expiresAt: getFutureDate(72), // Expires in 3 days
  },
  {
    id: 'pd4',
    name: 'Mai Bao',
    image:
      'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?w=500&q=80',
    rating: 4.0,
    category: 'Asian',
    price: '$',
    location: 'Downtown, Chicago',
    tag: 'New Deal',
    dealType: 'Discount',
    dealValue: '30% OFF',
    originalValue: 25,
    discountValue: 7.5,
    expiresAt: getFutureDate(8),
  },
];

// Export arrays for homepage use - all using premiumDeals
export const topRatedDeals: Deal[] = premiumDeals;
export const happyHourDeals: Deal[] = premiumDeals.filter(
  (d) => d.dealType === 'Happy Hour',
);
export const experiencesData: Deal[] = premiumDeals;
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
    name: 'Cafe Hawkers',
    image:
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&q=80',
    rating: 4.1,
    category: 'Cafe',
    price: '$$',
    location: 'Times Square, New York',
    position: [40.7589, -73.9851],
    description:
      "Today's special brew is 50% off until 4 PM. Unlock to reveal!",
    originalPrice: 12559,
    discountedPrice: 11659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
    dealType: 'Discount',
    dealValue: '50% OFF',
    originalValue: 20,
    discountValue: 10,
    expiresAt: getFutureDate(4),
  },
  {
    id: 'ad2',
    name: 'Out Of The Box Courtyard',
    image:
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    rating: 4.3,
    category: 'Multi-cuisine',
    price: '$$$',
    location: 'Broadway, New York',
    position: [40.7614, -73.9776],
    description:
      'Enjoy a free dessert with any main course. Perfect for a sunny afternoon.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
    dealType: 'Happy Hour',
    dealValue: 'Free Dessert',
    expiresAt: getFutureDate(12),
  },
  {
    id: 'ad3',
    name: 'Echoes Living Room',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    rating: 4.6,
    category: 'Lounge',
    price: '$$$',
    location: 'Midtown, Atlanta',
    position: [33.7849, -84.3841],
    description:
      'Happy Hour specials on all imported drinks from 5 PM to 7 PM.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
    dealType: 'Happy Hour',
    dealValue: '2-for-1 Drinks',
    expiresAt: getFutureDate(3),
  },
  {
    id: 'ad4',
    name: 'Mai Bao',
    image:
      'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?w=500&q=80',
    rating: 4.0,
    category: 'Asian',
    price: '$',
    location: 'Rittenhouse Square, Philadelphia',
    position: [39.9496, -75.1714],
    description: 'Quick lunch deal: Get a bao trio for the price of two.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
    dealType: 'Discount',
    dealValue: '30% OFF',
    originalValue: 25,
    discountValue: 7.5,
    expiresAt: getFutureDate(8),
  },
  {
    id: 'ad5',
    name: "The Passenger's Bar",
    image:
      'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=500&q=80',
    rating: 2.9,
    category: 'Bar',
    price: '$$',
    location: 'Downtown, Chicago',
    position: [41.8781, -87.6298],
    description:
      'Live music tonight! No cover charge. Check in for a complimentary shooter.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
    dealType: 'Kickback',
    dealValue: 'Free Entry',
    expiresAt: getFutureDate(18),
  },
];
