import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { Zap, Heart, Users, Sparkles, MapPin, LayoutGrid, Sunset, Utensils, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

const MAX_SELECT = 3;

const VIBE_OPTIONS = [
  { id: 'HAPPY_HOUR', label: 'Happy hour vibe', icon: Sunset },
  { id: 'DATE_NIGHT', label: 'Date night', icon: Heart },
  { id: 'QUICK_BITE', label: 'Quick bite', icon: Utensils },
  { id: 'FINE_DINING', label: 'Fine dining', icon: Sparkles },
  { id: 'TRENDY', label: 'Trendy', icon: Zap },
  { id: 'COZY', label: 'Cozy', icon: Flame },
  { id: 'FAMILY_FRIENDLY', label: 'Family-friendly', icon: Users },
  { id: 'UPSCALE', label: 'Upscale', icon: Sparkles },
  { id: 'CASUAL', label: 'Casual', icon: LayoutGrid },
  { id: 'LIVE_MUSIC', label: 'Live music', icon: Zap },
  { id: 'CENTRAL', label: 'Central location', icon: MapPin },
  { id: 'SPACIOUS', label: 'Spacious', icon: LayoutGrid },
];

export const VibeTagsStep = () => {
  const { state, dispatch } = useOnboarding();
  const step = 7;

  const toggle = (id: string) => {
    const selected = state.vibeTags.includes(id);
    if (selected) {
      dispatch({ type: 'SET_VIBE_TAGS', payload: state.vibeTags.filter((t) => t !== id) });
    } else if (state.vibeTags.length < MAX_SELECT) {
      dispatch({ type: 'TOGGLE_VIBE_TAG', payload: id });
    }
  };

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={() => dispatch({ type: 'SET_STEP', payload: step + 1 })}
      nextLabel="Next"
      nextDisabled={false}
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Choose up to {MAX_SELECT} vibes
        </h1>
        <p className="mt-2 text-neutral-600">
          Help customers discover your venue when they browse deals by vibe.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {VIBE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = state.vibeTags.includes(opt.id);
            const disabled = !selected && state.vibeTags.length >= MAX_SELECT;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggle(opt.id)}
                disabled={disabled}
                className={cn(
                  'flex items-center gap-2 rounded-xl border-2 px-5 py-3.5 text-left transition-all',
                  selected
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : disabled
                      ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400'
                      : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </OnboardingLayout>
  );
};
