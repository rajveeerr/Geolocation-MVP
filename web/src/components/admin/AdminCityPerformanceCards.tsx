import React from 'react';
import { useAdminPerformanceCities } from '@/hooks/useAdminPerformanceCities';
import { TrendingUp, TrendingDown, Minus, MapPin } from 'lucide-react';
import { SkeletonCard } from '@/components/common/Skeleton';

interface AdminCityPerformanceCardsProps {
  period?: '1d' | '7d' | '30d';
}

export const AdminCityPerformanceCards: React.FC<AdminCityPerformanceCardsProps> = ({
  period = '7d'
}) => {
  const { data, isLoading, error } = useAdminPerformanceCities({ period });

  if (isLoading) {
    return <SkeletonCard />;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-32">
          <span className="text-red-500 text-sm">Failed to load city performance data</span>
        </div>
      </div>
    );
  }

  const { cities } = data;

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
        <MapPin className="h-5 w-5 text-brand-primary-600" />
        <h3 className="text-lg font-semibold text-neutral-900">City Performance</h3>
        <span className="text-sm text-neutral-500">({period})</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <div
            key={city.id}
            className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-brand-primary-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-brand-primary-600" />
              </div>
              <div>
                <h4 className="font-medium text-neutral-900">{city.name}</h4>
                <p className="text-sm text-neutral-500">{city.state}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-semibold text-neutral-900">
                {city.value.toLocaleString()}
              </div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(city.trend)}`}>
                {getTrendIcon(city.trend)}
                <span>{city.change > 0 ? '+' : ''}{city.change.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {cities.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No city performance data available</p>
        </div>
      )}
    </div>
  );
};
