import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATHS } from '@/routing/paths';
import { useDealCreation } from '@/context/DealCreationContext';
import { dealCreationTypes, type DealTypeValue } from '@/config/dealCreation';
import { QuickFormLayout } from './quick-form/QuickFormLayout';

function DealTypeCard({
  title,
  eyebrow,
  summary,
  bestFor,
  icon: Icon,
  isSelected,
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
        'group relative overflow-hidden rounded-[1.45rem] border bg-card/95 dark:bg-card p-5 text-left text-foreground shadow-[0_8px_22px_rgba(15,23,42,0.045)] transition-all duration-300',
        'min-h-[170px]',
        isSelected
          ? 'border-[hsl(var(--brand-primary))] ring-2 ring-[hsl(var(--brand-primary))]/12'
          : 'border-border/80 hover:border-border hover:shadow-[0_10px_26px_rgba(15,23,42,0.07)]',
      )}
    >
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconWrap)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{summary}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Best For
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-foreground">{bestFor}</div>
          </div>
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300',
              isSelected
                ? 'bg-[hsl(var(--brand-primary))] text-white'
                : 'bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background',
            )}
          >
            <ArrowRight className="h-3.5 w-3.5" />
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
    // Resolve every type explicitly here so we don't depend on the parent
    // handler reading possibly-stale `state.dealType` from its closure
    // (dispatch is async — by the time onNext fires, the reducer may not
    // have committed the new dealType yet, so falling through was sending
    // Happy Hour / Standard to the wrong flow).
    if (dealType === 'HAPPY_HOUR') {
      navigate('/merchant/deals/create/happy-hour/edit');
    } else if (dealType === 'BOUNTY') {
      navigate('/merchant/deals/create/bounty');
    } else if (dealType === 'HIDDEN') {
      navigate('/merchant/deals/create/hidden');
    } else if (dealType === 'REDEEM_NOW') {
      navigate('/merchant/deals/create/redeem-now');
    } else if (dealType === 'RECURRING') {
      navigate('/merchant/deals/create/daily-deal');
    } else if (dealType === 'BOGO') {
      navigate('/merchant/deals/create/bogo');
    } else if (dealType === 'STANDARD') {
      navigate('/merchant/deals/create/standard');
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
    <QuickFormLayout
      title="Create a Deal"
      subtitle="Pick the offer structure that matches how you want customers to discover, redeem, and return."
      onBack={() => navigate(PATHS.MERCHANT_DASHBOARD)}
      contentClassName="w-full max-w-7xl"
      primary={{
        label: selectedType ? 'Build this deal' : 'Select a deal type',
        onClick: handleNext,
        disabled: !state.dealType,
      }}
    >
      <div className="space-y-5 pb-2">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dealCreationTypes.map((dealType, index) => (
            <DealTypeCard
              key={dealType.value}
              title={dealType.title}
              eyebrow={dealType.eyebrow}
              summary={dealType.summary}
              bestFor={dealType.bestFor}
              icon={dealType.icon}
              iconWrap={dealType.iconWrap}
              isSelected={state.dealType === dealType.value}
              onClick={() => handleDealTypeSelect(dealType.value)}
              delay={0.04 + index * 0.04}
            />
          ))}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)]"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--brand-50))] text-[hsl(var(--brand-primary))]">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-foreground">
                {selectedType ? dealCreationTypes.find((item) => item.value === selectedType)?.title : 'Choose a deal type'}
              </div>
              <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
                {selectedType
                  ? dealCreationTypes.find((item) => item.value === selectedType)?.detailDescription
                  : 'Select a format above to preview the strategy, then continue with a focused creation flow.'}
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </QuickFormLayout>
  );
};
