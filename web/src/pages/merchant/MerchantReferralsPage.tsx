import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  Gift,
  Plus,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wand2,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface MockReferralProgram {
  id: string;
  name: string;
  rewardForReferrer: string;
  rewardForReferred: string;
  status: 'ACTIVE' | 'PAUSED';
  totalReferrals: number;
  totalConversions: number;
  payouts: number;
}

const DEFAULT_PROGRAMS: MockReferralProgram[] = [
  {
    id: 'first-bite',
    name: 'First Bite',
    rewardForReferrer: '$5 store credit',
    rewardForReferred: '$10 off first order ($25+)',
    status: 'ACTIVE',
    totalReferrals: 312,
    totalConversions: 89,
    payouts: 445,
  },
  {
    id: 'bring-the-crew',
    name: 'Bring the Crew',
    rewardForReferrer: '15% off next order',
    rewardForReferred: '15% off first order',
    status: 'ACTIVE',
    totalReferrals: 178,
    totalConversions: 54,
    payouts: 0,
  },
];

const MOCK_TOP_REFERRERS = [
  { name: 'Marcus T.', referrals: 23, payouts: '$115' },
  { name: 'Priya K.', referrals: 18, payouts: '$90' },
  { name: 'Jordan W.', referrals: 12, payouts: '$60' },
  { name: 'Avery L.', referrals: 9, payouts: '$45' },
  { name: 'Sam R.', referrals: 7, payouts: '$35' },
];

function StatBox({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className={cn(panelClass, 'p-4')}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-[1.6rem] font-semibold tracking-tight text-neutral-950">{value}</span>
        {hint && <span className="text-xs text-neutral-500">{hint}</span>}
      </div>
    </div>
  );
}

function ProgramCard({
  program,
  onEdit,
}: {
  program: MockReferralProgram;
  onEdit: (p: MockReferralProgram) => void;
}) {
  const conversionRate =
    program.totalReferrals > 0
      ? Math.round((program.totalConversions / program.totalReferrals) * 100)
      : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'p-5')}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-900">{program.name}</h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset',
                program.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-700 ring-emerald-600/20'
                  : 'bg-neutral-100 text-neutral-600 ring-neutral-400/20',
              )}
            >
              {program.status}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">Referrer earns</p>
          <p className="text-sm font-medium text-neutral-900">{program.rewardForReferrer}</p>
          <p className="mt-2 text-xs text-neutral-500">Friend earns</p>
          <p className="text-sm font-medium text-neutral-900">{program.rewardForReferred}</p>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Referrals</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{program.totalReferrals}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Converted</div>
          <div className="mt-0.5 text-base font-bold text-neutral-900">{program.totalConversions}</div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-2.5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Rate</div>
          <div className="mt-0.5 text-base font-bold text-emerald-600">{conversionRate}%</div>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => onEdit(program)}
        className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-neutral-50"
      >
        <Edit3 className="mr-1.5 h-3.5 w-3.5" />
        Edit program
      </Button>
    </motion.article>
  );
}

function MerchantReferralsInner() {
  const { toast } = useToast();
  const [programs] = useState<MockReferralProgram[]>(DEFAULT_PROGRAMS);

  const showPreviewToast = (action: string) =>
    toast({
      title: 'Preview only',
      description: `${action} will be wired up once the merchant referral program is built. For now this page is a UI sketch.`,
    });

  const totalReferrals = programs.reduce((acc, p) => acc + p.totalReferrals, 0);
  const totalConversions = programs.reduce((acc, p) => acc + p.totalConversions, 0);
  const totalPayouts = programs.reduce((acc, p) => acc + p.payouts, 0);

  const sampleCode = 'YOHOP-MAYA';
  const sampleLink =
    typeof window !== 'undefined' ? `${window.location.origin}/r/${sampleCode}` : `https://example.com/r/${sampleCode}`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      {/* Preview banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-violet-200">
          <Wand2 className="h-4 w-4 text-violet-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-violet-900">Preview — not live yet</p>
          <p className="mt-0.5 text-xs text-violet-800">
            UI sketch of merchant-side referrals. Customer-side referral codes already exist (under <span className="font-medium">Cashback rewards</span>) — this page is the merchant configuration surface that's still to be built.
          </p>
        </div>
      </div>

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
          onClick={() => showPreviewToast('Adding a new program')}
          className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:from-emerald-600 hover:to-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <StatBox label="Total referrals" value={totalReferrals} hint="all-time" />
        <StatBox label="Converted" value={totalConversions} />
        <StatBox
          label="Conversion rate"
          value={`${totalReferrals > 0 ? Math.round((totalConversions / totalReferrals) * 100) : 0}%`}
        />
        <StatBox label="Payouts" value={`$${totalPayouts}`} hint="distributed" />
      </div>

      {/* Programs grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {programs.map((p) => (
          <ProgramCard key={p.id} program={p} onEdit={(prog) => showPreviewToast(`Editing "${prog.name}"`)} />
        ))}

        <button
          type="button"
          onClick={() => showPreviewToast('Adding a new program')}
          className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.45rem] border-2 border-dashed border-neutral-300 bg-neutral-50/50 text-neutral-400 transition hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700"
        >
          <Plus className="h-8 w-8" />
          <span className="mt-2 text-sm font-medium">Create another program</span>
          <span className="mt-1 px-6 text-center text-xs text-neutral-400">
            Run multiple programs in parallel — e.g. one for first-time customers, another for win-back.
          </span>
        </button>
      </div>

      {/* Sample share */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">Sample share</h2>
        </header>
        <p className="mt-1 text-xs text-neutral-500">
          What the customer sees when they tap "Share" — a unique code and link they can send to friends.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
            <code className="flex-1 truncate font-mono text-sm font-bold tracking-wider text-emerald-900">
              {sampleCode}
            </code>
            <button
              type="button"
              onClick={() => copy(sampleCode)}
              className="rounded p-1.5 text-emerald-700 hover:bg-emerald-100"
              aria-label="Copy code"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50/60 p-3">
            <code className="flex-1 truncate font-mono text-xs text-neutral-700">{sampleLink}</code>
            <button
              type="button"
              onClick={() => copy(sampleLink)}
              className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100"
              aria-label="Copy link"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Top referrers */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-neutral-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">Top referrers (sample)</h2>
        </header>
        <ol className="mt-3 divide-y divide-neutral-100">
          {MOCK_TOP_REFERRERS.map((r, i) => (
            <li key={r.name} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-900">{r.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-neutral-500">{r.referrals} referrals</span>
                <span className="font-semibold text-emerald-700">{r.payouts}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Roadmap */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-neutral-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">What's needed to ship this</h2>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            <span>
              Customer-side referral codes <span className="text-neutral-500">— already built (User.referralCode + REFERRAL_BONUS)</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Schema for merchant-side referral programs (reward config, eligible deals, expiry)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Attribution at deal-redemption time → credit referrer + apply friend bonus</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Top-referrers leaderboard endpoint + payout history</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            <span>Customer-facing share UI inside each merchant's storefront</span>
          </li>
        </ul>
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => showPreviewToast('Browsing existing referral activity')}
            className="rounded-full"
          >
            See existing referral activity
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

export const MerchantReferralsPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can view referral programs.">
    <MerchantReferralsInner />
  </MerchantProtectedRoute>
);
