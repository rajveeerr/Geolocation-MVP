import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Plus, Target, Users, X } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useToast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/services/api';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

interface MerchantBountyDeal {
  id: number | string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  bountyRewardAmount?: number | null;
  minReferralsRequired?: number | null;
  bountyQRCode?: string | null;
  bountyPotAmount?: number | null;
  bountyMaxInvites?: number | null;
  bountyMinSpend?: number | null;
  currentRedemptions?: number;
}

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const dealStatus = (deal: MerchantBountyDeal) => {
  const now = new Date();
  const start = new Date(deal.startTime);
  const end = new Date(deal.endTime);
  if (now < start) return { label: 'Scheduled', tone: 'bg-sky-100 text-sky-700 ring-sky-600/20' };
  if (now > end) return { label: 'Expired', tone: 'bg-neutral-100 text-neutral-600 ring-neutral-400/20' };
  return { label: 'Active', tone: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' };
};

const timeRemaining = (deal: MerchantBountyDeal) => {
  const ms = new Date(deal.endTime).getTime() - Date.now();
  if (ms <= 0) return null;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours >= 24) return `${Math.floor(hours / 24)}d`;
  if (hours >= 1) return `${hours}h`;
  return `${minutes} min`;
};

interface BountyFormState {
  title: string;
  description: string;
  expiresInHours: string;
  potAmount: string;
  perPerson: string;
  maxInvites: string;
  minSpend: string;
}

const blankForm = (): BountyFormState => ({
  title: '',
  description: '',
  expiresInHours: '2',
  potAmount: '',
  perPerson: '',
  maxInvites: '',
  minSpend: '',
});

function CreateBountyForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BountyFormState>(() => blankForm());

  const set = <K extends keyof BountyFormState>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const createBounty = useMutation({
    mutationFn: async () => {
      const expiresHours = parseFloat(form.expiresInHours);
      if (!Number.isFinite(expiresHours) || expiresHours <= 0) {
        throw new Error('Expires In must be a positive number');
      }
      const perPerson = parseFloat(form.perPerson);
      const potAmount = parseFloat(form.potAmount);
      const maxInvites = parseInt(form.maxInvites, 10);
      const minSpend = parseFloat(form.minSpend);

      if (!form.title.trim()) throw new Error('Title is required');
      if (!Number.isFinite(potAmount) || potAmount <= 0) throw new Error('Pot Amount must be positive');
      if (!Number.isFinite(perPerson) || perPerson <= 0) throw new Error('Per Person must be positive');
      if (!Number.isFinite(maxInvites) || maxInvites < 1) throw new Error('Max Invites must be ≥ 1');
      if (!Number.isFinite(minSpend) || minSpend < 0) throw new Error('Min Spend must be ≥ 0');

      const now = new Date();
      const endTime = new Date(now.getTime() + expiresHours * 60 * 60 * 1000);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        dealType: 'Bounty Deal',
        category: 'FOOD_AND_BEVERAGE',
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        // Existing bounty mechanic fields (required by BE validation)
        bountyRewardAmount: perPerson,
        minReferralsRequired: 1,
        // New flash group bounty fields
        bountyPotAmount: potAmount,
        bountyMaxInvites: maxInvites,
        bountyMinSpend: minSpend,
        kickbackEnabled: true,
      };

      const res = await apiPost<{ deal: any; message?: string }, typeof payload>('/merchants/deals', payload);
      if (!res.success) throw new Error(res.error ?? 'Failed to launch bounty');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-deals'] });
      toast({ title: 'Bounty launched', description: 'Customers can start sharing it now.' });
      setForm(blankForm());
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: 'Could not launch bounty', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className={cn(panelClass, 'p-5')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <Target className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Create New Bounty</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close form"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="bounty-title" className="text-xs font-semibold text-neutral-700">
              Title
            </Label>
            <Input
              id="bounty-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Taco Tuesday Happy Hour"
              className="mt-1.5 h-11"
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="bounty-expires" className="text-xs font-semibold text-neutral-700">
              Expires In (hours)
            </Label>
            <Input
              id="bounty-expires"
              type="number"
              min={1}
              step={0.5}
              value={form.expiresInHours}
              onChange={(e) => set('expiresInHours', e.target.value)}
              placeholder="2"
              className="mt-1.5 h-11"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="bounty-desc" className="text-xs font-semibold text-neutral-700">
            Description
          </Label>
          <Textarea
            id="bounty-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Bring your friends and save!"
            rows={2}
            maxLength={500}
            className="mt-1.5 resize-none"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="bounty-pot" className="text-xs font-semibold text-neutral-700">
              Pot Amount ($)
            </Label>
            <Input
              id="bounty-pot"
              type="number"
              min={0}
              step="0.01"
              value={form.potAmount}
              onChange={(e) => set('potAmount', e.target.value)}
              placeholder="100"
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="bounty-perperson" className="text-xs font-semibold text-neutral-700">
              Per Person ($)
            </Label>
            <Input
              id="bounty-perperson"
              type="number"
              min={0}
              step="0.01"
              value={form.perPerson}
              onChange={(e) => set('perPerson', e.target.value)}
              placeholder="5"
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="bounty-max" className="text-xs font-semibold text-neutral-700">
              Max Invites
            </Label>
            <Input
              id="bounty-max"
              type="number"
              min={1}
              value={form.maxInvites}
              onChange={(e) => set('maxInvites', e.target.value)}
              placeholder="6"
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="bounty-minspend" className="text-xs font-semibold text-neutral-700">
              Min Spend ($)
            </Label>
            <Input
              id="bounty-minspend"
              type="number"
              min={0}
              step="0.01"
              value={form.minSpend}
              onChange={(e) => set('minSpend', e.target.value)}
              placeholder="20"
              className="mt-1.5 h-11"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={() => createBounty.mutate()}
          disabled={createBounty.isPending}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-base font-semibold text-white shadow-md hover:from-emerald-600 hover:to-emerald-700"
        >
          {createBounty.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Launch Bounty
        </Button>
      </div>
    </motion.div>
  );
}

function BountyDealCard({ deal }: { deal: MerchantBountyDeal }) {
  const status = dealStatus(deal);
  const reward = deal.bountyRewardAmount ?? 0;
  const pot = deal.bountyPotAmount;
  const maxInvites = deal.bountyMaxInvites;
  const minSpend = deal.bountyMinSpend;
  const claimed = deal.currentRedemptions ?? 0;
  const remaining = timeRemaining(deal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-5')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 ring-1 ring-inset ring-orange-200">
          <Target className="h-5 w-5" />
        </div>
        {remaining && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
            ⏰ {remaining}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold text-neutral-900">{deal.title}</h3>
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', status.tone)}>
          {status.label}
        </span>
      </div>

      {deal.description && (
        <p className="mt-2 text-sm text-neutral-500">{deal.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Pot Amount</div>
          <div className="mt-0.5 text-base font-bold text-emerald-600">
            {pot != null ? `$${pot.toFixed(0)}` : '—'}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Per Person</div>
          <div className="mt-0.5 text-base font-bold text-emerald-600">${reward.toFixed(0)}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Claimed</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">
            {maxInvites != null ? `${claimed}/${maxInvites}` : claimed}
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Min Spend</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">
            {minSpend != null ? `$${minSpend.toFixed(0)}` : '—'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MerchantBountyDealsContent() {
  const [showForm, setShowForm] = useState(false);
  const { data: merchantData } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: MerchantBountyDeal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const bountyDeals = useMemo(
    () => (data?.data?.deals ?? []).filter((d) => (d.bountyRewardAmount ?? 0) > 0),
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
            <Target className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
              Customer Bounties
            </h2>
            <p className="text-sm text-neutral-600">
              Time-limited group deals that customers can share.
            </p>
          </div>
        </div>
        <Button
          size="md"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Hide form' : 'Create Bounty'}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showForm && <CreateBountyForm key="bounty-form" onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      {bountyDeals.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <Target className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No bounty deals yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Launch a bounty — set a pot, per-person payout, and a slot cap. Customers share the link to fill it.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first bounty
            </Button>
            <Link to={PATHS.MERCHANT_DEALS}>
              <Button variant="secondary" className="rounded-full">
                All deals
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs text-neutral-600">
            <Users className="h-3.5 w-3.5 text-neutral-400" />
            {bountyDeals.length} active bounty deal{bountyDeals.length === 1 ? '' : 's'}.
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {bountyDeals.map((deal) => (
              <BountyDealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const MerchantBountyDealsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage bounties.">
    <MerchantBountyDealsContent />
  </MerchantProtectedRoute>
);
