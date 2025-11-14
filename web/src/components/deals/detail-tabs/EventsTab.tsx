// web/src/components/deals/detail-tabs/EventsTab.tsx
import { useState } from 'react';
import { Calendar, Music, Wine, ChefHat, Drumstick } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface EventsTabProps {
  deal: DetailedDeal;
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'wine', label: 'Wine', icon: Wine },
  { id: 'class', label: 'Class', icon: ChefHat },
  { id: 'special-dinner', label: 'Special Dinner', icon: Drumstick },
];

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Live Jazz Night',
    category: 'music',
    description: 'Enjoy smooth jazz with our house band while dining on our special tasting menu',
    date: 'November 15, 2025',
    time: '7:00 PM - 10:00 PM',
    spotsLeft: 12,
    totalSpots: 40,
    price: 85,
    coins: 42,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
  },
  {
    id: 2,
    title: 'Wine Pairing Dinner',
    category: 'wine',
    description: '5-course meal paired with exclusive wines from Napa Valley',
    date: 'November 18, 2025',
    time: '6:30 PM - 9:30 PM',
    spotsLeft: 8,
    totalSpots: 30,
    price: 125,
    coins: 62,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
  },
  {
    id: 3,
    title: 'Cooking Class: Pasta Making',
    category: 'class',
    description: 'Learn to make fresh pasta from scratch with our head chef',
    date: 'November 22, 2025',
    time: '2:00 PM - 5:00 PM',
    spotsLeft: 5,
    totalSpots: 16,
    price: 95,
    coins: 47,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
    almostFull: true,
  },
  {
    id: 4,
    title: 'Thanksgiving Feast',
    category: 'special-dinner',
    description: 'Traditional Thanksgiving dinner with a contemporary twist',
    date: 'November 28, 2025',
    time: '5:00 PM - 8:00 PM',
    spotsLeft: 18,
    totalSpots: 60,
    price: 110,
    coins: 55,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
  },
];

export const EventsTab = ({ deal }: EventsTabProps) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredEvents = selectedFilter === 'all'
    ? MOCK_EVENTS
    : MOCK_EVENTS.filter(e => e.category === selectedFilter);

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <Calendar className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The events feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Events Banner */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
        </div>
        <p className="text-red-100">
          Join us for exclusive dining experiences, cooking classes, and special celebrations. Earn bonus coins for attending!
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-colors',
                selectedFilter === filter.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
        {filteredEvents.map((event) => {
          const FilterIcon = FILTERS.find(f => f.id === event.category)?.icon || Calendar;
          return (
            <div
              key={event.id}
              className="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <FilterIcon className="h-4 w-4" />
                  <span className="text-xs font-semibold">{FILTERS.find(f => f.id === event.category)?.label}</span>
                </div>
                {event.almostFull && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                    Almost Full!
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-xl mb-2">{event.title}</h4>
                <p className="text-sm text-neutral-600 mb-4">{event.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <span>🕐</span>
                    <span>{event.time}</span>
                  </div>
                  <div className="text-sm text-neutral-700">
                    <span className="font-semibold">{event.spotsLeft} of {event.totalSpots} spots left</span>
                  </div>
                  <div className="text-lg font-bold text-neutral-900">
                    ${event.price} per person
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-600 font-semibold">
                    Earn {event.coins} loyalty coins when you attend
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    Register
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Private Events Section */}
      <div className="bg-white rounded-xl p-6 border border-neutral-200 opacity-50 pointer-events-none">
        <h3 className="text-xl font-bold mb-4">Host Your Private Event</h3>
        <p className="text-neutral-600 mb-4">
          {deal.merchant.businessName} offers customizable private dining experiences for groups of 10-100 guests. Perfect for celebrations, corporate events, and intimate gatherings.
        </p>
        <ul className="space-y-2 mb-6 text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Dedicated event coordinator</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Customizable menus and bar packages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Private dining rooms available</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>AV equipment and entertainment options</span>
          </li>
        </ul>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            variant="primary"
            disabled
            className="opacity-50 cursor-not-allowed"
          >
            Inquire About Private Events
          </Button>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Contact Events Team</p>
            <p className="text-sm text-neutral-600">events@{deal.merchant.businessName.toLowerCase().replace(/\s+/g, '')}.com</p>
            <p className="text-sm text-neutral-600">{deal.merchant.phoneNumber || '(555) 123-4568'}</p>
            <p className="text-xs text-neutral-500 mt-2">Response within 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

