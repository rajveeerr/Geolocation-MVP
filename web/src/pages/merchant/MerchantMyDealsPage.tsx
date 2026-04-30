import { Button } from '@/components/common/Button';
import { Plus, Tag, CalendarIcon, ClockIcon, DollarSign, Percent, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  dealType?: {
    name?: string | null;
  } | null;
  category?: {
    name?: string | null;
  } | null;
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
    <div className="rounded-[1.45rem] border border-neutral-200/80 bg-white/95 p-6 shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="max-w-[80%] text-[1.05rem] font-semibold tracking-tight text-neutral-900">{deal.title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-[13px] font-medium ${
            isActive
              ? 'bg-emerald-100 text-emerald-800'
              : isExpired
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-800'
          }`}
        >
          {isActive ? 'Active' : isExpired ? 'Expired' : 'Scheduled'}
        </span>
      </div>

      <p className="mb-4 line-clamp-3 text-[13px] leading-6 text-neutral-600">{deal.description}</p>

      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-neutral-500">
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
          <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1">
            <Percent className="h-4 w-4 text-emerald-600" />
            <span className="text-[13px] font-semibold text-emerald-700">
              {deal.discountPercentage}% OFF
            </span>
          </div>
        ) : deal.discountAmount ? (
          <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span className="text-[13px] font-semibold text-emerald-700">
              ${deal.discountAmount} OFF
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <div className="text-xs text-neutral-500">
          Created {formatDate(deal.createdAt)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full border-neutral-200 bg-white px-4 text-[13px] text-neutral-700 hover:bg-neutral-50"
            onClick={() => onEdit(deal)}
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-3 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
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
      <div key={i} className="rounded-[1.45rem] border border-neutral-200/80 bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.045)]">
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
  type DealTypeFilter = 'all' | 'happy_hour' | 'standard' | 'recurring';
  type CategoryFilter = 'all' | 'food_beverage' | 'retail' | 'entertainment' | 'health_fitness' | 'beauty_wellness' | 'other';
  const panelClass =
    'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';
  
  const [activeFilter, setActiveFilter] = useState<DealStatusFilter>('all');
  const [activeDealType, setActiveDealType] = useState<DealTypeFilter>('all');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

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

  const isLoading = dealsLoading;
  const error = dealsError;

  const filteredDeals = useMemo(() => {
    const deals = dealsData?.data?.deals ?? [];
    let filtered = deals;

    // Filter by status (active, scheduled, expired)
    if (activeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter((deal) => {
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
    }

    // Filter by deal type
    if (activeDealType !== 'all') {
      filtered = filtered.filter((deal) => {
        const dealType = deal.dealType?.name?.toLowerCase() || 'standard';
        switch (activeDealType) {
          case 'happy_hour':
            return dealType.includes('happy') || dealType.includes('hour');
          case 'standard':
            return dealType.includes('standard') || dealType.includes('regular');
          case 'recurring':
            return dealType.includes('recurring');
          default:
            return true;
        }
      });
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((deal) => {
        const category = deal.category?.name?.toLowerCase() || 'other';
        switch (activeCategory) {
          case 'food_beverage':
            return category.includes('food') || category.includes('beverage') || category.includes('restaurant');
          case 'retail':
            return category.includes('retail') || category.includes('shopping');
          case 'entertainment':
            return category.includes('entertainment') || category.includes('movie') || category.includes('game');
          case 'health_fitness':
            return category.includes('health') || category.includes('fitness') || category.includes('gym');
          case 'beauty_wellness':
            return category.includes('beauty') || category.includes('wellness') || category.includes('spa');
          case 'other':
            return !['food', 'beverage', 'restaurant', 'retail', 'shopping', 'entertainment', 'movie', 'game', 'health', 'fitness', 'gym', 'beauty', 'wellness', 'spa'].some(keyword => category.includes(keyword));
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [dealsData?.data?.deals, activeFilter, activeDealType, activeCategory]);

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
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-1 sm:py-4">
      <div className="mb-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Commerce</div>
            <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">My Deals</h1>
            <p className="mt-2 max-w-2xl text-[13px] text-neutral-600 sm:text-sm">
              Manage active, scheduled, and expired promotions with a cleaner operating view.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={PATHS.MERCHANT_DEALS_CREATE}>
              <Button size="lg" className="w-full rounded-full bg-neutral-950 px-5 text-sm text-white hover:bg-neutral-800 sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create New Deal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className={cn(panelClass, 'mb-8 p-5 sm:p-6')}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-neutral-900">Filters</h3>
            <p className="mt-1 text-[13px] text-neutral-500">Refine by status, deal type, or category.</p>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-neutral-500">
            <span>Showing {filteredDeals.length} deals</span>
            {(activeFilter !== 'all' || activeDealType !== 'all' || activeCategory !== 'all') && (
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setActiveDealType('all');
                  setActiveCategory('all');
                }}
                className="font-medium text-neutral-700 transition hover:text-neutral-950"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-neutral-700">Status</label>
            <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as DealStatusFilter)}>
              <SelectTrigger className="h-11 w-full rounded-[1rem] border-neutral-200 bg-white text-[13px] shadow-sm">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-neutral-700">Deal Type</label>
            <Select value={activeDealType} onValueChange={(value) => setActiveDealType(value as DealTypeFilter)}>
              <SelectTrigger className="h-11 w-full rounded-[1rem] border-neutral-200 bg-white text-[13px] shadow-sm">
                <SelectValue placeholder="Select deal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="happy_hour">Happy Hour</SelectItem>
                <SelectItem value="standard">Item Deal</SelectItem>
                <SelectItem value="recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-medium text-neutral-700">Category</label>
            <Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as CategoryFilter)}>
              <SelectTrigger className="h-11 w-full rounded-[1rem] border-neutral-200 bg-white text-[13px] shadow-sm">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="health_fitness">Health & Fitness</SelectItem>
                <SelectItem value="beauty_wellness">Beauty & Wellness</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Deals Content */}
      {isLoading ? (
        <DealsSkeleton />
      ) : error ? (
        <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-6">
          <p className="text-red-800">
            Error loading deals. Please try again later.
          </p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className={cn(panelClass, 'py-16 text-center')}>
          <div className="mx-auto mb-4 h-16 w-16 text-neutral-300">
            <Tag className="h-16 w-16" />
          </div>
          <h3 className="mb-2 text-[1.5rem] font-semibold tracking-tight text-neutral-900">
            {activeFilter === 'all' && activeDealType === 'all' && activeCategory === 'all'
              ? 'No deals yet'
              : 'No deals found with current filters'}
          </h3>
          <p className="mx-auto mb-8 max-w-md text-[13px] leading-6 text-neutral-600 sm:text-sm">
            {activeFilter === 'all' && activeDealType === 'all' && activeCategory === 'all'
              ? 'Create your first deal to start attracting customers and grow your business'
              : 'Try adjusting your filters to see your other deals, or create a new one.'}
          </p>
          
          {activeFilter === 'all' && activeDealType === 'all' && activeCategory === 'all' ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                <Button size="lg" className="rounded-full bg-neutral-950 px-5 text-white hover:bg-neutral-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Deal
                </Button>
              </Link>
              <Link to={PATHS.MERCHANT_HAPPY_HOUR_CREATE}>
                <Button size="lg" variant="outline" className="rounded-full border-neutral-200 bg-white px-5 text-neutral-700 hover:bg-neutral-50">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  Quick Happy Hour
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setActiveFilter('all');
                  setActiveDealType('all');
                  setActiveCategory('all');
                }}
                className="rounded-full border border-neutral-200 px-6 py-3 font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"
              >
                Clear Filters
              </button>
              <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                <Button size="lg" variant="outline" className="rounded-full border-neutral-200 bg-white px-5 text-neutral-700 hover:bg-neutral-50">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Deal
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
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

          <div className={cn(panelClass, 'mt-8 flex flex-col items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-[#f6f7f9] p-5 sm:flex-row')}>
            <div className="text-center sm:text-left">
              <h4 className="text-[15px] font-semibold text-neutral-900">Need more deals?</h4>
              <p className="text-[13px] text-neutral-500">Create different offer types to keep your storefront fresh.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                <Button size="sm" className="rounded-full bg-neutral-950 px-4 text-white hover:bg-neutral-800">
                  <Plus className="mr-1 h-3 w-3" />
                  Item Deal
                </Button>
              </Link>
              <Link to={PATHS.MERCHANT_HAPPY_HOUR_CREATE}>
                <Button size="sm" variant="outline" className="rounded-full border-neutral-200 bg-white px-4 text-neutral-700 hover:bg-neutral-50">
                  <ClockIcon className="mr-1 h-3 w-3" />
                  Happy Hour
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-50 sm:hidden">
        <Link to={PATHS.MERCHANT_DEALS_CREATE}>
          <Button 
            size="lg" 
            className="h-14 w-14 rounded-full bg-neutral-950 shadow-lg transition-all duration-200 hover:bg-neutral-800 hover:shadow-xl"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
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
