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
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {/* Absolute countdown - keeps card heights consistent */}
        {shouldShowCountdown && (
          <div
            className={cn(
              'w-minw absolute left-1/2 top-3 z-10 -translate-x-1/2',
              isExpiringSoon ? '' : '',
            )}
          >
            <div
              className={cn(
                'mx-auto flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold',
                isExpiringSoon
                  ? 'border border-red-200 bg-red-50 text-red-700'
                  : 'border border-amber-200 bg-amber-50 text-amber-700',
              )}
            >
              <Clock4 className="h-4 w-4" />
              <span>
                {days > 0 && `${days}d `}
                {String(hours).padStart(2, '0')}:
                {String(minutes).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
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
            <Star className="h-5 w-5 fill-current text-amber-500" />
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

        {/* Countdown moved above image as an absolute overlay for consistent card heights */}
      </div>
    </motion.div>
  );
};

export default PremiumDealCard;
