// web/src/components/landing/BookingCard.tsx

import type { Deal } from './DealCard';
import { Heart, MapPin, Star } from 'lucide-react';

interface BookingCardProps {
  deal: Deal;
}

export const BookingCard = ({ deal }: BookingCardProps) => {
  return (
    <div className="group w-72 flex-shrink-0">
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-80 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute right-0 top-0 p-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30">
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="mt-3">
        <h4 className="text-lg font-bold text-neutral-800">{deal.name}</h4>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
          <div className="flex items-center gap-0.5">
            <Star className="h-4 w-4 fill-current text-red-500" />
            <span className="font-semibold">{deal.rating.toFixed(1)}</span>
          </div>
          <span>&middot;</span>
          <span>{deal.category}</span>
          <span>&middot;</span>
          <span className="font-semibold">{deal.price}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin className="h-4 w-4" />
          <span>{deal.location}</span>
        </div>
      </div>
    </div>
  );
};
