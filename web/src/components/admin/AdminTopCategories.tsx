import React from 'react';
import { useAdminPerformanceTopCategories } from '@/hooks/useAdminPerformanceTopCategories';
import { TrendingUp, TrendingDown, Minus, Tag, Hash } from 'lucide-react';
import { SkeletonList } from '@/components/common/Skeleton';

interface AdminTopCategoriesProps {
  limit?: number;
  period?: '1d' | '7d' | '30d';
}

export const AdminTopCategories: React.FC<AdminTopCategoriesProps> = ({
  limit = 10,
  period = '7d'
}) => {
  const { data, isLoading, error } = useAdminPerformanceTopCategories({ limit, period });

  if (isLoading) {
    return <SkeletonList items={limit} />;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-32">
          <span className="text-red-500 text-sm">Failed to load top categories data</span>
        </div>
      </div>
    );
  }

  const { categories } = data;

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
        <Tag className="h-5 w-5 text-brand-primary-600" />
        <h3 className="text-lg font-semibold text-neutral-900">Top Categories</h3>
        <span className="text-sm text-neutral-500">({period})</span>
      </div>
      
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:border-brand-primary-300 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-primary-100 flex items-center justify-center text-sm font-semibold text-brand-primary-600">
                {index + 1}
              </div>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-brand-primary-100 text-brand-primary-600"
                >
                  {category.icon || <Tag className="h-5 w-5" />}
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900">{category.name}</h4>
                  <p className="text-sm text-neutral-500">{category.description}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-lg font-semibold text-neutral-900">
                <Hash className="h-4 w-4" />
                <span>{(category.deals || 0).toLocaleString()}</span>
              </div>
              <div className={`flex items-center gap-1 text-sm ${getTrendColor(category.trend)}`}>
                {getTrendIcon(category.trend)}
                <span>{category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-8">
          <Tag className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No category data available</p>
        </div>
      )}
    </div>
  );
};
