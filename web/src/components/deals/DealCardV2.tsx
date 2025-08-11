import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DealWithLocation } from '@/data/deals';

interface DealCardV2Props {
  deal: DealWithLocation;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export const DealCardV2 = ({
  deal,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: DealCardV2Props) => {
  const isOpen = deal.bookingInfo.toLowerCase().includes('sorry'); // Simple logic for status

  return (
    <motion.div
      onMouseEnter={() => onMouseEnter(deal.id)}
      onMouseLeave={onMouseLeave}
      className={cn(
        'cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 transition-all duration-300',
        'bg-white hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5',
        isHovered
          ? '-translate-y-1 border-primary/30 shadow-xl shadow-primary/10'
          : 'shadow-sm',
      )}
    >
      <div className="relative overflow-hidden">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-32 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-36 md:h-40"
        />
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
          <div
            className={cn(
              'rounded-full px-1.5 py-0.5 text-xs font-semibold backdrop-blur-sm sm:px-2 sm:py-1',
              isOpen
                ? 'border border-green-200 bg-green-500/20 text-green-700'
                : 'border border-red-200 bg-red-500/20 text-red-700',
            )}
          >
            {isOpen ? 'Open' : 'Closed'}
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="mb-1.5 flex items-start justify-between sm:mb-2">
          <h3 className="pr-2 text-base font-bold leading-tight text-neutral-800 sm:text-lg">
            {deal.name}
          </h3>
          <div className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-1.5 py-0.5 sm:px-2 sm:py-1">
            <Star className="h-3 w-3 fill-current text-amber-500 sm:h-4 sm:w-4" />
            <span className="text-xs font-semibold text-amber-700 sm:text-sm">
              {deal.rating}
            </span>
          </div>
        </div>
        <p className="text-xs font-medium text-neutral-600 sm:text-sm">
          {deal.category}
        </p>
        <p className="mt-1 text-xs text-neutral-500">{deal.location}</p>

        {/* Deal highlight section */}
        <div className="mt-2.5 border-t border-neutral-100 pt-2.5 sm:mt-3 sm:pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500 sm:h-2 sm:w-2"></div>
              <span className="text-xs font-semibold text-green-700 sm:text-sm">
                Deal Available
              </span>
            </div>
            <span className="text-sm font-bold text-primary">{deal.price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
