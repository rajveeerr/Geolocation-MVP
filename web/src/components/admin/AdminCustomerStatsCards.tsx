import React from 'react';
import { StatCard } from '@/components/common/StatCard';
import { Users, UserCheck, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useAdminCustomersOverview } from '@/hooks/useAdminCustomersOverview';
import { SkeletonStatsCard } from '@/components/common/Skeleton';

interface AdminCustomerStatsCardsProps {
  period?: '1d' | '7d' | '30d' | '90d';
  cityId?: number;
  state?: string;
}

export const AdminCustomerStatsCards: React.FC<AdminCustomerStatsCardsProps> = ({
  period = '30d',
  cityId,
  state
}) => {
  const { data, isLoading, error } = useAdminCustomersOverview({ period, cityId, state });

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
        title="Total Customers"
        value={metrics.totalCustomers.value.toLocaleString()}
        icon={<Users />}
        color={getTrendColor(metrics.totalCustomers.trend)}
        change={{
          value: metrics.totalCustomers.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.totalCustomers.trend)
        }}
      />
      
      <StatCard
        title="Paid Members"
        value={metrics.paidMembers.value.toLocaleString()}
        icon={<UserCheck />}
        color={getTrendColor(metrics.paidMembers.trend)}
        change={{
          value: metrics.paidMembers.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.paidMembers.trend)
        }}
      />
      
      <StatCard
        title="Total Spend"
        value={`$${metrics.totalSpend.value.toLocaleString()}`}
        icon={<DollarSign />}
        color={getTrendColor(metrics.totalSpend.trend)}
        change={{
          value: metrics.totalSpend.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.totalSpend.trend)
        }}
      />
      
      <StatCard
        title="Average Spend"
        value={`$${metrics.averageSpend.value.toFixed(2)}`}
        icon={<DollarSign />}
        color={getTrendColor(metrics.averageSpend.trend)}
        change={{
          value: metrics.averageSpend.change,
          period: `vs previous ${period}`,
          icon: getTrendIcon(metrics.averageSpend.trend)
        }}
      />
    </div>
  );
};
