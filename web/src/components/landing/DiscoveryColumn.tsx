// web/src/components/landing/DiscoveryColumn.tsx
import { Link } from 'react-router-dom';
import { Heart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/common/Button';
import type { Deal } from '@/data/deals';
import { PATHS } from '@/routing/paths';

// A single item in the list
const DiscoveryItem = ({ deal }: { deal: Deal }) => (
  <Link
    to={`/deals/${deal.id}`}
    className="group flex items-center gap-4 px-1 py-3"
  >
    <img
      src={deal.image}
      alt={deal.name}
      className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
    />
    <div className="min-w-0 flex-grow">
      <h4 className="truncate font-bold text-neutral-800 transition-colors group-hover:text-brand-primary-600">
        {deal.name}
      </h4>
      <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
        <Star className="h-4 w-4 fill-current text-brand-primary-500" />
        <span className="font-semibold">{deal.rating.toFixed(1)}</span>
        <span className="truncate">
          ({typeof deal.category === 'string' 
            ? deal.category 
            : deal.category?.label || deal.category?.name || 'Category'}) &middot; {deal.price}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
        <MapPin className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{deal.location}</span>
      </div>
    </div>
    <button className="flex-shrink-0 p-2 text-neutral-400 transition-colors hover:text-red-500">
      <Heart className="h-5 w-5" />
    </button>
  </Link>
);

interface DiscoveryColumnProps {
  title: string;
  icon: React.ReactNode;
  deals: Deal[];
  ctaPath?: string;
}

export const DiscoveryColumn = ({
  title,
  icon,
  deals,
  ctaPath = PATHS.ALL_DEALS,
}: DiscoveryColumnProps) => {
  return (
    <div className="flex w-full max-w-sm flex-1 flex-col rounded-2xl border border-neutral-200/80 bg-white shadow-md">
      <div className="relative flex-shrink-0 py-6 text-center">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-lg">
            {icon}
          </div>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-neutral-900">
          {title}
        </h3>
      </div>
      <div className="flex-1 overflow-hidden px-4 pb-4">
        <div className="divide-y divide-neutral-200/60">
          {deals.slice(0, 5).map(
            (
              deal, // Show top 5 items
            ) => (
              <DiscoveryItem key={deal.id} deal={deal} />
            ),
          )}
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-neutral-200/60 p-4 text-center">
        <Link to={ctaPath}>
          <Button
            variant="secondary"
            size="md"
            className="rounded-lg font-semibold"
          >
            See All
          </Button>
        </Link>
      </div>
    </div>
  );
};
