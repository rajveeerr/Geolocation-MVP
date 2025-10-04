import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CityPerformance {
  name: string;
  value: number;
  change: number;
  isPositive: boolean;
}

interface CityPerformanceCardsProps {
  data: CityPerformance[];
}

export const CityPerformanceCards: React.FC<CityPerformanceCardsProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">City Performance</h3>
        <div className="text-neutral-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">City Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((city, index) => (
          <div
            key={index}
            className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 hover:border-neutral-300 transition-colors"
          >
            <div className="text-sm font-medium text-neutral-600 mb-1">{city.name}</div>
            <div className="text-2xl font-bold text-neutral-900 mb-2">
              {city.value.toLocaleString()}
            </div>
            <div className={`flex items-center gap-1 text-xs font-semibold ${
              city.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {city.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(city.change)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
