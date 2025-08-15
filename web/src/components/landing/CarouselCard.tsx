import type { Deal } from '@/data/deals';
import { Heart, Star, MapPin } from 'lucide-react';

interface CarouselCardProps {
  deal: Deal;
}

export const CarouselCard = ({ deal }: CarouselCardProps) => {
  return (
    <div className="group w-full cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl shadow-sm transition-shadow duration-200 hover:shadow-md sm:rounded-2xl">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {deal.tag && (
          <div className="absolute left-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 text-xs font-bold text-neutral-800 shadow-sm backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2 sm:py-1">
            {deal.tag}
          </div>
        )}
        <button className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-red-500/90 hover:text-white sm:right-3 sm:top-3 sm:h-8 sm:w-8">
          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
      <div className="mt-2 sm:mt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-neutral-800 sm:text-base">
            {deal.name}
          </h3>
          <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
            <Star className="h-3.5 w-3.5 fill-current text-amber-500 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium text-amber-700 sm:text-sm">
              {deal.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-500 sm:mt-1 sm:text-sm">
          <MapPin className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="truncate">{deal.location}</span>
        </p>
        <p className="mt-1 text-xs text-neutral-800 sm:text-sm">
          <span className="font-bold">From <span className="text-sky-600">{deal.price}</span></span>
          <span className="ml-1 text-neutral-500">/ guest</span>
        </p>
      </div>
    </div>
  );
};
