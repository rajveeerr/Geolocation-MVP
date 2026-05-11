import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
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

const PRESETS: Array<{ id: string; label: string; sub: string; buy: number; get: number; discount: number }> = [
  { id: 'b1g1f', label: 'Buy 1 Get 1 Free', sub: 'Classic BOGO', buy: 1, get: 1, discount: 100 },
  { id: 'b2g1f', label: 'Buy 2 Get 1 Free', sub: 'Family-style', buy: 2, get: 1, discount: 100 },
  { id: 'b1g1half', label: 'Buy 1 Get 1 50% Off', sub: 'Half-off second', buy: 1, get: 1, discount: 50 },
  { id: 'b3g1f', label: 'Buy 3 Get 1 Free', sub: 'Group order', buy: 3, get: 1, discount: 100 },
];

interface BogoFormState {
  title: string;
  description: string;
  buy: number;
  get: number;
  discount: number;
  durationDays: string;
  maxRedemptions: string;
}

const blankForm = (): BogoFormState => ({
  title: '',
  description: '',
  buy: 1,
  get: 1,
  discount: 100,
  durationDays: '14',
  maxRedemptions: '',
});

function CreateBogoForm({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BogoFormState>(() => blankForm());

  const set = <K extends keyof BogoFormState>(key: K, value: BogoFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const previewLabel = useMemo(() => {
    const verb = form.discount === 100 ? 'Free' : `${form.discount}% Off`;
    return `Buy ${form.buy}, Get ${form.get} ${verb}`;
  }, [form.buy, form.get, form.discount]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setForm((prev) => ({ ...prev, buy: preset.buy, get: preset.get, discount: preset.discount }));
  };

  const createBogo = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error('Title is required');
      if (form.buy < 1) throw new Error('Customer buys must be at least 1');
      if (form.get < 1) throw new Error('Customer gets must be at least 1');
      if (form.discount < 0 || form.discount > 100)
        throw new Error('Discount must be between 0 and 100');
      const durationDays = parseFloat(form.durationDays);
      if (!Number.isFinite(durationDays) || durationDays <= 0)
        throw new Error('Duration must be a positive number of days');

      const maxRedemptions = form.maxRedemptions === '' ? undefined : parseInt(form.maxRedemptions, 10);
      if (maxRedemptions !== undefined && (!Number.isFinite(maxRedemptions) || maxRedemptions < 0)) {
        throw new Error('Max redemptions must be a non-negative number');
      }

      const now = new Date();
      const endTime = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        dealType: 'BOGO',
        category: 'FOOD_AND_BEVERAGE',
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        bogoBuyQuantity: form.buy,
        bogoGetQuantity: form.get,
        bogoGetDiscountPercent: form.discount,
        maxRedemptions,
      };

      const res = await apiPost<{ deal: any; message?: string }, typeof payload>('/merchants/deals', payload);
      if (!res.success) throw new Error(res.error ?? 'Failed to create BOGO deal');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-deals'] });
      toast({ title: 'BOGO deal created', description: 'Customers can start redeeming it now.' });
      setForm(blankForm());
      onClose();
    },
    onError: (err: Error) => {
      toast({ title: 'Could not create BOGO deal', description: err.message, variant: 'destructive' });
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
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <ShoppingBag className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">New BOGO Deal</h3>
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

        {/* Live preview */}
        <div className="mt-4 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-white p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-700">Live preview</div>
          <div className="mt-0.5 text-xl font-bold tracking-tight text-neutral-900">{previewLabel}</div>
        </div>

        {/* Presets */}
        <div className="mt-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <Label className="text-xs font-semibold text-neutral-700">Quick presets</Label>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PRESETS.map((preset) => {
              const selected = preset.buy === form.buy && preset.get === form.get && preset.discount === form.discount;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border-2 p-3 text-left transition',
                    selected
                      ? 'border-orange-500 bg-orange-50/60'
                      : 'border-neutral-200 bg-white hover:border-neutral-300',
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-neutral-900">{preset.label}</div>
                    <div className="text-xs text-neutral-500">{preset.sub}</div>
                  </div>
                  {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual config */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="bogo-buy" className="text-xs font-semibold text-neutral-700">
              Customer buys
            </Label>
            <Input
              id="bogo-buy"
              type="number"
              min={1}
              value={form.buy}
              onChange={(e) => set('buy', Math.max(1, parseInt(e.target.value) || 0))}
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="bogo-get" className="text-xs font-semibold text-neutral-700">
              Customer gets
            </Label>
            <Input
              id="bogo-get"
              type="number"
              min={1}
              value={form.get}
              onChange={(e) => set('get', Math.max(1, parseInt(e.target.value) || 0))}
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="bogo-discount" className="text-xs font-semibold text-neutral-700">
              Discount on "get" (%)
            </Label>
            <Input
              id="bogo-discount"
              type="number"
              min={0}
              max={100}
              value={form.discount}
              onChange={(e) => set('discount', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
              className="mt-1.5 h-11"
            />
          </div>
        </div>

        {/* Title + description */}
        <div className="mt-5">
          <Label htmlFor="bogo-title" className="text-xs font-semibold text-neutral-700">
            Deal title
          </Label>
          <Input
            id="bogo-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value.slice(0, 100))}
            placeholder="e.g. Wing Wednesday — Buy 2 Get 1 Free"
            className="mt-1.5 h-11"
            maxLength={100}
          />
        </div>

        <div className="mt-4">
          <Label htmlFor="bogo-desc" className="text-xs font-semibold text-neutral-700">
            Description
          </Label>
          <Textarea
            id="bogo-desc"
            value={form.description}
            onChange={(e) => set('description', e.target.value.slice(0, 500))}
            placeholder="Optional — restrictions, dine-in only, etc."
            rows={2}
            className="mt-1.5 resize-none"
            maxLength={500}
          />
        </div>

        {/* Duration + max redemptions */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="bogo-duration" className="text-xs font-semibold text-neutral-700">
              Runs for (days)
            </Label>
            <Input
              id="bogo-duration"
              type="number"
              min={1}
              step="0.5"
              value={form.durationDays}
              onChange={(e) => set('durationDays', e.target.value)}
              placeholder="14"
              className="mt-1.5 h-11"
            />
          </div>
          <div>
            <Label htmlFor="bogo-max" className="text-xs font-semibold text-neutral-700">
              Max redemptions (optional)
            </Label>
            <Input
              id="bogo-max"
              type="number"
              min={0}
              value={form.maxRedemptions}
              onChange={(e) => set('maxRedemptions', e.target.value)}
              placeholder="Unlimited"
              className="mt-1.5 h-11"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={() => createBogo.mutate()}
          disabled={createBogo.isPending}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-base font-semibold text-white shadow-md hover:from-orange-600 hover:to-orange-700"
        >
          {createBogo.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Launch BOGO Deal
        </Button>
      </div>
    </motion.div>
  );
}

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
  const [showForm, setShowForm] = useState(false);
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
        <Button
          size="md"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:from-orange-600 hover:to-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showForm ? 'Hide form' : 'Create BOGO'}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showForm && <CreateBogoForm key="bogo-form" onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      {bogoDeals.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No BOGO deals yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Create a BOGO deal — pick a preset like "Buy 1 Get 1 Free" or dial in your own buy/get quantities.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button
              size="md"
              onClick={() => setShowForm(true)}
              className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first BOGO
            </Button>
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
