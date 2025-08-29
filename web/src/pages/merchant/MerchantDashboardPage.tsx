// src/pages/merchant/MerchantDashboardPage.tsx
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { CalendarIcon, ClockIcon, PercentIcon } from 'lucide-react';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';

interface Deal {
  id: string;
  title: string;
  description: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  startTime: string;
  endTime: string;
  redemptionInstructions: string;
  createdAt: string;
  merchant: {
    businessName: string;
    address: string;
  };
}

const DealCard = ({ deal }: { deal: Deal }) => {
  const isActive =
    new Date() >= new Date(deal.startTime) &&
    new Date() <= new Date(deal.endTime);
  const isExpired = new Date() > new Date(deal.endTime);

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <h3 className="text-xl font-semibold text-neutral-800">{deal.title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : isExpired
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isActive ? 'Active' : isExpired ? 'Expired' : 'Scheduled'}
        </span>
      </div>

      <p className="mb-4 text-neutral-600">{deal.description}</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <PercentIcon className="h-4 w-4 text-brand-primary-600" />
          <span className="font-medium">
            {deal.discountPercentage
              ? `${deal.discountPercentage}% OFF`
              : `$${deal.discountAmount} OFF`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">
            {new Date(deal.startTime).toLocaleDateString()} -{' '}
            {new Date(deal.endTime).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-neutral-500" />
          <span className="text-sm text-neutral-600">
            Created {new Date(deal.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-4">
        <p className="text-sm text-neutral-500">
          <strong>Redemption:</strong> {deal.redemptionInstructions}
        </p>
      </div>
    </div>
  );
};

const DealsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-lg border border-neutral-200 bg-white p-6"
      >
        <div className="mb-4 h-6 w-3/4 rounded bg-neutral-200" />
        <div className="mb-2 h-4 w-full rounded bg-neutral-200" />
        <div className="mb-4 h-4 w-2/3 rounded bg-neutral-200" />
        <div className="space-y-2">
          <div className="h-4 w-1/2 rounded bg-neutral-200" />
          <div className="h-4 w-2/3 rounded bg-neutral-200" />
          <div className="h-4 w-1/3 rounded bg-neutral-200" />
        </div>
      </div>
    ))}
  </div>
);

export const MerchantDashboardPage = () => {
  // Fetch merchant status from API
  const { data: merchantData, isLoading: merchantLoading } =
    useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;
  // Fetch merchant's deals (hook must run unconditionally; use `enabled` to control network call)
  const {
    data: dealsData,
    isLoading: dealsLoading,
    error: dealsError,
  } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: Deal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED', // Only fetch if we have status and it's approved
  });

  // Show loading state while fetching merchant status
  if (merchantLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-64 rounded bg-neutral-200" />
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded bg-neutral-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // If no merchant status, they're not a merchant yet
  if (!merchantStatus) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Join as a Merchant</h1>
          <p className="mb-8 text-neutral-600">
            Start creating deals and reach new customers
          </p>
          <Link to={PATHS.MERCHANT_ONBOARDING}>
            <Button size="lg">Become a Merchant</Button>
          </Link>
        </div>
      </div>
    );
  }

  const deals = dealsData?.data?.deals || [];
  const isLoading = dealsLoading;
  const error = dealsError;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Your Dashboard</h1>
          <p className="mt-2 text-neutral-600">
            Manage your deals and track performance
          </p>
        </div>
        {merchantStatus === 'APPROVED' && (
          <Link to={PATHS.MERCHANT_DEALS_CREATE}>
            <Button size="lg" className="rounded-lg">
              Create New Deal
            </Button>
          </Link>
        )}
      </div>

      {merchantStatus === 'PENDING' && (
        <div className="rounded-lg border border-amber-200 bg-amber-100 p-6">
          <h2 className="text-xl font-bold text-amber-800">
            Application Pending
          </h2>
          <p className="mt-2 text-amber-700">
            Your application to become a merchant is currently under review.
            We'll notify you via email once it's approved. This usually takes
            1-2 business days.
          </p>
        </div>
      )}

      {merchantStatus === 'APPROVED' && (
        <>
          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-medium text-neutral-500">
                Total Deals
              </h3>
              <p className="text-3xl font-bold text-neutral-800">
                {deals.length}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-medium text-neutral-500">
                Active Deals
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {
                  deals.filter((deal) => {
                    const now = new Date();
                    return (
                      now >= new Date(deal.startTime) &&
                      now <= new Date(deal.endTime)
                    );
                  }).length
                }
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-medium text-neutral-500">
                Scheduled
              </h3>
              <p className="text-3xl font-bold text-amber-600">
                {
                  deals.filter((deal) => new Date() < new Date(deal.startTime))
                    .length
                }
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-medium text-neutral-500">Expired</h3>
              <p className="text-3xl font-bold text-red-600">
                {
                  deals.filter((deal) => new Date() > new Date(deal.endTime))
                    .length
                }
              </p>
            </div>
          </div>

          {/* Deals Section */}
          <div className="mb-6">
            <h2 className="mb-4 text-2xl font-bold">Your Deals</h2>

            {isLoading ? (
              <DealsSkeleton />
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-100 p-6">
                <p className="text-red-800">
                  Error loading deals. Please try again later.
                </p>
              </div>
            ) : deals.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-white py-12 text-center">
                <h3 className="mb-2 text-xl font-semibold text-neutral-800">
                  No deals yet
                </h3>
                <p className="mb-6 text-neutral-600">
                  Create your first deal to start attracting customers
                </p>
                <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                  <Button>Create Your First Deal</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {deals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {merchantStatus === 'REJECTED' && (
        <div className="rounded-lg border border-red-200 bg-red-100 p-6">
          <h2 className="text-xl font-bold text-red-800">
            Application Not Approved
          </h2>
          <p className="mt-2 text-red-700">
            Unfortunately, your merchant application was not approved at this
            time. Please contact our support team if you have any questions or
            would like to reapply.
          </p>
          <div className="mt-4 space-x-3">
            <Link to="/contact">
              <Button variant="secondary">Contact Support</Button>
            </Link>
            <Link to={PATHS.MERCHANT_ONBOARDING}>
              <Button>Reapply</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
