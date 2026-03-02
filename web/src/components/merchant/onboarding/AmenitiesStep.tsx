import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { Textarea } from '@/components/ui/textarea';
import {
  Wifi,
  Car,
  Utensils,
  CreditCard,
  Users,
  Music,
  Sun,
  PawPrint,
  Wine,
  Calendar,
  Gift,
  Sunset,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

const AMENITY_OPTIONS = [
  { id: 'WIFI', label: 'Free WiFi', icon: Wifi },
  { id: 'PARKING', label: 'Parking', icon: Car },
  { id: 'DINE_IN', label: 'Dine-in', icon: Utensils },
  { id: 'CARD_PAYMENT', label: 'Card payments', icon: CreditCard },
  { id: 'GROUP_FRIENDLY', label: 'Group friendly', icon: Users },
  { id: 'LIVE_MUSIC', label: 'Live music / DJ', icon: Music },
  { id: 'OUTDOOR_SEATING', label: 'Outdoor seating', icon: Sun },
  { id: 'PET_FRIENDLY', label: 'Pet friendly', icon: PawPrint },
  { id: 'FULL_BAR', label: 'Full bar', icon: Wine },
  { id: 'TABLE_BOOKING', label: 'Table reservations', icon: Calendar },
  { id: 'LOYALTY_PROGRAM', label: 'Loyalty program', icon: Gift },
  { id: 'HAPPY_HOUR', label: 'Happy hour', icon: Sunset },
];

export const AmenitiesStep = () => {
  const { state, dispatch } = useOnboarding();
  const step = 8;

  const toggle = (id: string) => {
    dispatch({ type: 'TOGGLE_AMENITY', payload: id });
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
          What does your venue offer?
        </h1>
        <p className="mt-2 text-neutral-600">
          This helps customers choose where to use their deals. Add more from your dashboard later.
        </p>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-neutral-500">
            Select what applies
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {AMENITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const selected = state.amenities.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggle(opt.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    selected
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  )}
                >
                  <Icon className="h-6 w-6 text-neutral-600" />
                  <span className="text-center text-sm font-medium text-neutral-900">
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-neutral-500">
            Anything else customers should know?
          </h3>
          <Textarea
            value={state.thingsToNote}
            onChange={(e) =>
              dispatch({ type: 'SET_THINGS_TO_NOTE', payload: e.target.value })}
            placeholder="e.g. Rooftop terrace, valet parking, wheelchair accessible, signature dish..."
            className="mt-3 min-h-24 resize-none rounded-xl border-neutral-300"
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};
