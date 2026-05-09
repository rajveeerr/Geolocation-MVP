import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Clock3,
  Crown,
  Edit3,
  Gem,
  Plus,
  Sparkles,
  Trash2,
  Users,
  Wand2,
  Zap,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface MockTier {
  id: string;
  name: string;
  icon: typeof Crown;
  accent: string;
  monthlyPrice: number;
  description: string;
  perks: string[];
  members: number;
}

const DEFAULT_TIERS: MockTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: Award,
    accent: 'from-amber-100 to-amber-50 text-amber-700 ring-amber-200',
    monthlyPrice: 4.99,
    description: 'Light perks for occasional customers.',
    perks: [
      '5% off any order',
      'Member-only weekly deal',
      'Standard delivery (no priority)',
    ],
    members: 124,
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: Gem,
    accent: 'from-slate-100 to-slate-50 text-slate-700 ring-slate-300',
    monthlyPrice: 9.99,
    description: 'Better discounts and free standard delivery.',
    perks: [
      '10% off any order',
      'Free standard delivery',
      'Early access to new deals (24h)',
      '2× loyalty points on every visit',
    ],
    members: 58,
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: Crown,
    accent: 'from-yellow-200 to-yellow-50 text-yellow-800 ring-yellow-300',
    monthlyPrice: 19.99,
    description: 'Best for regulars — biggest discounts and priority everything.',
    perks: [
      '15% off any order',
      'Free priority delivery',
      'Skip-the-line at pickup',
      '3× loyalty points',
      'Birthday gift voucher',
      'Exclusive monthly chef event',
    ],
    members: 19,
  },
];

const ALL_PERKS = [
  '5% off any order',
  '10% off any order',
  '15% off any order',
  'Free standard delivery',
  'Free priority delivery',
  'Skip-the-line at pickup',
  'Early access to new deals (24h)',
  'Early access to new deals (48h)',
  '2× loyalty points',
  '3× loyalty points',
  'Member-only weekly deal',
  'Birthday gift voucher',
  'Exclusive monthly chef event',
  'Free dessert with any meal',
  'Reservation priority',
];

function PerkRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-neutral-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
      <span>{text}</span>
    </li>
  );
}

function TierCard({
  tier,
  onEdit,
  onDelete,
}: {
  tier: MockTier;
  onEdit: (tier: MockTier) => void;
  onDelete: (tier: MockTier) => void;
}) {
  const Icon = tier.icon;
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'flex flex-col p-5')}
    >
      <header
        className={cn(
          'mb-4 inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold ring-1 ring-inset',
          tier.accent,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {tier.name}
      </header>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-neutral-900">${tier.monthlyPrice.toFixed(2)}</span>
        <span className="text-xs text-neutral-500">/ month</span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{tier.description}</p>

      <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-neutral-500">
        <Users className="h-3.5 w-3.5" aria-hidden />
        {tier.members} active member{tier.members === 1 ? '' : 's'}
      </div>

      <ul className="mt-4 space-y-1.5">
        {tier.perks.map((p) => (
          <PerkRow key={p} text={p} />
        ))}
      </ul>

      <footer className="mt-5 flex items-center gap-2 border-t border-neutral-100 pt-4">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onEdit(tier)}
          className="flex-1 rounded-full"
        >
          <Edit3 className="mr-1.5 h-3.5 w-3.5" />
          Edit perks
        </Button>
        <button
          type="button"
          onClick={() => onDelete(tier)}
          className="rounded-full border border-neutral-200 p-2 text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Remove ${tier.name} tier`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </footer>
    </motion.article>
  );
}

function MerchantMembershipTiersInner() {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<MockTier[]>(DEFAULT_TIERS);

  const showPreviewToast = (action: string) =>
    toast({
      title: 'Preview only',
      description: `${action} will be wired up once membership billing is built. For now this page is a UI sketch.`,
    });

  const handleEdit = (tier: MockTier) => showPreviewToast(`Editing "${tier.name}"`);
  const handleDelete = (tier: MockTier) => showPreviewToast(`Removing "${tier.name}"`);

  const totalMembers = tiers.reduce((sum, t) => sum + t.members, 0);
  const monthlyRevenue = tiers.reduce((sum, t) => sum + t.members * t.monthlyPrice, 0);

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
            This is a UI sketch of how merchant membership tiers will work. Nothing saves and customers can't subscribe yet — we'll wire up real billing in a future pass.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Incentives</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">Membership tiers</h1>
          <p className="mt-2 max-w-xl text-[13px] text-neutral-500 sm:text-sm">
            Offer customers ongoing perks for a monthly subscription — discounts, free delivery, priority access. Each tier defines its own perks and price.
          </p>
        </div>
        <Button
          size="md"
          onClick={() => showPreviewToast('Adding a new tier')}
          className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add tier
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Active members</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[1.6rem] font-semibold tracking-tight text-neutral-950">{totalMembers}</span>
            <span className="text-xs text-neutral-500">across all tiers</span>
          </div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Monthly revenue</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[1.6rem] font-semibold tracking-tight text-neutral-950">
              ${monthlyRevenue.toFixed(0)}
            </span>
            <span className="text-xs text-neutral-500">recurring (mock)</span>
          </div>
        </div>
        <div className={cn(panelClass, 'p-4')}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Tiers</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[1.6rem] font-semibold tracking-tight text-neutral-950">{tiers.length}</span>
            <span className="text-xs text-neutral-500">configured</span>
          </div>
        </div>
      </div>

      {/* Tiers grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.id} tier={t} onEdit={handleEdit} onDelete={handleDelete} />
        ))}

        <button
          type="button"
          onClick={() => showPreviewToast('Adding a new tier')}
          className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.45rem] border-2 border-dashed border-neutral-300 bg-neutral-50/50 text-neutral-400 transition hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
        >
          <Plus className="h-8 w-8" />
          <span className="mt-2 text-sm font-medium">Add another tier</span>
          <span className="mt-1 px-6 text-center text-xs text-neutral-400">
            Most merchants use 2–3 tiers. Bronze / Silver / Gold is a good default.
          </span>
        </button>
      </div>

      {/* Perks library preview */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">Perk library</h2>
        </header>
        <p className="mt-1 text-xs text-neutral-500">
          When you create a tier, you'll mix and match perks from this library. Custom perks coming later.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_PERKS.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
            >
              <Zap className="h-3 w-3 text-amber-500" />
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-neutral-500" aria-hidden />
          <h2 className="text-sm font-semibold text-neutral-900">What's needed to ship this</h2>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            Schema for tiers, perks, member subscriptions, billing periods
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            Recurring billing via PayPal SDK (already in BE deps) — webhooks for renewals, dunning, cancellation
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            Perk enforcement at the right call sites — discount % at deal redemption, delivery flag in checkout, "early access" gate on deal listings, etc.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
            Customer-facing subscribe/manage screens
          </li>
        </ul>
      </section>
    </div>
  );
}

export const MerchantMembershipTiersPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can preview membership tiers.">
    <MerchantMembershipTiersInner />
  </MerchantProtectedRoute>
);
