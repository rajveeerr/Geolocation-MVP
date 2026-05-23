import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const merchantPanelClass =
  'rounded-[1.35rem] border border-border/80 bg-card/92 dark:bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] backdrop-blur';

export function MerchantPageIntro({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-gradient-to-br from-card via-card to-muted dark:to-card dark:bg-none p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] dark:shadow-none sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full bg-foreground px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-background">
            {eyebrow}
          </div>
          <h2 className="mt-3 text-[1.45rem] font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground sm:text-sm">{description}</p>
        </div>
        {aside ? <div className="min-w-0 lg:min-w-[220px]">{aside}</div> : null}
      </div>
    </section>
  );
}

export function MerchantMetaCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-border/80 bg-card/90 dark:bg-card p-4 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-[15px] font-semibold text-foreground">{value}</div>
      {caption ? <div className="mt-1 text-[13px] text-muted-foreground">{caption}</div> : null}
    </div>
  );
}

export function MerchantSegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex flex-wrap items-center gap-2 rounded-[1.1rem] border border-border/80 bg-card/90 dark:bg-card p-1.5 shadow-sm', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-[0.9rem] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200',
            value === option.value
              ? 'bg-foreground text-background shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function MerchantPageState({
  tone = 'neutral',
  title,
  description,
  action,
}: {
  tone?: 'neutral' | 'amber' | 'red';
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-200/80 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/30'
      : tone === 'red'
        ? 'border-red-200/80 dark:border-red-900/50 bg-red-50/90 dark:bg-red-950/30'
        : 'border-border/80 bg-card/92 dark:bg-card';

  return (
    <section className={cn('rounded-[1.4rem] border p-6 text-center shadow-sm', toneClass)}>
      <h2 className="text-[1.15rem] font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
