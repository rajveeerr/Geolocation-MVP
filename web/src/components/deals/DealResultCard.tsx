// web/src/components/landing/DealResultCard.tsx
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

export const DealResultCard = ({ deal, isHovered, onMouseEnter, onMouseLeave }: DealResultCardProps) => {
  return (
    <motion.div
      onMouseEnter={() => onMouseEnter(deal.id)}
      onMouseLeave={onMouseLeave}
      className={cn(
        "flex gap-4 p-3 transition-colors duration-200 rounded-lg cursor-pointer",
        isHovered && "bg-neutral-100"
      )}
    >
      <img src={deal.image} alt={deal.name} className="w-24 h-24 rounded-md object-cover flex-shrink-0" />
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-neutral-800">{deal.name}</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
              <div className="flex items-center gap-0.5"><Star className="w-4 h-4 text-red-500 fill-current" /><span>{deal.rating}</span></div>
              <span>&middot;</span><span>{deal.category}</span><span>&middot;</span><span>{deal.price}</span>
            </div>
            <p className="text-sm text-neutral-500 mt-1">{deal.location}</p>
          </div>
          <Button variant="secondary" size="sm" className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 font-bold">
            DEAL
          </Button>
        </div>
        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{deal.description}</p>
      </div>
      <button className="p-2 text-neutral-400 hover:text-red-500 self-start"><Heart className="w-6 h-6" /></button>
    </motion.div>
  );
};