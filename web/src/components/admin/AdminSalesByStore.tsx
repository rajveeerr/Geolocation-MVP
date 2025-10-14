import React from 'react';
import { useAdminPerformanceSalesByStore } from '@/hooks/useAdminPerformanceSalesByStore';
import { TrendingUp, TrendingDown, Minus, Store, MapPin } from 'lucide-react';
import { SkeletonList } from '@/components/common/Skeleton';

interface AdminSalesByStoreProps {
  cityId?: number;
  limit?: number;
  period?: '1d' | '7d' | '30d';
}

export const AdminSalesByStore: React.FC<AdminSalesByStoreProps> = ({
  cityId,
  limit = 10,
  period = '7d'
}) => {
  const { data, isLoading, error } = useAdminPerformanceSalesByStore({ cityId, limit, period });

  if (isLoading) {
    return <SkeletonList items={limit} />;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-32">
          <span className="text-red-500 text-sm">Failed to load sales by store data</span>
        </div>
      </div>
    );
  }

  const { stores } = data;

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
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-neutral-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Store className="h-5 w-5 text-brand-primary-600" />
        <h3 className="text-lg font-semibold text-neutral-900">Sales by Store</h3>
        <span className="text-sm text-neutral-500">({period})</span>
      </div>
      
      <div className="space-y-3">
        {stores.map((store, index) => (
          <div
            key={store.id}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-brand-primary-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary-100 flex items-center justify-center text-sm font-semibold text-brand-primary-600">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium text-neutral-900">{store.name}</h4>
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <MapPin className="h-3 w-3" />
                  <span>{store.city}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-neutral-900">
                {store.sales.toLocaleString()}
              </div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(store.trend)}`}>
                {getTrendIcon(store.trend)}
                <span>{store.change > 0 ? '+' : ''}{store.change.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {stores.length === 0 && (
        <div className="text-center py-8">
          <Store className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No store sales data available</p>
        </div>
      )}
    </div>
  );
};
