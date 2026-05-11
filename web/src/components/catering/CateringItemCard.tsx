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
  const categoryLabel = (item.category || 'Catering').toUpperCase();
  const firstTag = item.tags?.[0];

  return (
    <motion.button
      type="button"
      onClick={() => onClick(item)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative w-full overflow-hidden rounded-2xl shadow-lg transition-shadow hover:shadow-xl"
      style={{ aspectRatio: '204.75 / 364' }}
    >
      {/* Full-bleed image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
          <ChefHat className="h-10 w-10 text-neutral-600" aria-hidden />
        </div>
      )}

      {/* Category badge — top left */}
      <div className="absolute left-3 top-3 z-10">
        <div className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-md">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[9px] font-bold uppercase leading-none tracking-wider text-white">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Price badge — top right */}
      <div className="absolute right-3 top-3 z-10 max-w-[55%]">
        <div className="flex flex-col items-end gap-0.5 rounded-full bg-black/65 px-2.5 py-1.5 text-right shadow-sm backdrop-blur-md">
          <span className="text-sm font-bold leading-none tabular-nums text-white">
            {price.label}
          </span>
          <span className="text-[9px] font-medium text-white/75">{price.suffix}</span>
        </div>
      </div>

      {/* "Most ordered" ribbon */}
      {item.isPopular && (
        <div className="absolute left-3 top-12 z-10">
          <span className="inline-flex items-center rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm">
            Most ordered
          </span>
        </div>
      )}

      {/* Bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col px-3 pb-3 pt-2 text-left">
        <h4 className="line-clamp-2 text-sm font-black uppercase leading-tight tracking-wide text-white">
          {item.name}
        </h4>

        {firstTag && (
          <p className="mt-0.5 line-clamp-1 text-[10px] uppercase tracking-wide text-white/55">
            {firstTag}
          </p>
        )}

        <p className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-white/75">
          <Users className="h-3 w-3 text-white/80" />
          {formatServing(item)}
        </p>

        {/* Action row */}
        <div className="mt-2.5 flex w-full items-center justify-center">
          <span
            className={cn(
              'flex max-w-full min-w-0 items-center justify-center gap-1.5 rounded-full py-2 pl-2 pr-2.5 transition-colors',
              'bg-white group-hover:bg-neutral-100',
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a1a2e]">
              <ChefHat className="h-3 w-3 text-white" />
            </span>
            <span className="min-w-0 truncate text-[10px] font-semibold leading-tight text-[#1a1a2e]">
              View &amp; order
            </span>
          </span>
        </div>
      </div>
    </motion.button>
  );
};
