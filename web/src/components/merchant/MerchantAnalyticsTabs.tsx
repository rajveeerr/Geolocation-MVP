import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useMerchantDealPerformance } from '@/hooks/useMerchantDealPerformance';
import { useMerchantCustomerInsights } from '@/hooks/useMerchantCustomerInsights';
import { useMerchantRevenueAnalytics } from '@/hooks/useMerchantRevenueAnalytics';
import { useMerchantEngagementMetrics } from '@/hooks/useMerchantEngagementMetrics';
import { useMerchantPerformanceComparison } from '@/hooks/useMerchantPerformanceComparison';
import { useMerchantCityPerformance } from '@/hooks/useMerchantCityPerformance';
import { Loader2 } from 'lucide-react';
import { MerchantSegmentedControl, merchantPanelClass } from '@/components/merchant/MerchantAppleUI';
import { cn } from '@/lib/utils';

interface MerchantAnalyticsTabsProps {
  period?: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' | 'all_time';
}

const chartColors = {
  ink: '#111827',
  slate: '#6b7280',
  grid: '#e5e7eb',
  blue: '#4f46e5',
  blueSoft: '#c7d2fe',
  green: '#10b981',
  greenSoft: '#d1fae5',
  amber: '#f59e0b',
  amberSoft: '#fef3c7',
  rose: '#f43f5e',
  roseSoft: '#ffe4e6',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="h-6 w-6 animate-spin text-brand-primary-600" />
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="rounded-[1rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>
);

const AnalyticsStatCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-[1rem] border border-neutral-200/80 bg-neutral-50/70 p-4">
    <div className="text-[12px] font-medium text-neutral-500">{label}</div>
    <div className="mt-2 text-[1.45rem] font-semibold tracking-tight text-neutral-950">{value}</div>
    {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
  </div>
);

const AnalyticsChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className={merchantPanelClass}>
    <div className="mb-4">
      <div className="text-[15px] font-semibold text-neutral-950">{title}</div>
      {subtitle ? <div className="mt-1 text-[13px] text-neutral-500">{subtitle}</div> : null}
    </div>
    {children}
  </div>
);

const TrendPill = ({
  trend,
  value,
}: {
  trend: 'up' | 'down' | 'stable';
  value: number;
}) => {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        isUp
          ? 'bg-emerald-50 text-emerald-700'
          : isDown
            ? 'bg-rose-50 text-rose-700'
            : 'bg-neutral-100 text-neutral-600',
      )}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : isDown ? <TrendingDown className="h-3 w-3" /> : null}
      {value > 0 ? '+' : ''}
      {value.toFixed(1)}%
    </div>
  );
};

export const MerchantAnalyticsTabs = ({ period = 'last_30_days' }: MerchantAnalyticsTabsProps) => {
  const [activeTab, setActiveTab] = useState<
    'deal-performance' | 'customer-insights' | 'revenue-analytics' | 'engagement-metrics' | 'performance-comparison' | 'city-performance'
  >('deal-performance');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="text-[13px] font-semibold text-neutral-900">Detailed views</div>
        <div className="overflow-x-auto pb-1">
          <MerchantSegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            options={[
              { value: 'deal-performance', label: 'Deal Performance' },
              { value: 'customer-insights', label: 'Customer Insights' },
              { value: 'revenue-analytics', label: 'Revenue Analytics' },
              { value: 'engagement-metrics', label: 'Engagement Metrics' },
              { value: 'performance-comparison', label: 'Performance Comparison' },
              { value: 'city-performance', label: 'City Performance' },
            ]}
            className="min-w-max"
          />
        </div>
      </div>

      {activeTab === 'deal-performance' ? <DealPerformanceContent period={period} /> : null}
      {activeTab === 'customer-insights' ? <CustomerInsightsContent period={period} /> : null}
      {activeTab === 'revenue-analytics' ? <RevenueAnalyticsContent period={period} /> : null}
      {activeTab === 'engagement-metrics' ? <EngagementMetricsContent period={period} /> : null}
      {activeTab === 'performance-comparison' ? <PerformanceComparisonContent period={period} /> : null}
      {activeTab === 'city-performance' ? <CityPerformanceContent period={period} /> : null}
    </div>
  );
};

const DealPerformanceContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantDealPerformance({ period: period as 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' });

  const aggregatedSeries = useMemo(() => {
    if (!data?.deals) return [];

    const buckets = new Map<string, { date: string; checkIns: number; saves: number; revenue: number }>();

    data.deals.forEach((deal) => {
      deal.timeSeries.forEach((point) => {
        const existing = buckets.get(point.date) ?? {
          date: point.date,
          checkIns: 0,
          saves: 0,
          revenue: 0,
        };

        existing.checkIns += point.checkIns;
        existing.saves += point.saves;
        existing.revenue += point.revenue;
        buckets.set(point.date, existing);
      });
    });

    return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load deal performance data." />;
  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <AnalyticsStatCard label="Total deals" value={formatCompactNumber(data.summary.totalDeals)} />
        <AnalyticsStatCard label="Active deals" value={formatCompactNumber(data.summary.activeDeals)} />
        <AnalyticsStatCard label="Check-ins" value={formatCompactNumber(data.summary.totalCheckIns)} />
        <AnalyticsStatCard label="Saves" value={formatCompactNumber(data.summary.totalSaves)} />
        <AnalyticsStatCard label="Conversion" value={`${data.summary.averageConversionRate.toFixed(1)}%`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <AnalyticsChartCard title="Deal momentum" subtitle="Check-ins and saves over time">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregatedSeries}>
                <defs>
                  <linearGradient id="dealCheckins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.blue} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={chartColors.blue} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="checkIns" stroke={chartColors.blue} fill="url(#dealCheckins)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="saves" stroke={chartColors.green} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Top deals" subtitle="Strongest live offer performance">
          <div className="space-y-3">
            {data.deals.slice(0, 5).map((deal) => (
              <div key={deal.id} className="rounded-[1rem] border border-neutral-200/80 bg-neutral-50/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[13px] font-semibold text-neutral-900">{deal.title}</div>
                    <div className="mt-1 text-xs text-neutral-500">{deal.category.name}</div>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', deal.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600')}>
                    {deal.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                  <div><span className="text-neutral-500">Check-ins</span><div className="mt-1 font-semibold text-neutral-900">{formatCompactNumber(deal.performance.checkIns)}</div></div>
                  <div><span className="text-neutral-500">Saves</span><div className="mt-1 font-semibold text-neutral-900">{formatCompactNumber(deal.performance.saves)}</div></div>
                  <div><span className="text-neutral-500">Unique users</span><div className="mt-1 font-semibold text-neutral-900">{formatCompactNumber(deal.performance.uniqueUsers)}</div></div>
                  <div><span className="text-neutral-500">Kickbacks</span><div className="mt-1 font-semibold text-neutral-900">{formatCompactNumber(deal.performance.kickbackEvents)}</div></div>
                </div>
              </div>
            ))}
          </div>
        </AnalyticsChartCard>
      </div>
    </div>
  );
};

const CustomerInsightsContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantCustomerInsights({ period: period as 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load customer insights data." />;
  if (!data) return null;

  const { customerOverview, activityLevels, customerSegments, topCustomers } = data.insights;
  const activityData = [
    { name: 'High', value: activityLevels.high, fill: chartColors.green },
    { name: 'Medium', value: activityLevels.medium, fill: chartColors.amber },
    { name: 'Low', value: activityLevels.low, fill: chartColors.rose },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsStatCard label="Total customers" value={formatCompactNumber(customerOverview.totalCustomers)} />
        <AnalyticsStatCard label="New customers" value={formatCompactNumber(customerOverview.newCustomers)} />
        <AnalyticsStatCard label="Returning" value={formatCompactNumber(customerOverview.returningCustomers)} />
        <AnalyticsStatCard label="Retention rate" value={`${customerOverview.customerRetentionRate.toFixed(1)}%`} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsChartCard title="Activity profile" subtitle="How active your customer base is right now">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill={chartColors.blue} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Customer segments" subtitle="Segment size by customer behavior">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSegments}>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="segment" tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill={chartColors.green} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard title="Top customers" subtitle="Recent high-value customers">
        <div className="space-y-3">
          {topCustomers.slice(0, 5).map((customer) => (
            <div key={customer.id} className="flex items-center justify-between rounded-[1rem] border border-neutral-200/80 bg-neutral-50/60 p-4">
              <div>
                <div className="text-[13px] font-semibold text-neutral-900">{customer.name}</div>
                <div className="mt-1 text-xs text-neutral-500">
                  {customer.checkInCount} check-ins · Last active {formatDateLabel(customer.lastActive)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-neutral-900">{formatCurrency(customer.totalSpend)}</div>
                <div className="mt-1 text-xs text-neutral-500">{formatCompactNumber(customer.totalPoints)} pts</div>
              </div>
            </div>
          ))}
        </div>
      </AnalyticsChartCard>
    </div>
  );
};

const RevenueAnalyticsContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantRevenueAnalytics({ period: period as 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load revenue analytics data." />;
  if (!data) return null;

  const { analytics } = data;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsStatCard label="Total revenue" value={formatCurrency(analytics.totalRevenue.value)} hint={`${analytics.totalRevenue.change > 0 ? '+' : ''}${analytics.totalRevenue.change.toFixed(1)}% vs prior`} />
        <AnalyticsStatCard label="Kickback paid" value={formatCurrency(analytics.kickbackAnalytics.totalKickbackPaid)} />
        <AnalyticsStatCard label="Kickback earned" value={formatCurrency(analytics.kickbackAnalytics.totalKickbackEarned)} />
        <AnalyticsStatCard label="Net kickback" value={formatCurrency(analytics.kickbackAnalytics.netKickback)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <AnalyticsChartCard title="Revenue over time" subtitle="Order volume and revenue trend">
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueByTime}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.green} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={chartColors.green} stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => formatCompactNumber(value)} tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke={chartColors.green} fill="url(#revenueGradient)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="orders" stroke={chartColors.blue} dot={false} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Revenue by category" subtitle="Contribution mix by category">
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenueByCategory}>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="category" tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(value) => formatCompactNumber(value)} tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill={chartColors.amber} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>
      </div>
    </div>
  );
};

const EngagementMetricsContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantEngagementMetrics({ period: period as 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load engagement metrics data." />;
  if (!data) return null;

  const { funnelMetrics, userBehavior, topEngagingDeals, timeBasedEngagement } = data.metrics;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <AnalyticsStatCard label="Deal views" value={formatCompactNumber(funnelMetrics.totalViews)} />
        <AnalyticsStatCard label="Deal saves" value={formatCompactNumber(funnelMetrics.totalSaves)} />
        <AnalyticsStatCard label="Check-ins" value={formatCompactNumber(funnelMetrics.totalCheckIns)} />
        <AnalyticsStatCard label="Kickbacks" value={formatCompactNumber(funnelMetrics.totalKickbackEvents)} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AnalyticsChartCard title="Engagement timeline" subtitle="Views, saves, and check-ins over time">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeBasedEngagement}>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke={chartColors.ink} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="saves" stroke={chartColors.blue} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="checkIns" stroke={chartColors.green} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>

        <AnalyticsChartCard title="Conversion funnel" subtitle="How customers move through the funnel">
          <div className="space-y-4">
            {[
              { label: 'View to save', value: funnelMetrics.conversionRates.viewToSave },
              { label: 'Save to check-in', value: funnelMetrics.conversionRates.saveToCheckIn },
              { label: 'Check-in to kickback', value: funnelMetrics.conversionRates.checkInToKickback },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-[13px]">
                  <span className="text-neutral-600">{item.label}</span>
                  <span className="font-semibold text-neutral-900">{item.value.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-neutral-900" style={{ width: `${Math.min(item.value, 100)}%` }} />
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <AnalyticsStatCard label="Avg session" value={`${userBehavior.averageSessionDuration.toFixed(1)} min`} />
              <AnalyticsStatCard label="Repeat rate" value={`${userBehavior.repeatCustomerRate.toFixed(1)}%`} />
            </div>
          </div>
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard title="Top engaging deals" subtitle="Strongest attention and interaction rates">
        <div className="space-y-3">
          {topEngagingDeals.slice(0, 5).map((deal) => (
            <div key={deal.dealId} className="rounded-[1rem] border border-neutral-200/80 bg-neutral-50/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-neutral-900">{deal.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">{deal.engagementRate.toFixed(1)}% engagement rate</div>
                </div>
                <TrendPill trend={deal.engagementRate > 20 ? 'up' : 'stable'} value={deal.engagementRate} />
              </div>
            </div>
          ))}
        </div>
      </AnalyticsChartCard>
    </div>
  );
};

const PerformanceComparisonContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantPerformanceComparison({
    currentPeriod: period as 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year',
    previousPeriod: period as 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year',
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load performance comparison data." />;
  if (!data) return null;

  const { comparison } = data;
  const comparisonCards = [
    { label: 'Gross sales', current: comparison.currentPeriod.metrics.grossSales, previous: comparison.previousPeriod.metrics.grossSales, comparison: comparison.comparisons.grossSales, currency: true },
    { label: 'Order volume', current: comparison.currentPeriod.metrics.orderVolume, previous: comparison.previousPeriod.metrics.orderVolume, comparison: comparison.comparisons.orderVolume, currency: false },
    { label: 'Avg order value', current: comparison.currentPeriod.metrics.averageOrderValue, previous: comparison.previousPeriod.metrics.averageOrderValue, comparison: comparison.comparisons.averageOrderValue, currency: true },
    { label: 'Customers', current: comparison.currentPeriod.metrics.totalCustomers, previous: comparison.previousPeriod.metrics.totalCustomers, comparison: comparison.comparisons.totalCustomers, currency: false },
    { label: 'Active deals', current: comparison.currentPeriod.metrics.activeDeals, previous: comparison.previousPeriod.metrics.activeDeals, comparison: comparison.comparisons.activeDeals, currency: false },
    { label: 'Kickback earnings', current: comparison.currentPeriod.metrics.kickbackEarnings, previous: comparison.previousPeriod.metrics.kickbackEarnings, comparison: comparison.comparisons.kickbackEarnings, currency: true },
  ];

  return (
    <div className="space-y-5">
      <AnalyticsChartCard title="Performance trend" subtitle="Current period against previous baseline">
        <div className="h-[270px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={comparison.trends}>
              <CartesianGrid vertical={false} stroke={chartColors.grid} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="grossSales" stroke={chartColors.blue} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="orderVolume" stroke={chartColors.green} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="averageOrderValue" stroke={chartColors.amber} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsChartCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {comparisonCards.map((item) => (
          <div key={item.label} className="rounded-[1rem] border border-neutral-200/80 bg-neutral-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-medium text-neutral-600">{item.label}</div>
              <TrendPill trend={item.comparison.trend} value={item.comparison.percentageChange} />
            </div>
            <div className="mt-3 text-[1.25rem] font-semibold text-neutral-950">
              {item.currency ? formatCurrency(item.current) : formatCompactNumber(item.current)}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Previous: {item.currency ? formatCurrency(item.previous) : formatCompactNumber(item.previous)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CityPerformanceContent = ({ period }: { period: string }) => {
  const { data, isLoading, error } = useMerchantCityPerformance({ period: period as 'last_7_days' | 'last_30_days' | 'this_month' | 'this_year' });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load city performance data." />;
  if (!data) return null;

  const chartData = data.cities.map((city) => ({
    cityName: city.cityName,
    grossSales: city.totalPerformance.grossSales,
    orderVolume: city.totalPerformance.orderVolume,
  }));

  return (
    <div className="space-y-5">
      <AnalyticsChartCard title="City revenue view" subtitle="Performance across active merchant cities">
        <div className="h-[270px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} stroke={chartColors.grid} />
              <XAxis dataKey="cityName" tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: chartColors.slate }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="grossSales" radius={[10, 10, 0, 0]} fill={chartColors.blue} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsChartCard>

      <div className="grid gap-4 xl:grid-cols-2">
        {data.cities.map((city) => (
          <AnalyticsChartCard
            key={city.cityId}
            title={city.cityName}
            subtitle={`${city.stores.length} store${city.stores.length === 1 ? '' : 's'} in this city`}
          >
            <div className="grid grid-cols-2 gap-4">
              <AnalyticsStatCard label="Gross sales" value={formatCurrency(city.totalPerformance.grossSales)} />
              <AnalyticsStatCard label="Order volume" value={formatCompactNumber(city.totalPerformance.orderVolume)} />
              <AnalyticsStatCard label="Avg order value" value={formatCurrency(city.totalPerformance.averageOrderValue)} />
              <AnalyticsStatCard label="Kickbacks" value={formatCurrency(city.totalPerformance.kickbackEarnings)} />
            </div>
          </AnalyticsChartCard>
        ))}
      </div>
    </div>
  );
};
