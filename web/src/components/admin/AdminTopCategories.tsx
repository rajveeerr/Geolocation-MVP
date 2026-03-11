import React, { useState } from 'react';
import { useAdminPerformanceTopCategories } from '@/hooks/useAdminPerformanceTopCategories';
import { TrendingUp, TrendingDown, Minus, Tag, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { SkeletonList } from '@/components/common/Skeleton';
import { Button } from '@/components/ui/button';

interface AdminTopCategoriesProps {
  limit?: number;
  period?: '1d' | '7d' | '30d';
  cityId?: number;
}

export const AdminTopCategories: React.FC<AdminTopCategoriesProps> = ({
  limit = 10,
  period = '7d',
  cityId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading, error } = useAdminPerformanceTopCategories({ limit, period, cityId });

  if (isLoading) return <SkeletonList items={limit} />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <span className="text-sm text-red-400">Failed to load top categories data</span>
        </div>
      </div>
    );
  }

  const { categories } = data;
  const displayCategories = isExpanded ? categories : categories.slice(0, 5);
  const hasMore = categories.length > 5;

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
      <div className="flex items-center gap-2.5 mb-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-50">
          <Tag className="h-4 w-4 text-brand-primary-600" />
        </span>
        <h3 className="text-base font-bold font-heading text-neutral-900">Top Categories</h3>
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">{period}</span>
      </div>

      <div className="space-y-2.5">
        {displayCategories.map((category, index) => (
          <div key={category.id}
            className="flex items-center justify-between rounded-xl p-3 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-50 text-xs font-bold text-brand-primary-600">
                {index + 1}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-50 text-base">
                {category.icon || <Tag className="h-4 w-4 text-brand-primary-600" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-neutral-800">{category.name}</h4>
                <p className="text-[12px] text-neutral-400 line-clamp-1">{category.description}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 text-sm font-bold text-neutral-900 justify-end">
                <Hash className="h-3.5 w-3.5" />
                {(category.deals || 0).toLocaleString()}
              </div>
              <div className={`flex items-center gap-0.5 text-[12px] justify-end ${getTrendColor(category.trend)}`}>
                {getTrendIcon(category.trend)}
                {category.change > 0 ? '+' : ''}{category.change.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-700 rounded-xl h-9">
            {isExpanded
              ? <><ChevronUp className="h-3.5 w-3.5" /> Show Less</>
              : <><ChevronDown className="h-3.5 w-3.5" /> Show All ({categories.length})</>}
          </Button>
        </div>
      )}

      {categories.length === 0 && (
        <div className="text-center py-10">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
            <Tag className="h-5 w-5 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-400">No category data available</p>
        </div>
      )}
    </div>
  );
};
