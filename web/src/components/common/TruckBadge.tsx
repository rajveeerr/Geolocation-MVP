import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TruckBadgeSize = 'xs' | 'sm' | 'md';
export type TruckBadgeVariant = 'default' | 'live';

interface TruckBadgeProps {
  size?: TruckBadgeSize;
  variant?: TruckBadgeVariant;
  label?: string;
  className?: string;
}

const sizeClasses: Record<TruckBadgeSize, string> = {
  xs: 'gap-1 px-1.5 py-0.5 text-[10px]',
  sm: 'gap-1 px-2 py-0.5 text-xs',
  md: 'gap-1.5 px-2.5 py-1 text-sm',
};

const iconSize: Record<TruckBadgeSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

const variantClasses: Record<TruckBadgeVariant, string> = {
  default: 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-600/20',
  live: 'bg-amber-500 text-white ring-1 ring-inset ring-amber-600/40',
};

export const TruckBadge = ({
  size = 'sm',
  variant = 'default',
  label = 'Food truck',
  className,
}: TruckBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {variant === 'live' && (
        <span
          aria-hidden
          className="relative flex h-1.5 w-1.5"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      )}
      <Truck className={iconSize[size]} aria-hidden />
      <span>{label}</span>
    </span>
  );
};

export default TruckBadge;
