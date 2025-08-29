// src/components/landing/CompactDealCard.tsx
import type { Deal } from '@/data/deals';
import { Heart, Star, Clock } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { cn } from '@/lib/utils';

interface CompactDealCardProps {
  deal: Deal;
}

export const CompactDealCard = ({ deal }: CompactDealCardProps) => {
  const { hours, minutes } = useCountdown(deal.expiresAt || '');
  const showCountdown = deal.expiresAt && (hours > 0 || minutes > 0);

  return (
    <div className="group w-full cursor-pointer">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-100 shadow-sm ring-1 ring-neutral-200/50 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-brand-primary-300/30">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Tag */}
        {deal.tag && (
          <div className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-neutral-900 shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
            {deal.tag}
          </div>
        )}

        {/* Heart Button */}
        <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-red-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/50">
          <Heart className="h-4.5 w-4.5" />
        </button>

        {/* Countdown Badge */}
        {showCountdown && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
            <Clock className="h-3.5 w-3.5 text-red-500" />
            <span
              className={cn(
                'text-xs font-bold',
                hours < 1 ? 'text-red-600' : 'text-neutral-700',
              )}
            >
              {hours}h {minutes}m
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-bold leading-tight text-neutral-900 transition-colors duration-200 group-hover:text-brand-primary-600">
            {deal.name}
          </h3>
          <div className="flex flex-shrink-0 items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-neutral-700">
              {deal.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <p className="truncate text-sm text-neutral-500">{deal.location}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-bold text-brand-primary-600">
            {deal.dealValue}
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {deal.price}
          </span>
        </div>
      </div>
    </div>
  );
};
