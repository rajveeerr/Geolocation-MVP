import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { Home, Coffee, ShoppingBag, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

const categories = [
  { name: 'Restaurant', icon: Utensils },
  { name: 'Cafe', icon: Coffee },
  { name: 'Retail', icon: ShoppingBag },
  { name: 'Other', icon: Home },
];

export const BusinessCategoryStep = () => {
  const { state, dispatch } = useOnboarding();
  const step = 3;

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={() => dispatch({ type: 'SET_STEP', payload: step + 1 })}
      nextLabel="Next"
      nextDisabled={!state.businessCategory}
      nextDisabledReason="Please select a category to continue."
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Which best describes your place?
        </h1>
        <p className="mt-2 text-neutral-600">
          We&apos;ll use this to help customers find deals at places like yours.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() =>
                dispatch({ type: 'SET_BUSINESS_CATEGORY', payload: cat.name })
              }
              className={cn(
                'flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all',
                state.businessCategory === cat.name
                  ? 'border-brand-primary-500 bg-brand-primary-50 shadow-card'
                  : 'border-neutral-200 hover:border-neutral-300'
              )}
            >
              <cat.icon className="h-8 w-8 text-neutral-600" />
              <span className="font-semibold text-neutral-900">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </OnboardingLayout>
  );
};
