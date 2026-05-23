// src/components/merchant/create-deal/quick-form/DealTypeChips.tsx
import { Percent, Gift, ShoppingBag, Trophy, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DealCreationState } from '@/context/DealCreationContext';

type ChipDealType = NonNullable<DealCreationState['dealType']>;

interface ChipDef {
  value: ChipDealType;
  label: string;
  icon: LucideIcon;
  iconWrap: string;
}

const CHIPS: ChipDef[] = [
  { value: 'STANDARD', label: '% Discount', icon: Percent, iconWrap: 'bg-orange-100 dark:bg-orange-950/40 text-orange-600' },
  { value: 'REDEEM_NOW', label: 'Free item', icon: Gift, iconWrap: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600' },
  { value: 'BOGO', label: 'Buy X get Y', icon: ShoppingBag, iconWrap: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' },
  { value: 'BOUNTY', label: 'Bounty points', icon: Trophy, iconWrap: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600' },
];

interface DealTypeChipsProps {
  value: ChipDealType | null;
  onChange: (value: ChipDealType) => void;
  /** Restrict the chips shown to a subset (useful inside type-locked flows). */
  allowed?: ChipDealType[];
  className?: string;
}

/**
 * Inline chip selector for swapping deal types within the long-form layout.
 * Horizontal pill strip — wraps on narrow screens.
 */
export const DealTypeChips = ({ value, onChange, allowed, className }: DealTypeChipsProps) => {
  const chips = allowed ? CHIPS.filter((c) => allowed.includes(c.value)) : CHIPS;
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => {
        const isSelected = chip.value === value;
        const Icon = chip.icon;
        return (
          <button
            key={chip.value}
            type="button"
            onClick={() => onChange(chip.value)}
            aria-pressed={isSelected}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition',
              isSelected
                ? 'border-foreground bg-foreground text-background shadow-[0_4px_12px_rgba(15,23,42,0.16)]'
                : 'border-border bg-card text-foreground hover:border-border hover:bg-muted',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                isSelected ? 'bg-card/15 dark:bg-card text-white' : chip.iconWrap,
              )}
            >
              <Icon className="h-3 w-3" />
            </span>
            <span>{chip.label}</span>
          </button>
        );
      })}
    </div>
  );
};
