// web/src/components/deals/detail-tabs/BookRoomsTab.tsx
import { useState } from 'react';
import { Building2, Users, Tv, Wifi, Video, Coffee, Calendar } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';

interface BookRoomsTabProps {
  deal: DetailedDeal;
}

const ROOM_TYPES = [
  { id: 'all', label: 'All Spaces' },
  { id: 'conference', label: 'Conference Rooms' },
  { id: 'hotel', label: 'Hotel Rooms' },
  { id: 'private-dining', label: 'Private Dining' },
];

const MOCK_ROOMS = [
  {
    id: 1,
    name: 'Executive Boardroom',
    type: 'conference',
    capacity: 16,
    price: 150,
    duration: '2hr min',
    description: 'Premium boardroom perfect for executive meetings, presentations, and client...',
    features: [
      { icon: Users, label: 'Up to 16 people' },
      { icon: Tv, label: '85" 4K Display' },
      { icon: Video, label: 'Video Conference' },
      { icon: Wifi, label: 'High-speed WiFi' },
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
  },
  {
    id: 2,
    name: 'Innovation Suite',
    type: 'conference',
    capacity: 24,
    price: 200,
    duration: '3hr min',
    description: 'Modern collaborative workspace ideal for workshops, brainstorming sessions, and...',
    features: [
      { icon: Users, label: 'Up to 24 people' },
      { icon: Tv, label: 'Dual Displays' },
      { icon: Wifi, label: 'High-speed WiFi' },
      { icon: Coffee, label: 'Full Kitchen' },
    ],
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600',
  },
  {
    id: 3,
    name: 'Meeting Pod',
    type: 'conference',
    capacity: 6,
    price: 75,
    duration: '1hr min',
    description: 'Intimate meeting space perfect for small team huddles and one-on-one...',
    features: [
      { icon: Users, label: 'Up to 6 people' },
      { icon: Tv, label: 'Smart TV' },
      { icon: Wifi, label: 'WiFi' },
      { icon: Video, label: 'Video Ready' },
    ],
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
  },
];

export const BookRoomsTab = ({ deal }: BookRoomsTabProps) => {
  const [selectedType, setSelectedType] = useState('all');

  const filteredRooms = selectedType === 'all'
    ? MOCK_ROOMS
    : MOCK_ROOMS.filter(room => room.type === selectedType);

  return (
    <div className="space-y-6 relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
        <div className="bg-white rounded-2xl p-8 border-2 border-neutral-200 shadow-xl text-center max-w-md">
          <Building2 className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Coming Soon</h3>
          <p className="text-neutral-600 mb-6">
            The room booking feature is currently under development. Check back soon!
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Book a Room</h1>
        <p className="text-lg text-neutral-600">
          Reserve conference rooms, hotel accommodations, or private dining spaces for your next event.
        </p>
      </div>

      {/* Room Type Filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {ROOM_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
              selectedType === type.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="space-y-6 opacity-50 pointer-events-none">
        {selectedType === 'conference' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Conference Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
                      {room.capacity} people
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-xl mb-2">{room.name}</h4>
                    <p className="text-sm text-neutral-600 mb-4">{room.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-lg font-bold">${room.price}/hr</p>
                        <p className="text-xs text-neutral-500">{room.duration}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {room.features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                          <div key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                            <Icon className="h-4 w-4" />
                            <span>{feature.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      variant="primary"
                      className="w-full opacity-50 cursor-not-allowed"
                      disabled
                    >
                      View Details & Book
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

