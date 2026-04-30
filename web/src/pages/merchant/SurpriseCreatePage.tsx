import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useToast } from '@/hooks/use-toast';
import { useCreateSurpriseDeal, useGenerateSurpriseAI } from '@/hooks/useSurprises';
import type { CreateSurpriseDealPayload, SurpriseType } from '@/types/surprises';
import { cn } from '@/lib/utils';

const SURPRISE_TYPES: { value: SurpriseType; label: string; description: string }[] = [
  {
    value: 'LOCATION_BASED',
    label: 'Location',
    description: 'Reveal when user is within a set radius',
  },
  {
    value: 'TIME_BASED',
    label: 'Time',
    description: 'Reveal automatically at a specific date & time',
  },
  {
    value: 'ENGAGEMENT_BASED',
    label: 'Check-in',
    description: 'Reveal after user checks in at your location',
  },
  {
    value: 'RANDOM_DROP',
    label: 'Random Drop',
    description: 'First-come-first-served from a limited slot pool',
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
  redemptionInstructions: '',
  surpriseType: 'LOCATION_BASED',
  surpriseHint: '',
  discountPercentage: '',
  discountAmount: '',
  revealRadiusMeters: '',
  revealAt: '',
  revealDurationMinutes: '60',
  surpriseTotalSlots: '',
};

function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-500/20 disabled:bg-neutral-50';

function SurpriseCreateInner() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const create = useCreateSurpriseDeal();
  const generateAI = useGenerateSurpriseAI();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [aiIntent, setAiIntent] = useState('');

  const set = (field: keyof FormState, value: string) =>
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
            revealRadiusMeters: s.suggestedRevealRadiusMeters !== null
              ? String(s.suggestedRevealRadiusMeters)
              : '',
          }));
          toast({ title: 'AI suggestion applied', description: 'Review and edit before saving.' });
        },
        onError: (e) =>
          toast({ title: 'AI failed', description: e.message, variant: 'destructive' }),
      },
    );
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim() || !form.startTime || !form.endTime || !form.redemptionInstructions.trim()) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }
    if (form.surpriseType === 'LOCATION_BASED' && !form.revealRadiusMeters) {
      toast({ title: 'Reveal radius required for Location-based surprise', variant: 'destructive' });
      return;
    }
    if (form.surpriseType === 'TIME_BASED' && !form.revealAt) {
      toast({ title: 'Reveal time required for Time-based surprise', variant: 'destructive' });
      return;
    }

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
        toast({ title: 'Surprise deal created!' });
        navigate(PATHS.MERCHANT_SURPRISES);
      },
      onError: (e) =>
        toast({ title: 'Create failed', description: e.message, variant: 'destructive' }),
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        to={PATHS.MERCHANT_SURPRISES}
        className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-brand-primary-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        Back to My Surprises
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-neutral-900">Create Surprise Deal</h1>
      <p className="mt-1 text-sm text-neutral-500">
        A mystery deal that users reveal by meeting a trigger condition.
      </p>

      {/* AI Generate section */}
      <div className="mt-6 rounded-xl border border-brand-primary-200 bg-brand-primary-50 p-4">
        <p className="text-sm font-semibold text-brand-primary-800">Generate with AI ✨</p>
        <p className="mt-0.5 text-xs text-brand-primary-600">
          Describe your offer and we'll fill in the form for you.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            className={cn(inputCls, 'flex-1 border-brand-primary-200 bg-white')}
            placeholder="e.g. 20% off all cocktails after 8pm on weekends"
            value={aiIntent}
            onChange={(e) => setAiIntent(e.target.value)}
          />
          <Button
            size="sm"
            className="flex-shrink-0 rounded-full"
            onClick={handleGenerateAI}
            disabled={generateAI.isPending}
          >
            {generateAI.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          {/* Surprise type selector */}
          <Field label="Surprise Type" required>
            <div className="grid grid-cols-2 gap-2">
              {SURPRISE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('surpriseType', t.value)}
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all',
                    form.surpriseType === t.value
                      ? 'border-brand-primary-500 bg-brand-primary-50 ring-1 ring-brand-primary-300'
                      : 'border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  <p className="text-sm font-semibold text-neutral-900">{t.label}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{t.description}</p>
                </button>
              ))}
            </div>
          </Field>

          {/* Basic info */}
          <Field label="Title" required>
            <input
              className={inputCls}
              placeholder="e.g. Mystery Happy Hour"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </Field>

          <Field label="Description" required>
            <textarea
              className={cn(inputCls, 'resize-none')}
              rows={3}
              placeholder="Full deal description (shown after reveal)"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>

          <Field label="Hint" hint="Teaser shown to users before they reveal the deal">
            <input
              className={inputCls}
              placeholder="e.g. Something bubbly awaits after sundown… 🍾"
              value={form.surpriseHint}
              onChange={(e) => set('surpriseHint', e.target.value)}
            />
          </Field>

          <Field label="Redemption Instructions" required>
            <textarea
              className={cn(inputCls, 'resize-none')}
              rows={2}
              placeholder="e.g. Show this screen to your server before ordering."
              value={form.redemptionInstructions}
              onChange={(e) => set('redemptionInstructions', e.target.value)}
            />
          </Field>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount %" hint="Leave blank if not applicable">
              <input
                className={inputCls}
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 30"
                value={form.discountPercentage}
                onChange={(e) => set('discountPercentage', e.target.value)}
              />
            </Field>
            <Field label="Discount Amount ($)" hint="Leave blank if not applicable">
              <input
                className={inputCls}
                type="number"
                min={0}
                placeholder="e.g. 5"
                value={form.discountAmount}
                onChange={(e) => set('discountAmount', e.target.value)}
              />
            </Field>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time" required>
              <input
                className={inputCls}
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </Field>
            <Field label="End Time" required>
              <input
                className={inputCls}
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
              />
            </Field>
          </div>

          {/* Conditional: Location-based */}
          {form.surpriseType === 'LOCATION_BASED' && (
            <Field label="Reveal Radius (meters)" required hint="How close the user must be to unlock">
              <input
                className={inputCls}
                type="number"
                min={10}
                placeholder="e.g. 100"
                value={form.revealRadiusMeters}
                onChange={(e) => set('revealRadiusMeters', e.target.value)}
              />
            </Field>
          )}

          {/* Conditional: Time-based */}
          {form.surpriseType === 'TIME_BASED' && (
            <Field label="Reveal At" required hint="Deal becomes unlockable at this exact time">
              <input
                className={inputCls}
                type="datetime-local"
                value={form.revealAt}
                onChange={(e) => set('revealAt', e.target.value)}
              />
            </Field>
          )}

          {/* Advanced */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Reveal Window (minutes)" hint="How long after reveal user has to redeem (default 60)">
              <input
                className={inputCls}
                type="number"
                min={1}
                placeholder="60"
                value={form.revealDurationMinutes}
                onChange={(e) => set('revealDurationMinutes', e.target.value)}
              />
            </Field>
            <Field label="Total Slots" hint="Leave blank for unlimited">
              <input
                className={inputCls}
                type="number"
                min={1}
                placeholder="e.g. 50"
                value={form.surpriseTotalSlots}
                onChange={(e) => set('surpriseTotalSlots', e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            size="md"
            className="flex-1 rounded-full"
            onClick={handleSubmit}
            disabled={create.isPending}
          >
            {create.isPending ? 'Creating…' : 'Create Surprise Deal'}
          </Button>
          <Link to={PATHS.MERCHANT_SURPRISES}>
            <Button variant="secondary" size="md" className="rounded-full">
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const SurpriseCreatePage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can create surprise deals.">
    <SurpriseCreateInner />
  </MerchantProtectedRoute>
);
