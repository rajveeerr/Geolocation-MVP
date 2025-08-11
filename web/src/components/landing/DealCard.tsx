// web/src/components/landing/DealCard.tsx

import type { Deal } from '@/data/deals';
import { Heart, MapPin, Star } from 'lucide-react';

interface DealCardProps {
  deal: Deal;
}

export const DealCard = ({ deal }: DealCardProps) => {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-4 transition-colors hover:bg-neutral-50 sm:gap-4 sm:px-2 sm:py-3">
      <img
        src={deal.image}
        alt={deal.name}
        className="h-14 w-14 flex-shrink-0 rounded-md object-cover sm:h-16 sm:w-16"
      />
      <div className="min-w-0 flex-grow">
        <h4 className="truncate font-semibold text-neutral-800 sm:text-base">
          {deal.name}
        </h4>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-neutral-600 sm:gap-2">
          <div className="flex items-center gap-0.5">
            <Star className="h-4 w-4 fill-current text-red-500" />
            <span>{deal.rating.toFixed(1)}</span>
          </div>
          <span className="hidden sm:inline">&middot;</span>
          <span className="truncate">{deal.category}</span>
          <span className="hidden sm:inline">&middot;</span>
          <span className="font-medium text-green-600">{deal.price}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{deal.location}</span>
        </div>
      </div>
      <button className="flex-shrink-0 p-2 text-neutral-400 transition-colors hover:text-red-500">
        <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    </div>
  );
};
