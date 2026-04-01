import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const merchantPanelClass =
  'rounded-[1.35rem] border border-neutral-200/80 bg-white/92 p-5 shadow-[0_8px_24px_rgba(15,23,42,0.045)] backdrop-blur';

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
    <section className="overflow-hidden rounded-[1.5rem] border border-neutral-200/80 bg-gradient-to-br from-white via-white to-[#f2f4f7] p-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            {eyebrow}
          </div>
          <h2 className="mt-3 text-[1.45rem] font-semibold tracking-tight text-neutral-950 sm:text-[1.7rem]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-neutral-600 sm:text-sm">{description}</p>
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
    <div className="rounded-[1.15rem] border border-neutral-200/80 bg-white/90 p-4 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{label}</div>
      <div className="mt-2 text-[15px] font-semibold text-neutral-900">{value}</div>
      {caption ? <div className="mt-1 text-[13px] text-neutral-500">{caption}</div> : null}
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
    <div className={cn('inline-flex flex-wrap items-center gap-2 rounded-[1.1rem] border border-neutral-200/80 bg-white/90 p-1.5 shadow-sm', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-[0.9rem] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200',
            value === option.value
              ? 'bg-neutral-950 text-white shadow-sm'
              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
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
      ? 'border-amber-200/80 bg-amber-50/90'
      : tone === 'red'
        ? 'border-red-200/80 bg-red-50/90'
        : 'border-neutral-200/80 bg-white/92';

  return (
    <section className={cn('rounded-[1.4rem] border p-6 text-center shadow-sm', toneClass)}>
      <h2 className="text-[1.15rem] font-semibold text-neutral-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-neutral-600">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
