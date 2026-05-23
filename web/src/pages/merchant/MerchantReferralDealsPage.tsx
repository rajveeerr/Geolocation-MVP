import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Loader2, Share2, Target, Users } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { useReferrals } from '@/hooks/useReferrals';
import {
  useCreateReferralProgram,
  useReferralPrograms,
  useUpdateReferralProgram,
} from '@/hooks/useReferralPrograms';
import { useToast } from '@/hooks/use-toast';
import { apiGet } from '@/services/api';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import type { MerchantReferralProgram, ReferralProgramPayload } from '@/types/referral';

const panelClass =
  'rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface ReferralDeal {
  id: number;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  currentRedemptions?: number;
  dealType?: { name?: string | null } | null;
  isExpired?: boolean;
  isUpcoming?: boolean;
}

interface ReferralFormState {
  isActive: boolean;
  rewardForReferrer: string;
  rewardForReferred: string;
  description: string;
  maxRedemptionsPerUser: string;
  expiresAt: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

const dealState = (deal: ReferralDeal) => {
  if (deal.isExpired) return { label: 'Expired', tone: 'bg-muted text-muted-foreground ring-neutral-400/20' };
  if (deal.isUpcoming) return { label: 'Scheduled', tone: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-sky-600/20' };
  return { label: 'Active', tone: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20' };
};

const blankForm = (): ReferralFormState => ({
  isActive: true,
  rewardForReferrer: '',
  rewardForReferred: '',
  description: '',
  maxRedemptionsPerUser: '',
  expiresAt: '',
});

const formFromProgram = (program?: MerchantReferralProgram | null): ReferralFormState => {
  if (!program) return blankForm();
  return {
    isActive: program.isActive,
    rewardForReferrer: program.rewardForReferrer,
    rewardForReferred: program.rewardForReferred,
    description: program.description ?? '',
    maxRedemptionsPerUser: program.maxRedemptionsPerUser != null ? String(program.maxRedemptionsPerUser) : '',
    expiresAt: program.expiresAt ? new Date(program.expiresAt).toISOString().slice(0, 10) : '',
  };
};

function DealSelectionCard({
  deal,
  program,
  selected,
  onSelect,
}: {
  deal: ReferralDeal;
  program?: MerchantReferralProgram;
  selected: boolean;
  onSelect: (deal: ReferralDeal) => void;
}) {
  const state = dealState(deal);

  return (
    <button
      type="button"
      onClick={() => onSelect(deal)}
      disabled={deal.isExpired}
      className={cn(
        panelClass,
        'w-full border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)] disabled:cursor-not-allowed disabled:opacity-60',
        selected && 'border-teal-300 ring-2 ring-teal-200',
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
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 ring-1 ring-inset', program ? 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 ring-teal-600/20' : 'bg-muted text-muted-foreground ring-neutral-400/20')}>
          {program ? (program.isActive ? 'Referral enabled' : 'Referral paused') : 'No referral offer yet'}
        </span>
        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-muted-foreground ring-1 ring-inset ring-neutral-200">
          {deal.dealType?.name ?? 'Deal'}
        </span>
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
    </button>
  );
}

function ConfigureReferralForm({
  deal,
  program,
  form,
  setForm,
  onSave,
  isSaving,
}: {
  deal: ReferralDeal;
  program?: MerchantReferralProgram;
  form: ReferralFormState;
  setForm: React.Dispatch<React.SetStateAction<ReferralFormState>>;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className={cn(panelClass, 'p-5')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Configure referral offer</div>
          <h3 className="mt-1 text-lg font-bold text-foreground">{deal.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {program ? 'Update the referral offer attached to this deal.' : 'Attach a referral offer to this deal.'}
          </p>
        </div>
        <div className={cn('rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', form.isActive ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 ring-emerald-200' : 'bg-muted text-muted-foreground ring-neutral-200')}>
          {form.isActive ? 'Enabled' : 'Paused'}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="referrer-offer" className="text-xs font-semibold text-foreground">Referrer earns</Label>
          <Input
            id="referrer-offer"
            value={form.rewardForReferrer}
            onChange={(e) => setForm((prev) => ({ ...prev, rewardForReferrer: e.target.value }))}
            placeholder="$5 store credit"
            className="mt-1.5 h-11"
            maxLength={300}
          />
        </div>
        <div>
          <Label htmlFor="friend-offer" className="text-xs font-semibold text-foreground">Friend gets</Label>
          <Input
            id="friend-offer"
            value={form.rewardForReferred}
            onChange={(e) => setForm((prev) => ({ ...prev, rewardForReferred: e.target.value }))}
            placeholder="$10 off first visit"
            className="mt-1.5 h-11"
            maxLength={300}
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="referral-desc" className="text-xs font-semibold text-foreground">Offer notes</Label>
        <Textarea
          id="referral-desc"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Example: applies when a referred friend checks in to this deal for the first time."
          rows={3}
          className="mt-1.5 resize-none"
          maxLength={1000}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="referral-max" className="text-xs font-semibold text-foreground">Max redemptions per referrer</Label>
          <Input
            id="referral-max"
            type="number"
            min={1}
            value={form.maxRedemptionsPerUser}
            onChange={(e) => setForm((prev) => ({ ...prev, maxRedemptionsPerUser: e.target.value }))}
            placeholder="No limit"
            className="mt-1.5 h-11"
          />
        </div>
        <div>
          <Label htmlFor="referral-expires" className="text-xs font-semibold text-foreground">Referral offer ends</Label>
          <Input
            id="referral-expires"
            type="date"
            lang="en-US"
            value={form.expiresAt}
            onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
            className="mt-1.5 h-11"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
          className="h-4 w-4 accent-teal-600"
        />
        <div>
          <div className="text-sm font-medium text-foreground">Enable referral offer</div>
          <p className="text-xs text-muted-foreground">Attribution is recorded when a referred customer checks in to this deal.</p>
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

      <Button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-base font-semibold text-white shadow-md hover:from-emerald-600 hover:to-teal-700"
      >
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {program ? 'Update referral offer' : 'Enable referral offer'}
      </Button>
    </div>
  );
}

function ConfiguredReferralCard({
  deal,
  program,
  shareCode,
  onCopyLink,
}: {
  deal: ReferralDeal;
  program: MerchantReferralProgram;
  shareCode: string | null;
  onCopyLink: (deal: ReferralDeal) => void;
}) {
  const state = dealState(deal);

  return (
    <div className={cn(panelClass, 'p-5', !program.isActive && 'opacity-70')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-200">
          <Share2 className="h-5 w-5" />
        </div>
        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', state.tone)}>
          {state.label}
        </span>
      </div>

      <div className="mt-3">
        <h3 className="text-base font-bold text-foreground">{deal.title}</h3>
        {program.description && <p className="mt-1 text-sm text-muted-foreground">{program.description}</p>}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Referrer earns</div>
          <div className="mt-0.5 text-sm font-medium text-foreground">{program.rewardForReferrer}</div>
        </div>
        <div className="rounded-xl border border-border bg-muted/60 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Friend gets</div>
          <div className="mt-0.5 text-sm font-medium text-foreground">{program.rewardForReferred}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/30 p-3 text-xs">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Status</div>
          <div className="mt-0.5 text-sm font-bold text-teal-800 dark:text-teal-300">{program.isActive ? 'Enabled' : 'Paused'}</div>
        </div>
        <button
          type="button"
          onClick={() => onCopyLink(deal)}
          disabled={!shareCode || !program.isActive}
          className="inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-card px-3 py-1.5 text-xs font-medium text-teal-800 dark:text-teal-300 hover:bg-teal-50 dark:bg-teal-950/30 disabled:opacity-60"
        >
          <Share2 className="h-3.5 w-3.5" />
          Copy share link
        </button>
      </div>
    </div>
  );
}

function MerchantReferralDealsInner() {
  const { toast } = useToast();
  const { data: merchantData } = useMerchantStatus();
  const merchantStatus = merchantData?.data?.merchant?.status;
  const { data: referralData } = useReferrals();
  const shareCode = referralData?.referralCode ?? null;
  const createProgram = useCreateReferralProgram();
  const updateProgram = useUpdateReferralProgram();
  const programsQuery = useReferralPrograms({ includeInactive: true });

  const dealsQuery = useQuery({
    queryKey: ['merchant-deals'],
    queryFn: () => apiGet<{ deals: ReferralDeal[] }>('/merchants/deals'),
    enabled: !!merchantStatus && merchantStatus === 'APPROVED',
  });

  const deals = useMemo<ReferralDeal[]>(() => dealsQuery.data?.data?.deals ?? [], [dealsQuery.data]);
  const programs = programsQuery.data?.programs ?? [];
  const programByDealId = useMemo(
    () => new Map<number, MerchantReferralProgram>(
      programs
        .filter((program) => program.dealId != null)
        .map((program) => [Number(program.dealId), program]),
    ),
    [programs],
  );
  const availableDeals = useMemo(() => deals.filter((deal) => !deal.isExpired), [deals]);
  const configuredDeals = useMemo(
    () => availableDeals.filter((deal) => programByDealId.has(deal.id)),
    [availableDeals, programByDealId],
  );

  const [selectedDealId, setSelectedDealId] = useState<number | null>(null);
  const [form, setForm] = useState<ReferralFormState>(() => blankForm());

  useEffect(() => {
    if (selectedDealId == null && availableDeals.length > 0) {
      setSelectedDealId(availableDeals[0].id);
    }
  }, [availableDeals, selectedDealId]);

  const selectedDeal = useMemo(
    () => availableDeals.find((deal) => deal.id === selectedDealId) ?? null,
    [availableDeals, selectedDealId],
  );
  const selectedProgram = selectedDeal ? programByDealId.get(selectedDeal.id) : undefined;

  useEffect(() => {
    setForm(formFromProgram(selectedProgram));
  }, [selectedProgram, selectedDealId]);

  const buildPayload = (): ReferralProgramPayload => {
    if (!selectedDeal) throw new Error('Select a deal first');
    const maxRedemptionsPerUser = form.maxRedemptionsPerUser.trim()
      ? Number(form.maxRedemptionsPerUser)
      : null;
    if (maxRedemptionsPerUser != null && (!Number.isInteger(maxRedemptionsPerUser) || maxRedemptionsPerUser < 1)) {
      throw new Error('Max redemptions must be at least 1');
    }
    if (!form.rewardForReferrer.trim()) throw new Error('Referrer reward is required');
    if (!form.rewardForReferred.trim()) throw new Error('Friend reward is required');

    return {
      dealId: selectedDeal.id,
      name: `${selectedDeal.title} referral`,
      description: form.description.trim() || null,
      rewardForReferrer: form.rewardForReferrer.trim(),
      rewardForReferred: form.rewardForReferred.trim(),
      isActive: form.isActive,
      maxRedemptionsPerUser,
      expiresAt: form.expiresAt.trim() ? new Date(form.expiresAt).toISOString() : null,
    };
  };

  const saveReferralOffer = async () => {
    try {
      const payload = buildPayload();
      if (selectedProgram) {
        await updateProgram.mutateAsync({ id: selectedProgram.id, payload });
      } else {
        await createProgram.mutateAsync(payload);
      }
    } catch (error: any) {
      toast({ title: 'Could not save referral offer', description: error.message, variant: 'destructive' });
    }
  };

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

  const isLoading = dealsQuery.isLoading || programsQuery.isLoading;
  const error = dealsQuery.error || programsQuery.error;
  const isSaving = createProgram.isPending || updateProgram.isPending;

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

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      <div className={cn(panelClass, 'flex flex-wrap items-center justify-between gap-4 border-teal-200/70 dark:border-teal-900/50 bg-gradient-to-r from-teal-50 via-card to-card dark:bg-none dark:bg-card p-5')}>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <Share2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Referral Deals</h2>
            <p className="text-sm text-muted-foreground">Pick one of your deals, then choose the referral offer attached to it.</p>
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Configured referral deals</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-foreground">{configuredDeals.length}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected deal</div>
          <div className="mt-1 truncate text-[1.1rem] font-semibold tracking-tight text-teal-700 dark:text-teal-300">{selectedDeal?.title ?? 'None'}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className={cn(panelClass, 'flex items-center justify-between gap-3 p-4')}>
            <div>
              <h3 className="text-base font-bold text-foreground">Choose a deal</h3>
              <p className="text-sm text-muted-foreground">Expired deals are read-only. Active and upcoming deals can receive referral offers.</p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-neutral-200">{availableDeals.length} available</div>
          </div>

          {availableDeals.length === 0 ? (
            <div className={cn(panelClass, 'border-dashed p-8 text-center')}>
              <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground" aria-hidden />
              <h3 className="text-[1.4rem] font-semibold tracking-tight text-foreground">No deals yet</h3>
              <p className="mt-1 text-[13px] text-muted-foreground sm:text-sm">Create a deal first, then come back here to attach referral offers.</p>
              <div className="mt-5 flex justify-center">
                <Link to={PATHS.MERCHANT_DEALS_CREATE}>
                  <Button className="rounded-full bg-foreground text-background hover:bg-foreground/85">Create a deal</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {availableDeals.map((deal) => (
                <DealSelectionCard
                  key={deal.id}
                  deal={deal}
                  program={programByDealId.get(deal.id)}
                  selected={deal.id === selectedDeal?.id}
                  onSelect={(picked) => setSelectedDealId(picked.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          {selectedDeal ? (
            <ConfigureReferralForm
              deal={selectedDeal}
              program={selectedProgram}
              form={form}
              setForm={setForm}
              onSave={saveReferralOffer}
              isSaving={isSaving}
            />
          ) : (
            <div className={cn(panelClass, 'p-5 text-sm text-muted-foreground')}>Select a deal to configure its referral offer.</div>
          )}
        </div>
      </div>

      {configuredDeals.length > 0 && (
        <div className="space-y-4">
          <div className={cn(panelClass, 'flex items-center justify-between gap-3 p-4')}>
            <div>
              <h3 className="text-base font-bold text-foreground">Configured referral deals</h3>
              <p className="text-sm text-muted-foreground">Deals with active or paused referral offers attached.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/30 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 ring-1 ring-inset ring-teal-200">
              <Users className="h-3.5 w-3.5" />
              {configuredDeals.length}
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {configuredDeals.map((deal) => {
              const program = programByDealId.get(deal.id);
              return program ? (
                <ConfiguredReferralCard
                  key={deal.id}
                  deal={deal}
                  program={program}
                  shareCode={shareCode}
                  onCopyLink={copyShareLink}
                />
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export const MerchantReferralDealsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage referral deals.">
    <MerchantReferralDealsInner />
  </MerchantProtectedRoute>
);
