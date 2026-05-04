import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  EyeOff,
  Gift,
  Repeat,
  Tag,
  Trophy,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';

type DealTypeValue = 'STANDARD' | 'HAPPY_HOUR' | 'RECURRING' | 'REDEEM_NOW' | 'HIDDEN' | 'BOUNTY';

const dealTypes: Array<{
  value: DealTypeValue;
  title: string;
  eyebrow: string;
  summary: string;
  bestFor: string;
  selectedAccent: string;
  iconWrap: string;
  icon: typeof Tag;
}> = [
  {
    value: 'STANDARD',
    title: 'Item Deal',
    eyebrow: 'Core offer',
    summary: 'Promote a single menu item, combo, or short campaign with flexible pricing.',
    bestFor: 'Flash promos and product pushes',
    selectedAccent: 'bg-[#111827]',
    iconWrap: 'bg-[#fff0e8] text-[#ff5a36]',
    icon: Tag,
  },
  {
    value: 'HAPPY_HOUR',
    title: 'Happy Hour',
    eyebrow: 'Traffic builder',
    summary: 'Use short windows and curated pricing to fill slower hours with urgency.',
    bestFor: 'Afternoon and late-night traffic',
    selectedAccent: 'bg-[#1f2937]',
    iconWrap: 'bg-[#e6fffb] text-[#0f766e]',
    icon: Clock,
  },
  {
    value: 'RECURRING',
    title: 'Daily Deal',
    eyebrow: 'Habit loop',
    summary: 'Create repeatable weekly moments like Taco Tuesday or Wine Wednesday.',
    bestFor: 'Recurring weekly rituals',
    selectedAccent: 'bg-[#0f172a]',
    iconWrap: 'bg-[#eef2ff] text-[#4338ca]',
    icon: Repeat,
  },
  {
    value: 'REDEEM_NOW',
    title: 'Redeem Now',
    eyebrow: 'Instant unlock',
    summary: 'Drive immediate action with a spend threshold and a fixed reward.',
    bestFor: 'Fast conversion and same-day visits',
    selectedAccent: 'bg-[#292524]',
    iconWrap: 'bg-[#fff1e6] text-[#f97316]',
    icon: Zap,
  },
  {
    value: 'HIDDEN',
    title: 'Hidden Deal',
    eyebrow: 'Exclusive access',
    summary: 'Unlock members-only or code-based offers that feel secret and premium.',
    bestFor: 'VIP moments and discovery-based offers',
    selectedAccent: 'bg-[#18181b]',
    iconWrap: 'bg-[#f3e8ff] text-[#7c3aed]',
    icon: EyeOff,
  },
  {
    value: 'BOUNTY',
    title: 'Bounty Deal',
    eyebrow: 'Reward loop',
    summary: 'Incentivize guests with referrals, check-ins, or outcome-based rewards.',
    bestFor: 'Growth campaigns and social reach',
    selectedAccent: 'bg-[#172554]',
    iconWrap: 'bg-[#e9fff1] text-[#15803d]',
    icon: Trophy,
  },
];

const dealTypeDescriptions: Record<DealTypeValue, string> = {
  STANDARD: 'A flexible format for one-time promotions, featured items, and seasonal offers.',
  HAPPY_HOUR: 'Short, high-intent offer windows designed to increase traffic during quieter times.',
  RECURRING: 'A repeating schedule that turns a promotion into something customers remember every week.',
  REDEEM_NOW: 'A spend-threshold offer that gives guests an immediate incentive to convert right now.',
  HIDDEN: 'A gated offer that feels private, surprising, or earned through special access.',
  BOUNTY: 'A performance-style offer that rewards actions like referrals, attendance, or check-ins.',
};

function DealTypeCard({
  title,
  eyebrow,
  summary,
  bestFor,
  icon: Icon,
  isSelected,
  selectedAccent,
  iconWrap,
  onClick,
  delay,
}: {
  title: string;
  eyebrow: string;
  summary: string;
  bestFor: string;
  icon: typeof Tag;
  isSelected: boolean;
  selectedAccent: string;
  iconWrap: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.34 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        'group relative overflow-hidden rounded-[1.65rem] border p-5 text-left transition-all duration-300',
        'min-h-[220px] shadow-[0_12px_28px_rgba(15,23,42,0.06)]',
        isSelected
          ? 'border-transparent text-white shadow-[0_16px_34px_rgba(15,23,42,0.16)]'
          : 'border-neutral-200/80 bg-white text-neutral-900 hover:border-neutral-300 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]',
      )}
    >
      <div className={cn('absolute inset-0 transition-colors duration-300', isSelected ? selectedAccent : 'bg-white')} />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-[1rem] border transition-colors duration-300',
              isSelected
                ? 'border-white/25 bg-white/20 text-white'
                : `border-transparent ${iconWrap}`,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div
            className={cn(
              'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]',
              isSelected ? 'bg-white/15 text-white/90' : 'bg-neutral-100 text-neutral-500',
            )}
          >
            {eyebrow}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[1.3rem] font-semibold tracking-tight">{title}</h3>
          <p className={cn('mt-3 text-[14px] leading-6', isSelected ? 'text-white/88' : 'text-neutral-600')}>
            {summary}
          </p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <div className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', isSelected ? 'text-white/65' : 'text-neutral-400')}>
              Best For
            </div>
            <div className={cn('mt-1 text-[13px] font-medium', isSelected ? 'text-white' : 'text-neutral-700')}>
              {bestFor}
            </div>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300',
              isSelected ? 'bg-white text-neutral-900' : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white',
            )}
          >
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export const DealTypeStep = ({ onNext }: { onNext: () => void }) => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  const navigateForDealType = (dealType: DealTypeValue | null) => {
    if (dealType === 'BOUNTY') {
      navigate('/merchant/deals/create/bounty');
    } else if (dealType === 'HIDDEN') {
      navigate('/merchant/deals/create/hidden');
    } else if (dealType === 'REDEEM_NOW') {
      navigate('/merchant/deals/create/redeem-now');
    } else if (dealType === 'RECURRING') {
      navigate('/merchant/deals/create/daily-deal/weekdays');
    } else {
      onNext();
    }
  };

  const handleNext = () => {
    navigateForDealType(state.dealType as DealTypeValue | null);
  };

  const handleDealTypeSelect = (dealType: DealTypeValue) => {
    dispatch({ type: 'SET_FIELD', field: 'dealType', value: dealType });
    navigateForDealType(dealType);
  };

  const selectedType = state.dealType as DealTypeValue | null;

  return (
    <OnboardingStepLayout
      title="Design the right deal format"
      subtitle="Pick the offer structure that matches how you want customers to discover, redeem, and return."
      onNext={handleNext}
      onBack={() => navigate(PATHS.MERCHANT_DASHBOARD)}
      isNextDisabled={!state.dealType}
      nextButtonText={selectedType ? 'Build this deal' : 'Select a deal type'}
      contentClassName="w-full max-w-7xl"
    >
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-2">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dealTypes.map((dealType, index) => (
            <DealTypeCard
              key={dealType.value}
              title={dealType.title}
              eyebrow={dealType.eyebrow}
              summary={dealType.summary}
              bestFor={dealType.bestFor}
              icon={dealType.icon}
              selectedAccent={dealType.selectedAccent}
              iconWrap={dealType.iconWrap}
              isSelected={state.dealType === dealType.value}
              onClick={() => handleDealTypeSelect(dealType.value)}
              delay={0.08 + index * 0.06}
            />
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="rounded-[1.65rem] bg-white/95 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.07)] ring-1 ring-neutral-200/75 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[hsl(var(--brand-50))] text-[hsl(var(--brand-primary))]">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-neutral-900">
                {selectedType ? dealTypes.find((item) => item.value === selectedType)?.title : 'Choose a deal type'}
              </div>
              <p className="mt-1 text-[13px] leading-6 text-neutral-600">
                {selectedType
                  ? dealTypeDescriptions[selectedType]
                  : 'Select a format above to preview the strategy, then continue with a focused creation flow.'}
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </OnboardingStepLayout>
  );
};
