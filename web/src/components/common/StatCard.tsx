// web/src/components/common/StatCard.tsx
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: React.ReactNode;
  color?: 'primary' | 'amber' | 'green' | 'red';
}

export const StatCard = ({ title, value, icon, color = 'primary' }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-brand-primary-100 text-brand-primary-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white p-5 rounded-lg border shadow-sm flex items-center gap-4">
      <div className={cn("flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center", colorClasses[color])}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
};