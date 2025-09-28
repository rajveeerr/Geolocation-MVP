// web/src/components/common/StatCard.tsx
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  color?: 'primary' | 'amber' | 'green' | 'red';
  change?: { value: number; period?: string };
}

export const StatCard = ({ title, value, icon, color = 'primary', change }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-brand-primary-100 text-brand-primary-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  const isPositiveChange = change && change.value >= 0;

  return (
    <div className="bg-white p-5 rounded-lg border shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center", colorClasses[color])}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-500">{title}</p>
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <span className={cn("flex items-center font-semibold", isPositiveChange ? "text-green-600" : "text-red-600")}>
            {isPositiveChange ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change.value)}%
          </span>
          <span className="text-neutral-400">vs {change.period || 'last period'}</span>
        </div>
      )}
    </div>
  );
};