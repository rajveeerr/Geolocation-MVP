// web/src/components/common/StatCard.tsx
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  color?: 'primary' | 'amber' | 'green' | 'red' | 'neutral';
  change?: { value: number; period?: string; icon?: React.ReactNode };
}

const iconBgMap: Record<string, string> = {
  primary: 'bg-brand-primary-50 text-brand-primary-600',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-600',
  red: 'bg-red-50 text-red-600',
  neutral: 'bg-neutral-100 text-neutral-600',
};

export const StatCard = ({ title, value, icon, color = 'primary', change }: StatCardProps) => {
  const isPositiveChange = change && change.value >= 0;

  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-neutral-500">{title}</p>
          <p className="mt-1.5 text-2xl font-bold font-heading text-neutral-900 tracking-tight">{value}</p>
        </div>
        <div className={cn('flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center', iconBgMap[color] || iconBgMap.primary)}>
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {change.icon ? (
            <span className={cn('flex items-center font-semibold', isPositiveChange ? 'text-emerald-600' : 'text-red-500')}>
              {change.icon}
              {Math.abs(change.value)}%
            </span>
          ) : (
            <span className={cn('flex items-center gap-0.5 font-semibold', isPositiveChange ? 'text-emerald-600' : 'text-red-500')}>
              {isPositiveChange ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(change.value)}%
            </span>
          )}
          <span className="text-neutral-400">{change.period || 'vs last period'}</span>
        </div>
      )}
    </div>
  );
};
