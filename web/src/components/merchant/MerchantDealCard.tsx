// web/src/components/merchant/MerchantDealCard.tsx
import { Button } from '@/components/common/Button';
import { Edit, Clock, Tag, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Deal } from '@/data/deals';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

// Define the shape of the deal object as it comes from the /merchants/my-deals API
interface MerchantDeal {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string | null;
  startTime?: string;
  endTime?: string;
  discountPercentage?: number | null;
  discountAmount?: number | null;
}

// Helper to determine the status of the deal
const getDealStatus = (
  startTime: string,
  endTime: string,
): { text: string; className: string } => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) {
    return {
      text: 'Scheduled',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }
  if (now > end) {
    return {
      text: 'Expired',
      className: 'bg-red-100 text-red-800 border-red-200',
    };
  }
  return {
    text: 'Live',
    className: 'bg-green-100 text-green-800 border-green-200',
  };
};

export const MerchantDealCard = ({ deal }: { deal: MerchantDeal | Deal }) => {
  // Normalize fields so this component can be reused with both merchant API shape and frontend mock Deal
  const title =
    (deal as MerchantDeal).title ?? (deal as Deal).name ?? 'Untitled Deal';
  const description =
    (deal as MerchantDeal).description ?? (deal as Deal).dealValue ?? '';
  const imageUrl =
    (deal as MerchantDeal).imageUrl ?? (deal as Deal).image ?? null;

  // startTime / endTime may not exist on the frontend Deal shape; guard with 'in' checks
  const startTime =
    'startTime' in (deal as any) && (deal as any).startTime
      ? (deal as any).startTime
      : new Date().toISOString();

  const endTime =
    'endTime' in (deal as any) && (deal as any).endTime
      ? (deal as any).endTime
      : 'expiresAt' in (deal as any) && (deal as any).expiresAt
        ? (deal as any).expiresAt
        : new Date().toISOString();

  const status = getDealStatus(startTime, endTime);
  const offerText = (deal as MerchantDeal).discountPercentage
    ? `${(deal as MerchantDeal).discountPercentage}% OFF`
    : (deal as MerchantDeal).discountAmount
      ? `$${(deal as MerchantDeal).discountAmount} OFF`
      : (deal as Deal).dealValue
        ? (deal as Deal).dealValue
        : 'Special Offer';

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg sm:flex-row">
      <div className="relative h-48 w-full overflow-hidden sm:h-auto sm:w-56">
        <img
          src={
            imageUrl ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80'
          }
          alt={title}
          className="h-full w-full object-cover"
        />
        {/* Top-center time badge to keep cards uniform */}
        <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
          <div className="rounded-lg bg-white/95 px-3 py-1 text-sm font-semibold shadow-md backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-600" />
              <span className="text-sm text-neutral-700">
                Runs until {new Date(endTime).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-6">
        <div className="mb-2 flex items-start justify-between">
          <h3 className="text-xl font-bold text-neutral-900 transition-colors group-hover:text-brand-primary-600">
            {title}
          </h3>
          <span
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-bold',
              status.className,
            )}
          >
            {status.text}
          </span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-neutral-500">
          {description}
        </p>

        <div className="mt-auto space-y-3 border-t border-neutral-100 pt-4">
          <div className="flex items-center gap-3 text-sm text-neutral-700">
            <Tag className="h-4 w-4 text-brand-primary-600" />
            <span className="font-semibold">{offerText}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-700">
            <Clock className="h-4 w-4 text-neutral-500" />
            <span>Runs until {new Date(endTime).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Link to={PATHS.MERCHANT_DASHBOARD} className="inline-block">
            <Button variant="secondary" size="sm" className="rounded-lg">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-neutral-600"
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
};
