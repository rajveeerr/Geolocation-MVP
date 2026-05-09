import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Plus, ShoppingBag } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { apiGet } from '@/services/api';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { BogoBadge, formatBogoLabel } from '@/components/deals/BogoBadge';

interface MerchantBogoDeal {
  id: number | string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  bogoBuyQuantity?: number | null;
  bogoGetQuantity?: number | null;
  bogoGetDiscountPercent?: number | null;
  currentRedemptions?: number;
  maxRedemptions?: number | null;
}

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const dealStatus = (deal: MerchantBogoDeal) => {
  const now = new Date();
  const start = new Date(deal.startTime);
  const end = new Date(deal.endTime);
  if (now < start) return { label: 'Scheduled', tone: 'bg-sky-100 text-sky-700 ring-sky-600/20' };
  if (now > end) return { label: 'Expired', tone: 'bg-neutral-100 text-neutral-600 ring-neutral-400/20' };
  return { label: 'Active', tone: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' };
};

function BogoDealCard({ deal }: { deal: MerchantBogoDeal }) {
  const status = dealStatus(deal);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-5')}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 ring-1 ring-inset ring-orange-200">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-neutral-900">{deal.title}</h3>
              <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', status.tone)}>
                {status.label}
              </span>
              <BogoBadge config={deal} size="xs" />
            </div>
            {deal.description && (
              <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{deal.description}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              {formatDate(deal.startTime)} – {formatDate(deal.endTime)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Buy</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{deal.bogoBuyQuantity ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Get</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{deal.bogoGetQuantity ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Discount</div>
          <div className="mt-0.5 text-base font-bold text-orange-600">
            {deal.bogoGetDiscountPercent != null ? `${deal.bogoGetDiscountPercent}%` : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Redemptions</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">
            {deal.currentRedemptions ?? 0}
            {deal.maxRedemptions ? ` / ${deal.maxRedemptions}` : ''}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MerchantBogoDealsContent() {
  const { data: merchantData } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: MerchantBogoDeal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const bogoDeals = useMemo(
    () => (data?.data?.deals ?? []).filter((d) => !!formatBogoLabel(d)),
    [data],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(panelClass, 'border-rose-200 bg-rose-50 p-4 text-sm text-rose-700')}>
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      {/* Title banner */}
      <div className={cn(panelClass, 'flex flex-wrap items-center justify-between gap-4 border-orange-200/70 bg-gradient-to-r from-orange-50 via-white to-white p-5')}>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
            <ShoppingBag className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
              BOGO Deals
            </h2>
            <p className="text-sm text-neutral-600">
              "Buy N Get M" deals — drive larger ticket sizes with volume incentives.
            </p>
          </div>
        </div>
        <Link to="/merchant/deals/create/bogo">
          <Button
            size="md"
            className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:from-orange-600 hover:to-orange-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create BOGO
          </Button>
        </Link>
      </div>

      {bogoDeals.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No BOGO deals yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Create a BOGO deal — pick a preset like "Buy 1 Get 1 Free" or dial in your own buy/get quantities.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/merchant/deals/create/bogo">
              <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
                <Plus className="mr-2 h-4 w-4" />
                Create your first BOGO
              </Button>
            </Link>
            <Link to={PATHS.MERCHANT_DEALS}>
              <Button size="md" variant="secondary" className="rounded-full">
                All deals
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {bogoDeals.map((deal) => (
            <BogoDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}

export const MerchantBogoDealsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage BOGO deals.">
    <MerchantBogoDealsContent />
  </MerchantProtectedRoute>
);
