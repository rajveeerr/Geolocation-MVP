// web/src/pages/admin/AdminOverviewPage.tsx
import { useState } from 'react';
import { Calendar, Filter, MapPin, Zap, Trophy, TrendingUp, TrendingDown, Users, Target, Award, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { AdminPerformanceStatsCards } from '@/components/admin/AdminPerformanceStatsCards';
import { AdminCityPerformanceCards } from '@/components/admin/AdminCityPerformanceCards';
import { AdminSalesByStore } from '@/components/admin/AdminSalesByStore';
import { AdminWeeklyChart } from '@/components/admin/AdminWeeklyChart';
import { AdminTopMerchants } from '@/components/admin/AdminTopMerchants';
import { AdminTopCities } from '@/components/admin/AdminTopCities';
import { AdminTopCategories } from '@/components/admin/AdminTopCategories';
import { useAdminCities } from '@/hooks/useAdminCities';
import { useAdminTapInsOverview, useAdminBountiesOverview, useAdminTapInsGeographic, useAdminBountiesLeaderboard } from '@/hooks/useAdminAdvancedAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminOverviewPage = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'checkins' | 'saves' | 'sales'>('checkins');
  const [isLeaderboardExpanded, setIsLeaderboardExpanded] = useState(false);

  const { data: citiesData, isLoading: citiesLoading } = useAdminCities({ active: true, limit: 100 });
  const activeCities = citiesData?.cities || [];

  const getCityId = (cityName: string) => {
    const city = activeCities.find(c => c.name === cityName);
    return city?.id || undefined;
  };

  const cityId = selectedCity ? getCityId(selectedCity) : undefined;

  const { data: tapInsOverview, isLoading: isLoadingTapIns } = useAdminTapInsOverview({
    period: selectedTimeRange === '1d' ? 'last_24_hours' :
            selectedTimeRange === '7d' ? 'last_7_days' :
            selectedTimeRange === '30d' ? 'last_30_days' : 'last_90_days',
    cityId
  });

  const { data: bountiesOverview, isLoading: isLoadingBounties } = useAdminBountiesOverview({
    period: selectedTimeRange === '1d' ? 'last_24_hours' :
            selectedTimeRange === '7d' ? 'last_7_days' :
            selectedTimeRange === '30d' ? 'last_30_days' : 'last_90_days',
    cityId
  });

  const { data: tapInsGeographic } = useAdminTapInsGeographic({
    period: selectedTimeRange === '1d' ? 'last_24_hours' :
            selectedTimeRange === '7d' ? 'last_7_days' :
            selectedTimeRange === '30d' ? 'last_30_days' : 'last_90_days',
    limit: 10
  });

  const { data: bountiesLeaderboard } = useAdminBountiesLeaderboard({ period: 'current', limit: 10 });

  const formatCount = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDistance = (meters: number) => `${(meters * 0.000621371).toFixed(1)} mi`;

  const getTrendIcon = (trend: 'up' | 'down') =>
    trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />;

  const getTrendColor = (trend: 'up' | 'down') =>
    trend === 'up' ? 'text-emerald-600' : 'text-red-500';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight">Performance Analytics</h1>
          <p className="mt-1 text-sm text-neutral-500">Comprehensive view of platform performance metrics.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { icon: <MapPin className="h-4 w-4 text-neutral-400" />, content: (
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}
                className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none cursor-pointer" disabled={citiesLoading}>
                <option value="">All Cities</option>
                {citiesLoading ? <option value="" disabled>Loading...</option> :
                  activeCities.map((city) => <option key={city.id} value={city.name}>{city.name}, {city.state}</option>)}
              </select>
            )},
            { icon: <Calendar className="h-4 w-4 text-neutral-400" />, content: (
              <select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none cursor-pointer">
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            )},
            { icon: <Filter className="h-4 w-4 text-neutral-400" />, content: (
              <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none cursor-pointer">
                <option value="checkins">Check-ins</option>
                <option value="saves">Saves</option>
                <option value="sales">Sales</option>
              </select>
            )},
          ].map((filter, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl border border-neutral-200/60 bg-white px-3 py-2 shadow-sm">
              {filter.icon}
              {filter.content}
            </div>
          ))}
        </div>
      </div>

      {/* Key Metric Stat Cards */}
      <AdminPerformanceStatsCards period={selectedTimeRange} cityId={cityId} />

      {/* Tap-ins & Bounties */}
      <div className="space-y-8">
        {/* Tap-ins Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading text-neutral-900 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50">
              <Zap className="h-4 w-4 text-yellow-500" />
            </span>
            Tap-ins Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingTapIns ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-neutral-200/60 bg-white p-5 animate-pulse">
                  <div className="h-3 bg-neutral-100 rounded-lg w-3/4 mb-3" />
                  <div className="h-7 bg-neutral-100 rounded-lg w-1/2" />
                </div>
              ))
            ) : tapInsOverview?.metrics ? (
              [
                { label: 'Total Tap-ins', m: tapInsOverview.metrics.totalTapIns, icon: <Zap className="h-5 w-5" />, bg: 'bg-yellow-50 text-yellow-500' },
                { label: 'Unique Users', m: tapInsOverview.metrics.uniqueUsers, icon: <Users className="h-5 w-5" />, bg: 'bg-blue-50 text-blue-500' },
                { label: 'Avg Distance', m: tapInsOverview.metrics.averageDistance, icon: <Target className="h-5 w-5" />, bg: 'bg-emerald-50 text-emerald-500', fmt: formatDistance },
                { label: 'Top Merchant', m: tapInsOverview.metrics.topMerchant, icon: <Award className="h-5 w-5" />, bg: 'bg-purple-50 text-purple-500' },
              ].map(({ label, m, icon, bg, fmt }) => (
                <div key={label} className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-neutral-500">{label}</p>
                      <p className="mt-1.5 text-2xl font-bold font-heading text-neutral-900 tracking-tight">
                        {fmt ? fmt(m.value) : formatCount(m.value)}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {getTrendIcon(m.trend)}
                        <span className={`text-xs font-semibold ${getTrendColor(m.trend)}`}>
                          {m.change > 0 ? '+' : ''}{m.change}%
                        </span>
                      </div>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-neutral-200 py-12 text-center text-sm text-neutral-400">
                No tap-ins data available
              </div>
            )}
          </div>

          {tapInsGeographic?.geographic && (
            <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2.5 text-base font-heading">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                  </span>
                  Geographic Distribution
                </CardTitle>
                <CardDescription className="text-[13px]">Tap-ins by city and distance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-3">Top Cities</h4>
                    <div className="space-y-2">
                      {tapInsGeographic.geographic.cityDistribution.slice(0, 5).map((city, index) => (
                        <div key={city.city.id} className="flex items-center justify-between rounded-xl bg-neutral-50/80 p-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary-50 text-xs font-bold text-brand-primary-600">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-neutral-800">{city.city.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-neutral-900">{formatCount(city.tapIns)}</p>
                            <p className="text-[11px] text-neutral-400">{formatCount(city.uniqueUsers)} users</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-700 mb-3">Distance Analysis</h4>
                    <div className="space-y-2.5">
                      {[
                        { label: 'Average', value: tapInsGeographic.geographic.distanceAnalysis.average, color: 'bg-blue-50 text-blue-700' },
                        { label: 'Median', value: tapInsGeographic.geographic.distanceAnalysis.median, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Maximum', value: tapInsGeographic.geographic.distanceAnalysis.max, color: 'bg-purple-50 text-purple-700' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className={`flex justify-between items-center rounded-xl p-3.5 ${color}`}>
                          <span className="text-sm font-medium">{label}</span>
                          <span className="text-sm font-bold">{formatDistance(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Bounties Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading text-neutral-900 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <Trophy className="h-4 w-4 text-red-500" />
            </span>
            Bounty Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingBounties ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-neutral-200/60 bg-white p-5 animate-pulse">
                  <div className="h-3 bg-neutral-100 rounded-lg w-3/4 mb-3" />
                  <div className="h-7 bg-neutral-100 rounded-lg w-1/2" />
                </div>
              ))
            ) : bountiesOverview?.metrics ? (
              [
                { label: 'Total Participants', m: bountiesOverview.metrics.totalParticipants, icon: <Users className="h-5 w-5" />, bg: 'bg-red-50 text-red-500' },
                { label: 'Points Awarded', m: bountiesOverview.metrics.totalPointsAwarded, icon: <Award className="h-5 w-5" />, bg: 'bg-emerald-50 text-emerald-500' },
                { label: 'Avg Points/User', m: bountiesOverview.metrics.averagePointsPerUser, icon: <BarChart3 className="h-5 w-5" />, bg: 'bg-blue-50 text-blue-500', fmt: (v: number) => v.toFixed(1) },
                { label: 'Top Performer', m: bountiesOverview.metrics.topPerformerPoints, icon: <Trophy className="h-5 w-5" />, bg: 'bg-purple-50 text-purple-500' },
              ].map(({ label, m, icon, bg, fmt }) => (
                <div key={label} className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-neutral-500">{label}</p>
                      <p className="mt-1.5 text-2xl font-bold font-heading text-neutral-900 tracking-tight">
                        {fmt ? fmt(m.value) : formatCount(m.value)}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {getTrendIcon(m.trend)}
                        <span className={`text-xs font-semibold ${getTrendColor(m.trend)}`}>
                          {m.change > 0 ? '+' : ''}{m.change}%
                        </span>
                      </div>
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>{icon}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-neutral-200 py-12 text-center text-sm text-neutral-400">
                No bounties data available
              </div>
            )}
          </div>

          {bountiesLeaderboard?.leaderboard && (
            <Card className="rounded-2xl border-neutral-200/60 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2.5 text-base font-heading">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </span>
                  Current Leaderboard
                </CardTitle>
                <CardDescription className="text-[13px]">Top performers in the current period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(isLeaderboardExpanded ? bountiesLeaderboard.leaderboard : bountiesLeaderboard.leaderboard.slice(0, 5))
                    .map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between rounded-xl bg-neutral-50/80 p-3.5">
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? "default" : "secondary"} className="rounded-lg">#{user.rank}</Badge>
                        <div>
                          <h4 className="text-sm font-semibold text-neutral-800">{user.name}</h4>
                          <p className="text-[12px] text-neutral-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-600">{formatCount(user.totalPoints)} pts</p>
                        <p className="text-[12px] text-neutral-400">{formatCount(user.periodPoints)} this period</p>
                      </div>
                    </div>
                  ))}
                </div>
                {bountiesLeaderboard.leaderboard.length > 5 && (
                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <Button variant="ghost" onClick={() => setIsLeaderboardExpanded(!isLeaderboardExpanded)}
                      className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 rounded-xl">
                      {isLeaderboardExpanded
                        ? <><ChevronUp className="h-4 w-4" /> Show Less</>
                        : <><ChevronDown className="h-4 w-4" /> Show All ({bountiesLeaderboard.leaderboard.length} users)</>}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* City Performance */}
      <AdminCityPerformanceCards period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminWeeklyChart cityId={cityId} metric={selectedMetric}
          title={selectedCity ? `${selectedCity} - Weekly ${selectedMetric}` : `Weekly ${selectedMetric}`} />
        <AdminSalesByStore cityId={cityId} period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange} />
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminTopMerchants period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange} />
        <AdminTopCities period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange} />
        <AdminTopCategories period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange} cityId={cityId} />
      </div>
    </div>
  );
};
