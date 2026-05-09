import { motion } from 'framer-motion';
import { ChefHat, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CateringItem } from '@/types/catering';

interface CateringItemCardProps {
  item: CateringItem;
  onClick: (item: CateringItem) => void;
}

const formatPrice = (item: CateringItem) => {
  if (item.pricingType === 'FIXED' && item.fixedPrice != null) {
    return { label: `$${item.fixedPrice.toFixed(2)}`, suffix: 'flat' };
  }
  return { label: `$${item.pricePerPerson.toFixed(2)}`, suffix: '/ person' };
};

const formatServing = (item: CateringItem) => {
  const parts: string[] = [];
  if (item.servesCount) parts.push(`Serves ${item.servesCount}`);
  parts.push(`Min ${item.minPeople}`);
  return parts.join(' · ');
};

export const CateringItemCard = ({ item, onClick }: CateringItemCardProps) => {
  const price = formatPrice(item);

  return (
    <motion.button
      type="button"
      onClick={() => onClick(item)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative flex w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-sm transition hover:border-neutral-300 hover:shadow-md"
    >
      <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-neutral-100 sm:h-36 sm:w-36">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ChefHat className="h-10 w-10 text-neutral-300" aria-hidden />
          </div>
        )}
        {item.isPopular && (
          <span className="absolute left-2 top-2 inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            Most ordered
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold text-neutral-900">{item.name}</h3>

        {(item.tags.length > 0 || item.packagingType) && (
          <div className="flex flex-wrap gap-1">
            {item.packagingType && (
              <span className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                {item.packagingType}
              </span>
            )}
            {item.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <p className={cn('text-xs text-neutral-500', item.description ? 'line-clamp-2' : 'invisible')}>
          {item.description || 'placeholder'}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <Users className="h-3 w-3" aria-hidden />
            {formatServing(item)}
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-neutral-900">{price.label}</span>
            <span className="ml-0.5 text-[11px] text-neutral-500">{price.suffix}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
};
