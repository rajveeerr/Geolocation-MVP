import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy, KeyRound, Loader2, Plus } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { apiGet } from '@/services/api';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MerchantHiddenDeal {
  id: number | string;
  title: string;
  description?: string | null;
  accessCode: string | null;
  startTime: string;
  endTime: string;
  discountPercentage?: number | null;
  discountAmount?: number | null;
}

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const dealStatus = (deal: MerchantHiddenDeal) => {
  const now = new Date();
  const start = new Date(deal.startTime);
  const end = new Date(deal.endTime);
  if (now < start) return { label: 'Scheduled', tone: 'bg-sky-100 text-sky-700' };
  if (now > end) return { label: 'Expired', tone: 'bg-neutral-100 text-neutral-600' };
  return { label: 'Active', tone: 'bg-emerald-100 text-emerald-700' };
};

const formatDiscount = (deal: MerchantHiddenDeal) => {
  if (deal.discountPercentage) return `${deal.discountPercentage}% off`;
  if (deal.discountAmount) return `$${deal.discountAmount} off`;
  return 'Special offer';
};

function HiddenDealCard({ deal }: { deal: MerchantHiddenDeal }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const status = dealStatus(deal);
  const code = deal.accessCode ?? '';
  const shareUrl =
    typeof window !== 'undefined' && code
      ? `${window.location.origin}/deals/hidden/${code}?dealId=${deal.id}`
      : '';

  const copy = async (kind: 'code' | 'link', text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
      toast({ title: kind === 'code' ? 'Code copied' : 'Share link copied' });
    } catch {
      toast({ title: 'Copy failed', description: 'Select and copy manually.', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-4')}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-neutral-900">{deal.title}</h3>
            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', status.tone)}>
              {status.label}
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
              {formatDiscount(deal)}
            </span>
          </div>
          {deal.description && (
            <p className="line-clamp-2 text-xs text-neutral-500">{deal.description}</p>
          )}
          <p className="text-xs text-neutral-500">
            {formatDate(deal.startTime)} – {formatDate(deal.endTime)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 sm:min-w-[180px]">
          <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-3 py-2">
            <KeyRound className="h-4 w-4 text-amber-700" aria-hidden />
            <code className="font-mono text-sm font-bold tracking-wider text-amber-900">{code || '—'}</code>
            {code && (
              <button
                type="button"
                onClick={() => copy('code', code)}
                className="ml-1 rounded p-1 text-amber-700 hover:bg-amber-100"
                aria-label="Copy access code"
              >
                {copied === 'code' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
          {shareUrl && (
            <button
              type="button"
              onClick={() => copy('link', shareUrl)}
              className="inline-flex items-center gap-1 text-xs font-medium text-brand-primary-600 hover:underline"
            >
              {copied === 'link' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copy share link
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MerchantHiddenDealsContent() {
  const { data: merchantData } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: MerchantHiddenDeal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const hiddenDeals = useMemo(
    () => (data?.data?.deals ?? []).filter((d) => !!d.accessCode),
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
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Rewards</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">Hidden deals</h1>
          <p className="mt-2 max-w-xl text-[13px] text-neutral-500 sm:text-sm">
            Deals locked behind an access code. Share the code or link with select customers — only people with the code can see and redeem.
          </p>
        </div>
        <Link to="/merchant/deals/create/hidden">
          <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
            <Plus className="mr-2 h-4 w-4" />
            Create hidden deal
          </Button>
        </Link>
      </div>

      {hiddenDeals.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <KeyRound className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No hidden deals yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Create a deal and turn on "Hidden" to give it an access code. Hidden deals don't appear in normal discovery — share the code with the customers you want to reach.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/merchant/deals/create/hidden">
              <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
                <Plus className="mr-2 h-4 w-4" />
                Create a hidden deal
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
        <div className="space-y-2">
          {hiddenDeals.map((deal) => (
            <HiddenDealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}

export const MerchantHiddenDealsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage hidden deals.">
    <MerchantHiddenDealsContent />
  </MerchantProtectedRoute>
);
