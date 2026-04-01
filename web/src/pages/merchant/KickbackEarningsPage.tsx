import { useState } from 'react';
import { type KickbackEarningRow, useKickbackEarnings } from '@/hooks/useKickbackEarnings';
import { Button } from '@/components/common/Button';
import { ArrowLeft, ChevronDown, Plus, Loader2 } from 'lucide-react';
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
                  <p className="text-neutral-500">{new Date(item.date).toLocaleDateString('en-US')}</p>
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

      {isLoading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      {error && <div className="py-20 text-center text-sm text-status-expired">Could not load earnings data.</div>}

      {data && (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard title="Revenue" value={data.summary.revenue} subtext="Tracked for selected period" />
            <SummaryCard title="Total kickback" value={data.summary.totalKickbackHandout} subtext="Tracked for selected period" />
          </div>
          <div className={cn(merchantPanelClass, 'overflow-hidden p-0')}>
            {data.details.map((detail, index: number) => (
              <EarningsRow key={index} detail={detail} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
