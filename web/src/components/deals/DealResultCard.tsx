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
        'flex cursor-pointer gap-4 rounded-lg p-3 transition-colors duration-200',
        isHovered && 'bg-neutral-100',
      )}
    >
      <img
        src={deal.image}
        alt={deal.name}
        className="h-24 w-24 flex-shrink-0 rounded-md object-cover"
      />
      <div className="flex-grow">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-neutral-800">{deal.name}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600">
              <div className="flex items-center gap-0.5">
                <Star className="h-4 w-4 fill-current text-red-500" />
                <span>{deal.rating}</span>
              </div>
              <span>&middot;</span>
              <span>{deal.category}</span>
              <span>&middot;</span>
              <span>{deal.price}</span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">{deal.location}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="border-green-200 bg-green-100 font-bold text-green-700 hover:bg-green-200"
          >
            DEAL
          </Button>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {deal.description}
        </p>
      </div>
      <button className="self-start p-2 text-neutral-400 hover:text-red-500">
        <Heart className="h-6 w-6" />
      </button>
    </motion.div>
  );
};
