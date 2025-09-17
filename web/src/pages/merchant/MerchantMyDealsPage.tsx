import { Button } from '@/components/common/Button';
import { Plus, Loader2, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { MerchantDealCard } from '@/components/merchant/MerchantDealCard';

interface MerchantDeal {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  startTime: string;
  endTime: string;
  discountPercentage?: number | null;
  discountAmount?: number | null;
}

export const MerchantMyDealsPage = () => {
  // Use react-query to fetch the deals for the logged-in merchant
  const {
    data: dealsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['my-merchant-deals'],
    queryFn: () => apiGet<MerchantDeal[]>('/merchants/my-deals'),
  });

  const deals = dealsResponse?.data || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Deals</h1>
          <p className="mt-1 text-neutral-600">
            Manage all your active, scheduled, and expired deals.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_DEALS_CREATE}>
          <Button size="md" className="rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create New Deal
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
          <p className="ml-4 text-neutral-600">Loading your deals...</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-100 p-6 text-center text-red-800">
          <p>Error loading your deals. Please try again later.</p>
        </div>
      )}

      {!isLoading && !error && deals.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 py-16 text-center">
          <div className="mx-auto h-12 w-12 text-neutral-400">
            <Tag />
          </div>
          <h2 className="mt-4 text-xl font-bold text-neutral-800">
            You haven't created any deals yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-neutral-500">
            Click the "Create New Deal" button to get started and attract new
            customers to your business.
          </p>
        </div>
      )}

      {!isLoading && !error && deals.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {deals.map((deal) => (
            <MerchantDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
};
