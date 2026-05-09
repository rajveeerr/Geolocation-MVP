import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BogoConfig {
  bogoBuyQuantity?: number | null;
  bogoGetQuantity?: number | null;
  bogoGetDiscountPercent?: number | null;
}

export const formatBogoLabel = (cfg: BogoConfig): string | null => {
  const buy = cfg.bogoBuyQuantity;
  const get = cfg.bogoGetQuantity;
  const discount = cfg.bogoGetDiscountPercent;
  if (!buy || !get || discount == null) return null;
  const verb = discount === 100 ? 'Free' : `${discount}% Off`;
  return `Buy ${buy}, Get ${get} ${verb}`;
};

interface BogoBadgeProps {
  config: BogoConfig;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'soft' | 'solid';
  className?: string;
}

const sizeClasses: Record<NonNullable<BogoBadgeProps['size']>, string> = {
  xs: 'gap-1 px-1.5 py-0.5 text-[10px]',
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-1 text-sm',
};

const iconSize: Record<NonNullable<BogoBadgeProps['size']>, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

const variantClasses: Record<NonNullable<BogoBadgeProps['variant']>, string> = {
  soft: 'bg-orange-100 text-orange-800 ring-1 ring-inset ring-orange-600/20',
  solid: 'bg-orange-500 text-white shadow-sm',
};

export const BogoBadge = ({
  config,
  size = 'sm',
  variant = 'soft',
  className,
}: BogoBadgeProps) => {
  const label = formatBogoLabel(config);
  if (!label) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold uppercase tracking-wide',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      <ShoppingBag className={iconSize[size]} aria-hidden />
      {label}
    </span>
  );
};
