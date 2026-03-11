import React, { useState } from 'react';
import { useAdminPerformanceTopMerchants } from '@/hooks/useAdminPerformanceTopMerchants';
import { TrendingUp, TrendingDown, Minus, Building, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
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

  if (isLoading) return <SkeletonList items={limit} />;

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center h-32">
          <span className="text-sm text-red-400">Failed to load top merchants data</span>
        </div>
      </div>
    );
  }

  const { merchants } = data;
  const displayMerchants = isExpanded ? merchants : merchants.slice(0, 5);
  const hasMore = merchants.length > 5;

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
          <Building className="h-4 w-4 text-brand-primary-600" />
        </span>
        <h3 className="text-base font-bold font-heading text-neutral-900">Top Merchants</h3>
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">{period}</span>
      </div>

      <div className="space-y-2">
        {displayMerchants.map((merchant, index) => (
          <div key={merchant.id}
            className="flex items-center justify-between rounded-xl p-2.5 hover:bg-neutral-50/80 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-primary-50 text-[10px] font-bold text-brand-primary-600">
                {index + 1}
              </span>
              {merchant.logoUrl ? (
                <img src={merchant.logoUrl} alt={merchant.name} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                  <Building className="h-4 w-4 text-neutral-400" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-medium text-neutral-800 truncate">{merchant.name}</h4>
                <p className="text-[11px] text-neutral-400">{merchant.category || 'Business'}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 text-sm font-bold text-neutral-900 justify-end">
                <DollarSign className="h-3 w-3" />
                {(merchant.revenue || 0).toLocaleString()}
              </div>
              <div className={`flex items-center gap-0.5 text-[11px] justify-end ${getTrendColor(merchant.trend)}`}>
                {getTrendIcon(merchant.trend)}
                {merchant.change > 0 ? '+' : ''}{merchant.change.toFixed(1)}%
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
              : <><ChevronDown className="h-3.5 w-3.5" /> Show All ({merchants.length})</>}
          </Button>
        </div>
      )}

      {merchants.length === 0 && (
        <div className="text-center py-10">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
            <Building className="h-5 w-5 text-neutral-300" />
          </div>
          <p className="text-sm text-neutral-400">No merchant data available</p>
        </div>
      )}
    </div>
  );
};
