import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Gift, BarChart2, Trash2, Users, Layers } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMerchantSurprises, useDeactivateSurpriseDeal } from '@/hooks/useSurprises';
import type { MerchantSurpriseDeal, SurpriseType } from '@/types/surprises';

const TYPE_LABELS: Record<SurpriseType, string> = {
  LOCATION_BASED: 'Location',
  TIME_BASED: 'Time',
  ENGAGEMENT_BASED: 'Check-in',
  RANDOM_DROP: 'Random Drop',
};

const TYPE_COLORS: Record<SurpriseType, string> = {
  LOCATION_BASED: 'bg-sky-100 text-sky-700',
  TIME_BASED: 'bg-violet-100 text-violet-700',
  ENGAGEMENT_BASED: 'bg-amber-100 text-amber-700',
  RANDOM_DROP: 'bg-rose-100 text-rose-700',
};

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

function SurpriseDealCard({
  deal,
  onDeactivate,
}: {
  deal: MerchantSurpriseDeal;
  onDeactivate: (id: number) => void;
}) {
  const isActive = deal.isActive && new Date(deal.endTime) > new Date();
  const slotsFull =
    deal.surpriseTotalSlots !== null && deal.surpriseSlotsUsed >= deal.surpriseTotalSlots;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]"
    >
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-neutral-100 via-white to-[#eef1f5]">
        <span className="text-4xl">{deal.category?.icon ?? '🎁'}</span>
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              TYPE_COLORS[deal.surpriseType],
            )}
          >
            {TYPE_LABELS[deal.surpriseType]}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              isActive && !slotsFull ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500',
            )}
          >
            {!isActive ? 'Inactive' : slotsFull ? 'Full' : 'Active'}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-[1.02rem] font-semibold tracking-tight text-neutral-900">{deal.title}</h3>
        {deal.surpriseHint && (
          <p className="mt-0.5 line-clamp-1 text-xs italic text-neutral-400">"{deal.surpriseHint}"</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-[1rem] bg-neutral-50 px-2.5 py-2">
            <Users className="h-4 w-4 text-neutral-500" />
            <div>
              <p className="text-xs text-neutral-400">Reveals</p>
              <p className="text-sm font-bold text-neutral-800">{deal.revealsCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-[1rem] bg-neutral-50 px-2.5 py-2">
            <Layers className="h-4 w-4 text-neutral-500" />
            <div>
              <p className="text-xs text-neutral-400">Slots</p>
              <p className="text-sm font-bold text-neutral-800">
                {deal.surpriseTotalSlots === null
                  ? `${deal.surpriseSlotsUsed} / ∞`
                  : `${deal.surpriseSlotsUsed} / ${deal.surpriseTotalSlots}`}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs text-neutral-400">
          {new Date(deal.startTime).toLocaleDateString()} — {new Date(deal.endTime).toLocaleDateString()}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
          <Link
            to={PATHS.MERCHANT_SURPRISES_ANALYTICS.replace(':dealId', String(deal.id))}
            className="flex-1"
          >
            <Button size="sm" className="w-full rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
              <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
              Analytics
            </Button>
          </Link>
          {isActive && (
            <button
              onClick={() => onDeactivate(deal.id)}
              className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
              title="Deactivate"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MerchantMySurprisesContent() {
  const { data, isLoading, error } = useMerchantSurprises();
  const deactivate = useDeactivateSurpriseDeal();
  const { toast } = useToast();

  const deals = data?.deals ?? [];

  const handleDeactivate = (dealId: number) => {
    if (!confirm('Deactivate this surprise deal? It will expire immediately.')) return;
    deactivate.mutate(dealId, {
      onSuccess: () => toast({ title: 'Surprise deal deactivated' }),
      onError: (e) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 p-4 text-red-700">
          {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-1 sm:py-4">
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Experiences</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">My Surprise Deals</h1>
          <p className="mt-2 text-[13px] text-neutral-500 sm:text-sm">
            Mystery deals that unlock based on location, time, check-ins, or random drops.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_SURPRISES_CREATE}>
          <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Surprise
          </Button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <Gift className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No surprise deals yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">Create a mystery deal to engage nearby customers.</p>
          <Link to={PATHS.MERCHANT_SURPRISES_CREATE} className="mt-4 inline-block">
            <Button size="sm" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">Create Your First Surprise</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <SurpriseDealCard key={deal.id} deal={deal} onDeactivate={handleDeactivate} />
          ))}
        </div>
      )}
    </div>
  );
}

export const MerchantMySurprisesPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage surprise deals.">
    <MerchantMySurprisesContent />
  </MerchantProtectedRoute>
);
