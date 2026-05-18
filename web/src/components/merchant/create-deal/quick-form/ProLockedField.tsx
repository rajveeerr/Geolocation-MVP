// src/components/merchant/create-deal/quick-form/ProLockedField.tsx
import type { ReactNode } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsPro } from '@/hooks/useIsPro';
import { PATHS } from '@/routing/paths';

interface ProLockedFieldProps {
  /** Label shown above the field (mirrors the unlocked Label). */
  label: string;
  /** Optional sub-label / hint shown next to the label. */
  hint?: string;
  /** The actual interactive field (slider, input, etc.). */
  children: ReactNode;
  /** Forces the lock on regardless of merchant tier. */
  forceLocked?: boolean;
  /** Custom CTA label. Defaults to "Pro needed to adjust". */
  lockedMessage?: string;
  /** Where the upgrade link points. Defaults to /pricing. */
  upgradeTo?: string;
  className?: string;
}

/**
 * Wraps a control so it stays visible but becomes non-interactive when the
 * merchant is on the Free tier. Shows a small lock chip + upgrade CTA so
 * merchants can still see the locked-in default value.
 */
export const ProLockedField = ({
  label,
  hint,
  children,
  forceLocked = false,
  lockedMessage = 'Pro needed to adjust',
  upgradeTo = PATHS.PRICING,
  className,
}: ProLockedFieldProps) => {
  const { isPro } = useIsPro();
  const locked = forceLocked || !isPro;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-neutral-900">{label}</span>
          {hint ? <span className="text-[12px] text-neutral-500">{hint}</span> : null}
        </div>
        {locked ? (
          <Link
            to={upgradeTo}
            className="group inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100"
            title={lockedMessage}
          >
            <Lock className="h-3 w-3" />
            <span>{lockedMessage}</span>
            <Sparkles className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
          </Link>
        ) : null}
      </div>
      <div
        className={cn(
          'relative rounded-2xl transition',
          locked && 'pointer-events-none select-none opacity-60',
        )}
        aria-disabled={locked}
      >
        {children}
        {locked ? (
          <div
            className="absolute inset-0 cursor-not-allowed rounded-2xl"
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
};
