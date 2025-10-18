// web/src/pages/admin/AdminOverviewPage.tsx
import { useState } from 'react';
import { Calendar, Filter, MapPin, Zap, Trophy, TrendingUp, TrendingDown, Users, Target, Award, BarChart3 } from 'lucide-react';
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

export const AdminOverviewPage = () => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'checkins' | 'saves' | 'sales'>('checkins');

  // Fetch active cities from the backend
  const { data: citiesData, isLoading: citiesLoading } = useAdminCities({ 
    active: true, 
    limit: 100 // Get all active cities
  });

  const activeCities = citiesData?.cities || [];

  // Convert city name to city ID using the fetched cities data
  const getCityId = (cityName: string) => {
    const city = activeCities.find(c => c.name === cityName);
    return city?.id || undefined;
  };

  const cityId = selectedCity ? getCityId(selectedCity) : undefined;

  // Fetch tap-ins and bounties data
  const { data: tapInsOverview, isLoading: isLoadingTapIns } = useAdminTapInsOverview({
    period: selectedTimeRange === '1d' ? 'last_24_hours' : 
            selectedTimeRange === '7d' ? 'last_7_days' :
            selectedTimeRange === '30d' ? 'last_30_days' : 'last_90_days',
    cityId: cityId
  });

  const { data: bountiesOverview, isLoading: isLoadingBounties } = useAdminBountiesOverview({
    period: selectedTimeRange === '1d' ? 'last_24_hours' : 
            selectedTimeRange === '7d' ? 'last_7_days' :
            selectedTimeRange === '30d' ? 'last_30_days' : 'last_90_days',
    cityId: cityId
  });

  // Fetch additional analytics data
  const { data: tapInsGeographic } = useAdminTapInsGeographic({
    period: selectedTimeRange === '1d' ? 'last_24_hours' : 
            selectedTimeRange === '7d' ? 'last_7_days' :
            selectedTimeRange === '30d' ? 'last_30_days' : 'last_90_days',
    limit: 10
  });

  const { data: bountiesLeaderboard } = useAdminBountiesLeaderboard({
    period: 'current',
    limit: 10
  });

  // Helper functions
  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };


  const formatDistance = (meters: number) => {
    const miles = meters * 0.000621371;
    return `${miles.toFixed(1)} mi`;
  };

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Performance Analytics</h1>
          <p className="text-neutral-600 mt-1">A comprehensive view of platform's performance metrics.</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <MapPin className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
              disabled={citiesLoading}
            >
              <option value="">All Cities</option>
              {citiesLoading ? (
                <option value="" disabled>Loading cities...</option>
              ) : (
                activeCities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}, {city.state}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Calendar className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedTimeRange} 
              onChange={(e) => setSelectedTimeRange(e.target.value as '1d' | '7d' | '30d' | '90d')}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-3 py-2">
            <Filter className="h-4 w-4 text-neutral-500" />
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value as 'checkins' | 'saves' | 'sales')}
              className="text-sm font-medium text-neutral-700 bg-transparent border-none outline-none"
            >
              <option value="checkins">Check-ins</option>
              <option value="saves">Saves</option>
              <option value="sales">Sales</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Key Metric Stat Cards --- */}
      <AdminPerformanceStatsCards 
        period={selectedTimeRange}
        cityId={cityId}
      />

      {/* --- Enhanced Tap-ins & Bounties Analytics --- */}
      <div className="space-y-6">
        {/* Tap-ins Analytics Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500" />
            Tap-ins Analytics
          </h2>
          
          {/* Tap-ins Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingTapIns ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : tapInsOverview?.metrics ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tap-ins</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {formatCount(tapInsOverview.metrics.totalTapIns.value)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(tapInsOverview.metrics.totalTapIns.trend)}
                          <span className={`text-sm ${getTrendColor(tapInsOverview.metrics.totalTapIns.trend)}`}>
                            {tapInsOverview.metrics.totalTapIns.change > 0 ? '+' : ''}{tapInsOverview.metrics.totalTapIns.change}%
                          </span>
                        </div>
                      </div>
                      <Zap className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Unique Users</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCount(tapInsOverview.metrics.uniqueUsers.value)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(tapInsOverview.metrics.uniqueUsers.trend)}
                          <span className={`text-sm ${getTrendColor(tapInsOverview.metrics.uniqueUsers.trend)}`}>
                            {tapInsOverview.metrics.uniqueUsers.change > 0 ? '+' : ''}{tapInsOverview.metrics.uniqueUsers.change}%
                          </span>
                        </div>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Distance</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatDistance(tapInsOverview.metrics.averageDistance.value)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(tapInsOverview.metrics.averageDistance.trend)}
                          <span className={`text-sm ${getTrendColor(tapInsOverview.metrics.averageDistance.trend)}`}>
                            {tapInsOverview.metrics.averageDistance.change > 0 ? '+' : ''}{tapInsOverview.metrics.averageDistance.change}%
                          </span>
                        </div>
                      </div>
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top Merchant</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCount(tapInsOverview.metrics.topMerchant.value)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(tapInsOverview.metrics.topMerchant.trend)}
                          <span className={`text-sm ${getTrendColor(tapInsOverview.metrics.topMerchant.trend)}`}>
                            {tapInsOverview.metrics.topMerchant.change > 0 ? '+' : ''}{tapInsOverview.metrics.topMerchant.change}%
                          </span>
                        </div>
                      </div>
                      <Award className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No tap-ins data available
              </div>
            )}
          </div>

          {/* Geographic Distribution */}
          {tapInsGeographic?.geographic && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Tap-ins by city and distance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Cities */}
                  <div>
                    <h4 className="font-semibold mb-3">Top Cities</h4>
                    <div className="space-y-2">
                      {tapInsGeographic.geographic.cityDistribution.slice(0, 5).map((city, index) => (
                        <div key={city.city.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">#{index + 1}</Badge>
                            <span className="font-medium">{city.city.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCount(city.tapIns)}</p>
                            <p className="text-xs text-gray-500">{formatCount(city.uniqueUsers)} users</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distance Analysis */}
                  <div>
                    <h4 className="font-semibold mb-3">Distance Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                        <span className="text-sm font-medium">Average Distance</span>
                        <span className="font-bold text-blue-600">
                          {formatDistance(tapInsGeographic.geographic.distanceAnalysis.average)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                        <span className="text-sm font-medium">Median Distance</span>
                        <span className="font-bold text-green-600">
                          {formatDistance(tapInsGeographic.geographic.distanceAnalysis.median)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-purple-50">
                        <span className="text-sm font-medium">Max Distance</span>
                        <span className="font-bold text-purple-600">
                          {formatDistance(tapInsGeographic.geographic.distanceAnalysis.max)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bounties Analytics Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-red-500" />
            Bounty Analytics
          </h2>
          
          {/* Bounties Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoadingBounties ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : bountiesOverview?.metrics ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Participants</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCount(bountiesOverview.metrics.totalParticipants.value)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(bountiesOverview.metrics.totalParticipants.trend)}
                          <span className={`text-sm ${getTrendColor(bountiesOverview.metrics.totalParticipants.trend)}`}>
                            {bountiesOverview.metrics.totalParticipants.change > 0 ? '+' : ''}{bountiesOverview.metrics.totalParticipants.change}%
                          </span>
                        </div>
                      </div>
                      <Users className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Points Awarded</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCount(bountiesOverview.metrics.totalPointsAwarded.value)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(bountiesOverview.metrics.totalPointsAwarded.trend)}
                          <span className={`text-sm ${getTrendColor(bountiesOverview.metrics.totalPointsAwarded.trend)}`}>
                            {bountiesOverview.metrics.totalPointsAwarded.change > 0 ? '+' : ''}{bountiesOverview.metrics.totalPointsAwarded.change}%
                          </span>
                        </div>
                      </div>
                      <Award className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Points/User</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {bountiesOverview.metrics.averagePointsPerUser.value.toFixed(1)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(bountiesOverview.metrics.averagePointsPerUser.trend)}
                          <span className={`text-sm ${getTrendColor(bountiesOverview.metrics.averagePointsPerUser.trend)}`}>
                            {bountiesOverview.metrics.averagePointsPerUser.change > 0 ? '+' : ''}{bountiesOverview.metrics.averagePointsPerUser.change}%
                          </span>
                        </div>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Top Performer</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCount(bountiesOverview.metrics.topPerformerPoints.value)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getTrendIcon(bountiesOverview.metrics.topPerformerPoints.trend)}
                          <span className={`text-sm ${getTrendColor(bountiesOverview.metrics.topPerformerPoints.trend)}`}>
                            {bountiesOverview.metrics.topPerformerPoints.change > 0 ? '+' : ''}{bountiesOverview.metrics.topPerformerPoints.change}%
                          </span>
                        </div>
                      </div>
                      <Trophy className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No bounties data available
              </div>
            )}
          </div>

          {/* Bounty Leaderboard */}
          {bountiesLeaderboard?.leaderboard && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Current Leaderboard
                </CardTitle>
                <CardDescription>Top performers in the current period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bountiesLeaderboard.leaderboard.slice(0, 10).map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{user.rank}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-600">{formatCount(user.totalPoints)} pts</p>
                        <p className="text-sm text-gray-500">{formatCount(user.periodPoints)} this period</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- City Performance Section --- */}
      <AdminCityPerformanceCards period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange} />

      {/* --- Sales Performance and Store Analytics --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminWeeklyChart 
          cityId={cityId}
          metric={selectedMetric}
          title={selectedCity ? `${selectedCity} - Weekly ${selectedMetric}` : `Weekly ${selectedMetric}`}
        />
        <AdminSalesByStore 
          cityId={cityId}
          period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange}
        />
      </div>

      {/* --- Leaderboards Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdminTopMerchants 
          period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange}
        />
        <AdminTopCities 
          period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange}
        />
        <AdminTopCategories 
          period={selectedTimeRange === '90d' ? '30d' : selectedTimeRange}
          cityId={cityId}
        />
      </div>
    </div>
  );
};
