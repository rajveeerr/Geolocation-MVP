// src/components/merchant/create-deal/quick-form/SectionCard.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Panel container matching the merchant dashboard "card" treatment.
 * Used to group form sections inside the long-form layout.
 */
export const SectionCard = ({ children, className }: SectionCardProps) => (
  <section
    className={cn(
      'rounded-[1.45rem] border border-border/80 bg-card/95 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)]',
      className,
    )}
  >
    {children}
  </section>
);

interface FieldLabelProps {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

export const FieldLabel = ({ label, hint, required, className, htmlFor }: FieldLabelProps) => (
  <div className={cn('flex flex-wrap items-center justify-between gap-2', className)}>
    <label htmlFor={htmlFor} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {label}
      {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
    </label>
    {hint ? <span className="text-[12px] text-muted-foreground">{hint}</span> : null}
  </div>
);
