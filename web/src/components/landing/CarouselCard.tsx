import type { Deal } from '@/data/deals';
import { Heart, Star } from 'lucide-react';

interface CarouselCardProps {
  deal: Deal;
}

export const CarouselCard = ({ deal }: CarouselCardProps) => {
  return (
    <div className="group w-full cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {deal.tag && (
          <div className="absolute left-2 sm:left-3 top-2 sm:top-3 rounded-md bg-white/95 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-bold text-neutral-800 shadow-sm">
            {deal.tag}
          </div>
        )}
        <button className="absolute right-2 sm:right-3 top-2 sm:top-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-black/40 hover:scale-110">
          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
      <div className="mt-2 sm:mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-neutral-800 leading-tight">
            {deal.name}
          </h3>
          <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current text-neutral-800" />
            <span className="text-xs sm:text-sm font-medium">{deal.rating.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 truncate">{deal.location}</p>
        <p className="mt-1 text-xs sm:text-sm text-neutral-800">
          <span className="font-bold">From {deal.price}</span> 
          <span className="text-neutral-500 ml-1">/ guest</span>
        </p>
      </div>
    </div>
  );
};
