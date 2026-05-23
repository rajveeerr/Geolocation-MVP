import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Plus,
  Sparkles,
  Users,
  Wand2,
  Zap,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const panelClass =
  'rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

interface MockTier {
  id: string;
  name: string;
  monthlyPrice: number;
  perks: string[];
  members: number;
}

const DEFAULT_TIERS: MockTier[] = [
  {
    id: 'gold',
    name: 'Gold Member',
    monthlyPrice: 29.99,
    perks: ['10% OFF all orders', 'Free delivery', 'Early access'],
    members: 156,
  },
  {
    id: 'platinum',
    name: 'Platinum VIP',
    monthlyPrice: 49.99,
    perks: ['20% OFF all orders', 'Free delivery', 'Priority seating', 'Birthday gift'],
    members: 47,
  },
];

const ALL_PERKS = [
  '5% OFF all orders',
  '10% OFF all orders',
  '15% OFF all orders',
  '20% OFF all orders',
  'Free delivery',
  'Free priority delivery',
  'Priority seating',
  'Skip-the-line at pickup',
  'Early access',
  'Early access (24h)',
  'Early access (48h)',
  '2× loyalty points',
  '3× loyalty points',
  'Birthday gift',
  'Member-only weekly deal',
  'Free dessert with any meal',
  'Reservation priority',
];

function PerkRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground">
      <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
      <span>{text}</span>
    </li>
  );
}

function TierCard({ tier, onManageMembers }: { tier: MockTier; onManageMembers: (tier: MockTier) => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'flex flex-col p-5')}
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold tracking-tight text-foreground">{tier.name}</h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-950/40 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 ring-1 ring-inset ring-violet-200">
          <Users className="h-3 w-3" aria-hidden />
          {tier.members} members
        </span>
      </header>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-bold tracking-tight text-violet-600">
          ${tier.monthlyPrice.toFixed(2)}
        </span>
        <span className="text-xs text-muted-foreground">/ month</span>
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Perks:
      </p>
      <ul className="mt-2 space-y-2">
        {tier.perks.map((p) => (
          <PerkRow key={p} text={p} />
        ))}
      </ul>

      <div className="mt-6 flex-1" />

      <Button
        type="button"
        variant="secondary"
        onClick={() => onManageMembers(tier)}
        className="w-full rounded-2xl bg-card py-3 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-neutral-200 hover:bg-muted"
      >
        Manage Members
      </Button>
    </motion.article>
  );
}

function MerchantMembershipTiersInner() {
  const { toast } = useToast();
  const [tiers] = useState<MockTier[]>(DEFAULT_TIERS);

  const showPreviewToast = (action: string) =>
    toast({
      title: 'Preview only',
      description: `${action} will be wired up once membership billing is built. For now this page is a UI sketch.`,
    });

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      {/* Preview banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/70 dark:bg-violet-950/30 dark:bg-violet-950/30 dark:bg-violet-950/30 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card ring-1 ring-violet-200">
          <Wand2 className="h-4 w-4 text-violet-600" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">Preview — not live yet</p>
          <p className="mt-0.5 text-xs text-violet-800 dark:text-violet-300">
            This is a UI sketch of how merchant membership tiers will work. Nothing saves and customers can't subscribe yet — we'll wire up real billing in a future pass.
          </p>
        </div>
      </div>

      {/* Title banner — content from the reference, our theme */}
      <div className={cn(panelClass, 'flex flex-wrap items-center justify-between gap-4 border-violet-200/70 dark:border-violet-900/50 bg-gradient-to-r from-violet-50 via-card to-card dark:bg-none dark:bg-card p-5')}>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
            <CreditCard className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Membership Tiers
            </h2>
            <p className="text-sm text-muted-foreground">
              Monthly subscription programs with exclusive perks
            </p>
          </div>
        </div>
        <Button
          size="md"
          onClick={() => showPreviewToast('Adding a new tier')}
          className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md hover:from-violet-600 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Tier
        </Button>
      </div>

      {/* Tier grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((t) => (
          <TierCard
            key={t.id}
            tier={t}
            onManageMembers={(tier) => showPreviewToast(`Managing members for "${tier.name}"`)}
          />
        ))}

        <button
          type="button"
          onClick={() => showPreviewToast('Adding a new tier')}
          className="flex min-h-[280px] flex-col items-center justify-center rounded-[1.45rem] border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition hover:border-violet-300 hover:bg-violet-50/40 dark:bg-violet-950/30 dark:bg-violet-950/30 dark:bg-violet-950/30 hover:text-violet-700 dark:text-violet-300"
        >
          <Plus className="h-8 w-8" />
          <span className="mt-2 text-sm font-medium">Create another tier</span>
          <span className="mt-1 px-6 text-center text-xs text-muted-foreground">
            Most merchants use 2–3 tiers. Gold + Platinum is a good start.
          </span>
        </button>
      </div>

      {/* Perk library */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">Perk library</h2>
        </header>
        <p className="mt-1 text-xs text-muted-foreground">
          When you create a tier, mix and match perks from this library. Custom perks coming later.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ALL_PERKS.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-foreground"
            >
              <Zap className="h-3 w-3 text-violet-500" />
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className={cn(panelClass, 'p-5')}>
        <header className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h2 className="text-sm font-semibold text-foreground">What's needed to ship this</h2>
        </header>
        <ul className="mt-3 space-y-2 text-sm text-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            Schema for tiers, perks, member subscriptions, billing periods
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            Recurring billing via PayPal SDK (already in BE deps) — webhooks for renewals, dunning, cancellation
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            Perk enforcement at the right call sites — discount % at deal redemption, delivery flag in checkout, "early access" gate on deal listings
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
            Customer-facing subscribe / manage screens
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
