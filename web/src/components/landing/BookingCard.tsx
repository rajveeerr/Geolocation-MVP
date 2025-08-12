// web/src/components/landing/BookingCard.tsx

import type { Deal } from './DealCard';
import { Heart, MapPin, Star } from 'lucide-react';

interface BookingCardProps {
  deal: Deal;
}

export const BookingCard = ({ deal }: BookingCardProps) => {
  return (
    <div className="flex-shrink-0 w-72 group">
      <div className="relative overflow-hidden rounded-xl">
        <img 
          src={deal.image} 
          alt={deal.name} 
          className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-0 right-0 p-3">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <h4 className="font-bold text-lg text-neutral-800">{deal.name}</h4>
        <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
          <div className="flex items-center gap-0.5">
            <Star className="w-4 h-4 text-red-500 fill-current" />
            <span className="font-semibold">{deal.rating.toFixed(1)}</span>
          </div>
          <span>&middot;</span>
          <span>{deal.category}</span>
          <span>&middot;</span>
          <span className="font-semibold">{deal.price}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
          <MapPin className="w-4 h-4" />
          <span>{deal.location}</span>
        </div>
      </div>
    </div>
  );
};