import React from 'react';
import { useAdminPerformanceCities } from '@/hooks/useAdminPerformanceCities';
import { TrendingUp, TrendingDown, Minus, MapPin, Store } from 'lucide-react';
import { SkeletonCard } from '@/components/common/Skeleton';

interface AdminCityPerformanceCardsProps {
  period?: '1d' | '7d' | '30d';
}

export const AdminCityPerformanceCards: React.FC<AdminCityPerformanceCardsProps> = ({
  period = '7d'
}) => {
  const { data: performanceData, isLoading, error } = useAdminPerformanceCities({ period });

  if (isLoading) return <SkeletonCard />;

  if (error || !performanceData) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <span className="text-sm text-red-400">Failed to load city performance data</span>
        </div>
      </div>
    );
  }

  const citiesWithStores = performanceData.cities;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
      case 'down': return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
      default: return <Minus className="h-3.5 w-3.5 text-neutral-500" />;
    }
  };

  const getCityIcon = (index: number) => {
    const icons = ['🏙️', '🌆', '🏢', '🌃', '🏘️', '🌇', '🏛️', '🌉'];
    return icons[index % icons.length];
  };

  return (
    <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-50">
            <MapPin className="h-4 w-4 text-brand-primary-600" />
          </span>
          <h3 className="text-base font-bold font-heading text-neutral-900">Active Cities with Merchants</h3>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">{period}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-neutral-500">
          <Store className="h-4 w-4" />
          <span>{citiesWithStores.length} Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {citiesWithStores.map((city, index) => (
          <div key={city.id}
            className="rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-5 shadow-sm hover:shadow-md hover:bg-white hover:border-brand-primary-100 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-neutral-200/60 shadow-sm text-xl group-hover:scale-105 transition-transform">
                {getCityIcon(index)}
              </div>
              <div>
                <h4 className="text-base font-bold text-neutral-900">{city.name}</h4>
                <p className="text-[13px] text-neutral-500">{city.state}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-bold font-heading text-neutral-900 tracking-tight">
                {city.value.toLocaleString()}
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-medium ${
                city.trend === 'up' ? 'text-emerald-600' :
                city.trend === 'down' ? 'text-red-600' :
                'text-neutral-500'
              }`}>
                {getTrendIcon(city.trend)}
                <span>{city.change > 0 ? '+' : ''}{city.change.toFixed(1)}%</span>
                <span className="text-neutral-400 text-[12px]">vs last period</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {citiesWithStores.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-50">
            <Store className="h-6 w-6 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-500">No active cities with merchants found</p>
          <p className="text-[13px] text-neutral-400 mt-1">Only cities with approved merchants and active stores are shown</p>
        </div>
      )}
    </div>
  );
};
