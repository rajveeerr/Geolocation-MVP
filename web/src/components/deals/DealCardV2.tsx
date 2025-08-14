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

export const DealCardV2 = ({ deal, isHovered, onMouseEnter, onMouseLeave }: DealCardV2Props) => {
  const isOpen = deal.bookingInfo.toLowerCase().includes('sorry'); // Simple logic for status

  return (
    <motion.div
      onMouseEnter={() => onMouseEnter(deal.id)}
      onMouseLeave={onMouseLeave}
      className={cn(
        "cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border border-neutral-200",
        "bg-white hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1",
        isHovered ? "shadow-xl shadow-primary/10 border-primary/30 -translate-y-1" : "shadow-sm"
      )}
    >
      <div className="relative overflow-hidden">
        <img 
          src={deal.image} 
          alt={deal.name} 
          className="w-full h-32 sm:h-36 md:h-40 object-cover transition-transform duration-300 hover:scale-105" 
        />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className={cn(
            "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold backdrop-blur-sm",
            isOpen ? "bg-green-500/20 text-green-700 border border-green-200" : "bg-red-500/20 text-red-700 border border-red-200"
          )}>
            {isOpen ? 'Open' : 'Closed'}
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
          <h3 className="font-bold text-neutral-800 text-base sm:text-lg leading-tight pr-2">{deal.name}</h3>
          <div className="flex items-center gap-1 flex-shrink-0 bg-amber-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-amber-200">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 fill-current" />
            <span className="text-xs sm:text-sm font-semibold text-amber-700">{deal.rating}</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium">{deal.category}</p>
        <p className="text-xs text-neutral-500 mt-1">{deal.location}</p>
        
        {/* Deal highlight section */}
        <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-semibold text-green-700">Deal Available</span>
            </div>
            <span className="text-sm font-bold text-primary">{deal.price}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};