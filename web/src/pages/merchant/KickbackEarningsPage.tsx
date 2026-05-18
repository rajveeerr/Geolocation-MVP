import { useMemo, useState } from 'react';
import {
  type KickbackEarningRow,
  type KickbackEarningsResponse,
  useKickbackEarnings,
} from '@/hooks/useKickbackEarnings';
import { Button } from '@/components/common/Button';
import { ArrowLeft, ChevronDown, Info, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MerchantMetaCard,
  MerchantPageIntro,
  MerchantSegmentedControl,
  merchantPanelClass,
} from '@/components/merchant/MerchantAppleUI';

const DEMO_DATA: KickbackEarningsResponse = {
  summary: {
    revenue: 4832.5,
    totalKickbackHandout: 382.4,
    totalTransactions: 27,
  },
  details: [
    {
      user: { name: 'Maya Patel', avatarUrl: 'https://i.pravatar.cc/80?img=47' },
      earned: 92.0,
      invitedCount: 4,
      totalSpentByInvitees: 1148.0,
      spendingDetail: [
        { dealTitle: 'Taco Tuesday — 60% OFF', dealId: 142, amountSpent: 287.5, amountEarned: 23.0, inviteeCount: 1, date: '2026-05-12' },
        { dealTitle: 'Wine Wednesday', dealId: 156, amountSpent: 340.0, amountEarned: 27.2, inviteeCount: 1, date: '2026-05-08' },
        { dealTitle: 'Weekend Brunch', dealId: 161, amountSpent: 520.5, amountEarned: 41.8, inviteeCount: 2, date: '2026-05-04' },
      ],
    },
    {
      user: { name: 'Diego Ramos', avatarUrl: 'https://i.pravatar.cc/80?img=12' },
      earned: 67.4,
      invitedCount: 3,
      totalSpentByInvitees: 842.5,
      spendingDetail: [
        { dealTitle: 'Late Night Cocktails', dealId: 168, amountSpent: 412.0, amountEarned: 32.9, inviteeCount: 2, date: '2026-05-11' },
        { dealTitle: 'Happy Hour Bites', dealId: 134, amountSpent: 430.5, amountEarned: 34.5, inviteeCount: 1, date: '2026-04-29' },
      ],
    },
    {
      user: { name: 'Aisha Khan', avatarUrl: 'https://i.pravatar.cc/80?img=25' },
      earned: 58.8,
      invitedCount: 3,
      totalSpentByInvitees: 735.0,
      spendingDetail: [
        { dealTitle: 'Bring 2 Friends — $10 each', dealId: 171, amountSpent: 735.0, amountEarned: 58.8, inviteeCount: 3, date: '2026-05-09' },
      ],
    },
    {
      user: { name: 'Jordan Lee', avatarUrl: 'https://i.pravatar.cc/80?img=33' },
      earned: 46.2,
      invitedCount: 2,
      totalSpentByInvitees: 578.0,
      spendingDetail: [
        { dealTitle: 'Buy 1 Get 1 Wings', dealId: 159, amountSpent: 318.0, amountEarned: 25.4, inviteeCount: 1, date: '2026-05-07' },
        { dealTitle: 'Members-only Chef Tasting', dealId: 170, amountSpent: 260.0, amountEarned: 20.8, inviteeCount: 1, date: '2026-05-02' },
      ],
    },
    {
      user: { name: 'Sofia Bianchi', avatarUrl: 'https://i.pravatar.cc/80?img=49' },
      earned: 38.0,
      invitedCount: 2,
      totalSpentByInvitees: 475.0,
      spendingDetail: [
        { dealTitle: 'Spend $35 → 50% OFF', dealId: 165, amountSpent: 475.0, amountEarned: 38.0, inviteeCount: 2, date: '2026-04-30' },
      ],
    },
    {
      user: { name: 'Noah Williams', avatarUrl: 'https://i.pravatar.cc/80?img=8' },
      earned: 24.0,
      invitedCount: 1,
      totalSpentByInvitees: 300.0,
      spendingDetail: [
        { dealTitle: 'Weekday Lunch Special', dealId: 148, amountSpent: 300.0, amountEarned: 24.0, inviteeCount: 1, date: '2026-04-26' },
      ],
    },
    {
      user: { name: 'Priya Iyer', avatarUrl: 'https://i.pravatar.cc/80?img=20' },
      earned: 18.4,
      invitedCount: 1,
      totalSpentByInvitees: 230.0,
      spendingDetail: [
        { dealTitle: 'Daily Deal — 25% off bottles', dealId: 152, amountSpent: 230.0, amountEarned: 18.4, inviteeCount: 1, date: '2026-04-22' },
      ],
    },
  ],
};

// --- Sub-components for a clean structure ---

const PeriodFilter = ({ period, setPeriod }: { period: string; setPeriod: (p: string) => void }) => {
  const periods = [
    { label: 'All time', value: 'all_time' },
    { label: 'Last 7 days', value: 'last_7_days' },
    { label: 'Last 30 days', value: 'last_30_days' },
    { label: 'This month', value: 'this_month' },
    { label: 'This year', value: 'this_year' },
  ];
  return (
    <MerchantSegmentedControl
      value={period}
      onChange={setPeriod}
      options={periods.map((p) => ({ label: p.label, value: p.value }))}
      className="min-w-max"
    />
  );
};

const SummaryCard = ({ title, value, subtext }: { title: string; value: number; subtext: string }) => (
  <div className="flex-1 rounded-[1.2rem] border border-neutral-200/80 bg-white/95 p-4 shadow-sm">
    <p className="text-[13px] text-neutral-500">{title}</p>
    <p className="mt-2 text-[1.5rem] font-bold tracking-tight text-neutral-900">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
    <p className="mt-1 text-[13px] text-neutral-500">{subtext}</p>
  </div>
);

const EarningsRow = ({ detail }: { detail: KickbackEarningRow }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 last:border-b-0 bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center text-left p-4 hover:bg-neutral-50">
        <Avatar className="h-10 w-10">
          <AvatarImage src={detail.user.avatarUrl} />
          <AvatarFallback>{detail.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4 flex-grow">
          <p className="text-[13px] font-bold text-neutral-900">{detail.user.name} earned ${detail.earned.toFixed(2)}</p>
          <p className="text-xs text-neutral-500">Invited {detail.invitedCount} others</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-semibold text-brand-primary-600">${detail.totalSpentByInvitees.toFixed(2)}</p>
        </div>
        <ChevronDown className={cn('ml-4 h-5 w-5 text-neutral-400 transition-transform', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {isOpen && detail.spendingDetail.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-16 space-y-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase">Spending Details</p>
              {detail.spendingDetail.map((item, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-neutral-100 text-xs font-bold text-neutral-500">
                    #{item.dealId}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-neutral-700">{item.dealTitle}</p>
                    <p className="text-xs text-neutral-500">
                      Earned ${item.amountEarned.toFixed(2)} from ${item.amountSpent.toFixed(2)} spend
                    </p>
                  </div>
                  <p className="text-neutral-500">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main Page Component ---
export const KickbackEarningsPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('all_time');
  const { data, isLoading, error } = useKickbackEarnings(period);

  // Fall back to demo data when the API hasn't been wired yet so merchants
  // can still see what this page will look like once earnings start coming
  // in. We surface a small "demo data" banner so it's clear this isn't real.
  const isDemo = !isLoading && (!!error || !data);
  const displayData = useMemo<KickbackEarningsResponse | null>(() => {
    if (data) return data;
    if (isDemo) return DEMO_DATA;
    return null;
  }, [data, isDemo]);

  return (
    <div className="space-y-5">
      <MerchantPageIntro
        eyebrow="Kickbacks"
        title="Track referral earnings and spending flow"
        description="Review how referrals convert into spend and how much kickback has been distributed across your merchant activity."
        aside={
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <MerchantMetaCard label="Time period" value={period.replaceAll('_', ' ')} caption="Switch periods without leaving the page." />
            <MerchantMetaCard label="Action" value="Create deal" caption="Launch a fresh deal to generate new referrals." />
          </div>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="overflow-x-auto pb-1">
          <PeriodFilter period={period} setPeriod={setPeriod} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(PATHS.MERCHANT_DASHBOARD)} variant="secondary" size="sm" className="inline-flex items-center whitespace-nowrap rounded-xl text-sm">
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
            Dashboard
          </Button>
          <Button onClick={() => navigate(PATHS.MERCHANT_DEALS_CREATE)} size="sm" className="rounded-xl text-sm">
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : null}

      {displayData ? (
        <div className="space-y-5">
          {isDemo ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[12px] leading-5 text-amber-800">
                <span className="font-semibold">Demo data</span> — earnings will appear here once your
                referral and bounty deals start converting. The numbers below are illustrative.
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Revenue from referrals"
              value={displayData.summary.revenue}
              subtext={`Across ${displayData.summary.totalTransactions ?? displayData.details.length} transactions`}
            />
            <SummaryCard
              title="Total kickback paid"
              value={displayData.summary.totalKickbackHandout}
              subtext={`To ${displayData.details.length} referrer${displayData.details.length === 1 ? '' : 's'}`}
            />
            <SummaryCard
              title="Net revenue"
              value={Math.max(0, displayData.summary.revenue - displayData.summary.totalKickbackHandout)}
              subtext={`${((1 - displayData.summary.totalKickbackHandout / Math.max(1, displayData.summary.revenue)) * 100).toFixed(1)}% retained`}
            />
          </div>

          <div className={cn(merchantPanelClass, 'overflow-hidden p-0')}>
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
              <div>
                <h3 className="text-[14px] font-semibold text-neutral-900">Top referrers</h3>
                <p className="text-[12px] text-neutral-500">Customers driving the most spend via referrals</p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-200">
                {displayData.details.length}
              </span>
            </div>
            {displayData.details.map((detail, index: number) => (
              <EarningsRow key={index} detail={detail} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
