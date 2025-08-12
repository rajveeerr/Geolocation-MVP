// web/src/components/landing/DealCard.tsx

import { Heart, MapPin, Star } from 'lucide-react';

export interface Deal {
  id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  price: '$$' | '$$$' | '$';
  location: string;
}

interface DealCardProps {
  deal: Deal;
}

export const DealCard = ({ deal }: DealCardProps) => {
  return (
    <div className="flex items-center gap-4 py-3 px-2 rounded-lg transition-colors hover:bg-neutral-50">
      <img src={deal.image} alt={deal.name} className="w-16 h-16 rounded-md object-cover" />
      <div className="flex-grow">
        <h4 className="font-semibold text-neutral-800">{deal.name}</h4>
        <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
          <div className="flex items-center gap-0.5">
            <Star className="w-4 h-4 text-red-500 fill-current" />
            <span>{deal.rating.toFixed(1)}</span>
          </div>
          <span>&middot;</span>
          <span>{deal.category}</span>
          <span>&middot;</span>
          <span>{deal.price}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-1">
          <MapPin className="w-4 h-4" />
          <span>{deal.location}</span>
        </div>
      </div>
      <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
        <Heart className="w-6 h-6" />
      </button>
    </div>
  );
};