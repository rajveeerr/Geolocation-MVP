// src/components/merchant/create-deal/quick-form/PillGroup.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PillOption<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface PillGroupProps<T extends string | number> {
  value: T | null | undefined;
  onChange: (value: T) => void;
  options: PillOption<T>[];
  /** "compact" = tight chip row; "grid" = larger 2-col grid with descriptions. */
  variant?: 'compact' | 'grid';
  ariaLabel?: string;
  className?: string;
}

/**
 * Segmented pill selector used across the quick-form layout for time-of-day,
 * duration, check-in reward etc. Matches the merchant dashboard pill styling.
 */
export const PillGroup = <T extends string | number>({
  value,
  onChange,
  options,
  variant = 'compact',
  ariaLabel,
  className,
}: PillGroupProps<T>) => {
  if (variant === 'grid') {
    return (
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn('grid grid-cols-2 gap-2.5', className)}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex items-start gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-card text-foreground hover:border-border hover:bg-muted',
              )}
            >
              {option.icon ? (
                <span
                  className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center',
                    isSelected ? 'text-white' : 'text-muted-foreground',
                  )}
                  aria-hidden
                >
                  <span
                    className={cn(
                      'inline-flex h-4 w-4 items-center justify-center rounded-full border',
                      isSelected ? 'border-white bg-card' : 'border-border bg-card',
                    )}
                  >
                    {isSelected ? <span className="h-2 w-2 rounded-full bg-foreground" /> : null}
                  </span>
                </span>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold leading-tight">{option.label}</div>
                {option.description ? (
                  <div
                    className={cn(
                      'mt-0.5 text-[11px] leading-snug',
                      isSelected ? 'text-white/75' : 'text-muted-foreground',
                    )}
                  >
                    {option.description}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
              isSelected
                ? 'border-foreground bg-foreground text-background shadow-[0_6px_18px_rgba(15,23,42,0.18)]'
                : 'border-border bg-card text-foreground hover:border-border hover:bg-muted',
            )}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
