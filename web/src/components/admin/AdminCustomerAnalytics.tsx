import React from 'react';
import { useAdminCustomersAnalytics } from '@/hooks/useAdminCustomersAnalytics';
import { Users, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { SkeletonCard } from '@/components/common/Skeleton';

interface AdminCustomerAnalyticsProps {
  period?: '1d' | '7d' | '30d' | '90d';
}

export const AdminCustomerAnalytics: React.FC<AdminCustomerAnalyticsProps> = ({
  period = '30d'
}) => {
  const { data, isLoading, error } = useAdminCustomersAnalytics({ period });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-center h-32">
          <span className="text-red-500 text-sm">Failed to load customer analytics</span>
        </div>
      </div>
    );
  }

  const { demographics, activityLevels, retentionMetrics, spendingPatterns } = data;

  return (
    <div className="space-y-6">
      {/* Demographics */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-brand-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Customer Demographics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Age Groups */}
          <div>
            <h4 className="font-medium text-neutral-700 mb-3">Age Groups</h4>
            <div className="space-y-2">
              {Object.entries(demographics.ageGroups).map(([age, count]) => (
                <div key={age} className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">{age}</span>
                  <span className="font-medium text-neutral-900">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Distribution */}
          <div>
            <h4 className="font-medium text-neutral-700 mb-3">Gender Distribution</h4>
            <div className="space-y-2">
              {Object.entries(demographics.genderDistribution).map(([gender, count]) => (
                <div key={gender} className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 capitalize">{gender}</span>
                  <span className="font-medium text-neutral-900">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Cities */}
          <div>
            <h4 className="font-medium text-neutral-700 mb-3">Top Cities</h4>
            <div className="space-y-2">
              {demographics.topCities.slice(0, 5).map((city, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">{city.city}</span>
                  <span className="font-medium text-neutral-900">{city.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Levels */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-brand-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Activity Levels</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(activityLevels).map(([level, count]) => (
            <div key={level} className="text-center p-4 rounded-lg border border-neutral-200">
              <div className="text-2xl font-bold text-brand-primary-600">{count.toLocaleString()}</div>
              <div className="text-sm text-neutral-600 capitalize">{level.replace(/([A-Z])/g, ' $1').trim()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Metrics */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-brand-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Retention Metrics</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg border border-neutral-200">
            <div className="text-2xl font-bold text-green-600">{retentionMetrics.newCustomers.toLocaleString()}</div>
            <div className="text-sm text-neutral-600">New Customers</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-neutral-200">
            <div className="text-2xl font-bold text-blue-600">{retentionMetrics.returningCustomers.toLocaleString()}</div>
            <div className="text-sm text-neutral-600">Returning Customers</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-neutral-200">
            <div className="text-2xl font-bold text-red-600">{retentionMetrics.churnRate.toFixed(1)}%</div>
            <div className="text-sm text-neutral-600">Churn Rate</div>
          </div>
          <div className="text-center p-4 rounded-lg border border-neutral-200">
            <div className="text-2xl font-bold text-green-600">{retentionMetrics.retentionRate.toFixed(1)}%</div>
            <div className="text-sm text-neutral-600">Retention Rate</div>
          </div>
        </div>
      </div>

      {/* Spending Patterns */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="h-5 w-5 text-brand-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Spending Patterns</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-neutral-700 mb-3">Average Spend</h4>
            <div className="text-3xl font-bold text-brand-primary-600">
              ${spendingPatterns.averageSpendPerCustomer.toFixed(2)}
            </div>
            <div className="text-sm text-neutral-600">per customer</div>
          </div>
          
          <div>
            <h4 className="font-medium text-neutral-700 mb-3">Top Spenders</h4>
            <div className="text-3xl font-bold text-green-600">
              {spendingPatterns.topSpendingCustomers.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-600">customers spending $200+</div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-neutral-700 mb-3">Spending Distribution</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(spendingPatterns.spendingDistribution).map(([range, count]) => (
              <div key={range} className="text-center p-3 rounded-lg border border-neutral-200">
                <div className="text-lg font-bold text-neutral-900">{count.toLocaleString()}</div>
                <div className="text-xs text-neutral-600">${range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
