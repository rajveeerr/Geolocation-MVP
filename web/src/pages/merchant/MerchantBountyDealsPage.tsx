import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, QrCode, RefreshCw, Search, Target, Users } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useToast } from '@/hooks/use-toast';
import { useRefreshBountyQR } from '@/hooks/useKitty';
import { apiGet, apiPatch } from '@/services/api';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';

const QR_IMAGE_BASE = 'https://api.qrserver.com/v1/create-qr-code/';
const qrImageUrl = (data: string, size = 96) =>
  `${QR_IMAGE_BASE}?size=${size}x${size}&data=${encodeURIComponent(data)}`;

interface MerchantBountyDeal {
  id: number;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  dealType?: { name?: string | null } | null;
  isExpired?: boolean;
  isUpcoming?: boolean;
  bountyRewardAmount?: number | null;
  minReferralsRequired?: number | null;
  bountyQRCode?: string | null;
  bountyPotAmount?: number | null;
  bountyMaxInvites?: number | null;
  bountyMinSpend?: number | null;
  currentRedemptions?: number;
}

interface BountyFormState {
  rewardAmount: string;
  minReferralsRequired: string;
  potAmount: string;
  maxInvites: string;
  minSpend: string;
  kickbackEnabled: boolean;
}

interface ConfigureBountyResponse {
  deal: MerchantBountyDeal;
  bounty: {
    rewardAmount: number;
    minReferrals: number;
    qrCode: string | null;
  };
}

const panelClass =
  'rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

const dealState = (deal: MerchantBountyDeal) => {
  if (deal.isExpired) return { label: 'Expired', tone: 'bg-muted text-muted-foreground ring-neutral-400/20' };
  if (deal.isUpcoming) return { label: 'Scheduled', tone: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-sky-600/20' };
  return { label: 'Active', tone: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20' };
};

const createBlankForm = (): BountyFormState => ({
  rewardAmount: '',
  minReferralsRequired: '1',
  potAmount: '',
  maxInvites: '',
  minSpend: '',
  kickbackEnabled: true,
});

const formFromDeal = (deal: MerchantBountyDeal): BountyFormState => ({
  rewardAmount: deal.bountyRewardAmount != null ? String(deal.bountyRewardAmount) : '',
  minReferralsRequired: deal.minReferralsRequired != null ? String(deal.minReferralsRequired) : '1',
  potAmount: deal.bountyPotAmount != null ? String(deal.bountyPotAmount) : '',
  maxInvites: deal.bountyMaxInvites != null ? String(deal.bountyMaxInvites) : '',
  minSpend: deal.bountyMinSpend != null ? String(deal.bountyMinSpend) : '',
  kickbackEnabled: true,
});

const BountySelectionCard = ({
  deal,
  selected,
  onSelect,
}: {
  deal: MerchantBountyDeal;
  selected: boolean;
  onSelect: (deal: MerchantBountyDeal) => void;
}) => {
  const state = dealState(deal);
  const bountySet = (deal.bountyRewardAmount ?? 0) > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(deal)}
      disabled={deal.isExpired}
      className={cn(
        panelClass,
        'w-full border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:opacity-60',
        selected && 'border-orange-300 ring-2 ring-orange-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-base font-semibold text-foreground">{deal.title}</h4>
          {deal.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{deal.description}</p>}
        </div>
        <span className={cn('inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', state.tone)}>
          {state.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 ring-1 ring-inset', bountySet ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 ring-orange-600/20' : 'bg-muted text-muted-foreground ring-neutral-400/20')}>
          {bountySet ? `$${deal.bountyRewardAmount?.toFixed(0)} reward` : 'No bounty yet'}
        </span>
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-muted-foreground ring-1 ring-inset ring-neutral-200">
          {deal.dealType?.name ?? 'Deal'}
        </span>
        {selected && (
          <span className="inline-flex items-center rounded-full bg-orange-50 dark:bg-orange-950/30 px-2 py-0.5 text-orange-700 dark:text-orange-300 ring-1 ring-inset ring-orange-200">
            Selected
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="rounded-xl border border-border bg-muted/60 p-2.5">
          <div className="font-semibold uppercase tracking-wider text-muted-foreground">Starts</div>
          <div className="mt-0.5">{formatDate(deal.startTime)}</div>
        </div>
        <div className="rounded-xl border border-border bg-muted/60 p-2.5">
          <div className="font-semibold uppercase tracking-wider text-muted-foreground">Ends</div>
          <div className="mt-0.5">{formatDate(deal.endTime)}</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        {deal.isExpired ? 'Expired deals cannot be configured.' : 'Choose this deal to attach bounty conditions.'}
      </div>
    </button>
  );
};

const ConfigureBountyForm = ({
  deal,
  form,
  setForm,
  onSave,
  isSaving,
}: {
  deal: MerchantBountyDeal;
  form: BountyFormState;
  setForm: React.Dispatch<React.SetStateAction<BountyFormState>>;
  onSave: () => void;
  isSaving: boolean;
}) => {
  const bountySet = (deal.bountyRewardAmount ?? 0) > 0;

  return (
    <div className={cn(panelClass, 'p-5')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Configure bounty</div>
          <h3 className="mt-1 text-lg font-bold text-foreground">{deal.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {bountySet ? 'Update the current bounty settings for this deal.' : 'Attach a bounty to this deal and set the conditions customers must meet.'}
          </p>
        </div>
        <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-neutral-200">
          {bountySet ? 'Bounty active' : 'Not yet configured'}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bounty-reward" className="text-xs font-semibold text-foreground">Reward per friend ($)</Label>
          <Input id="bounty-reward" type="number" min={0} step="0.01" value={form.rewardAmount} onChange={(e) => setForm((prev) => ({ ...prev, rewardAmount: e.target.value }))} placeholder="5" className="mt-1.5 h-11" />
        </div>
        <div>
          <Label htmlFor="bounty-minrefs" className="text-xs font-semibold text-foreground">Min referrals required</Label>
          <Input id="bounty-minrefs" type="number" min={1} value={form.minReferralsRequired} onChange={(e) => setForm((prev) => ({ ...prev, minReferralsRequired: e.target.value }))} placeholder="1" className="mt-1.5 h-11" />
        </div>
        <div>
          <Label htmlFor="bounty-pot" className="text-xs font-semibold text-foreground">Pot amount ($)</Label>
          <Input id="bounty-pot" type="number" min={0} step="0.01" value={form.potAmount} onChange={(e) => setForm((prev) => ({ ...prev, potAmount: e.target.value }))} placeholder="100" className="mt-1.5 h-11" />
        </div>
        <div>
          <Label htmlFor="bounty-max" className="text-xs font-semibold text-foreground">Max invites</Label>
          <Input id="bounty-max" type="number" min={1} value={form.maxInvites} onChange={(e) => setForm((prev) => ({ ...prev, maxInvites: e.target.value }))} placeholder="6" className="mt-1.5 h-11" />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="bounty-minspend" className="text-xs font-semibold text-foreground">Minimum spend to qualify ($)</Label>
        <Input id="bounty-minspend" type="number" min={0} step="0.01" value={form.minSpend} onChange={(e) => setForm((prev) => ({ ...prev, minSpend: e.target.value }))} placeholder="20" className="mt-1.5 h-11" />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3">
        <input type="checkbox" checked={form.kickbackEnabled} onChange={(e) => setForm((prev) => ({ ...prev, kickbackEnabled: e.target.checked }))} className="h-4 w-4 accent-orange-600" />
        <div>
          <div className="text-sm font-medium text-foreground">Enable kickbacks</div>
          <p className="text-xs text-muted-foreground">Keeps the referral reward active for this bounty.</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
        <div className="font-semibold text-foreground">Current deal snapshot</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div>Starts {formatDate(deal.startTime)}</div>
          <div>Ends {formatDate(deal.endTime)}</div>
          <div>Existing redemptions {deal.currentRedemptions ?? 0}</div>
          <div>Type {deal.dealType?.name ?? 'Deal'}</div>
        </div>
      </div>

      <Button type="button" onClick={onSave} disabled={isSaving} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-base font-semibold text-white shadow-md hover:from-emerald-600 hover:to-emerald-700">
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {bountySet ? 'Update bounty' : 'Launch bounty'}
      </Button>
    </div>
  );
};

function BountyDealCard({ deal }: { deal: MerchantBountyDeal }) {
  const status = dealState(deal);
  const reward = deal.bountyRewardAmount ?? 0;
  const pot = deal.bountyPotAmount;
  const maxInvites = deal.bountyMaxInvites;
  const minSpend = deal.bountyMinSpend;
  const claimed = deal.currentRedemptions ?? 0;
  const remaining = (() => {
    const ms = new Date(deal.endTime).getTime() - Date.now();
    if (ms <= 0) return null;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) return `${Math.floor(hours / 24)}d`;
    if (hours >= 1) return `${hours}h`;
    return `${minutes} min`;
  })();
  const { toast } = useToast();
  const refreshQR = useRefreshBountyQR();
  const qrSrc = deal.bountyQRCode ? qrImageUrl(deal.bountyQRCode, 96) : null;

  const handleRefreshQR = () => {
    refreshQR.mutate(
      { dealId: deal.id },
      {
        onSuccess: () => {
          toast({ title: 'QR code refreshed', description: 'A new bounty QR code has been generated for this deal.' });
        },
        onError: (err) => {
          toast({ title: 'Could not refresh QR', description: err.message, variant: 'destructive' });
        },
      },
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn(panelClass, 'p-5')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 ring-1 ring-inset ring-orange-200">
          <Target className="h-5 w-5" />
        </div>
        {remaining && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300 ring-1 ring-inset ring-rose-200">
            ⏰ {remaining}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold text-foreground">{deal.title}</h3>
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', status.tone)}>
          {status.label}
        </span>
      </div>

      {deal.description && <p className="mt-2 text-sm text-muted-foreground">{deal.description}</p>}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border bg-muted/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pot Amount</div>
          <div className="mt-0.5 text-base font-bold text-emerald-600">{pot != null ? `$${pot.toFixed(0)}` : '—'}</div>
        </div>
        <div className="rounded-xl border border-border bg-muted/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Per Person</div>
          <div className="mt-0.5 text-base font-bold text-emerald-600">${reward.toFixed(0)}</div>
        </div>
        <div className="rounded-xl border border-border bg-muted/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Claimed</div>
          <div className="mt-0.5 text-base font-bold text-foreground">{maxInvites != null ? `${claimed}/${maxInvites}` : claimed}</div>
        </div>
        <div className="rounded-xl border border-border bg-muted/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Min Spend</div>
          <div className="mt-0.5 text-base font-bold text-foreground">{minSpend != null ? `$${minSpend.toFixed(0)}` : '—'}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 sm:flex-nowrap">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
          {qrSrc ? <img src={qrSrc} alt="Bounty QR" className="h-full w-full object-contain" /> : <QrCode className="h-7 w-7 text-muted-foreground" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Verification QR</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {qrSrc ? 'Friends scan this at check-in to credit the referrer.' : 'No QR yet — generate one to start crediting referrals.'}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRefreshQR}
          disabled={refreshQR.isPending}
          className="w-full shrink-0 rounded-full sm:w-auto"
        >
          {refreshQR.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
          {qrSrc ? 'Refresh' : 'Generate'}
        </Button>
      </div>
    </motion.div>
  );
}

function MerchantBountyDealsContent() {
  const { data: merchantData } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: MerchantBountyDeal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const deals = useMemo(() => data?.data?.deals ?? [], [data]);
  const availableDeals = useMemo(() => deals.filter((deal) => !deal.isExpired), [deals]);
  const bountyDeals = useMemo(() => deals.filter((deal) => (deal.bountyRewardAmount ?? 0) > 0), [deals]);

  type BountyStatusFilter = 'all' | 'active' | 'scheduled' | 'expired';
  type BountySort = 'recent' | 'reward_desc' | 'redemptions_desc';
  type AvailableStatusFilter = 'all' | 'active' | 'scheduled';
  type AvailableBountyFilter = 'all' | 'configured' | 'unconfigured';

  const [bountyStatusFilter, setBountyStatusFilter] = useState<BountyStatusFilter>('all');
  const [bountySort, setBountySort] = useState<BountySort>('recent');
  const [bountySearch, setBountySearch] = useState('');

  // Filters for the "Choose a deal" picker (attach-bounty list)
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerStatus, setPickerStatus] = useState<AvailableStatusFilter>('all');
  const [pickerBounty, setPickerBounty] = useState<AvailableBountyFilter>('all');

  const filteredAvailableDeals = useMemo(() => {
    const term = pickerSearch.trim().toLowerCase();
    return availableDeals.filter((deal) => {
      if (pickerStatus === 'active' && deal.isUpcoming) return false;
      if (pickerStatus === 'scheduled' && !deal.isUpcoming) return false;
      const hasBounty = (deal.bountyRewardAmount ?? 0) > 0;
      if (pickerBounty === 'configured' && !hasBounty) return false;
      if (pickerBounty === 'unconfigured' && hasBounty) return false;
      if (term && !deal.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [availableDeals, pickerSearch, pickerStatus, pickerBounty]);

  const hasActivePickerFilter =
    pickerStatus !== 'all' || pickerBounty !== 'all' || pickerSearch.trim().length > 0;

  const filteredBountyDeals = useMemo(() => {
    const term = bountySearch.trim().toLowerCase();
    const filtered = bountyDeals.filter((deal) => {
      if (bountyStatusFilter === 'active' && (deal.isExpired || deal.isUpcoming)) return false;
      if (bountyStatusFilter === 'scheduled' && !deal.isUpcoming) return false;
      if (bountyStatusFilter === 'expired' && !deal.isExpired) return false;
      if (term && !deal.title.toLowerCase().includes(term)) return false;
      return true;
    });
    const sorted = [...filtered];
    if (bountySort === 'reward_desc') {
      sorted.sort((a, b) => (b.bountyRewardAmount ?? 0) - (a.bountyRewardAmount ?? 0));
    } else if (bountySort === 'redemptions_desc') {
      sorted.sort((a, b) => (b.currentRedemptions ?? 0) - (a.currentRedemptions ?? 0));
    } else {
      // 'recent' — keep API order (already sorted desc by createdAt server-side)
    }
    return sorted;
  }, [bountyDeals, bountyStatusFilter, bountySort, bountySearch]);

  const hasActiveBountyFilter =
    bountyStatusFilter !== 'all' || bountySort !== 'recent' || bountySearch.trim().length > 0;

  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [form, setForm] = useState<BountyFormState>(() => createBlankForm());

  useEffect(() => {
    if (selectedDealId == null && availableDeals.length > 0) {
      setSelectedDealId(availableDeals[0].id);
    }
  }, [availableDeals, selectedDealId]);

  const selectedDeal = useMemo(
    () => availableDeals.find((deal) => deal.id === selectedDealId) ?? null,
    [availableDeals, selectedDealId],
  );

  useEffect(() => {
    if (!selectedDeal) {
      setForm(createBlankForm());
      return;
    }
    setForm(formFromDeal(selectedDeal));
  }, [selectedDeal]);

  const configureBounty = useMutation<ConfigureBountyResponse, Error, void>({
    mutationFn: async () => {
      if (!selectedDeal) {
        throw new Error('Select a deal first');
      }

      const rewardAmount = parseFloat(form.rewardAmount);
      const minReferrals = parseInt(form.minReferralsRequired, 10);
      const potAmount = form.potAmount.trim() ? parseFloat(form.potAmount) : undefined;
      const maxInvites = form.maxInvites.trim() ? parseInt(form.maxInvites, 10) : undefined;
      const minSpend = form.minSpend.trim() ? parseFloat(form.minSpend) : undefined;

      if (!Number.isFinite(rewardAmount) || rewardAmount <= 0) throw new Error('Reward amount must be positive');
      if (!Number.isInteger(minReferrals) || minReferrals < 1) throw new Error('Minimum referrals must be at least 1');
      if (potAmount !== undefined && (!Number.isFinite(potAmount) || potAmount < 0)) throw new Error('Pot amount must be zero or greater');
      if (maxInvites !== undefined && (!Number.isInteger(maxInvites) || maxInvites < 1)) throw new Error('Max invites must be at least 1');
      if (minSpend !== undefined && (!Number.isFinite(minSpend) || minSpend < 0)) throw new Error('Minimum spend must be zero or greater');

      const payload = {
        bountyRewardAmount: rewardAmount,
        minReferralsRequired: minReferrals,
        bountyPotAmount: potAmount,
        bountyMaxInvites: maxInvites,
        bountyMinSpend: minSpend,
        kickbackEnabled: form.kickbackEnabled,
      };

      const response = await apiPatch<ConfigureBountyResponse, typeof payload>(`/merchants/deals/${selectedDeal.id}/bounty`, payload);
      if (!response.success || !response.data) {
        throw new Error(response.error ?? 'Failed to save bounty');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant-deals'] });
      toast({ title: 'Bounty saved', description: 'The selected deal is now configured for sharing.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Could not save bounty', description: err.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className={cn(panelClass, 'border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-300')}>{(error as Error).message}</div>;
  }

  if (!merchantStatus) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Join as a Merchant</h1>
          <p className="mb-8 text-muted-foreground">Start creating deals and reach new customers</p>
          <Link to={PATHS.MERCHANT_ONBOARDING}>
            <Button size="lg">Become a Merchant</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      <div className={cn(panelClass, 'flex flex-wrap items-center justify-between gap-4 border-orange-200/70 dark:border-orange-900/50 bg-gradient-to-r from-orange-50 via-card to-card dark:from-card dark:bg-card p-5')}>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md">
            <Target className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Customer Bounties</h2>
            <p className="text-sm text-muted-foreground">Pick one of your deals, then attach a referral bounty and conditions to it.</p>
          </div>
        </div>
        <Link to={PATHS.MERCHANT_DEALS}>
          <Button size="md" variant="secondary" className="rounded-full border-border bg-card text-foreground shadow-sm hover:bg-muted">
            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
            View all deals
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Available deals</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-foreground">{availableDeals.length}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Configured bounties</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-foreground">{bountyDeals.length}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected deal</div>
          <div className="mt-1 truncate text-[1.1rem] font-semibold tracking-tight text-orange-700 dark:text-orange-300">{selectedDeal?.title ?? 'None'}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className={cn(panelClass, 'flex items-center justify-between gap-3 p-4')}>
            <div>
              <h3 className="text-base font-bold text-foreground">Choose a deal</h3>
              <p className="text-sm text-muted-foreground">Expired deals are read-only. Active and upcoming deals can be configured.</p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-neutral-200">{availableDeals.length} available</div>
          </div>

          {availableDeals.length === 0 ? (
            <div className={cn(panelClass, 'border-dashed p-8 text-center')}>
              <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
              <h3 className="text-[1.4rem] font-semibold tracking-tight text-foreground">No deals yet</h3>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">Create a deal first, then come back here to attach bounty conditions.</p>
              <div className="mt-5 flex justify-center gap-2">
                <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                  <Button className="rounded-full bg-foreground text-background hover:bg-foreground/85">Create a deal</Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Filter bar */}
              <div className={cn(panelClass, 'flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4')}>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Filters
                </span>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search title"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    className="h-8 w-[160px] rounded-full border-border bg-card pl-7 pr-3 text-[12px] shadow-none"
                  />
                </div>

                <Select
                  value={pickerStatus}
                  onValueChange={(value) => setPickerStatus(value as AvailableStatusFilter)}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[120px] gap-1.5 rounded-full border-border bg-card px-3 text-[12px] font-medium shadow-none">
                    <span className="text-muted-foreground">Status:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={pickerBounty}
                  onValueChange={(value) => setPickerBounty(value as AvailableBountyFilter)}
                >
                  <SelectTrigger className="h-8 w-auto min-w-[140px] gap-1.5 rounded-full border-border bg-card px-3 text-[12px] font-medium shadow-none">
                    <span className="text-muted-foreground">Bounty:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unconfigured">No bounty yet</SelectItem>
                    <SelectItem value="configured">Configured</SelectItem>
                  </SelectContent>
                </Select>

                {hasActivePickerFilter ? (
                  <button
                    onClick={() => {
                      setPickerSearch('');
                      setPickerStatus('all');
                      setPickerBounty('all');
                    }}
                    className="rounded-full px-2 py-1 text-[12px] font-semibold text-foreground transition hover:text-foreground"
                  >
                    Clear
                  </button>
                ) : null}

                <span className="ml-auto text-[12px] text-muted-foreground">
                  {filteredAvailableDeals.length} of {availableDeals.length}
                </span>
              </div>

              {filteredAvailableDeals.length === 0 ? (
                <div className={cn(panelClass, 'px-4 py-10 text-center')}>
                  <p className="text-[13px] text-muted-foreground">No deals match these filters.</p>
                  <button
                    onClick={() => {
                      setPickerSearch('');
                      setPickerStatus('all');
                      setPickerBounty('all');
                    }}
                    className="mt-2 inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-[12px] font-semibold text-foreground hover:border-border hover:bg-muted"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredAvailableDeals.map((deal) => (
                    <BountySelectionCard
                      key={deal.id}
                      deal={deal}
                      selected={deal.id === selectedDeal?.id}
                      onSelect={(picked) => setSelectedDealId(picked.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedDeal ? (
            <ConfigureBountyForm
              deal={selectedDeal}
              form={form}
              setForm={setForm}
              onSave={() => configureBounty.mutate()}
              isSaving={configureBounty.isPending}
            />
          ) : (
            <div className={cn(panelClass, 'p-5 text-sm text-muted-foreground')}>Select a deal to configure its bounty.</div>
          )}
        </div>
      </div>

      {bountyDeals.length > 0 && (
        <div className="space-y-3">
          <div className={cn(panelClass, 'flex items-center justify-between gap-3 p-4')}>
            <div>
              <h3 className="text-base font-bold text-foreground">Configured bounties</h3>
              <p className="text-sm text-muted-foreground">Deals with active bounty settings and QR codes.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950/30 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300 ring-1 ring-inset ring-orange-200">
              <Users className="h-3.5 w-3.5" />
              {bountyDeals.length}
            </div>
          </div>

          {/* Filter bar */}
          <div className={cn(panelClass, 'flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4')}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Filters
            </span>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search title"
                value={bountySearch}
                onChange={(e) => setBountySearch(e.target.value)}
                className="h-8 w-[160px] rounded-full border-border bg-card pl-7 pr-3 text-[12px] shadow-none"
              />
            </div>

            <Select
              value={bountyStatusFilter}
              onValueChange={(value) => setBountyStatusFilter(value as BountyStatusFilter)}
            >
              <SelectTrigger className="h-8 w-auto min-w-[120px] gap-1.5 rounded-full border-border bg-card px-3 text-[12px] font-medium shadow-none">
                <span className="text-muted-foreground">Status:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bountySort} onValueChange={(value) => setBountySort(value as BountySort)}>
              <SelectTrigger className="h-8 w-auto min-w-[150px] gap-1.5 rounded-full border-border bg-card px-3 text-[12px] font-medium shadow-none">
                <span className="text-muted-foreground">Sort:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="reward_desc">Highest reward</SelectItem>
                <SelectItem value="redemptions_desc">Most redemptions</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveBountyFilter ? (
              <button
                onClick={() => {
                  setBountyStatusFilter('all');
                  setBountySort('recent');
                  setBountySearch('');
                }}
                className="rounded-full px-2 py-1 text-[12px] font-semibold text-foreground transition hover:text-foreground"
              >
                Clear
              </button>
            ) : null}

            <span className="ml-auto text-[12px] text-muted-foreground">
              {filteredBountyDeals.length} of {bountyDeals.length}{' '}
              {bountyDeals.length === 1 ? 'bounty' : 'bounties'}
            </span>
          </div>

          {filteredBountyDeals.length === 0 ? (
            <div className={cn(panelClass, 'px-4 py-10 text-center')}>
              <p className="text-[13px] text-muted-foreground">No bounties match these filters.</p>
              <button
                onClick={() => {
                  setBountyStatusFilter('all');
                  setBountySort('recent');
                  setBountySearch('');
                }}
                className="mt-2 inline-flex h-8 items-center rounded-full border border-border bg-card px-3 text-[12px] font-semibold text-foreground hover:border-border hover:bg-muted"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredBountyDeals.map((deal) => (
                <BountyDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const MerchantBountyDealsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage bounties.">
    <MerchantBountyDealsContent />
  </MerchantProtectedRoute>
);