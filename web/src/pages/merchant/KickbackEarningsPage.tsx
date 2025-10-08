import { useState } from 'react';
import { useKickbackEarnings } from '@/hooks/useKickbackEarnings';
import { Button } from '@/components/common/Button';
import { ArrowLeft, ChevronDown, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'framer-motion';

// --- Sub-components for a clean structure ---

const PeriodFilter = ({ period, setPeriod }: { period: string; setPeriod: (p: string) => void }) => {
  const periods = ['All time', 'Today', 'Yesterday', 'This week'];
  return (
    <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p.toLowerCase().replace(' ', '_'))}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200',
            period === p.toLowerCase().replace(' ', '_')
              ? 'bg-black text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-200/50',
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

const SummaryCard = ({ title, value, subtext }: { title: string; value: number; subtext: string }) => (
  <div className="flex-1 rounded-2xl bg-white p-6 border border-neutral-200 shadow-sm">
    <p className="text-sm text-neutral-500">{title}</p>
    <p className="text-3xl font-bold mt-2 text-neutral-900">${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
    <p className="text-neutral-500 text-sm mt-1">{subtext}</p>
  </div>
);

const EarningsRow = ({ detail }: { detail: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-neutral-200 last:border-b-0 bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center w-full text-left p-4 hover:bg-neutral-50">
        <Avatar className="h-10 w-10">
          <AvatarImage src={detail.user.avatarUrl} />
          <AvatarFallback>{detail.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-4 flex-grow">
          <p className="font-bold text-neutral-900">{detail.user.name} earned ${detail.earned.toFixed(2)}</p>
          <p className="text-sm text-neutral-500">Invited {detail.invitedCount} others</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-brand-primary-600">${detail.totalSpentByInvitees.toFixed(2)}</p>
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
              {detail.spendingDetail.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <img src={item.imageUrl} className="h-10 w-10 rounded-md object-cover" />
                  <p className="flex-grow font-semibold text-neutral-700">{item.itemName}</p>
                  <p className="text-neutral-500">${item.price.toFixed(2)}</p>
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
    <div className="bg-white min-h-screen">
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(PATHS.MERCHANT_DASHBOARD)} variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft />
          </Button>
          <h1 className="font-bold text-lg">Kickback Earnings</h1>
        </div>
        <Button onClick={() => navigate(PATHS.MERCHANT_DEALS_CREATE)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create
        </Button>
      </header>

      <main className="p-4 max-w-3xl mx-auto">
        <PeriodFilter period={period} setPeriod={setPeriod} />

        {isLoading && <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {error && <div className="text-center py-20 text-status-expired">Could not load earnings data.</div>}

        {data && (
          <div className="mt-6 space-y-6">            
            <div className="flex flex-col sm:flex-row gap-4">
              <SummaryCard title="Revenue" value={data.summary.revenue} subtext="All time" />
              <SummaryCard title="Total kickback handout" value={data.summary.totalKickbackHandout} subtext="All time" />
            </div>
            <div className="rounded-2xl border border-neutral-200 overflow-hidden">
              {data.details.map((detail: any, index: number) => (
                <EarningsRow key={index} detail={detail} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
