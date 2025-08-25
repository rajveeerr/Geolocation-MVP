// src/components/deals/PremiumDealCard.tsx
import { motion } from 'framer-motion';
import { Star, Clock4 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import type { Deal } from '@/data/deals';
import { useCountdown } from '@/hooks/useCountdown';
import { Separator } from '@/components/ui/separator';

interface PremiumDealCardProps { 
  deal: Deal 
}

const CountdownSegment = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
        <span className="text-xl sm:text-2xl font-bold text-neutral-800">{String(value).padStart(2, '0')}</span>
        <span className="text-[10px] sm:text-xs text-neutral-500">{label}</span>
    </div>
);

export const PremiumDealCard = ({ deal }: PremiumDealCardProps) => {
  // Always call useCountdown, but with a fallback date if not provided
  const targetDate = deal.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const countdown = useCountdown(targetDate);
  const { days = 0, hours = 0, minutes = 0 } = countdown || {};
  const isExpiringSoon = days < 1 && hours < 4;
  
  // Only show countdown if deal actually has an expiration date
  const shouldShowCountdown = Boolean(deal.expiresAt);

  return (
    <motion.div 
      className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/30"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
        {/* Deal Header - Only show if deal has specific type and value */}
        {deal.dealType && deal.dealValue && (
          <div className="bg-neutral-800 text-white p-3 sm:p-4 flex justify-between items-center">
              <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold opacity-80">{deal.dealType.toUpperCase()}</span>
                  <span className="text-lg sm:text-xl font-bold text-amber-400">{deal.dealValue}</span>
              </div>
              <Button size="sm" className="bg-white text-neutral-800 hover:bg-neutral-200 h-9 sm:h-10 rounded-lg font-bold">
                  Buy Now!
              </Button>
          </div>
        )}
        
        {/* Image */}
        <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
             <img src={deal.image} alt={deal.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-4">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-neutral-800 pr-2 line-clamp-2 sm:text-lg">{deal.name}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-sm font-semibold">{deal.rating}</span>
                </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">{deal.location}</p>
            
            {deal.tag && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                {deal.tag}
              </span>
            )}

            <Separator className="my-3 sm:my-4" />

            {/* Value Proposition - Only show if we have pricing data */}
            {deal.originalValue && deal.discountValue && deal.originalValue > 0 && (
                <div className="grid grid-cols-3 divide-x divide-neutral-200 text-center mb-3 sm:mb-4">
                    <div className="pr-2">
                      <p className="text-xs text-neutral-500">VALUE</p>
                      <p className="font-bold text-sm sm:text-base">${deal.originalValue.toFixed(2)}</p>
                    </div>
                    <div className="px-2">
                      <p className="text-xs text-neutral-500">DISCOUNT</p>
                      <p className="font-bold text-sm sm:text-base">{Math.round((deal.discountValue/deal.originalValue)*100)}%</p>
                    </div>
                    <div className="pl-2">
                      <p className="text-xs text-neutral-500">SAVE</p>
                      <p className="font-bold text-sm sm:text-base">${Math.max(0, deal.originalValue - deal.discountValue).toFixed(2)}</p>
                    </div>
                </div>
            )}

            {/* Countdown - Only show if deal has expiration */}
            {shouldShowCountdown && (
              <div>
                  <div className={cn("flex items-center gap-1 text-xs sm:text-sm mb-2", isExpiringSoon ? "text-red-600 font-bold" : "text-neutral-600")}>
                      <Clock4 className="w-3.5 h-3.5" />
                      <span>Time left to buy:</span>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-neutral-200 rounded-lg bg-neutral-100/70 p-2">
                      <CountdownSegment value={days} label="Days" />
                      <CountdownSegment value={hours} label="Hours" />
                      <CountdownSegment value={minutes} label="Min" />
                  </div>
              </div>
            )}
        </div>
    </motion.div>
  );
};

export default PremiumDealCard;
