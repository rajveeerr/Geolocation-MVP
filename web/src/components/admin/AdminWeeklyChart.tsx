import React from 'react';
import { useAdminPerformanceWeeklyChart } from '@/hooks/useAdminPerformanceWeeklyChart';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SkeletonChart } from '@/components/common/Skeleton';

interface AdminWeeklyChartProps {
  cityId?: number;
  merchantId?: number;
  metric?: 'checkins' | 'saves' | 'sales';
  title?: string;
}

export const AdminWeeklyChart: React.FC<AdminWeeklyChartProps> = ({
  cityId,
  merchantId,
  metric = 'checkins',
  title
}) => {
  const { data, isLoading, error } = useAdminPerformanceWeeklyChart({ cityId, merchantId, metric });

  if (isLoading) {
    return <SkeletonChart />;
  }

  if (error || !data) {
    if (!cityId) {
      return (
        <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50">
                <BarChart3 className="h-6 w-6 text-neutral-300" />
              </div>
              <p className="text-sm font-semibold text-neutral-700">Select a City to View Analytics</p>
              <p className="mt-1 text-[13px] text-neutral-400 max-w-xs mx-auto">Choose a specific city from the filter above to see detailed performance metrics.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center h-64">
          <span className="text-sm text-red-400">Failed to load chart data</span>
        </div>
      </div>
    );
  }

  const { chartData } = data;
  const maxValue = Math.max(...chartData.data);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'checkins': return 'Check-ins';
      case 'saves': return 'Saves';
      case 'sales': return 'Sales';
      default: return metric;
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-50">
          <BarChart3 className="h-4 w-4 text-brand-primary-600" />
        </span>
        <h3 className="text-base font-bold font-heading text-neutral-900">
          {title || `Weekly ${getMetricLabel(metric)}`}
        </h3>
      </div>

      <div className="h-48 flex items-end justify-between gap-2">
        {chartData.days.map((day, index) => {
          const value = chartData.data[index];
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={day} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1 w-full">
                <div
                  className="w-full rounded-t-lg bg-brand-primary-500 transition-all duration-300 hover:bg-brand-primary-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${day}: ${value}`}
                />
                <span className="text-[11px] font-semibold text-neutral-600">{value}</span>
              </div>
              <span className="text-[11px] font-medium text-neutral-400">{day}</span>
            </div>
          );
        })}
      </div>

      {chartData.data.every(value => value === 0) && (
        <div className="text-center py-8">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
            <BarChart3 className="h-5 w-5 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-400">No data available for this period</p>
        </div>
      )}
    </div>
  );
};
