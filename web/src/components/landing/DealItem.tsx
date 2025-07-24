import { motion } from 'framer-motion';
import { Zap, Utensils, Coffee } from 'lucide-react';

interface DealItemProps {
  deal: {
    id: number;
    name: string;
    business: string;
    distance: string;
    position: L.LatLngExpression;
    category: string;
  };
  isHovered: boolean;
  onMouseEnter: (id: number) => void;
  onMouseLeave: () => void;
}

export const DealItem = ({
  deal,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: DealItemProps) => {
  return (
    <motion.div
      onMouseEnter={() => onMouseEnter(deal.id)}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.02, x: 5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2 transition-all duration-200 sm:gap-4 sm:p-3 ${isHovered ? 'border-brand-primary-200/80 bg-white/90 shadow-lg ring-1 ring-brand-primary-400/20 backdrop-blur-sm' : 'border-brand-primary-100/50 bg-white/60 backdrop-blur-sm'}`}
    >
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg sm:h-14 sm:w-14 ${deal.category === 'Food' ? 'bg-gradient-to-br from-accent-orange-100 to-accent-orange-200' : 'bg-gradient-to-br from-cyan-100 to-brand-primary-200'}`}
      >
        {deal.category === 'Food' ? (
          <Utensils className="h-6 w-6 text-accent-orange-600 sm:h-7 sm:w-7" />
        ) : (
          <Coffee className="h-6 w-6 text-brand-primary-600 sm:h-7 sm:w-7" />
        )}
      </div>
      <div className="flex-grow">
        <p className="text-sm font-semibold leading-tight text-neutral-text-primary sm:text-base">
          {deal.name}
        </p>
        <p className="text-xs text-neutral-text-secondary sm:text-sm">
          {deal.business}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center justify-end gap-1 text-xs font-bold text-green-600 sm:text-sm">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          <span>LIVE</span>
        </div>
        <p className="text-xs text-neutral-500 sm:text-sm">
          {deal.distance}
        </p>
      </div>
    </motion.div>
  );
};