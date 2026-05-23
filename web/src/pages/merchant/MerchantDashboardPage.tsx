// src/pages/merchant/MerchantDashboardPage.tsx
import { Button } from '@/components/common/Button';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { CalendarIcon, ClockIcon, DollarSign, Percent, BarChart3, Users, Gift, AlertTriangle, PackageX, Boxes, Sparkles, CheckCircle2 } from 'lucide-react';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useMerchantDashboardStats } from '@/hooks/useMerchantDashboardStats';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { useMerchantMenu } from '@/hooks/useMerchantMenu';
import { useMerchantLoyaltyProgram } from '@/hooks/useMerchantLoyalty';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ExploreDealsPreview } from '@/components/merchant/ExploreDealsPreview';
// Removed shadcn tabs import - using custom styling like kickback page
import { MerchantTableBookingDashboard } from '@/components/table-booking/MerchantTableBookingDashboard';
import { BusinessTypeCard } from '@/components/merchant/BusinessTypeCard';
import { CheckInFeed } from '@/components/merchant/CheckInFeed';
import { useAiMerchantInsights } from '@/hooks/useAi';
import { useAuth } from '@/context/useAuth';

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

interface MerchantCheckInSummaryResponse {
  success: boolean;
  pagination?: {
    totalCount: number;
  };
}

const panelClass =
  'rounded-[1.4rem] border border-border/80 bg-card/92 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)] dark:shadow-none backdrop-blur';

const DealCard = ({ deal }: { deal: Deal }) => {
  const isActive =
    new Date() >= new Date(deal.startTime) &&
    new Date() <= new Date(deal.endTime);
  const isExpired = new Date() > new Date(deal.endTime);

  return (
    <div className="rounded-[1.3rem] border border-border/80 bg-card/95 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)] dark:shadow-none transition-shadow hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)] dark:hover:shadow-none">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-[17px] font-semibold text-foreground">{deal.title}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isActive
              ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300'
              : isExpired
                ? 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300'
                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
          }`}
        >
          {isActive ? 'Active' : isExpired ? 'Expired' : 'Scheduled'}
        </span>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">{deal.description}</p>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-brand-primary-600" />
          <span className="text-sm font-medium">
            {deal.discountPercentage
              ? `${deal.discountPercentage}% OFF`
              : `$${deal.discountAmount} OFF`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {new Date(deal.startTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} -{' '}
            {new Date(deal.endTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Created {new Date(deal.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
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
        className="animate-pulse rounded-lg border border-border bg-card p-6"
      >
        <div className="mb-4 h-6 w-3/4 rounded bg-accent" />
        <div className="mb-2 h-4 w-full rounded bg-accent" />
        <div className="mb-4 h-4 w-2/3 rounded bg-accent" />
        <div className="space-y-2">
          <div className="h-4 w-1/2 rounded bg-accent" />
          <div className="h-4 w-2/3 rounded bg-accent" />
          <div className="h-4 w-1/3 rounded bg-accent" />
        </div>
      </div>
    ))}
  </div>
);

const LoyaltyProgramCard = () => {
  const { data: loyaltyProgram, isLoading } = useMerchantLoyaltyProgram();
  const hasProgram = loyaltyProgram?.program && !loyaltyProgram.error;

  return (
    <div className={cn(panelClass, 'bg-gradient-to-br from-card via-card to-muted dark:to-card dark:bg-none')}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-border/80 bg-muted text-foreground">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Loyalty Program</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {isLoading 
                ? 'Checking status...' 
                : hasProgram 
                  ? 'Reward your customers with points' 
                  : 'Set up a loyalty program to reward your customers'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-10 w-32 rounded-xl bg-accent" />
          </div>
        ) : hasProgram ? (
          <div className="flex gap-3">
            <Link to={PATHS.MERCHANT_LOYALTY_ANALYTICS}>
              <Button
                size="sm"
                className="rounded-xl bg-foreground text-xs text-background hover:bg-foreground/85"
              >
                View Program
              </Button>
            </Link>
            <Link to={PATHS.MERCHANT_LOYALTY_PROGRAM}>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl border-border bg-card text-xs text-foreground hover:bg-muted"
              >
                Manage Settings
              </Button>
            </Link>
          </div>
        ) : (
          <Link to={PATHS.MERCHANT_LOYALTY_SETUP}>
            <Button
              size="sm"
              className="rounded-xl bg-foreground text-xs text-background hover:bg-foreground/85"
            >
              Set Up Loyalty Program
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export const MerchantDashboardPage = () => {
  type DealStatusFilter = 'all' | 'active' | 'scheduled' | 'expired';
  const [activeFilter, setActiveFilter] = useState<DealStatusFilter>('all');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: merchantData, isLoading: merchantLoading } = useMerchantStatus();
  const { user } = useAuth();
  const merchantStatus = merchantData?.data?.merchant?.status;
  const profileAvatarUrl = user?.avatarUrl || null;

  // Fetch dashboard stats for dynamic KPI cards
  const { data: dashboardStats, isLoading: statsLoading } = useMerchantDashboardStats({ 
    period: 'all_time' 
  });

  // Fetch real store data
  const { data: storesData, isLoading: storesLoading } = useMerchantStores();
  const { data: aiInsights, isLoading: aiInsightsLoading } = useAiMerchantInsights();
  const merchantStores = storesData?.stores ?? [];

  // Inventory health summary for the dashboard widget
  const { data: menuData } = useMerchantMenu();
  const inventoryHealth = useMemo(() => {
    const items = menuData?.menuItems ?? [];
    let lowStock = 0;
    let outOfStock = 0;
    const lowStockItems: { id: number; name: string; qty: number }[] = [];
    const outOfStockItems: { id: number; name: string }[] = [];
    items.forEach((it) => {
      if (it.inventoryStatus === 'LOW_STOCK') {
        lowStock += 1;
        lowStockItems.push({ id: it.id, name: it.name, qty: it.inventoryQuantity ?? 0 });
      }
      if (it.inventoryStatus === 'OUT_OF_STOCK') {
        outOfStock += 1;
        outOfStockItems.push({ id: it.id, name: it.name });
      }
    });
    return {
      lowStock,
      outOfStock,
      totalAlerts: lowStock + outOfStock,
      lowStockItems: lowStockItems.slice(0, 4),
      outOfStockItems: outOfStockItems.slice(0, 4),
    };
  }, [menuData]);

  const { data: checkInSummary, isLoading: checkInSummaryLoading } = useQuery({
    queryKey: ['merchant-checkins-summary'],
    queryFn: () =>
      apiGet<MerchantCheckInSummaryResponse>(
        '/merchants/check-ins?page=1&limit=1&sortBy=createdAt&sortOrder=desc',
      ),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
    staleTime: 60 * 1000,
  });

  const totalCheckIns = checkInSummary?.data?.pagination?.totalCount ?? 0;

  const {
    data: dealsData,
    isLoading: dealsLoading,
    error: dealsError,
  } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: Deal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const deals = useMemo(() => dealsData?.data?.deals ?? [], [dealsData?.data?.deals]);
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

  if (merchantLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-24 rounded-[2rem] bg-accent/80" />
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-[1.5rem] bg-accent/80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!merchantStatus) {
    return (
      <div className={cn(panelClass, 'mx-auto max-w-3xl py-10 text-center')}>
          <h1 className="mb-4 text-4xl font-semibold tracking-tight text-foreground">Join as a Merchant</h1>
          <p className="mb-8 text-muted-foreground">
            Start creating deals and reach new customers
          </p>
          <Link to={PATHS.MERCHANT_ONBOARDING}>
            <Button size="lg" className="rounded-xl px-6">Become a Merchant</Button>
          </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[1.6rem] border border-border/80 bg-gradient-to-br from-card via-card to-muted p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] dark:bg-card dark:bg-none dark:shadow-none sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-background">
              Merchant overview
            </div>
            <h2 className="mt-3 text-[1.8rem] font-semibold tracking-tight text-foreground sm:text-[2rem]">
              Calmer operations across deals, stores, guests, and rewards.
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground sm:text-sm">
              This dashboard now leans into a smaller, cleaner Apple-style control surface with quieter cards and clearer actions.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-border/80 bg-card/90 dark:bg-card p-4 shadow-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Merchant status</div>
              <div className="mt-2 text-[15px] font-semibold text-foreground">{merchantStatus}</div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                {merchantStores.length} store{merchantStores.length === 1 ? '' : 's'} connected
              </div>
              {profileAvatarUrl ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1">
                  <img
                    src={profileAvatarUrl}
                    alt={user?.name || 'Profile avatar'}
                    className="h-6 w-6 rounded-full object-cover object-center"
                  />
                  <span className="text-[11px] font-medium text-muted-foreground">Profile photo active</span>
                </div>
              ) : null}
            </div>
            <div className="rounded-[1.2rem] border border-border/80 bg-card/90 dark:bg-card p-4 shadow-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Customer activity</div>
              <div className="mt-2 text-[15px] font-semibold text-foreground">
                {checkInSummaryLoading ? '...' : `${totalCheckIns} tap-ins`}
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">Live check-in momentum across your locations</div>
            </div>
          </div>
        </div>

        {merchantStatus === 'APPROVED' && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={PATHS.MERCHANT_ANALYTICS}>
              <Button variant="secondary" size="lg" className="rounded-xl border-border text-sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link to={PATHS.MERCHANT_DEALS_CREATE}>
              <Button size="lg" className="rounded-xl text-sm">
                Create New Deal
              </Button>
            </Link>
          </div>
        )}
      </div>

      {merchantStatus === 'PENDING' && (
        <div className="rounded-[1.75rem] border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/30 dark:bg-amber-950/30 dark:bg-amber-950/30 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300">
            Application Pending
          </h2>
          <p className="mt-2 text-amber-700 dark:text-amber-300">
            Your application to become a merchant is currently under review. This usually takes 1-2 business days. We'll notify you via email once it's approved.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] border border-amber-200 dark:border-amber-900/50 bg-card p-4">
              <h3 className="mb-2 font-semibold text-amber-800 dark:text-amber-300">Prepare Your Menu</h3>
              <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
                While waiting for approval, you can start setting up your menu items.
              </p>
              <Link to={PATHS.MERCHANT_MENU}>
                <Button variant="secondary" size="sm" className="w-full rounded-xl">
                  Manage Menu
                </Button>
              </Link>
            </div>
            
            <div className="rounded-[1.25rem] border border-amber-200 dark:border-amber-900/50 bg-card p-4">
              <h3 className="mb-2 font-semibold text-amber-800 dark:text-amber-300">Explore Deals</h3>
              <p className="mb-4 text-sm text-amber-700 dark:text-amber-300">
                See what other merchants are offering to get inspired.
              </p>
              <ExploreDealsPreview />
            </div>
          </div>
        </div>
      )}

      {merchantStatus === 'APPROVED' && (
        <>
          {/* Custom Tabs Navigation - matching kickback page style */}
          <div className="mb-5">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-[1.1rem] border border-border/80 bg-card/90 dark:bg-card p-1.5 shadow-sm">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  'rounded-[0.9rem] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200',
                  activeTab === 'overview'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('deals')}
                className={cn(
                  'rounded-[0.9rem] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200',
                  activeTab === 'deals'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                Deals
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={cn(
                  'rounded-[0.9rem] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200',
                  activeTab === 'analytics'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('booking')}
                className={cn(
                  'rounded-[0.9rem] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200',
                  activeTab === 'booking'
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                Table Booking
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Dynamic KPI Row */}
              <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className={panelClass}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Gross sales</h4>
                  <p className="mt-2 flex items-baseline gap-2 text-[1.55rem] font-bold text-foreground">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-foreground">
                      <DollarSign className="h-3 w-3" />
                    </span>
                    {statsLoading ? '...' : `$${dashboardStats?.kpis.grossSales || 0}`}
                  </p>
                </div>
              </div>
            </div>

            <div className={panelClass}>
              <div>
                <h4 className="text-[13px] text-muted-foreground">Order volume</h4>
                <p className="mt-2 text-[1.55rem] font-bold text-foreground">
                  {statsLoading ? '...' : dashboardStats?.kpis.orderVolume || 0}
                </p>
              </div>
            </div>

            <div className={panelClass}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Tap-ins</h4>
                  <p className="mt-2 flex items-baseline gap-2 text-[1.55rem] font-bold text-foreground">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-foreground">
                      <Users className="h-3 w-3" />
                    </span>
                    {checkInSummaryLoading ? '...' : totalCheckIns}
                  </p>
                </div>
              </div>
            </div>

            <div className={panelClass}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] text-muted-foreground">Bounty earnings</h4>
                  <p className="mt-2 flex items-baseline gap-2 text-[1.55rem] font-bold text-foreground">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-foreground">
                      <DollarSign className="h-3 w-3" />
                    </span>
                    {statsLoading ? '...' : `$${dashboardStats?.kpis.totalKickbackHandout || 0}`}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Link to={PATHS.MERCHANT_KICKBACKS}>
                  <Button size="sm" variant="ghost" className="w-full text-xs">View Kickback Earnings</Button>
                </Link>
                <Link to={PATHS.MERCHANT_ANALYTICS}>
                  <Button size="sm" variant="ghost" className="w-full text-xs">View Analytics</Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Inventory notification panel */}
          <div
            className={cn(
              panelClass,
              'mb-6',
              inventoryHealth.totalAlerts > 0
                ? 'border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/40 to-card dark:bg-none dark:bg-card'
                : 'border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/50 to-card dark:bg-none dark:bg-card',
            )}
          >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {inventoryHealth.totalAlerts > 0 ? (
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">Inventory notifications</h3>
                    {inventoryHealth.totalAlerts > 0 ? (
                      <>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="mr-3 inline-flex items-center gap-1">
                            <Boxes className="h-3 w-3 text-amber-600" />
                            <strong>{inventoryHealth.lowStock}</strong> low on stock
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <PackageX className="h-3 w-3 text-red-600" />
                            <strong>{inventoryHealth.outOfStock}</strong> out of stock
                          </span>
                        </p>

                        <div className="mt-3 space-y-2">
                          {inventoryHealth.outOfStockItems.map((it) => (
                            <div
                              key={`oos-${it.id}`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-red-100 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/30 dark:bg-red-950/30 dark:bg-red-950/30 px-3 py-2"
                            >
                              <span className="truncate text-xs font-medium text-red-700 dark:text-red-300">{it.name}</span>
                              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                                Out of stock
                              </span>
                            </div>
                          ))}
                          {inventoryHealth.lowStockItems.map((it) => (
                            <div
                              key={`low-${it.id}`}
                              className="flex items-center justify-between gap-3 rounded-lg border border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/30 dark:bg-amber-950/30 dark:bg-amber-950/30 px-3 py-2"
                            >
                              <span className="truncate text-xs font-medium text-amber-800 dark:text-amber-300">{it.name}</span>
                              <span className="shrink-0 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                                {it.qty} left
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-300">
                        All inventory levels look healthy right now. No low-stock or out-of-stock alerts.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link to={`${PATHS.MERCHANT_INVENTORY}?analyze=true`}>
                    <Button size="sm" variant="secondary" className="rounded-xl gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Insights
                    </Button>
                  </Link>
                  <Link to={PATHS.MERCHANT_INVENTORY}>
                    <Button size="sm" className="rounded-xl">
                      Open Inventory
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

          {/* Business Type Card */}
          <div className="mb-6">
            <BusinessTypeCard />
          </div>

          {/* Loyalty Program Card */}
          <div className="mb-6">
            <LoyaltyProgramCard />
          </div>

          {/* AI Merchant Insights */}
          <div className={cn(panelClass, 'mb-6')}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-foreground">AI business insights</h3>
                  <p className="text-xs text-muted-foreground">
                    Quick, plain‑English summary of how your deals are performing.
                  </p>
                </div>
              </div>
            </div>

            {aiInsightsLoading && (
              <div className="space-y-2">
                <div className="h-4 w-40 animate-pulse rounded bg-accent" />
                <div className="h-3 w-full animate-pulse rounded bg-accent" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-accent" />
              </div>
            )}

            {!aiInsightsLoading && aiInsights && (
              <div className="space-y-4">
                <p className="text-[13px] text-foreground">{aiInsights.insights.summary}</p>
                {aiInsights.insights.topInsights.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      What we&apos;re seeing
                    </p>
                    <ul className="space-y-1 text-[13px] text-foreground">
                      {aiInsights.insights.topInsights.slice(0, 3).map((point, idx) => (
                        <li key={idx}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.insights.recommendations.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Recommended next moves
                    </p>
                    <ul className="space-y-2 text-[13px] text-foreground">
                      {aiInsights.insights.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="rounded-lg bg-muted p-2">
                          <div className="text-[13px] font-medium text-foreground">{rec.title}</div>
                          <div className="text-xs text-muted-foreground">{rec.description}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Region badges - using real merchant store data */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {storesLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-[1rem] bg-accent px-4 py-2 text-sm">
                  <div className="h-4 w-20 bg-muted rounded mb-1"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
              ))
            ) : merchantStores.length > 0 ? (
              // Show only cities where merchant has stores
              merchantStores
                .filter((store) => store.city) // Filter out stores without city data
                .map((store) => (
                  <div
                    key={store.id}
                    className="rounded-[1rem] border border-border/80 bg-card/92 dark:bg-card px-4 py-2 text-[13px] text-foreground shadow-sm"
                  >
                    <div className="font-semibold">{store.city?.name || 'Unknown City'}</div>
                    <div className="text-xs text-muted-foreground">
                      {store.active ? 'Active' : 'Inactive'} 
                      <span className="ml-2 text-emerald-600">
                        {store.active ? '100%' : '0%'}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              // No stores state
              <div className="rounded-[1rem] bg-muted px-4 py-2 text-[13px] text-muted-foreground">
                <div className="font-semibold">No Stores</div>
                <div className="text-xs text-muted-foreground">Create your first store to see city performance</div>
              </div>
            )}
          </div>

          {/* Chart + Store List */}
          <div className="mb-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className={cn(panelClass, 'col-span-2')}>
              <h4 className="mb-4 text-[13px] text-muted-foreground">Sales (Last 7 days)</h4>
              <div className="flex items-center justify-center h-56">
                <div className="text-center">
                  <div className="text-4xl text-muted-foreground mb-2">📊</div>
                  <p className="text-sm text-muted-foreground">No sales data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Testing phase</p>
                </div>
              </div>
            </div>

            <div className={cn(panelClass, 'col-span-1')}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] text-muted-foreground">Sales by store</h4>
                <Link to={PATHS.MERCHANT_STORES}>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Manage Stores
                  </Button>
                </Link>
              </div>
              {storesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-accent" />
                        <div className="h-4 w-32 bg-accent rounded" />
                      </div>
                      <div className="h-4 w-16 bg-accent rounded" />
                    </div>
                  ))}
                </div>
              ) : merchantStores.length > 0 ? (
                <ul className="space-y-3">
                  {merchantStores.map((store) => (
                    <li key={store.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full inline-block ${
                          store.active ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] text-foreground">
                            {store.address}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {store.city?.name || 'Unknown City'}{store.city?.state ? `, ${store.city.state}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        <span className="text-muted-foreground">0</span>
                        <span className="text-green-500 ml-2">0%</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-4">No stores found</p>
                  <Link to={PATHS.MERCHANT_STORES_CREATE}>
                    <Button size="sm" variant="secondary">
                      Create Your First Store
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Check-in Feed */}
          <div className={cn(panelClass, 'mb-8')}>
            <CheckInFeed
              limit={5}
              expandedLimit={25}
              canViewMore={true}
              autoRefresh={true}
              refreshInterval={30000}
            />
          </div>
            </div>
          )}

          {activeTab === 'deals' && (
            <div className="space-y-6">
              <div className="mb-6">
                <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                  <h2 className="text-[1.4rem] font-semibold tracking-tight text-foreground">Your deals</h2>
                  <div className="flex items-center gap-2 rounded-full border border-border bg-muted p-1">
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
                          'rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200',
                          activeFilter === filter
                            ? 'bg-card text-brand-primary-600 shadow-sm'
                            : 'text-muted-foreground hover:bg-accent/50',
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
                  <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-100 dark:bg-red-950/40 p-6">
                    <p className="text-red-800 dark:text-red-300">
                      Error loading deals. Please try again later.
                    </p>
                  </div>
                ) : filteredDeals.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card py-12 text-center">
                    <h3 className="mb-2 text-[1.1rem] font-semibold text-foreground">
                      {activeFilter === 'all'
                        ? 'No deals yet'
                        : `No ${activeFilter} deals found`}
                    </h3>
                    <p className="mb-6 text-sm text-muted-foreground">
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
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <h3 className="mb-4 text-[1.1rem] font-semibold">Advanced analytics</h3>
                <p className="mb-6 text-sm text-muted-foreground">Detailed performance insights and analytics</p>
                <Link to={PATHS.MERCHANT_ANALYTICS}>
                  <Button size="lg">View Full Analytics</Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-6">
              <MerchantTableBookingDashboard />
            </div>
          )}
        </>
      )}

      {merchantStatus === 'REJECTED' && (
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
      )}
    </div>
  );
};
