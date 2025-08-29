// src/components/merchant/MerchantDealCard.tsx
import type { Deal } from '@/data/deals';
import { Button } from '@/components/common/Button';
import { Edit, Star, MapPin } from 'lucide-react';

interface MerchantDealCardProps {
  deal: Deal;
}

export const MerchantDealCard = ({ deal }: MerchantDealCardProps) => {
  const now = new Date();
  const expiresAt = deal.expiresAt ? new Date(deal.expiresAt) : null;
  const isExpired = expiresAt ? expiresAt <= now : false;
  const isLive = !isExpired && expiresAt; // If not expired and has expiry date, it's live

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-brand-primary-200 hover:shadow-lg sm:flex-row">
      <div className="relative">
        <img
          src={deal.image}
          alt={deal.name}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-auto sm:w-56"
        />
        {/* Status Badge */}
        <div className="absolute left-3 top-3">
          {isLive && (
            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
              Live
            </span>
          )}
          {isExpired && (
            <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-600">
              Expired
            </span>
          )}
          {!expiresAt && (
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              No Expiry
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-grow flex-col p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-grow">
            <h3 className="mb-2 text-xl font-bold text-neutral-900 transition-colors group-hover:text-brand-primary-600">
              {deal.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{deal.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <span>{deal.location}</span>
              </div>
              <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600">
                {deal.price}
              </span>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="ml-4 flex-shrink-0 rounded-xl"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="flex-grow">
          <p className="mb-2 text-base font-semibold text-brand-primary-600">
            {deal.dealValue || 'Special deal available'}
          </p>
          <p className="line-clamp-2 text-sm text-neutral-500">
            {deal.category} deal available
          </p>
        </div>

        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="text-xs font-medium text-neutral-500">
            {expiresAt
              ? `Expires on ${expiresAt.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}`
              : 'No expiration date'}
          </p>
        </div>
      </div>
    </div>
  );
};
