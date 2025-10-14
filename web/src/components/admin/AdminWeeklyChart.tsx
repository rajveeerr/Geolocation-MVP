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
    // Show helpful message when no city is selected
    if (!cityId) {
      return (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600 font-medium mb-2">Select a City to View Analytics</p>
              <p className="text-neutral-500 text-sm">Choose a specific city from the filter above to see detailed performance metrics and trends.</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Show error message for other cases
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-64">
          <span className="text-red-500 text-sm">Failed to load chart data</span>
        </div>
      </div>
    );
  }

  const { chartData } = data;
  const maxValue = Math.max(...chartData.data);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'checkins':
        return 'Check-ins';
      case 'saves':
        return 'Saves';
      case 'sales':
        return 'Sales';
      default:
        return metric;
    }
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'checkins':
        return <TrendingUp className="h-4 w-4" />;
      case 'saves':
        return <TrendingDown className="h-4 w-4" />;
      case 'sales':
        return <Minus className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        {getMetricIcon(metric)}
        <h3 className="text-lg font-semibold text-neutral-900">
          {title || `Weekly ${getMetricLabel(metric)}`}
        </h3>
      </div>
      
      <div className="h-48 flex items-end justify-between gap-2">
        {chartData.days.map((day, index) => {
          const value = chartData.data[index];
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={day} className="flex flex-col items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand-primary-500 rounded-t transition-all duration-300 hover:bg-brand-primary-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${day}: ${value}`}
                />
                <span className="text-xs text-neutral-600">{value}</span>
              </div>
              <span className="text-xs font-medium text-neutral-700">{day}</span>
            </div>
          );
        })}
      </div>
      
      {chartData.data.every(value => value === 0) && (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No data available for this period</p>
        </div>
      )}
    </div>
  );
};
