import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  Plus,
  Share2,
  TrendingUp,
  Users,
  Wand2,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface MockReferralDeal {
  id: string;
  title: string;
  status: 'ACTIVE' | 'PAUSED' | 'SCHEDULED';
  baseOffer: string;
  referrerReward: string;
  friendReward: string;
  shares: number;
  conversions: number;
  attributedRevenue: number;
}

const DEFAULT_DEALS: MockReferralDeal[] = [
  {
    id: 'first-bite-tacos',
    title: '$5 Off Tacos — First Bite',
    status: 'ACTIVE',
    baseOffer: '$5 off any taco order',
    referrerReward: '$3 store credit per friend who redeems',
    friendReward: '$5 off (the deal)',
    shares: 247,
    conversions: 84,
    attributedRevenue: 1820,
  },
  {
    id: 'happy-hour-buddy',
    title: 'Happy Hour Buddy Pass',
    status: 'ACTIVE',
    baseOffer: '20% off cocktails 5–7pm',
    referrerReward: 'Free appetizer next visit',
    friendReward: '20% off + free first drink',
    shares: 132,
    conversions: 41,
    attributedRevenue: 968,
  },
];

const formatMoney = (n: number) => `$${n.toFixed(0)}`;

function StatusBadge({ status }: { status: MockReferralDeal['status'] }) {
  const tone =
    status === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20'
      : status === 'PAUSED'
        ? 'bg-amber-100 text-amber-800 ring-amber-600/20'
        : 'bg-sky-100 text-sky-700 ring-sky-600/20';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', tone)}>
      {status}
    </span>
  );
}

function ReferralDealCard({
  deal,
  onEdit,
  onCopyLink,
}: {
  deal: MockReferralDeal;
  onEdit: (d: MockReferralDeal) => void;
  onCopyLink: (d: MockReferralDeal) => void;
}) {
  const conversionRate = deal.shares > 0 ? Math.round((deal.conversions / deal.shares) * 100) : 0;
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
            <StatusBadge status={deal.status} />
          </div>
          <p className="mt-1 text-xs text-neutral-500">{deal.baseOffer}</p>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Referrer earns</div>
          <div className="mt-0.5 text-sm font-medium text-neutral-900">{deal.referrerReward}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Friend gets</div>
          <div className="mt-0.5 text-sm font-medium text-neutral-900">{deal.friendReward}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Shares</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{deal.shares}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Redeemed</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{deal.conversions}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Rate</div>
          <div className="mt-0.5 text-base font-bold text-emerald-600">{conversionRate}%</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Attributed revenue</div>
          <div className="mt-0.5 text-sm font-bold text-emerald-800">{formatMoney(deal.attributedRevenue)}</div>
        </div>
        <button
          type="button"
          onClick={() => onCopyLink(deal)}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-50"
        >
          <Share2 className="h-3.5 w-3.5" />
          Sample link
        </button>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => onEdit(deal)}
        className="mt-4 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
      >
        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
        Edit deal
      </Button>
    </motion.article>
  );
}

function MerchantReferralDealsInner() {
  const { toast } = useToast();
  const [deals] = useState<MockReferralDeal[]>(DEFAULT_DEALS);

  const showPreviewToast = (action: string) =>
    toast({
      title: 'Preview only',
      description: `${action} will be wired up once deal-level referral attribution is built. For now this page is a UI sketch.`,
    });

  const copySampleLink = async (deal: MockReferralDeal) => {
    const sampleLink =
      typeof window !== 'undefined'
        ? `${window.location.origin}/r/deal/${deal.id}?via=YOHOP-MAYA`
        : `https://example.com/r/deal/${deal.id}?via=YOHOP-MAYA`;
    try {
      await navigator.clipboard.writeText(sampleLink);
      toast({ title: 'Sample link copied', description: sampleLink });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const totals = deals.reduce(
    (acc, d) => ({
      shares: acc.shares + d.shares,
      conversions: acc.conversions + d.conversions,
      revenue: acc.revenue + d.attributedRevenue,
    }),
    { shares: 0, conversions: 0, revenue: 0 },
  );

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      {/* Preview banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-violet-200">
          <Wand2 className="h-4 w-4 text-violet-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-violet-900">Preview — not live yet</p>
          <p className="mt-0.5 text-xs text-violet-800">
            UI sketch of <span className="font-medium">deal-level referral attribution</span>. Different from{' '}
            <span className="font-medium">Bounties</span> (referrer earns per friend) and{' '}
            <span className="font-medium">Referrals</span> (standalone program). Here both the referrer and the friend get something on each shared deal.
          </p>
        </div>
      </div>

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
              Shareable deals that reward both the referrer and the friend who redeems.
            </p>
          </div>
        </div>
        <Button
          size="md"
          onClick={() => showPreviewToast('Adding a new referral deal')}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Referral Deal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Active deals</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-neutral-950">{deals.length}</div>
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

      {/* Deals grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {deals.map((d) => (
          <ReferralDealCard
            key={d.id}
            deal={d}
            onEdit={(deal) => showPreviewToast(`Editing "${deal.title}"`)}
            onCopyLink={copySampleLink}
          />
        ))}

        <button
          type="button"
          onClick={() => showPreviewToast('Adding a new referral deal')}
          className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.45rem] border-2 border-dashed border-neutral-300 bg-neutral-50/50 text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
        >
          <Plus className="h-8 w-8" />
          <span className="mt-2 text-sm font-medium">Create another referral deal</span>
          <span className="mt-1 px-6 text-center text-xs text-neutral-400">
            Pick an existing deal, set what the referrer earns, set what the friend gets, generate share links.
          </span>
        </button>
      </div>

      {/* How it differs */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-neutral-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">How this differs from Bounties and Referrals</h2>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
            <span>
              <strong>Bounties</strong> reward the <em>referrer only</em> — they earn $X per friend they bring. The friend redeems the regular deal price.
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
              <strong>Referral deals</strong> (this page) are <em>per-deal</em> — both the referrer and the friend get something. Best for "share this and you both win" mechanics on individual promotions.
            </span>
          </li>
        </ul>
      </section>

      {/* Roadmap */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-neutral-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">What's needed to ship this</h2>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>
              Bounty schema (per-deal payout) <span className="text-neutral-500">— already built; the friend-side reward is the new piece</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Schema field on Deal for friend-side reward + claim window</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Per-deal share-link generation + attribution at redemption</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Customer share UI on the deal detail page (copy link, native share sheet)</span>
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
