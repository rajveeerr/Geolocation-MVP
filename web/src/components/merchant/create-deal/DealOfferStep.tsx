// src/components/merchant/create-deal/DealOfferStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Percent, Minus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { useMemo } from 'react';

// Small card component to give a premium feel
const OfferCard = ({ icon, title, subtitle, selected, onClick, ariaPressed }: any) => (
  <button
    onClick={onClick}
    aria-pressed={ariaPressed}
    className={cn(
      'rounded-2xl border p-5 text-left transition-shadow w-full flex items-start gap-4',
      selected
        ? 'ring-2 ring-brand-primary-300 shadow-[0_6px_18px_rgba(59,130,246,0.12)] bg-gradient-to-b from-white to-brand-primary-50'
        : 'border-neutral-200 bg-white hover:shadow-sm'
    )}
  >
    <div className={cn('flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center', selected ? 'bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 text-white' : 'bg-neutral-100 text-brand-primary-600')}>
      {icon}
    </div>
    <div>
      <p className="font-semibold text-neutral-900">{title}</p>
      <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
    </div>
  </button>
);

const QuickPreset = ({ children, onClick, active }: any) => (
  <Button
    onClick={onClick}
    size="sm"
    variant={active ? 'primary' : 'secondary'}
    className={cn('rounded-full px-3 py-1 !h-auto')}
  >
    {children}
  </Button>
);

const OfferPreview = ({ dealType, standardOfferKind, discountPercentage, discountAmount }: any) => {
  const text = useMemo(() => {
    if (dealType === 'HAPPY_HOUR') return 'Happy Hour — Limited time offer';
    if (dealType === 'RECURRING') return 'Recurring Deal — Repeats weekly';
    if (standardOfferKind === 'percentage' && discountPercentage) return `${discountPercentage}% OFF — Shown to users`; 
    if (standardOfferKind === 'amount' && discountAmount) return `$${Number(discountAmount).toFixed(2)} OFF — Shown to users`;
    return 'No offer configured yet';
  }, [dealType, standardOfferKind, discountPercentage, discountAmount]);

  return (
    <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-md bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center text-amber-600">
          <Sparkles />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Preview</p>
          <p className="mt-1 text-sm text-neutral-500">{text}</p>
        </div>
      </div>
    </div>
  );
};

export const DealOfferStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  // If choosing a STANDARD offer, require either discountPercentage or discountAmount
  const isNextDisabled =
    !state.dealType ||
    (state.dealType === 'STANDARD' && !state.discountPercentage && !state.discountAmount);

  return (
    <OnboardingStepLayout
      title="Make it irresistible — choose how customers will save"
      onNext={() => navigate('/merchant/deals/create/schedule')}
      onBack={() => navigate(-1)}
      isNextDisabled={isNextDisabled}
      progress={40}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OfferCard
            icon={<Percent className="h-6 w-6" />}
            title="Percentage Off"
            subtitle="A clear percent discount shown on the deal card"
            selected={state.standardOfferKind === 'percentage'}
            ariaPressed={state.standardOfferKind === 'percentage'}
            onClick={() => dispatch({ type: 'SET_STANDARD_OFFER_KIND', kind: 'percentage' })}
          />
          <OfferCard
            icon={<Minus className="h-6 w-6" />}
            title="Fixed Amount Off"
            subtitle="A dollar amount taken off — great for simple messaging"
            selected={state.standardOfferKind === 'amount'}
            ariaPressed={state.standardOfferKind === 'amount'}
            onClick={() => dispatch({ type: 'SET_STANDARD_OFFER_KIND', kind: 'amount' })}
          />
        </div>

        {/* Inputs + quick-presets — improved layout: input above presets, better spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {(state.standardOfferKind === 'percentage' || state.discountPercentage !== null) && (
            <div>
              <Label htmlFor="percentage" className="text-lg font-semibold">Discount Percentage</Label>
              <p className="text-sm text-neutral-500 mt-1">Use presets or enter a custom percentage.</p>

              <div className="mt-3">
                <Input
                  id="percentage"
                  type="number"
                  min={1}
                  max={100}
                  value={state.discountPercentage ?? ''}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: Number.isFinite(v) ? Math.max(1, Math.min(100, v)) : null });
                  }}
                  className="h-10 text-lg max-w-xs"
                  placeholder="e.g., 25"
                  aria-label="Discount percentage"
                />

                <div className="mt-3 flex gap-3 flex-wrap items-center">
                  {[10,20,30,50].map((p) => (
                    <QuickPreset
                      key={p}
                      onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'discountPercentage', value: p })}
                      active={state.discountPercentage === p}
                    >
                      {p}%
                    </QuickPreset>
                  ))}
                </div>
              </div>
            </div>
          )}

          {(state.standardOfferKind === 'amount' || state.discountAmount !== null) && (
            <div>
              <Label htmlFor="amount" className="text-lg font-semibold">Discount Amount</Label>
              <p className="text-sm text-neutral-500 mt-1">Enter how much customers save. Use presets for speed.</p>

              <div className="mt-3">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={0.01}
                  value={state.discountAmount ?? ''}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: Number.isFinite(v) ? Math.max(0.01, Number(v.toFixed(2))) : null });
                  }}
                  className="h-10 text-lg max-w-xs"
                  placeholder="e.g., 5.00"
                  aria-label="Discount amount"
                />

                <div className="mt-3 flex gap-3 flex-wrap items-center">
                  {[2.5,5,10].map((a) => (
                    <QuickPreset
                      key={String(a)}
                      onClick={() => dispatch({ type: 'UPDATE_FIELD', field: 'discountAmount', value: a })}
                      active={state.discountAmount === a}
                    >
                      ${Number(a).toFixed(2)}
                    </QuickPreset>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live preview of how the deal will look */}
        <OfferPreview
          dealType={state.dealType}
          standardOfferKind={state.standardOfferKind}
          discountPercentage={state.discountPercentage}
          discountAmount={state.discountAmount}
        />

        {/* microcopy to help merchants */}
        <div className="text-sm text-neutral-500">
          <p>If you're unsure, start with a small preset and preview how it appears to customers. Happy Hour or Recurring deals will show timing options in the next step.</p>
        </div>
      </div>
    </OnboardingStepLayout>
  );
};
