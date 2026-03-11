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

  if (isLoading) return <SkeletonList items={limit} />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <span className="text-sm text-red-400">Failed to load sales by store data</span>
        </div>
      </div>
    );
  }

  const { stores } = data;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
      case 'down': return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
      default: return <Minus className="h-3.5 w-3.5 text-neutral-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-emerald-600';
      case 'down': return 'text-red-500';
      default: return 'text-neutral-500';
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-50">
          <Store className="h-4 w-4 text-brand-primary-600" />
        </span>
        <h3 className="text-base font-bold font-heading text-neutral-900">Sales by Store</h3>
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">{period}</span>
      </div>

      <div className="space-y-2.5">
        {stores.map((store, index) => (
          <div key={store.id}
            className="flex items-center justify-between rounded-xl p-3 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-50 text-xs font-bold text-brand-primary-600">
                {index + 1}
              </span>
              <div>
                <h4 className="text-sm font-semibold text-neutral-800">{store.name}</h4>
                <div className="flex items-center gap-1 text-[12px] text-neutral-400">
                  <MapPin className="h-3 w-3" />
                  <span>{store.city}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-neutral-900">{store.sales.toLocaleString()}</div>
              <div className={`flex items-center gap-1 text-[12px] justify-end ${getTrendColor(store.trend)}`}>
                {getTrendIcon(store.trend)}
                <span>{store.change > 0 ? '+' : ''}{store.change.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-10">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
            <Store className="h-5 w-5 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-400">No store sales data available</p>
        </div>
      )}
    </div>
  );
};
