// web/src/components/landing/DealCard.tsx

import type { Deal } from '@/data/deals';
import { Heart, MapPin, Star } from 'lucide-react';


interface DealCardProps {
  deal: Deal;
}

export const DealCard = ({ deal }: DealCardProps) => {
  return (
    <div className="flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-neutral-50">
      <img
        src={deal.image}
        alt={deal.name}
        className="h-16 w-16 rounded-md object-cover"
      />
      <div className="flex-grow">
        <h4 className="font-semibold text-neutral-800">{deal.name}</h4>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
          <div className="flex items-center gap-0.5">
            <Star className="h-4 w-4 fill-current text-red-500" />
            <span>{deal.rating.toFixed(1)}</span>
          </div>
          <span>&middot;</span>
          <span>{deal.category}</span>
          <span>&middot;</span>
          <span>{deal.price}</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
          <MapPin className="h-4 w-4" />
          <span>{deal.location}</span>
        </div>
      </div>
      <button className="p-2 text-neutral-400 transition-colors hover:text-red-500">
        <Heart className="h-6 w-6" />
      </button>
    </div>
  );
};
