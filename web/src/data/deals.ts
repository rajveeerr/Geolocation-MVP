// web/src/data/deals.ts
import type { Deal } from '@/components/landing/DealCard';

export const happyHourDeals: Deal[] = [
  {
    id: 'hh1',
    name: 'Brat House',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    rating: 3.7,
    category: 'Indian',
    price: '$',
    location: 'Rajinder Nagar',
  },
  {
    id: 'hh2',
    name: 'Xpose Lounge',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    rating: 4.2,
    category: 'Indian',
    price: '$$',
    location: 'Netaji Subhash Place',
  },
  {
    id: 'hh3',
    name: 'Yo! China',
    image:
      'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=400&q=80',
    rating: 3.9,
    category: 'Indian',
    price: '$',
    location: 'Janakpuri',
  },
];

export const topRatedDeals: Deal[] = [
  {
    id: 'tr1',
    name: 'You Mee - Greater Kailash',
    image:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80',
    rating: 4.5,
    category: 'Indian',
    price: '$',
    location: 'Greater Kailash',
  },
  {
    id: 'tr2',
    name: 'The Belgian Waffle Co',
    image:
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
    rating: 3.7,
    category: 'Indian',
    price: '$',
    location: 'Tagore Garden',
  },
  {
    id: 'tr3',
    name: 'Thyme - The Umrao',
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
    rating: 4.0,
    category: 'Indian',
    price: '$$',
    location: 'Kapashera',
  },
];

export const newDeals: Deal[] = [
  {
    id: 'nd1',
    name: 'Moti Mahal Delux',
    image:
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&q=80',
    rating: 4.3,
    category: 'Indian',
    price: '$$',
    location: 'South Extension',
  },
  {
    id: 'nd2',
    name: 'Cafe Hawkers',
    image:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400&q=80',
    rating: 4.1,
    category: 'Indian',
    price: '$',
    location: 'Connaught Place',
  },
  {
    id: 'nd3',
    name: 'Kampai',
    image:
      'https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=400&q=80',
    rating: 4.3,
    category: 'Indian',
    price: '$$$',
    location: 'Aerocity',
  },
];

export const bookTonightDeals: Deal[] = [
  {
    id: 'bt1',
    name: 'Chicago Pizza - Pushp Vihar',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    rating: 3.9,
    category: 'Italian',
    price: '$',
    location: 'Pushp Vihar',
  },
  {
    id: 'bt2',
    name: 'The Belgian Waffle Co - Saket',
    image:
      'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&q=80',
    rating: 3.5,
    category: 'Desserts',
    price: '$',
    location: 'Saket',
  },
  {
    id: 'bt3',
    name: 'Nanking',
    image:
      'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?w=500&q=80',
    rating: 4.0,
    category: 'Chinese',
    price: '$$',
    location: 'Vasant Kunj',
  },
  {
    id: 'bt4',
    name: 'The Belgian Waffle Co - Kirti Nagar',
    image:
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    rating: 3.4,
    category: 'Desserts',
    price: '$',
    location: 'Kirti Nagar',
  },
  {
    id: 'bt5',
    name: 'Raajsik - The Umrao',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80',
    rating: 3.7,
    category: 'Indian',
    price: '$$',
    location: 'Kapashera',
  },
];

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
    location: 'Connaught Place',
    position: [40.7128, -74.006],
    description:
      "Today's special brew is 50% off until 4 PM. Unlock to reveal!",
    originalPrice: 12559,
    discountedPrice: 11659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
  },
  {
    id: 'ad2',
    name: 'Out Of The Box Courtyard',
    image:
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=500&q=80',
    rating: 4.3,
    category: 'Multi-cuisine',
    price: '$$$',
    location: 'Connaught Place',
    position: [40.7145, -74.0082],
    description:
      'Enjoy a free dessert with any main course. Perfect for a sunny afternoon.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
  },
  {
    id: 'ad3',
    name: 'Echoes Living Room',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80',
    rating: 4.6,
    category: 'Lounge',
    price: '$$$',
    location: 'GTB Nagar',
    position: [40.7295, -73.9965],
    description:
      'Happy Hour specials on all imported drinks from 5 PM to 7 PM.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
  },
  {
    id: 'ad4',
    name: 'Mai Bao',
    image:
      'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?w=500&q=80',
    rating: 4.0,
    category: 'Asian',
    price: '$',
    location: 'Saket',
    position: [40.723, -73.993],
    description: 'Quick lunch deal: Get a bao trio for the price of two.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
  },
  {
    id: 'ad5',
    name: "The Passenger's Bar",
    image:
      'https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=500&q=80',
    rating: 2.9,
    category: 'Bar',
    price: '$$',
    location: 'Kailash Colony',
    position: [40.731, -74.0055],
    description:
      'Live music tonight! No cover charge. Check in for a complimentary shooter.',
    originalPrice: 11659,
    discountedPrice: 10659,
    bookingInfo: "Sorry, we don't currently have any tables available for 2.",
  },
];
