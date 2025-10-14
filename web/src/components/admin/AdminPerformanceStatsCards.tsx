import React from 'react';
import { StatCard } from '@/components/common/StatCard';
import { DollarSign, Users, Tag, Building, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAdminPerformanceOverview } from '@/hooks/useAdminPerformanceOverview';
import { SkeletonStatsCard } from '@/components/common/Skeleton';

interface AdminPerformanceStatsCardsProps {
  period?: '1d' | '7d' | '30d' | '90d';
  cityId?: number;
  merchantId?: number;
}

export const AdminPerformanceStatsCards: React.FC<AdminPerformanceStatsCardsProps> = ({
  period = '7d',
  cityId,
  merchantId
}) => {
  const { data, isLoading, error } = useAdminPerformanceOverview({ period, cityId, merchantId });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-red-200 p-6">
            <div className="flex items-center justify-center h-32">
              <span className="text-red-500 text-sm">Failed to load data</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { metrics } = data;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Gross Sales"
        value={`$${metrics.grossSales.value.toLocaleString()}`}
        icon={<DollarSign />}
        color={getTrendColor(metrics.grossSales.trend)}
        change={{
          value: metrics.grossSales.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.grossSales.trend)
        }}
      />
      
      <StatCard
        title="Order Volume"
        value={metrics.orderVolume.value.toLocaleString()}
        icon={<Users />}
        color={getTrendColor(metrics.orderVolume.trend)}
        change={{
          value: metrics.orderVolume.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.orderVolume.trend)
        }}
      />
      
      <StatCard
        title="Average Order Value"
        value={`$${metrics.averageOrderValue.value.toFixed(2)}`}
        icon={<Tag />}
        color={getTrendColor(metrics.averageOrderValue.trend)}
        change={{
          value: metrics.averageOrderValue.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.averageOrderValue.trend)
        }}
      />
      
      <StatCard
        title="Total Approved Merchants"
        value={metrics.totalApprovedMerchants.value.toLocaleString()}
        icon={<Building />}
        color={getTrendColor(metrics.totalApprovedMerchants.trend)}
        change={{
          value: metrics.totalApprovedMerchants.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.totalApprovedMerchants.trend)
        }}
      />
    </div>
  );
};
