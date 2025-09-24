// src/pages/merchant/MerchantDashboardPage.tsx
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { CalendarIcon, ClockIcon, DollarSign, Percent } from 'lucide-react';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ExploreDealsPreview } from '@/components/merchant/ExploreDealsPreview';

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
          <Percent className="h-4 w-4 text-brand-primary-600" />
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
  type DealStatusFilter = 'all' | 'active' | 'scheduled' | 'expired';
  const [activeFilter, setActiveFilter] = useState<DealStatusFilter>('all');

  const { data: merchantData, isLoading: merchantLoading } =
    useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;

  const {
    data: dealsData,
    isLoading: dealsLoading,
    error: dealsError,
  } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: Deal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const deals = dealsData?.data?.deals || [];
  const isLoading = dealsLoading;
  const error = dealsError;

  // Zero-state placeholders for future earnings integration
  const revenue = 0;
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(v);

  const filteredDeals = useMemo(() => {
    if (activeFilter === 'all') {
      return deals;
    }
    const now = new Date();
    return deals.filter((deal) => {
      const start = new Date(deal.startTime);
      const end = new Date(deal.endTime);
      switch (activeFilter) {
        case 'active':
          return now >= start && now <= end;
        case 'scheduled':
          return now < start;
        case 'expired':
          return now > end;
        default:
          return true;
      }
    });
  }, [deals, activeFilter]);

  if (merchantLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-64 rounded bg-neutral-200" />
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded bg-neutral-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        // The pending card provides a nice, colored container for our new section
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-amber-800">
            Application Pending
          </h2>
          <p className="mt-2 text-amber-700">
            Your application to become a merchant is currently under review. This usually takes 1-2 business days. We'll notify you via email once it's approved.
          </p>

          {/* This component now renders the ContentCarousel internally. */}
          <ExploreDealsPreview />
        </div>
      )}

      {merchantStatus === 'APPROVED' && (
        <>
          {/* KPI Row */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm text-neutral-500">Gross sales</h4>
                  <p className="mt-2 text-2xl font-extrabold text-neutral-900 flex items-baseline gap-2">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-neutral-100 text-neutral-700">
                      <DollarSign className="h-3 w-3" />
                    </span>
                    {formatCurrency(revenue)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">+ 4% vs yesterday</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div>
                <h4 className="text-sm text-neutral-500">Order Volume</h4>
                <p className="mt-2 text-2xl font-extrabold text-neutral-900">1,800</p>
                <p className="text-xs text-green-600 mt-1">+ 8% vs yesterday</p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div>
                <h4 className="text-sm text-neutral-500">Average Order Value</h4>
                <p className="mt-2 text-2xl font-extrabold text-neutral-900">{formatCurrency(revenue || 120)}</p>
                <p className="text-xs text-rose-500 mt-1">- 3% vs yesterday</p>
              </div>
              <div className="mt-4">
                <Link to={PATHS.MERCHANT_KICKBACKS}>
                  <Button size="sm" variant="ghost">View Kickback Earnings</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Region badges */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {[
              { name: 'Atlanta', value: 840, change: '+5.2%' },
              { name: 'Houston', value: 653, change: '+8.1%' },
              { name: 'Phoenix', value: 708, change: '+3.2%' },
              { name: 'Salt Lake City', value: 800, change: '+2.1%' },
              { name: 'San Diego', value: 820, change: '+1.4%' },
              { name: 'Chicago', value: 530, change: '+6.2%' },
              { name: 'Toronto', value: 980, change: '+4.3%' },
            ].map((r) => (
              <div key={r.name} className="rounded-md bg-neutral-900 px-4 py-2 text-white text-sm">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-neutral-200">{r.value} <span className="text-green-400 ml-2">{r.change}</span></div>
              </div>
            ))}
          </div>

          {/* Chart + Store List */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="col-span-2 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm text-neutral-600 mb-4">Sales (Last 7 days)</h4>
              <svg className="w-full h-56" viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
                <polyline fill="none" stroke="#3B82F6" strokeWidth="3" points="0,120 80,80 160,90 240,70 320,60 400,80 480,110 560,130 600,140" />
              </svg>
            </div>

            <div className="col-span-1 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm text-neutral-600 mb-4">Sales by Store</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Lemon & Sage Mediterranean Kitchen', value: 177, pct: '+2.3%' },
                  { name: 'Garden Grove Café & Bistro', value: 408, pct: '+7.4%' },
                  { name: 'Bella Vista Pizzeria & Pasta', value: 198, pct: '+1.2%' },
                  { name: 'Twilight Tavern & Lounge', value: 600, pct: '+5.8%' },
                ].map((s) => (
                  <li key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
                      <span className="text-sm text-neutral-800">{s.name}</span>
                    </div>
                    <div className="text-sm text-neutral-600">{s.value} <span className="text-green-500 ml-2">{s.pct}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <h2 className="text-2xl font-bold">Your Deals</h2>
              <div className="flex items-center gap-2 rounded-full border bg-neutral-100 p-1">
                {(
                  [
                    'all',
                    'active',
                    'scheduled',
                    'expired',
                  ] as DealStatusFilter[]
                ).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200',
                      activeFilter === filter
                        ? 'bg-white text-brand-primary-600 shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-200/50',
                    )}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <DealsSkeleton />
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-100 p-6">
                <p className="text-red-800">
                  Error loading deals. Please try again later.
                </p>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-white py-12 text-center">
                <h3 className="mb-2 text-xl font-semibold text-neutral-800">
                  {activeFilter === 'all'
                    ? 'No deals yet'
                    : `No ${activeFilter} deals found`}
                </h3>
                <p className="mb-6 text-neutral-600">
                  {activeFilter === 'all'
                    ? 'Create your first deal to start attracting customers'
                    : 'Try selecting a different filter to see your other deals.'}
                </p>
                {activeFilter === 'all' && (
                  <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                    <Button>Create Your First Deal</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDeals.map((deal) => (
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
