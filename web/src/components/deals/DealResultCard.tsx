import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DealWithLocation } from '@/data/deals';
import { Button } from '../common/Button';

interface DealResultCardProps {
  deal: DealWithLocation;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
}

export const DealResultCard = ({
  deal,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: DealResultCardProps) => {
  return (
    <motion.div
      onMouseEnter={() => onMouseEnter(deal.id)}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg p-3 transition-colors duration-200 sm:gap-4',
        isHovered && 'bg-neutral-100',
      )}
    >
      <img
        src={deal.image}
        alt={deal.name}
        className="h-20 w-20 flex-shrink-0 rounded-md object-cover sm:h-24 sm:w-24"
      />
      <div className="min-w-0 flex-grow">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-neutral-800 sm:text-lg">
              {deal.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-neutral-600 sm:gap-2">
              <div className="flex items-center gap-0.5">
                <Star className="h-4 w-4 fill-current text-red-500" />
                <span>{deal.rating}</span>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <span className="truncate">{deal.category}</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="font-medium text-sky-600">{deal.price}</span>
            </div>
            <p className="mt-1 truncate text-sm text-neutral-500">
              {deal.location}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <Button
              variant="secondary"
              size="sm"
              className="border-green-200 bg-green-100 text-xs font-bold text-green-700 hover:bg-green-200 sm:text-sm"
            >
              DEAL
            </Button>
            <button className="p-1 text-neutral-400 hover:text-red-500 sm:p-2">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {deal.description}
        </p>
      </div>
    </motion.div>
  );
};
