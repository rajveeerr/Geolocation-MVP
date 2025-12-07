// web/src/components/deals/DealTypeBadge.tsx
import { getDealTypeBadgeConfig } from '@/utils/dealCardUtils';
import { cn } from '@/lib/utils';

interface DealTypeBadgeProps {
  dealType: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DealTypeBadge = ({ dealType, className, size = 'md' }: DealTypeBadgeProps) => {
  const config = getDealTypeBadgeConfig(dealType);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </div>
  );
};

