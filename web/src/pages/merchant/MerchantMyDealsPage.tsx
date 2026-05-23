import { Button } from '@/components/common/Button';
import { Plus, CalendarIcon, ClockIcon, Edit, Trash2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet } from '@/services/api';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
      month: '2-digit',
      day: '2-digit',
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

  const dealTypeLabel = deal.dealType?.name ?? 'Item Deal';
  const statusLabel = isActive ? 'Active' : isExpired ? 'Expired' : 'Scheduled';
  const statusDot = isActive ? 'bg-emerald-500' : isExpired ? 'bg-rose-500' : 'bg-amber-500';
  const statusText = isActive ? 'text-emerald-700 dark:text-emerald-300' : isExpired ? 'text-rose-700 dark:text-rose-300' : 'text-amber-700 dark:text-amber-300';

  const discountLabel = deal.discountPercentage
    ? `${deal.discountPercentage}% off`
    : deal.discountAmount
      ? `$${deal.discountAmount} off`
      : null;

  return (
    <div className="flex h-full flex-col rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
      {/* Eyebrow row: deal type + status dot */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {dealTypeLabel}
        </span>
        <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold', statusText)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDot)} />
          {statusLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-foreground">
        {deal.title}
      </h3>

      {/* Description */}
      {deal.description ? (
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{deal.description}</p>
      ) : null}

      {/* Discount + schedule */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {discountLabel ? (
          <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/15">
            {discountLabel}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatDate(deal.startTime)}
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
          <ClockIcon className="h-3.5 w-3.5" />
          {formatTime(deal.startTime)} – {formatTime(deal.endTime)}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3 mt-4">
        <span className="text-[11px] text-muted-foreground">Created {formatDate(deal.createdAt)}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(deal)}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-semibold text-foreground transition hover:border-border hover:bg-muted"
          >
            <Edit className="h-3 w-3" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(deal)}
            aria-label="Delete deal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-rose-50 dark:bg-rose-950/30 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DealsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-[1.45rem] border border-border/80 bg-card p-6 shadow-[0_8px_22px_rgba(15,23,42,0.045)]">
        <div className="mb-4 flex items-start justify-between">
          <div className="h-6 w-3/4 rounded bg-accent" />
          <div className="h-6 w-16 rounded-full bg-accent" />
        </div>
        <div className="mb-4 space-y-2">
          <div className="h-4 w-full rounded bg-accent" />
          <div className="h-4 w-2/3 rounded bg-accent" />
        </div>
        <div className="mb-4 flex gap-4">
          <div className="h-4 w-20 rounded bg-accent" />
          <div className="h-4 w-24 rounded bg-accent" />
        </div>
        <div className="h-6 w-16 rounded bg-accent" />
      </div>
    ))}
  </div>
);

const MerchantMyDealsContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  type DealStatusFilter = 'all' | 'active' | 'scheduled' | 'expired';
  type DealTypeFilter =
    | 'all'
    | 'standard'
    | 'happy_hour'
    | 'recurring'
    | 'redeem_now'
    | 'hidden'
    | 'bounty'
    | 'bogo';
  type CategoryFilter = 'all' | 'food_beverage' | 'retail' | 'entertainment' | 'health_fitness' | 'beauty_wellness' | 'other';
  const panelClass =
    'rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card shadow-[0_8px_22px_rgba(15,23,42,0.045)]';
  
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

    // Filter by deal type — matches the backend dealType.name (case-insensitive
    // substring match) against the merchant's filter selection.
    if (activeDealType !== 'all') {
      filtered = filtered.filter((deal) => {
        const dealType = deal.dealType?.name?.toLowerCase() ?? 'standard';
        switch (activeDealType) {
          case 'standard': {
            // Standard / Item Deal — also matches when name is missing.
            const isSpecial =
              dealType.includes('happy') ||
              dealType.includes('recurring') ||
              dealType.includes('daily') ||
              dealType.includes('redeem') ||
              dealType.includes('hidden') ||
              dealType.includes('bounty') ||
              dealType.includes('bogo');
            return !isSpecial;
          }
          case 'happy_hour':
            return dealType.includes('happy');
          case 'recurring':
            return dealType.includes('recurring') || dealType.includes('daily');
          case 'redeem_now':
            return dealType.includes('redeem');
          case 'hidden':
            return dealType.includes('hidden');
          case 'bounty':
            return dealType.includes('bounty');
          case 'bogo':
            return dealType.includes('bogo');
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

  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (dealId: string | number) => {
      const response = await apiDelete<{ message?: string }>(`/merchants/me/deals/${dealId}`);
      if (!response.success) {
        throw new Error(response.error ?? 'Failed to delete deal');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-deals'] });
      toast({ title: 'Deal deleted', description: 'The deal has been removed.' });
      setDealToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Could not delete deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (deal: Deal) => {
    setDealToDelete(deal);
  };

  if (merchantLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-64 rounded bg-accent" />
          <div className="mb-8 h-12 w-96 rounded bg-accent" />
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
          <p className="mb-8 text-muted-foreground">
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
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300">
            Application Pending
          </h2>
          <p className="mt-2 text-amber-700 dark:text-amber-300">
            Your application to become a merchant is currently under review. This usually takes 1-2 business days. We'll notify you via email once it's approved.
          </p>
        </div>
      </div>
    );
  }

  if (merchantStatus === 'REJECTED') {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-100 dark:bg-red-950/40 p-6">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
            Application Not Approved
          </h2>
          <p className="mt-2 text-red-700 dark:text-red-300">
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
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Deals</div>
            <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-foreground">My Deals</h1>
            <p className="mt-2 max-w-2xl text-[13px] text-muted-foreground sm:text-sm">
              Manage active, scheduled, and expired promotions with a cleaner operating view.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={PATHS.MERCHANT_DEALS_CREATE}>
              <Button size="lg" className="w-full rounded-full bg-foreground px-5 text-sm text-background hover:bg-foreground/85 sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create New Deal
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className={cn(panelClass, 'mb-6 flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4')}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Filters
        </span>

        <Select value={activeFilter} onValueChange={(value) => setActiveFilter(value as DealStatusFilter)}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] gap-1.5 rounded-full border-border bg-card px-3 text-[12px] font-medium shadow-none">
            <span className="text-muted-foreground">Status:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activeDealType} onValueChange={(value) => setActiveDealType(value as DealTypeFilter)}>
          <SelectTrigger className="h-8 w-auto min-w-[140px] gap-1.5 rounded-full border-border bg-card px-3 text-[12px] font-medium shadow-none">
            <span className="text-muted-foreground">Type:</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="standard">Item Deal</SelectItem>
            <SelectItem value="happy_hour">Happy Hour</SelectItem>
            <SelectItem value="recurring">Daily Deal</SelectItem>
            <SelectItem value="redeem_now">Redeem Now</SelectItem>
            <SelectItem value="hidden">Hidden Deal</SelectItem>
            <SelectItem value="bounty">Bounty Deal</SelectItem>
            <SelectItem value="bogo">BOGO Deal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activeCategory} onValueChange={(value) => setActiveCategory(value as CategoryFilter)}>
          <SelectTrigger className="h-8 w-auto min-w-[160px] gap-1.5 rounded-full border-border bg-card px-3 text-[12px] font-medium shadow-none">
            <span className="text-muted-foreground">Category:</span>
            <SelectValue />
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

        {(activeFilter !== 'all' || activeDealType !== 'all' || activeCategory !== 'all') && (
          <button
            onClick={() => {
              setActiveFilter('all');
              setActiveDealType('all');
              setActiveCategory('all');
            }}
            className="rounded-full px-2 py-1 text-[12px] font-semibold text-foreground transition hover:text-foreground"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-[12px] text-muted-foreground">
          {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'}
        </span>
      </div>

      {/* Deals Content */}
      {isLoading ? (
        <DealsSkeleton />
      ) : error ? (
        <div className="rounded-[1.25rem] border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-6">
          <p className="text-red-800 dark:text-red-300">
            Error loading deals. Please try again later.
          </p>
        </div>
      ) : filteredDeals.length === 0 ? (
        <div className={cn(panelClass, 'py-16 text-center')}>
          <div className="mx-auto mb-4 h-16 w-16 text-muted-foreground">
            <Tag className="h-16 w-16" />
          </div>
          <h3 className="mb-2 text-[1.5rem] font-semibold tracking-tight text-foreground">
            {activeFilter === 'all' && activeDealType === 'all' && activeCategory === 'all'
              ? 'No deals yet'
              : 'No deals found with current filters'}
          </h3>
          <p className="mx-auto mb-8 max-w-md text-[13px] leading-6 text-muted-foreground sm:text-sm">
            {activeFilter === 'all' && activeDealType === 'all' && activeCategory === 'all'
              ? 'Create your first deal to start attracting customers and grow your business'
              : 'Try adjusting your filters to see your other deals, or create a new one.'}
          </p>
          
          {activeFilter === 'all' && activeDealType === 'all' && activeCategory === 'all' ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                <Button size="lg" className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/85">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Deal
                </Button>
              </Link>
              <Link to={PATHS.MERCHANT_HAPPY_HOUR_CREATE}>
                <Button size="lg" variant="outline" className="rounded-full border-border bg-card px-5 text-foreground hover:bg-muted">
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
                className="rounded-full border border-border px-6 py-3 font-medium text-foreground transition hover:bg-muted hover:text-foreground"
              >
                Clear Filters
              </button>
              <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                <Button size="lg" variant="outline" className="rounded-full border-border bg-card px-5 text-foreground hover:bg-muted">
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

          <div className={cn(panelClass, 'mt-8 flex flex-col items-center justify-between gap-4 bg-gradient-to-r from-card via-card to-muted dark:to-card dark:bg-none p-5 sm:flex-row')}>
            <div className="text-center sm:text-left">
              <h4 className="text-[15px] font-semibold text-foreground">Need more deals?</h4>
              <p className="text-[13px] text-muted-foreground">Create different offer types to keep your storefront fresh.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to={PATHS.MERCHANT_DEALS_CREATE_STANDARD}>
                <Button size="sm" className="rounded-full bg-foreground px-4 text-background hover:bg-foreground/85">
                  <Plus className="mr-1 h-3 w-3" />
                  Item Deal
                </Button>
              </Link>
              <Link to={PATHS.MERCHANT_DEALS_CREATE_DAILY}>
                <Button size="sm" variant="outline" className="rounded-full border-border bg-card px-4 text-foreground hover:bg-muted">
                  <Plus className="mr-1 h-3 w-3" />
                  Daily Deal
                </Button>
              </Link>
              <Link to={PATHS.MERCHANT_HAPPY_HOUR_CREATE}>
                <Button size="sm" variant="outline" className="rounded-full border-border bg-card px-4 text-foreground hover:bg-muted">
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
            className="h-14 w-14 rounded-full bg-foreground shadow-lg transition-all duration-200 hover:bg-foreground/85 hover:shadow-xl"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!dealToDelete}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setDealToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md border-border bg-card text-foreground p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-bold text-foreground">Delete this deal?</DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              {dealToDelete ? (
                <>
                  <span className="font-semibold text-foreground">"{dealToDelete.title}"</span> will be
                  permanently removed. This can't be undone.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2 px-6 py-4">
            <button
              type="button"
              onClick={() => setDealToDelete(null)}
              disabled={deleteMutation.isPending}
              className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-4 text-[13px] font-semibold text-foreground transition hover:border-border hover:bg-muted disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => dealToDelete && deleteMutation.mutate(dealToDelete.id)}
              disabled={deleteMutation.isPending}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background transition hover:bg-foreground/85 disabled:opacity-70"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting…
                </>
              ) : (
                'Delete deal'
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
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
