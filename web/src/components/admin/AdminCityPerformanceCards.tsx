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

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (error || !performanceData) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-32">
          <span className="text-red-500 text-sm">Failed to load city performance data</span>
        </div>
      </div>
    );
  }

  // The backend already filters cities to only show those with merchant stores
  // So we can use the performance data directly
  const citiesWithStores = performanceData.cities;

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


  const getCityIcon = (index: number) => {
    const icons = ['🏙️', '🌆', '🏢', '🌃', '🏘️', '🌇', '🏛️', '🌉'];
    return icons[index % icons.length];
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Active Cities with Merchants</h3>
          <span className="text-sm text-neutral-500">({period})</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-1">
            <Store className="h-4 w-4" />
            <span>{citiesWithStores.length} Active Cities</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {citiesWithStores.map((city, index) => (
          <div
            key={city.id}
            className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-neutral-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-2xl">
                  {getCityIcon(index)}
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 text-lg">{city.name}</h4>
                  <p className="text-neutral-500 text-sm">{city.state}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-neutral-900">
                {city.value.toLocaleString()}
              </div>
              <div className={`flex items-center gap-2 text-sm font-medium ${
                city.trend === 'up' ? 'text-green-600' : 
                city.trend === 'down' ? 'text-red-600' : 
                'text-neutral-600'
              }`}>
                {getTrendIcon(city.trend)}
                <span>{city.change > 0 ? '+' : ''}{city.change.toFixed(1)}%</span>
                <span className="text-neutral-500">vs last period</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {citiesWithStores.length === 0 && (
        <div className="text-center py-8">
          <Store className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No active cities with merchants found</p>
          <p className="text-sm text-neutral-400 mt-2">Only cities with approved merchants and active stores are shown here</p>
        </div>
      )}
    </div>
  );
};
