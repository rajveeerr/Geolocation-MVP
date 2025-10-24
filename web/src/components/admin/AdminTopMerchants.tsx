import React, { useState } from 'react';
import { useAdminPerformanceTopMerchants } from '@/hooks/useAdminPerformanceTopMerchants';
import { TrendingUp, TrendingDown, Minus, Building, DollarSign, ChevronDown } from 'lucide-react';
import { SkeletonList } from '@/components/common/Skeleton';
import { Button } from '@/components/ui/button';

interface AdminTopMerchantsProps {
  limit?: number;
  period?: '1d' | '7d' | '30d';
}

export const AdminTopMerchants: React.FC<AdminTopMerchantsProps> = ({
  limit = 10,
  period = '7d'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isLoading, error } = useAdminPerformanceTopMerchants({ limit, period });

  if (isLoading) {
    return <SkeletonList items={limit} />;
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-32">
          <span className="text-red-500 text-sm">Failed to load top merchants data</span>
        </div>
      </div>
    );
  }

  const { merchants } = data;
  const displayMerchants = isExpanded ? merchants : merchants.slice(0, 5);
  const hasMore = merchants.length > 5;


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
        <Building className="h-5 w-5 text-brand-primary-600" />
        <h3 className="text-lg font-semibold text-neutral-900">Top Merchants</h3>
        <span className="text-sm text-neutral-500">({period})</span>
      </div>
      
      <div className="space-y-2">
        {displayMerchants.map((merchant, index) => (
          <div
            key={merchant.id}
            className="flex items-center justify-between p-2 rounded-lg border border-neutral-200 hover:border-brand-primary-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-primary-100 flex items-center justify-center text-xs font-semibold text-brand-primary-600">
                {index + 1}
              </div>
              <div className="flex items-center gap-2">
                {merchant.logoUrl ? (
                  <img
                    src={merchant.logoUrl}
                    alt={merchant.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                    <Building className="h-4 w-4 text-neutral-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-neutral-900">{merchant.name}</h4>
                  <p className="text-xs text-neutral-500">{merchant.category || 'Business'}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm font-semibold text-neutral-900">
                <DollarSign className="h-3 w-3" />
                <span>${(merchant.revenue || 0).toLocaleString()}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs ${getTrendColor(merchant.trend)}`}>
                {getTrendIcon(merchant.trend)}
                <span>{merchant.change > 0 ? '+' : ''}{merchant.change.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All ({merchants.length} merchants)
              </>
            )}
          </Button>
        </div>
      )}
      
      {merchants.length === 0 && (
        <div className="text-center py-8">
          <Building className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No merchant data available</p>
        </div>
      )}
    </div>
  );
};
