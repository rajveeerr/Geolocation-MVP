import type { Deal } from '@/data/deals';
import { Heart, Star } from 'lucide-react';

interface CarouselCardProps {
  deal: Deal;
}

export const CarouselCard = ({ deal }: CarouselCardProps) => {
  return (
    <div className="group w-full">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {deal.tag && (
          <div className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-xs font-bold text-neutral-800 shadow-sm">
            {deal.tag}
          </div>
        )}
        <button className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-colors hover:bg-black/40">
          <Heart className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-2 pr-2 font-semibold text-neutral-800">
            {deal.name}
          </h3>
          <div className="flex flex-shrink-0 items-center gap-1">
            <Star className="h-4 w-4 fill-current text-neutral-800" />
            <span className="text-sm">{deal.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-sm text-neutral-600">{deal.location}</p>
        <p className="mt-1 text-sm text-neutral-800">
          <span className="font-bold">From {deal.price}</span> / guest
        </p>
      </div>
    </div>
  );
};
