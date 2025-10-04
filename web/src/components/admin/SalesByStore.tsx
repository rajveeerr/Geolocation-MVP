import React from 'react';
import { ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';

interface StoreSales {
  name: string;
  sales: number;
  change: number;
  isPositive: boolean;
}

interface SalesByStoreProps {
  data: StoreSales[];
}

export const SalesByStore: React.FC<SalesByStoreProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-neutral-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Sales by Store</h3>
        </div>
        <div className="text-neutral-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-neutral-600" />
        <h3 className="text-lg font-semibold text-neutral-900">Sales by Store</h3>
      </div>
      <div className="space-y-4">
        {data.map((store, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-neutral-900 truncate">
                  {store.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-neutral-900">
                  {store.sales.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${
                  store.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {store.isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {Math.abs(store.change)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
