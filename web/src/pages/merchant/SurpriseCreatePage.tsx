import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, MapPin, Clock, CheckCircle2, Dices } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { useCreateSurpriseDeal, useGenerateSurpriseAI } from '@/hooks/useSurprises';
import type { CreateSurpriseDealPayload, SurpriseType } from '@/types/surprises';
import { cn } from '@/lib/utils';
import { QuickFormLayout } from '@/components/merchant/create-deal/quick-form/QuickFormLayout';
import {
  SectionCard,
  FieldLabel,
} from '@/components/merchant/create-deal/quick-form/SectionCard';

const SURPRISE_TYPES: { value: SurpriseType; label: string; description: string; icon: typeof MapPin }[] = [
  {
    value: 'LOCATION_BASED',
    label: 'Location',
    description: 'Reveal when user is within a set radius',
    icon: MapPin,
  },
  {
    value: 'TIME_BASED',
    label: 'Time',
    description: 'Reveal automatically at a specific date & time',
    icon: Clock,
  },
  {
    value: 'ENGAGEMENT_BASED',
    label: 'Check-in',
    description: 'Reveal after user checks in at your location',
    icon: CheckCircle2,
  },
  {
    value: 'RANDOM_DROP',
    label: 'Random Drop',
    description: 'First-come-first-served from a limited slot pool',
    icon: Dices,
  },
];

interface FormState {
  title: string;
  description: string;
  categoryId: string;
  dealTypeId: string;
  startTime: string;
  endTime: string;
  redemptionInstructions: string;
  surpriseType: SurpriseType;
  surpriseHint: string;
  discountPercentage: string;
  discountAmount: string;
  revealRadiusMeters: string;
  revealAt: string;
  revealDurationMinutes: string;
  surpriseTotalSlots: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  categoryId: '',
  dealTypeId: '',
  startTime: '',
  endTime: '',
  redemptionInstructions: 'Show this screen to redeem.',
  surpriseType: 'LOCATION_BASED',
  surpriseHint: '',
  discountPercentage: '',
  discountAmount: '',
  revealRadiusMeters: '100',
  revealAt: '',
  revealDurationMinutes: '60',
  surpriseTotalSlots: '',
};

const inputClassName = 'mt-1.5 h-10 rounded-lg border-border bg-card text-[13.5px]';

function SurpriseCreateInner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const create = useCreateSurpriseDeal();
  const generateAI = useGenerateSurpriseAI();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [aiIntent, setAiIntent] = useState('');

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleGenerateAI = () => {
    if (aiIntent.trim().length < 5) {
      toast({ title: 'Describe your offer', description: 'At least 5 characters needed.', variant: 'destructive' });
      return;
    }
    generateAI.mutate(
      { intent: aiIntent, surpriseType: form.surpriseType },
      {
        onSuccess: (res) => {
          if (!res.success || !res.data) {
            toast({ title: 'AI unavailable', description: res.error ?? 'Try again later.', variant: 'destructive' });
            return;
          }
          const s = res.data.suggestion;
          setForm((prev) => ({
            ...prev,
            title: s.title,
            description: s.description,
            surpriseHint: s.surpriseHint,
            redemptionInstructions: s.redemptionInstructions,
            discountPercentage: s.discountPercentage !== null ? String(s.discountPercentage) : '',
            discountAmount: s.discountAmount !== null ? String(s.discountAmount) : '',
            surpriseType: s.suggestedRevealType,
            revealRadiusMeters:
              s.suggestedRevealRadiusMeters !== null ? String(s.suggestedRevealRadiusMeters) : '',
          }));
          toast({ title: 'AI suggestion applied', description: 'Review and edit before saving.' });
        },
        onError: (e) => toast({ title: 'AI failed', description: e.message, variant: 'destructive' }),
      },
    );
  };

  const canPublish = useMemo(() => {
    if (!form.title.trim() || !form.description.trim()) return false;
    if (!form.startTime || !form.endTime) return false;
    if (!form.redemptionInstructions.trim()) return false;
    if (form.surpriseType === 'LOCATION_BASED' && !form.revealRadiusMeters) return false;
    if (form.surpriseType === 'TIME_BASED' && !form.revealAt) return false;
    return true;
  }, [form]);

  const handleSubmit = () => {
    if (!canPublish) return;

    const payload: CreateSurpriseDealPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      categoryId: Number(form.categoryId) || 1,
      dealTypeId: Number(form.dealTypeId) || 1,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      redemptionInstructions: form.redemptionInstructions.trim(),
      surpriseType: form.surpriseType,
      surpriseHint: form.surpriseHint.trim() || undefined,
      discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : undefined,
      discountAmount: form.discountAmount ? Number(form.discountAmount) : undefined,
      revealRadiusMeters: form.revealRadiusMeters ? Number(form.revealRadiusMeters) : undefined,
      revealAt: form.revealAt ? new Date(form.revealAt).toISOString() : undefined,
      revealDurationMinutes: form.revealDurationMinutes ? Number(form.revealDurationMinutes) : undefined,
      surpriseTotalSlots: form.surpriseTotalSlots ? Number(form.surpriseTotalSlots) : undefined,
    };

    create.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Surprise deal published', description: 'Your surprise deal is now live.' });
        setTimeout(() => navigate(PATHS.MERCHANT_SURPRISES), 600);
      },
      onError: (e) => toast({ title: 'Could not publish', description: e.message, variant: 'destructive' }),
    });
  };

  return (
    <QuickFormLayout
      title="Create a Surprise Deal"
      subtitle="A mystery deal that customers reveal when they meet a trigger condition."
      onBack={() => navigate(PATHS.MERCHANT_SURPRISES)}
      primary={{
        label: 'Publish surprise',
        onClick: handleSubmit,
        disabled: !canPublish,
        isLoading: create.isPending,
      }}
    >
      <div className="space-y-3">
        {/* AI generator */}
        <SectionCard className="bg-gradient-to-br from-violet-50/50 to-card dark:bg-none dark:bg-card">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-foreground">Generate with AI</div>
              <p className="text-[12px] text-muted-foreground">
                Describe your offer in one line — we'll fill in the form.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  value={aiIntent}
                  onChange={(e) => setAiIntent(e.target.value)}
                  placeholder="e.g. 20% off all cocktails after 8pm on weekends"
                  className="h-10 rounded-lg border-border bg-card text-[13.5px]"
                />
                <Button
                  variant="ghost"
                  onClick={handleGenerateAI}
                  disabled={generateAI.isPending}
                  className="h-10 shrink-0 rounded-lg border border-violet-200 dark:border-violet-900/50 bg-violet-600 px-3 text-white hover:bg-violet-700 hover:text-white disabled:opacity-70"
                >
                  {generateAI.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
                </Button>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Surprise type */}
        <SectionCard>
          <FieldLabel label="Surprise type" required />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SURPRISE_TYPES.map((t) => {
              const Icon = t.icon;
              const selected = form.surpriseType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('surpriseType', t.value)}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border p-3 text-left transition',
                    selected
                      ? 'border-foreground bg-muted shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
                      : 'border-border bg-card hover:border-border hover:bg-muted',
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-foreground">{t.label}</div>
                    <div className="text-[11px] text-muted-foreground">{t.description}</div>
                  </div>
                  {selected ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-foreground" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Basics */}
        <SectionCard>
          <FieldLabel label="Title" required htmlFor="surprise-title" />
          <Input
            id="surprise-title"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Mystery Happy Hour"
            className={inputClassName}
            maxLength={100}
          />

          <div className="mt-4">
            <FieldLabel label="Description" required hint="Shown after the customer reveals the deal" htmlFor="surprise-desc" />
            <Textarea
              id="surprise-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="Full deal description (shown after reveal)"
              className="mt-1.5 resize-none rounded-lg border-border bg-card text-[13.5px]"
            />
          </div>

          <div className="mt-4">
            <FieldLabel label="Hint" hint="Teaser shown before the reveal" htmlFor="surprise-hint" />
            <Input
              id="surprise-hint"
              value={form.surpriseHint}
              onChange={(e) => set('surpriseHint', e.target.value)}
              placeholder="Something bubbly awaits after sundown… 🍾"
              className={inputClassName}
              maxLength={150}
            />
          </div>

          <div className="mt-4">
            <FieldLabel label="Redemption instructions" required htmlFor="surprise-redeem" />
            <Textarea
              id="surprise-redeem"
              value={form.redemptionInstructions}
              onChange={(e) => set('redemptionInstructions', e.target.value)}
              rows={2}
              placeholder="Show this screen to your server before ordering."
              className="mt-1.5 resize-none rounded-lg border-border bg-card text-[13.5px]"
            />
          </div>
        </SectionCard>

        {/* Discount */}
        <SectionCard>
          <FieldLabel label="Discount" hint="At least one of these or a custom offer" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Percent off
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.discountPercentage}
                onChange={(e) => set('discountPercentage', e.target.value)}
                placeholder="30"
                className="h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Dollar amount off
              </label>
              <Input
                type="number"
                min={0}
                value={form.discountAmount}
                onChange={(e) => set('discountAmount', e.target.value)}
                placeholder="5"
                className="h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
          </div>
        </SectionCard>

        {/* Schedule */}
        <SectionCard>
          <FieldLabel label="Schedule" required />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Start time
              </label>
              <Input
                type="datetime-local"
                lang="en-US"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                className="h-10 rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                End time
              </label>
              <Input
                type="datetime-local"
                lang="en-US"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                className="h-10 rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
          </div>
        </SectionCard>

        {/* Reveal config — varies by type */}
        {form.surpriseType === 'LOCATION_BASED' ? (
          <SectionCard>
            <FieldLabel
              label="Reveal radius (meters)"
              required
              hint="Customers within this distance can reveal the deal"
              htmlFor="surprise-radius"
            />
            <Input
              id="surprise-radius"
              type="number"
              min={10}
              value={form.revealRadiusMeters}
              onChange={(e) => set('revealRadiusMeters', e.target.value)}
              placeholder="100"
              className={cn(inputClassName, 'w-[180px]')}
            />
          </SectionCard>
        ) : null}

        {form.surpriseType === 'TIME_BASED' ? (
          <SectionCard>
            <FieldLabel label="Reveal at" required hint="Customers can reveal at this exact moment" htmlFor="surprise-reveal-at" />
            <Input
              id="surprise-reveal-at"
              type="datetime-local"
              lang="en-US"
              value={form.revealAt}
              onChange={(e) => set('revealAt', e.target.value)}
              className={inputClassName}
            />
          </SectionCard>
        ) : null}

        {/* Advanced */}
        <SectionCard>
          <FieldLabel label="Advanced" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Reveal window (minutes)
              </label>
              <Input
                type="number"
                min={1}
                value={form.revealDurationMinutes}
                onChange={(e) => set('revealDurationMinutes', e.target.value)}
                placeholder="60"
                className="h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">How long after reveal users have to redeem.</p>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Total slots
              </label>
              <Input
                type="number"
                min={1}
                value={form.surpriseTotalSlots}
                onChange={(e) => set('surpriseTotalSlots', e.target.value)}
                placeholder="50"
                className="h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Leave blank for unlimited reveals.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </QuickFormLayout>
  );
}

export const SurpriseCreatePage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can create surprise deals.">
    <SurpriseCreateInner />
  </MerchantProtectedRoute>
);
