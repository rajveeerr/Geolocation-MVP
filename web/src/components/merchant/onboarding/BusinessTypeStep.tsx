import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { Building2, MapPin, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

const OPTIONS = [
  {
    value: 'LOCAL' as const,
    label: 'Local Business',
    sublabel: 'Independent, single-location venue',
    icon: MapPin,
    color: 'green',
  },
  {
    value: 'NATIONAL' as const,
    label: 'National Chain',
    sublabel: 'Multi-location business or franchise',
    icon: Building2,
    color: 'blue',
  },
];

const PRICE_RANGES = [
  { value: '$', label: '$', desc: 'Budget-friendly' },
  { value: '$$', label: '$$', desc: 'Moderate' },
  { value: '$$$', label: '$$$', desc: 'Upscale' },
  { value: '$$$$', label: '$$$$', desc: 'Fine dining' },
];

export const BusinessTypeStep = () => {
  const { state, dispatch } = useOnboarding();
  const step = 4;

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={() => dispatch({ type: 'SET_STEP', payload: step + 1 })}
      nextDisabled={!state.businessType}
      nextDisabledReason="Please select your business type to continue."
      nextLabel="Next"
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Which best describes your business?
        </h1>
        <p className="mt-2 text-neutral-600">
          This helps us surface your deals to the right customers.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() =>
                dispatch({ type: 'SET_BUSINESS_TYPE', payload: opt.value })
              }
              className={cn(
                'flex items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all',
                state.businessType === opt.value
                  ? 'border-brand-primary-500 bg-brand-primary-50 shadow-card'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl',
                  opt.color === 'green' ? 'bg-green-100' : 'bg-blue-100'
                )}
              >
                <opt.icon
                  className={cn(
                    'h-6 w-6',
                    opt.color === 'green' ? 'text-green-600' : 'text-blue-600'
                  )}
                />
              </div>
              <div>
                <span className="font-semibold text-neutral-900">{opt.label}</span>
                <p className="mt-0.5 text-sm text-neutral-500">{opt.sublabel}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-10 border-t border-neutral-200 pt-10">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-neutral-900">
            <DollarSign className="h-5 w-5 text-neutral-500" />
            What can customers expect to spend?
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Optional. Helps customers choose where to use their deals.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRICE_RANGES.map((pr) => (
              <button
                key={pr.value}
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_PRICE_RANGE',
                    payload: state.priceRange === pr.value ? null : pr.value,
                  })
                }
                className={cn(
                  'rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  state.priceRange === pr.value
                    ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                )}
              >
                <span className="font-bold">{pr.label}</span>
                <span className="ml-1.5 text-xs text-neutral-500">{pr.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};
