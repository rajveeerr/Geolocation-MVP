import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock3,
  Edit3,
  Loader2,
  Pause,
  Play,
  Plus,
  Trash2,
  TrendingUp,
  UserPlus,
  X,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateReferralProgram,
  useDeleteReferralProgram,
  useReferralLeaderboard,
  useReferralPrograms,
  useUpdateReferralProgram,
} from '@/hooks/useReferralPrograms';
import { cn } from '@/lib/utils';
import type { MerchantReferralProgram, ReferralProgramPayload } from '@/types/referral';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface FormState {
  name: string;
  description: string;
  rewardForReferrer: string;
  rewardForReferred: string;
  maxRedemptionsPerUser: string;
  expiresAt: string;
}

const blankForm = (): FormState => ({
  name: '',
  description: '',
  rewardForReferrer: '',
  rewardForReferred: '',
  maxRedemptionsPerUser: '',
  expiresAt: '',
});

const formStateFromProgram = (p: MerchantReferralProgram): FormState => ({
  name: p.name,
  description: p.description ?? '',
  rewardForReferrer: p.rewardForReferrer,
  rewardForReferred: p.rewardForReferred,
  maxRedemptionsPerUser: p.maxRedemptionsPerUser != null ? String(p.maxRedemptionsPerUser) : '',
  expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString().slice(0, 10) : '',
});

const buildPayload = (form: FormState): ReferralProgramPayload | { error: string } => {
  if (!form.name.trim()) return { error: 'Name is required' };
  if (!form.rewardForReferrer.trim()) return { error: 'Referrer reward is required' };
  if (!form.rewardForReferred.trim()) return { error: 'Friend reward is required' };

  const payload: ReferralProgramPayload = {
    name: form.name.trim(),
    description: form.description.trim() || null,
    rewardForReferrer: form.rewardForReferrer.trim(),
    rewardForReferred: form.rewardForReferred.trim(),
  };
  if (form.maxRedemptionsPerUser.trim()) {
    const n = parseInt(form.maxRedemptionsPerUser, 10);
    if (!Number.isFinite(n) || n < 1) return { error: 'Max per user must be ≥ 1' };
    payload.maxRedemptionsPerUser = n;
  } else {
    payload.maxRedemptionsPerUser = null;
  }
  if (form.expiresAt.trim()) {
    payload.expiresAt = new Date(form.expiresAt).toISOString();
  } else {
    payload.expiresAt = null;
  }
  return payload;
};

function ProgramForm({
  initial,
  isEditing,
  onCancel,
  onSubmit,
  isSubmitting,
}: {
  initial?: FormState;
  isEditing: boolean;
  onCancel: () => void;
  onSubmit: (form: FormState) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<FormState>(initial ?? blankForm());
  const set = <K extends keyof FormState>(k: K, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className={cn(panelClass, 'p-5')}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-neutral-900">
          {isEditing ? 'Edit referral program' : 'New referral program'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ref-name" className="text-xs font-semibold text-neutral-700">Name</Label>
          <Input
            id="ref-name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="First Bite"
            className="mt-1.5 h-11"
            maxLength={200}
          />
        </div>
        <div>
          <Label htmlFor="ref-expires" className="text-xs font-semibold text-neutral-700">
            Expires <span className="font-normal text-neutral-500">(optional)</span>
          </Label>
          <Input
            id="ref-expires"
            type="date"
            value={form.expiresAt}
            onChange={(e) => set('expiresAt', e.target.value)}
            className="mt-1.5 h-11"
          />
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="ref-desc" className="text-xs font-semibold text-neutral-700">
          Description <span className="font-normal text-neutral-500">(optional)</span>
        </Label>
        <Textarea
          id="ref-desc"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="When customers refer a friend who places their first order..."
          rows={2}
          maxLength={1000}
          className="mt-1.5 resize-none"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ref-referrer" className="text-xs font-semibold text-neutral-700">
            Referrer earns
          </Label>
          <Input
            id="ref-referrer"
            value={form.rewardForReferrer}
            onChange={(e) => set('rewardForReferrer', e.target.value)}
            placeholder="$5 store credit"
            className="mt-1.5 h-11"
            maxLength={300}
          />
        </div>
        <div>
          <Label htmlFor="ref-referred" className="text-xs font-semibold text-neutral-700">
            Friend earns
          </Label>
          <Input
            id="ref-referred"
            value={form.rewardForReferred}
            onChange={(e) => set('rewardForReferred', e.target.value)}
            placeholder="$10 off first order ($25+)"
            className="mt-1.5 h-11"
            maxLength={300}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ref-max" className="text-xs font-semibold text-neutral-700">
            Max redemptions per user <span className="font-normal text-neutral-500">(optional)</span>
          </Label>
          <Input
            id="ref-max"
            type="number"
            min={1}
            value={form.maxRedemptionsPerUser}
            onChange={(e) => set('maxRedemptionsPerUser', e.target.value)}
            placeholder="No limit"
            className="mt-1.5 h-11"
          />
        </div>
      </div>

      <Button
        type="button"
        onClick={() => onSubmit(form)}
        disabled={isSubmitting}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-base font-semibold text-white shadow-md hover:from-emerald-600 hover:to-teal-700"
      >
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isEditing ? 'Save changes' : 'Create program'}
      </Button>
    </div>
  );
}

function ProgramCard({
  program,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  program: MerchantReferralProgram;
  onEdit: (p: MerchantReferralProgram) => void;
  onToggleActive: (p: MerchantReferralProgram) => void;
  onDelete: (p: MerchantReferralProgram) => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-5', !program.isActive && 'opacity-60')}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-neutral-900">{program.name}</h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                program.isActive
                  ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20'
                  : 'bg-neutral-100 text-neutral-600 ring-neutral-400/20',
              )}
            >
              {program.isActive ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
          {program.description && (
            <p className="mt-1.5 text-xs text-neutral-500">{program.description}</p>
          )}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Referrer earns</div>
              <div className="mt-0.5 text-sm font-medium text-neutral-900">{program.rewardForReferrer}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Friend earns</div>
              <div className="mt-0.5 text-sm font-medium text-neutral-900">{program.rewardForReferred}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-neutral-500">
            {program.maxRedemptionsPerUser != null && (
              <span>Max {program.maxRedemptionsPerUser} per user</span>
            )}
            {program.expiresAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Expires {new Date(program.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-2 border-t border-neutral-100 pt-4">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onEdit(program)}
          className="rounded-full"
        >
          <Edit3 className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onToggleActive(program)}
          className="rounded-full"
        >
          {program.isActive ? (
            <>
              <Pause className="mr-1.5 h-3.5 w-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Resume
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={() => onDelete(program)}
          className="ml-auto rounded-full border border-neutral-200 p-2 text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
          aria-label="Archive program"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.article>
  );
}

function MerchantReferralsInner() {
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<MerchantReferralProgram | null>(null);

  const { data, isLoading, error } = useReferralPrograms({ includeInactive: true });
  const { data: leaderboard } = useReferralLeaderboard();
  const createProgram = useCreateReferralProgram();
  const updateProgram = useUpdateReferralProgram();
  const deleteProgram = useDeleteReferralProgram();

  const programs = data?.programs ?? [];
  const totalAttributions = leaderboard?.total ?? 0;
  const topReferrers = leaderboard?.topReferrers ?? [];
  const recentAttributions = leaderboard?.recent ?? [];

  const handleSubmit = async (form: FormState) => {
    const payload = buildPayload(form);
    if ('error' in payload) {
      console.warn('Form validation:', payload.error);
      return;
    }
    try {
      if (editingProgram) {
        await updateProgram.mutateAsync({ id: editingProgram.id, payload });
      } else {
        await createProgram.mutateAsync(payload);
      }
      setShowForm(false);
      setEditingProgram(null);
    } catch {
      /* hook already toasted */
    }
  };

  const handleEdit = (program: MerchantReferralProgram) => {
    setEditingProgram(program);
    setShowForm(true);
  };

  const handleToggleActive = (program: MerchantReferralProgram) => {
    updateProgram.mutate({ id: program.id, payload: { isActive: !program.isActive } });
  };

  const handleDelete = (program: MerchantReferralProgram) => {
    if (!confirm(`Archive "${program.name}"? It'll be hidden from new customers.`)) return;
    deleteProgram.mutate({ id: program.id });
  };

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

  const activeCount = programs.filter((p) => p.isActive).length;

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      {/* Title banner */}
      <div className={cn(panelClass, 'flex flex-wrap items-center justify-between gap-4 border-emerald-200/70 bg-gradient-to-r from-emerald-50 via-white to-white p-5')}>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
            <UserPlus className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
              Referral Programs
            </h2>
            <p className="text-sm text-neutral-600">
              Reward customers for bringing new people in — and reward the new person too.
            </p>
          </div>
        </div>
        <Button
          size="md"
          onClick={() => {
            setEditingProgram(null);
            setShowForm((s) => !s);
          }}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {showForm && !editingProgram ? 'Hide form' : 'Create Program'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Total programs</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-neutral-950">{programs.length}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Active</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-neutral-950">{activeCount}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Total attributions</div>
          <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-emerald-700">{totalAttributions}</div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Top referrer</div>
          <div className="mt-1 truncate text-[1.05rem] font-semibold tracking-tight text-neutral-950">
            {topReferrers[0]?.name ?? '—'}
          </div>
          {topReferrers[0] && (
            <div className="text-[11px] text-neutral-500">{topReferrers[0].attributions} attributions</div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="ref-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ProgramForm
              initial={editingProgram ? formStateFromProgram(editingProgram) : undefined}
              isEditing={!!editingProgram}
              onCancel={() => {
                setShowForm(false);
                setEditingProgram(null);
              }}
              onSubmit={handleSubmit}
              isSubmitting={createProgram.isPending || updateProgram.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {programs.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <UserPlus className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No referral programs yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Run a "first-time customer" or "win-back" program. You set what the referrer earns and what their friend gets.
          </p>
          <div className="mt-5">
            <Button
              onClick={() => setShowForm(true)}
              className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create your first program
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {programs.map((p) => (
            <ProgramCard
              key={p.id}
              program={p}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Top referrers + recent attributions */}
      {totalAttributions > 0 && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className={cn(panelClass, 'p-5')}>
            <header className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" aria-hidden />
              <h2 className="text-sm font-semibold text-neutral-900">Top referrers</h2>
            </header>
            <ol className="mt-3 divide-y divide-neutral-100">
              {topReferrers.slice(0, 5).map((r, idx) => (
                <li key={r.userId} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">{r.name ?? `User #${r.userId}`}</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700">
                    {r.attributions} {r.attributions === 1 ? 'referral' : 'referrals'}
                  </span>
                </li>
              ))}
              {topReferrers.length === 0 && (
                <li className="py-2 text-xs text-neutral-500">No attributions yet.</li>
              )}
            </ol>
          </div>
          <div className={cn(panelClass, 'p-5')}>
            <header className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-500" aria-hidden />
              <h2 className="text-sm font-semibold text-neutral-900">Recent attributions</h2>
            </header>
            <ol className="mt-3 divide-y divide-neutral-100 text-sm">
              {recentAttributions.slice(0, 8).map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <span className="font-medium text-neutral-900">{a.referrer.name ?? `User #${a.referrer.id}`}</span>
                    <span className="mx-1 text-neutral-400">→</span>
                    <span className="text-neutral-700">{a.referred.name ?? `User #${a.referred.id}`}</span>
                    <div className="text-[11px] text-neutral-500">
                      {a.program.name} · via {a.triggerType.toLowerCase()}
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    {new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Roadmap — what attribution still needs */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-neutral-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">What's still pending</h2>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>
              Customer-side referral codes <span className="text-neutral-500">(already built — `User.referralCode`)</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>Configure programs (this page) — create, edit, pause, archive</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>Attribution recorded on every check-in by a referred customer (this page reflects it above)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>Top-referrers leaderboard endpoint</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span><strong>Reward fulfillment:</strong> rewards are free-text — actually paying out (store credit, discount code, etc.) is still manual on your end</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Catering-order attribution (right now only check-ins trigger it)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Customer-facing share UI inside each merchant's storefront</span>
          </li>
        </ul>
      </section>

      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
        <TrendingUp className="h-3.5 w-3.5 shrink-0 text-amber-700" />
        Reward fields are free-text in v1. Customers see them as-is. Structured payouts (auto-credit, percent off) come with attribution.
      </div>
    </div>
  );
}

export const MerchantReferralsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage referral programs.">
    <MerchantReferralsInner />
  </MerchantProtectedRoute>
);
