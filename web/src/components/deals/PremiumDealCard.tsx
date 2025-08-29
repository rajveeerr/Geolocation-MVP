// src/components/deals/PremiumDealCard.tsx
import { motion } from 'framer-motion';
import { Star, Clock4 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import type { Deal } from '@/data/deals';
import { useCountdown } from '@/hooks/useCountdown';
import { Separator } from '@/components/ui/separator';

interface PremiumDealCardProps {
  deal: Deal;
}

const CountdownSegment = ({
  value,
  label,
}: {
  value: number;
  label: string;
}) => (
  <div className="flex flex-col items-center">
    <span className="text-xl font-bold text-neutral-800 sm:text-2xl">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[10px] text-neutral-500 sm:text-xs">{label}</span>
  </div>
);

export const PremiumDealCard = ({ deal }: PremiumDealCardProps) => {
  // Always call useCountdown, but with a fallback date if not provided
  const targetDate =
    deal.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const countdown = useCountdown(targetDate);
  const { days = 0, hours = 0, minutes = 0 } = countdown || {};
  const isExpiringSoon = days < 1 && hours < 4;

  // Only show countdown if deal actually has an expiration date
  const shouldShowCountdown = Boolean(deal.expiresAt);

  return (
    <motion.div
      className="group w-full cursor-pointer overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Deal Header - Only show if deal has specific type and value */}
      {deal.dealType && deal.dealValue && (
        <div className="flex items-center justify-between bg-neutral-800 p-3 text-white sm:p-4">
          <div className="flex flex-col">
            <span className="text-xs font-semibold opacity-80 sm:text-sm">
              {deal.dealType.toUpperCase()}
            </span>
            <span className="text-lg font-bold text-amber-400 sm:text-xl">
              {deal.dealValue}
            </span>
          </div>
          <Button
            size="sm"
            className="h-9 rounded-lg bg-white font-bold text-neutral-800 hover:bg-neutral-200 sm:h-10"
          >
            Buy Now!
          </Button>
        </div>
      )}

      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content Body */}
      <div className="p-3 sm:p-4">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="line-clamp-2 pr-2 font-bold text-neutral-800 sm:text-lg">
            {deal.name}
          </h3>
          <div className="flex flex-shrink-0 items-center gap-1">
            <Star className="h-4 w-4 fill-current text-amber-500" />
            <span className="text-sm font-semibold">{deal.rating}</span>
          </div>
        </div>
        <p className="text-xs text-neutral-500 sm:text-sm">{deal.location}</p>

        {deal.tag && (
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            {deal.tag}
          </span>
        )}

        <Separator className="my-3 sm:my-4" />

        {/* Value Proposition - Only show if we have pricing data */}
        {deal.originalValue && deal.discountValue && deal.originalValue > 0 && (
          <div className="mb-3 grid grid-cols-3 divide-x divide-neutral-200 text-center sm:mb-4">
            <div className="pr-2">
              <p className="text-xs text-neutral-500">VALUE</p>
              <p className="text-sm font-bold sm:text-base">
                ${deal.originalValue.toFixed(2)}
              </p>
            </div>
            <div className="px-2">
              <p className="text-xs text-neutral-500">DISCOUNT</p>
              <p className="text-sm font-bold sm:text-base">
                {Math.round((deal.discountValue / deal.originalValue) * 100)}%
              </p>
            </div>
            <div className="pl-2">
              <p className="text-xs text-neutral-500">SAVE</p>
              <p className="text-sm font-bold sm:text-base">
                $
                {Math.max(0, deal.originalValue - deal.discountValue).toFixed(
                  2,
                )}
              </p>
            </div>
          </div>
        )}

        {/* Countdown - Only show if deal has expiration */}
        {shouldShowCountdown && (
          <div>
            <div
              className={cn(
                'mb-2 flex items-center gap-1 text-xs sm:text-sm',
                isExpiringSoon ? 'font-bold text-red-600' : 'text-neutral-600',
              )}
            >
              <Clock4 className="h-3.5 w-3.5" />
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
