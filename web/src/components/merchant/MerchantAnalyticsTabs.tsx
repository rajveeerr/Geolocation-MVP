import { useState } from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, MapPin, Activity } from 'lucide-react';
import { useMerchantDealPerformance } from '@/hooks/useMerchantDealPerformance';
import { useMerchantCustomerInsights } from '@/hooks/useMerchantCustomerInsights';
import { useMerchantRevenueAnalytics } from '@/hooks/useMerchantRevenueAnalytics';
import { useMerchantEngagementMetrics } from '@/hooks/useMerchantEngagementMetrics';
import { useMerchantPerformanceComparison } from '@/hooks/useMerchantPerformanceComparison';
import { useMerchantCityPerformance } from '@/hooks/useMerchantCityPerformance';
import { Loader2 } from 'lucide-react';

interface TabProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ id, label, icon, isActive, onClick }: TabProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
      isActive
        ? 'bg-brand-primary-100 text-brand-primary-700 border border-brand-primary-200'
        : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

interface MerchantAnalyticsTabsProps {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' | 'all_time';
}

export const MerchantAnalyticsTabs = ({ period = 'last_30_days' }: MerchantAnalyticsTabsProps) => {
  const [activeTab, setActiveTab] = useState('deal-performance');

  const tabs = [
    { id: 'deal-performance', label: 'Deal Performance', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'customer-insights', label: 'Customer Insights', icon: <Users className="h-4 w-4" /> },
    { id: 'revenue-analytics', label: 'Revenue Analytics', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'engagement-metrics', label: 'Engagement Metrics', icon: <Activity className="h-4 w-4" /> },
    { id: 'performance-comparison', label: 'Performance Comparison', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'city-performance', label: 'City Performance', icon: <MapPin className="h-4 w-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'deal-performance':
        return <DealPerformanceContent period={period} />;
      case 'customer-insights':
        return <CustomerInsightsContent period={period} />;
      case 'revenue-analytics':
        return <RevenueAnalyticsContent period={period} />;
      case 'engagement-metrics':
        return <EngagementMetricsContent period={period} />;
      case 'performance-comparison':
        return <PerformanceComparisonContent period={period} />;
      case 'city-performance':
        return <CityPerformanceContent period={period} />;
      default:
        return <DealPerformanceContent period={period} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Deal Performance Content
const DealPerformanceContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantDealPerformance({ period: period as any });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load deal performance data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Deal Performance Analytics</h3>
      
      {/* Summary Stats */}
      {(data as any)?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Total Deals</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).summary.totalDeals}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Active Deals</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).summary.activeDeals}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Total Check-ins</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).summary.totalCheckIns}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Total Saves</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).summary.totalSaves}</p>
          </div>
        </div>
      )}

      {/* Deal List */}
      {(data as any)?.deals && (data as any).deals.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">Individual Deal Performance</h4>
          <div className="space-y-4">
            {(data as any).deals.map((deal: any) => (
              <div key={deal.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-neutral-900">{deal.title}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    deal.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {deal.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{deal.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500">Check-ins</p>
                    <p className="font-semibold">{deal.performance.checkIns}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Saves</p>
                    <p className="font-semibold">{deal.performance.saves}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Unique Users</p>
                    <p className="font-semibold">{deal.performance.uniqueUsers}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Kickback Events</p>
                    <p className="font-semibold">{deal.performance.kickbackEvents}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Customer Insights Content
const CustomerInsightsContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantCustomerInsights({ period: period as any });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load customer insights data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Customer Insights</h3>
      
      {/* Customer Overview */}
      {(data as any)?.customerOverview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Total Customers</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).customerOverview.totalCustomers}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">New Customers</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).customerOverview.newCustomers}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Returning Customers</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).customerOverview.returningCustomers}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Retention Rate</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).customerOverview.customerRetentionRate}%</p>
          </div>
        </div>
      )}

      {/* Activity Levels */}
      {(data as any)?.activityLevels && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">Customer Activity Levels</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600">High Activity</p>
              <p className="text-2xl font-bold text-green-800">{(data as any).activityLevels.high}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-sm text-amber-600">Medium Activity</p>
              <p className="text-2xl font-bold text-amber-800">{(data as any).activityLevels.medium}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600">Low Activity</p>
              <p className="text-2xl font-bold text-red-800">{(data as any).activityLevels.low}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Revenue Analytics Content
const RevenueAnalyticsContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantRevenueAnalytics({ period: period as any });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load revenue analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Revenue Analytics</h3>
      
      {/* Summary Stats */}
      {(data as any)?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Total Revenue</p>
            <p className="text-2xl font-bold text-neutral-900">${(data as any).summary.totalRevenue}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Kickback Paid</p>
            <p className="text-2xl font-bold text-neutral-900">${(data as any).summary.totalKickbackPaid}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Transactions</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).summary.totalTransactions}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Avg Transaction</p>
            <p className="text-2xl font-bold text-neutral-900">${(data as any).summary.averageTransactionValue}</p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-sm text-neutral-600">Kickback Rate</p>
            <p className="text-2xl font-bold text-neutral-900">{(data as any).summary.kickbackRate}%</p>
          </div>
        </div>
      )}

      {/* Daily Trends */}
      {(data as any)?.dailyTrends && (data as any).dailyTrends.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">Daily Revenue Trends</h4>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(data as any).dailyTrends.slice(-7).map((trend: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <p className="text-sm text-neutral-600">{new Date(trend.date).toLocaleDateString()}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Revenue:</span>
                      <span className="font-semibold">${trend.revenue}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transactions:</span>
                      <span className="font-semibold">{trend.transactions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Kickback:</span>
                      <span className="font-semibold">${trend.kickbackPaid}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Engagement Metrics Content
const EngagementMetricsContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantEngagementMetrics({ period: period as any });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load engagement metrics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Engagement Metrics</h3>
      
      {/* Funnel Metrics */}
      {(data as any)?.funnelMetrics && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">Conversion Funnel</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">Deal Views</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).funnelMetrics.totalDealViews}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">Deal Saves</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).funnelMetrics.totalDealSaves}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">Check-ins</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).funnelMetrics.totalCheckIns}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">Kickback Events</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).funnelMetrics.totalKickbackEvents}</p>
            </div>
          </div>
          
          {/* Conversion Rates */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Save Rate</p>
              <p className="text-2xl font-bold text-green-800">{(data as any).funnelMetrics.conversionRates.saveRate}%</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Check-in Rate</p>
              <p className="text-2xl font-bold text-blue-800">{(data as any).funnelMetrics.conversionRates.checkInRate}%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600">Kickback Rate</p>
              <p className="text-2xl font-bold text-purple-800">{(data as any).funnelMetrics.conversionRates.kickbackRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* User Engagement */}
      {(data as any)?.userEngagement && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">User Engagement</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">Engaged Users</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).userEngagement.totalEngagedUsers}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">Retention Rate</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).userEngagement.customerRetentionRate}%</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">Avg Engagement</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).userEngagement.averageEngagementPerUser}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="text-sm text-neutral-600">High Activity</p>
              <p className="text-2xl font-bold text-neutral-900">{(data as any).userEngagement.engagementLevels.high}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Engaging Deals */}
      {(data as any)?.topEngagingDeals && (data as any).topEngagingDeals.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">Top Engaging Deals</h4>
          <div className="space-y-3">
            {(data as any).topEngagingDeals.map((deal: any) => (
              <div key={deal.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-neutral-900">{deal.title}</h5>
                  <span className="text-sm text-neutral-600">{deal.category.name}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-neutral-500">Engagement Score</p>
                    <p className="font-semibold">{deal.engagementScore}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Saves</p>
                    <p className="font-semibold">{deal.saves}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Check-ins</p>
                    <p className="font-semibold">{deal.checkIns}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Kickback Events</p>
                    <p className="font-semibold">{deal.kickbackEvents}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Performance Comparison Content
const PerformanceComparisonContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantPerformanceComparison({ period: period as any });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load performance comparison data</p>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Performance Comparison</h3>
      
      {/* Period Information */}
      {(data as any)?.currentPeriod && (data as any)?.comparePeriod && (
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Current Period</p>
              <p className="font-semibold text-neutral-900">{(data as any).currentPeriod.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Compared to</p>
              <p className="font-semibold text-neutral-900">{(data as any).comparePeriod.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Comparison */}
      {(data as any)?.currentMetrics && (data as any)?.compareMetrics && (data as any)?.changes && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">Metrics Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries((data as any).currentMetrics).map(([key, currentValue]) => {
              const compareValue = (data as any).compareMetrics[key];
              const change = (data as any).changes[key];
              const trend = (data as any).trends[key];
              
              return (
                <div key={key} className="bg-white border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-neutral-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <span className={`text-sm ${getTrendColor(trend)}`}>
                      {getTrendIcon(trend)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Current:</span>
                      <span className="font-semibold">{currentValue as any}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Previous:</span>
                      <span className="font-semibold">{compareValue as any}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Change:</span>
                      <span className={`font-semibold ${getTrendColor(trend)}`}>
                        {change > 0 ? '+' : ''}{change}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Date Ranges */}
      {(data as any)?.dateRanges && (
        <div>
          <h4 className="text-md font-semibold text-neutral-900 mb-4">Date Ranges</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Current Period</h5>
              <p className="text-sm text-blue-700">
                {new Date((data as any).dateRanges.current.from).toLocaleDateString()} - {new Date((data as any).dateRanges.current.to).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Comparison Period</h5>
              <p className="text-sm text-green-700">
                {new Date((data as any).dateRanges.compare.from).toLocaleDateString()} - {new Date((data as any).dateRanges.compare.to).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// City Performance Content
const CityPerformanceContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantCityPerformance({ period: period as any });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load city performance data</p>
        <p className="text-sm text-neutral-500 mt-2">This API is currently returning an error</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">City Performance</h3>
      <div className="text-center py-8">
        <p className="text-neutral-600">City performance data will be displayed here</p>
        <p className="text-sm text-neutral-500 mt-2">API endpoint needs to be fixed</p>
      </div>
    </div>
  );
};