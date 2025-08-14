import type { Deal } from '@/data/deals';
import { Heart, Star } from 'lucide-react';

interface CarouselCardProps {
  deal: Deal;
}

export const CarouselCard = ({ deal }: CarouselCardProps) => {
  return (
    <div className="group w-full">
      <div className="relative overflow-hidden rounded-xl aspect-square">
        <img 
          src={deal.image} 
          alt={deal.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {deal.tag && (
            <div className="absolute top-3 left-3 bg-white/90 rounded-md px-2 py-1 text-xs font-bold text-neutral-800 shadow-sm">
                {deal.tag}
            </div>
        )}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2">
        <div className="flex justify-between items-start">
            <h3 className="font-semibold text-neutral-800 pr-2 line-clamp-2">{deal.name}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
                <Star className="w-4 h-4 fill-current text-neutral-800" />
                <span className="text-sm">{deal.rating.toFixed(1)}</span>
            </div>
        </div>
        <p className="text-sm text-neutral-600">{deal.location}</p>
        <p className="text-sm text-neutral-800 mt-1"><span className="font-bold">From {deal.price}</span> / guest</p>
      </div>
    </div>
  );
}