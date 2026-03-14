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
  LOCATION_BASED: 'bg-blue-100 text-blue-700',
  TIME_BASED: 'bg-purple-100 text-purple-700',
  ENGAGEMENT_BASED: 'bg-orange-100 text-orange-700',
  RANDOM_DROP: 'bg-pink-100 text-pink-700',
};

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
      className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="relative h-28 bg-gradient-to-br from-brand-primary-500/20 via-purple-500/10 to-pink-500/20 flex items-center justify-center">
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
              isActive && !slotsFull ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500',
            )}
          >
            {!isActive ? 'Inactive' : slotsFull ? 'Full' : 'Active'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-bold text-neutral-900">{deal.title}</h3>
        {deal.surpriseHint && (
          <p className="mt-0.5 line-clamp-1 text-xs italic text-neutral-400">"{deal.surpriseHint}"</p>
        )}

        {/* Stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-2.5 py-2">
            <Users className="h-4 w-4 text-brand-primary-400" />
            <div>
              <p className="text-xs text-neutral-400">Reveals</p>
              <p className="text-sm font-bold text-neutral-800">{deal.revealsCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-2.5 py-2">
            <Layers className="h-4 w-4 text-brand-primary-400" />
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

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <Link
            to={PATHS.MERCHANT_SURPRISES_ANALYTICS.replace(':dealId', String(deal.id))}
            className="flex-1"
          >
            <Button size="sm" className="w-full rounded-lg">
              <BarChart2 className="mr-1.5 h-3.5 w-3.5" />
              Analytics
            </Button>
          </Link>
          {isActive && (
            <button
              onClick={() => onDeactivate(deal.id)}
              className="rounded-lg border border-red-200 p-2 text-red-500 transition-colors hover:bg-red-50"
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-screen-xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">My Surprise Deals</h1>
          <p className="mt-1 text-neutral-500">
            Mystery deals that unlock based on location, time, check-ins, or random drops.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_SURPRISES_CREATE}>
          <Button size="md" className="rounded-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Surprise
          </Button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-16 text-center">
          <Gift className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
          <h3 className="text-xl font-bold text-neutral-700">No surprise deals yet</h3>
          <p className="mt-1 text-neutral-500">Create a mystery deal to engage nearby customers.</p>
          <Link to={PATHS.MERCHANT_SURPRISES_CREATE} className="mt-4 inline-block">
            <Button size="sm" className="rounded-full">Create Your First Surprise</Button>
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
