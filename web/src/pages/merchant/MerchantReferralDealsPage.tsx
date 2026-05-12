import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Banknote,
  Edit3,
  Loader2,
  Plus,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useReferrals } from '@/hooks/useReferrals';
import { apiGet } from '@/services/api';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface BountyStats {
  shares: number;
  conversions: number;
  attributedRevenue: number;
}

interface ReferralDeal {
  id: number;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  bountyRewardAmount?: number | null;
  minReferralsRequired?: number | null;
  bountyMinSpend?: number | null;
  isActive: boolean;
  isExpired: boolean;
  isUpcoming: boolean;
  bountyStats: BountyStats | null;
}

const formatMoney = (n: number) => `$${n.toFixed(0)}`;

function statusFor(deal: ReferralDeal): { label: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED'; tone: string } {
  if (deal.isExpired) return { label: 'EXPIRED', tone: 'bg-neutral-100 text-neutral-600 ring-neutral-400/20' };
  if (deal.isUpcoming) return { label: 'SCHEDULED', tone: 'bg-sky-100 text-sky-700 ring-sky-600/20' };
  return { label: 'ACTIVE', tone: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' };
}

function ReferralDealCard({
  deal,
  shareCode,
  onCopyLink,
}: {
  deal: ReferralDeal;
  shareCode: string | null;
  onCopyLink: (deal: ReferralDeal) => void;
}) {
  const status = statusFor(deal);
  const stats = deal.bountyStats ?? { shares: 0, conversions: 0, attributedRevenue: 0 };
  const conversionRate = stats.shares > 0 ? Math.round((stats.conversions / stats.shares) * 100) : 0;
  const referrerReward = deal.bountyRewardAmount
    ? `$${deal.bountyRewardAmount} per qualified friend`
    : 'No referrer reward set';
  const friendReward = deal.bountyMinSpend
    ? `Unlocks the deal after $${deal.bountyMinSpend} spend`
    : 'The base deal price';

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-5')}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-900">{deal.title}</h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                status.tone,
              )}
            >
              {status.label}
            </span>
          </div>
          {deal.description && (
            <p className="mt-1 line-clamp-1 text-xs text-neutral-500">{deal.description}</p>
          )}
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Referrer earns</div>
          <div className="mt-0.5 text-sm font-medium text-neutral-900">{referrerReward}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Friend gets</div>
          <div className="mt-0.5 text-sm font-medium text-neutral-900">{friendReward}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Shares</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{stats.shares}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Redeemed</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{stats.conversions}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Rate</div>
          <div className="mt-0.5 text-base font-bold text-emerald-600">{conversionRate}%</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Attributed revenue</div>
          <div className="mt-0.5 text-sm font-bold text-emerald-800">{formatMoney(stats.attributedRevenue)}</div>
        </div>
        <button
          type="button"
          onClick={() => onCopyLink(deal)}
          disabled={!shareCode}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
        >
          <Share2 className="h-3.5 w-3.5" />
          Copy share link
        </button>
      </div>

      <Link to={PATHS.DEAL_DETAIL.replace(':dealId', String(deal.id))}>
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
        >
          <Edit3 className="mr-1.5 h-3.5 w-3.5" />
          Open deal
        </Button>
      </Link>
    </motion.article>
  );
}

function MerchantReferralDealsInner() {
  const { toast } = useToast();
  const { data: merchantData } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;
  const { data: referralData } = useReferrals();
  const shareCode = referralData?.referralCode ?? null;

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: ReferralDeal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const referralDeals = useMemo(
    () => (data?.data?.deals ?? []).filter((d) => (d.bountyRewardAmount ?? 0) > 0),
    [data],
  );

  const totals = useMemo(
    () =>
      referralDeals.reduce(
        (acc, d) => {
          const s = d.bountyStats ?? { shares: 0, conversions: 0, attributedRevenue: 0 };
          return {
            shares: acc.shares + s.shares,
            conversions: acc.conversions + s.conversions,
            revenue: acc.revenue + s.attributedRevenue,
          };
        },
        { shares: 0, conversions: 0, revenue: 0 },
      ),
    [referralDeals],
  );

  const copyShareLink = async (deal: ReferralDeal) => {
    if (!shareCode) {
      toast({
        title: 'Sign in to generate links',
        description: 'Your share links use your personal referral code.',
        variant: 'destructive',
      });
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}${PATHS.DEAL_DETAIL.replace(':dealId', String(deal.id))}?ref=${shareCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Share link copied', description: link });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      {/* Title banner */}
      <div className={cn(panelClass, 'flex flex-wrap items-center justify-between gap-4 border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-white to-white p-5')}>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <Share2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
              Referral Deals
            </h2>
            <p className="text-sm text-neutral-600">
              Bounty-powered deals — your customers share, friends redeem, the referrer earns.
            </p>
          </div>
        </div>
        <Link to="/merchant/deals/bounties">
          <Button
            size="md"
            className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:from-emerald-600 hover:to-teal-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Configure Bounty
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Active deals</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-neutral-950">{referralDeals.length}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Total shares</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-neutral-950">{totals.shares}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Conversions</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[1.6rem] font-semibold tracking-tight text-neutral-950">{totals.conversions}</span>
            <span className="text-xs text-emerald-600">
              {totals.shares > 0 ? Math.round((totals.conversions / totals.shares) * 100) : 0}%
            </span>
          </div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Attributed revenue</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-emerald-700">
            {formatMoney(totals.revenue)}
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <div className={cn(panelClass, 'border-rose-200 bg-rose-50/60 p-5 text-sm text-rose-700')}>
          Couldn't load referral deals. Try refreshing the page.
        </div>
      ) : referralDeals.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <Banknote className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No referral deals yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Create a bounty deal — set a per-friend payout for the referrer, and the friend redeems the underlying offer.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/merchant/deals/create/bounty">
              <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
                <Plus className="mr-2 h-4 w-4" />
                Create your first referral deal
              </Button>
            </Link>
            <Link to={PATHS.MERCHANT_DEALS}>
              <Button size="md" variant="secondary" className="rounded-full">
                All deals
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {referralDeals.map((d) => (
            <ReferralDealCard
              key={d.id}
              deal={d}
              shareCode={shareCode}
              onCopyLink={copyShareLink}
            />
          ))}
          <Link
            to="/merchant/deals/create/bounty"
            className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.45rem] border-2 border-dashed border-neutral-300 bg-neutral-50/50 text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
          >
            <Plus className="h-8 w-8" />
            <span className="mt-2 text-sm font-medium">Create another referral deal</span>
            <span className="mt-1 px-6 text-center text-xs text-neutral-400">
              Set the per-friend bounty payout, the qualifying spend, and the time window.
            </span>
          </Link>
        </div>
      )}

      {/* How it differs */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-neutral-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">How referral deals fit alongside Bounties and Referrals</h2>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
            <span>
              <strong>Bounties</strong> reward the <em>referrer</em> $X per qualified friend. This page surfaces those deals with share/conversion stats.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            <span>
              <strong>Referrals (program)</strong> are platform-wide — every customer has one referral code that works across all your deals.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>
              <strong>Referral deals</strong> (this page) are <em>per-deal</em>. Copy a deal's share link to track which deal drove the visit.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}

export const MerchantReferralDealsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can view referral deals.">
    <MerchantReferralDealsInner />
  </MerchantProtectedRoute>
);
