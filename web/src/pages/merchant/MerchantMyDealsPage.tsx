import { Button } from '@/components/common/Button';
import { Plus, Loader2, Tag, CalendarIcon, ClockIcon, DollarSign, Percent, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';

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

const DealCard = ({ deal, onEdit, onDelete }: { 
  deal: Deal; 
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}) => {
  const isActive =
    new Date() >= new Date(deal.startTime) &&
    new Date() <= new Date(deal.endTime);
  const isExpired = new Date() > new Date(deal.endTime);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

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

      <p className="mb-4 text-neutral-600 line-clamp-2">{deal.description}</p>

      <div className="mb-4 flex items-center gap-4 text-sm text-neutral-500">
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-4 w-4" />
          <span>{formatDate(deal.startTime)}</span>
        </div>
        <div className="flex items-center gap-1">
          <ClockIcon className="h-4 w-4" />
          <span>{formatTime(deal.startTime)} - {formatTime(deal.endTime)}</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        {deal.discountPercentage ? (
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
            <Percent className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {deal.discountPercentage}% OFF
            </span>
          </div>
        ) : deal.discountAmount ? (
          <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              ${deal.discountAmount} OFF
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          Created {formatDate(deal.createdAt)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(deal)}
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(deal)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const DealsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="h-6 w-3/4 rounded bg-neutral-200" />
          <div className="h-6 w-16 rounded-full bg-neutral-200" />
        </div>
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-2/3 rounded bg-neutral-200" />
        </div>
        <div className="mb-4 flex gap-4">
          <div className="h-4 w-20 rounded bg-neutral-200" />
          <div className="h-4 w-24 rounded bg-neutral-200" />
        </div>
        <div className="h-6 w-16 rounded bg-neutral-200" />
      </div>
    ))}
  </div>
);

const MerchantMyDealsContent = () => {
  const navigate = useNavigate();
  const { openModal } = useModal();
  type DealStatusFilter = 'all' | 'active' | 'scheduled' | 'expired';
  const [activeFilter, setActiveFilter] = useState<DealStatusFilter>('all');

  const { data: merchantData, isLoading: merchantLoading } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;

  // Use the same API endpoint as the dashboard
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

  const handleEdit = (deal: Deal) => {
    // Navigate to edit page - you might need to implement this route
    navigate(`/merchant/deals/${deal.id}/edit`);
  };

  const handleDelete = (deal: Deal) => {
    openModal({
      title: 'Delete Deal',
      content: `Are you sure you want to delete "${deal.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        // Implement delete functionality
        console.log('Delete deal:', deal.id);
      },
      variant: 'destructive'
    });
  };

  if (merchantLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-64 rounded bg-neutral-200" />
          <div className="mb-8 h-12 w-96 rounded bg-neutral-200" />
          <DealsSkeleton />
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

  if (merchantStatus === 'PENDING') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-amber-800">
            Application Pending
          </h2>
          <p className="mt-2 text-amber-700">
            Your application to become a merchant is currently under review. This usually takes 1-2 business days. We'll notify you via email once it's approved.
          </p>
        </div>
      </div>
    );
  }

  if (merchantStatus === 'REJECTED') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900">My Deals</h1>
          <p className="mt-2 text-neutral-600">
            Manage all your active, scheduled, and expired deals.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_DEALS_CREATE}>
          <Button size="lg" className="rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create New Deal
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
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

      {/* Deals Content */}
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
          <div className="mx-auto h-12 w-12 text-neutral-400">
            <Tag />
          </div>
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
            <DealCard 
              key={deal.id} 
              deal={deal} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const MerchantMyDealsPage = () => {
  return (
    <MerchantProtectedRoute fallbackMessage="Only merchants can view their deals. Please sign up as a merchant to access this feature.">
      <MerchantMyDealsContent />
    </MerchantProtectedRoute>
  );
};
