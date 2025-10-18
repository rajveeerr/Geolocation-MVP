import { DollarSign, ShoppingCart, TrendingUp, Gift, Calendar, Heart, Zap } from 'lucide-react';
import { useMerchantDashboardStats } from '@/hooks/useMerchantDashboardStats';
import { Loader2 } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'primary' | 'green' | 'amber' | 'red' | 'blue';
  subtitle?: string;
  isLoading?: boolean;
}

const KPICard = ({ title, value, icon, color, subtitle, isLoading }: KPICardProps) => {
  const colorClasses = {
    primary: 'bg-brand-primary-100 text-brand-primary-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <div className="mt-2">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            ) : (
              <p className="text-2xl font-bold text-neutral-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface MerchantKPICardsProps {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' | 'all_time';
}

export const MerchantKPICards = ({ period = 'all_time' }: MerchantKPICardsProps) => {
  const { data: stats, isLoading, error } = useMerchantDashboardStats({ period });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">Failed to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Key Performance Indicators</h2>
        <div className="text-sm text-neutral-600">
          Period: {stats?.period?.replace('_', ' ') || period.replace('_', ' ')}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Gross Sales"
          value={stats?.kpis.grossSales || 0}
          icon={<DollarSign className="h-6 w-6" />}
          color="green"
          subtitle="Total revenue generated"
          isLoading={isLoading}
        />
        
        <KPICard
          title="Order Volume"
          value={stats?.kpis.orderVolume || 0}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="primary"
          subtitle="Total number of orders"
          isLoading={isLoading}
        />
        
        <KPICard
          title="Average Order Value"
          value={stats?.kpis.averageOrderValue ? `$${stats.kpis.averageOrderValue.toFixed(2)}` : '$0.00'}
          icon={<TrendingUp className="h-6 w-6" />}
          color="amber"
          subtitle="Revenue per order"
          isLoading={isLoading}
        />
        
        <KPICard
          title="Kickback"
          value={stats?.kpis.totalKickbackHandout || 0}
          icon={<Gift className="h-6 w-6" />}
          color="blue"
          subtitle="Total kickback distributed"
          isLoading={isLoading}
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Active Deals"
          value={stats?.metrics.activeDeals || 0}
          icon={<Calendar className="h-6 w-6" />}
          color="primary"
          subtitle="Currently running deals"
          isLoading={isLoading}
        />
        
        <KPICard
          title="Saved Deals"
          value={stats?.metrics.totalSavedDeals || 0}
          icon={<Heart className="h-6 w-6" />}
          color="red"
          subtitle="Total deal saves by users"
          isLoading={isLoading}
        />
        
        <KPICard
          title="Kickback Events"
          value={stats?.metrics.totalKickbackEvents || 0}
          icon={<Zap className="h-6 w-6" />}
          color="amber"
          subtitle="Total kickback events triggered"
          isLoading={isLoading}
        />
      </div>

      {/* Date Range Info */}
      {stats?.dateRange && (
        <div className="bg-neutral-50 rounded-lg p-4">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Date Range:</span>{' '}
            {stats.dateRange.from 
              ? `${new Date(stats.dateRange.from).toLocaleDateString()} - ${new Date(stats.dateRange.to).toLocaleDateString()}`
              : `Up to ${new Date(stats.dateRange.to).toLocaleDateString()}`
            }
          </p>
        </div>
      )}
    </div>
  );
};