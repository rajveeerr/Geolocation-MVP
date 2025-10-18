import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  MapPin, 
  TrendingUp, 
  Users, 
  Star, 
  Award,
  BarChart3
} from 'lucide-react';
import { 
  useGlobalLeaderboard,
  useCityComparisonLeaderboard,
  useLeaderboardAnalytics,
  useLeaderboardInsights
} from '@/hooks/useLeaderboard';
import { useActiveCities } from '@/hooks/useActiveCities';
import { motion } from 'framer-motion';

export const EnhancedLeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [selectedCity, setSelectedCity] = useState<number | undefined>();

  // Fetch data
  const { data: globalLeaderboard, isLoading: isLoadingGlobal } = useGlobalLeaderboard({
    period: selectedPeriod,
    limit: 50,
    includeSelf: true,
    includeStats: true
  });

  const { data: cityComparison, isLoading: isLoadingCities } = useCityComparisonLeaderboard({
    period: selectedPeriod,
    limit: 20
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useLeaderboardAnalytics({
    period: selectedPeriod
  });

  const { data: insights, isLoading: isLoadingInsights } = useLeaderboardInsights({
    period: selectedPeriod
  });

  const { data: cities } = useActiveCities();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-neutral-600">#{rank}</span>;
  };


  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See who's leading the pack in your city and beyond</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 Days</SelectItem>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCity?.toString() || 'all'} onValueChange={(value) => setSelectedCity(value === 'all' ? undefined : parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities?.cities?.map((city: any) => (
                <SelectItem key={city.id} value={city.id.toString()}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="cities">Cities</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="global" className="space-y-6">
            {isLoadingGlobal ? (
              <div className="text-center py-12">Loading leaderboard...</div>
            ) : (
              <>
                {/* Stats Overview */}
                {globalLeaderboard?.globalStats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold">{formatNumber(globalLeaderboard.globalStats.totalUsers)}</p>
                            <p className="text-xs text-gray-500">{formatNumber(globalLeaderboard.globalStats.activeUsers)} active</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Points</p>
                            <p className="text-2xl font-bold">{formatNumber(globalLeaderboard.globalStats.totalPointsEarned)}</p>
                            <p className="text-xs text-gray-500">Avg: {formatNumber(globalLeaderboard.globalStats.avgPointsPerUser)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Check-ins</p>
                            <p className="text-2xl font-bold">{formatNumber(globalLeaderboard.globalStats.totalCheckIns)}</p>
                            <p className="text-xs text-gray-500">{formatNumber(globalLeaderboard.globalStats.uniqueDealsUsed)} unique deals</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Top Score</p>
                            <p className="text-2xl font-bold">{formatNumber(globalLeaderboard.globalStats.maxPoints)}</p>
                            <p className="text-xs text-gray-500">Min: {formatNumber(globalLeaderboard.globalStats.minPoints)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Personal Position */}
                {globalLeaderboard?.personalPosition && (
                  <Card className="mb-6 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Trophy className="h-5 w-5" />
                        Your Position
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">#{globalLeaderboard.personalPosition.rank}</p>
                            <p className="text-sm text-blue-700">Your Rank</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{formatNumber(globalLeaderboard.personalPosition.totalPoints)}</p>
                            <p className="text-sm text-blue-700">Total Points</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">{formatNumber(globalLeaderboard.personalPosition.periodPoints)}</p>
                            <p className="text-sm text-blue-700">This Period</p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-blue-700">
                          <p>{globalLeaderboard.personalPosition.checkInCount} check-ins</p>
                          <p>{globalLeaderboard.personalPosition.uniqueDealsCheckedIn} unique deals</p>
                          <p>Member since {new Date(globalLeaderboard.personalPosition.memberSince).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Leaderboard Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      Global Leaderboard
                    </CardTitle>
                    <CardDescription>
                      Top performers across all cities for {selectedPeriod.replace('_', ' ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {globalLeaderboard?.leaderboard?.map((entry, index) => (
                        <motion.div
                          key={entry.userId}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-white"
                        >
                          <div className="flex items-center gap-2">
                            {getRankIcon(entry.rank)}
                          </div>

                          <Avatar className="h-12 w-12">
                            <AvatarImage src={entry.avatarUrl || undefined} />
                            <AvatarFallback>
                              {entry.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{entry.name}</h3>
                            </div>
                            <p className="text-sm text-gray-600">{entry.email}</p>
                            <p className="text-xs text-gray-500">Member since {new Date(entry.memberSince).toLocaleDateString()}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {formatNumber(entry.totalPoints)}
                            </p>
                            <p className="text-sm text-gray-600">total points</p>
                          </div>

                          <div className="text-right text-sm text-gray-600">
                            <p>{formatNumber(entry.periodPoints)} this period</p>
                            <p>{entry.checkInCount} check-ins</p>
                            <p>{entry.uniqueDealsCheckedIn} unique deals</p>
                            <p>{entry.eventCount} events</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* City Comparison */}
          <TabsContent value="cities" className="space-y-6">
            {isLoadingCities ? (
              <div className="text-center py-12">Loading city data...</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-green-500" />
                    City Performance
                  </CardTitle>
                  <CardDescription>
                    Compare performance across different cities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cityComparison?.entries?.map((city, index) => (
                      <motion.div
                        key={city.cityId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getRankIcon(city.rank)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{city.cityName}</h3>
                            <p className="text-sm text-gray-600">
                              {city.state}, {city.country}
                            </p>
                            <p className="text-xs text-gray-500">
                              Top performer: {city.topPerformer.name} ({formatNumber(city.topPerformer.totalPoints)} pts)
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">
                            {formatNumber(city.totalPoints)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatNumber(city.totalUsers)} users
                          </p>
                        </div>

                        <div className="text-right text-sm text-gray-600">
                          <p>{formatNumber(city.totalCheckIns)} check-ins</p>
                          <p>{formatNumber(city.totalDealSaves)} saves</p>
                          <p>Avg: {Math.round(city.averagePointsPerUser)} pts/user</p>
                          <p>Avg check-ins: {Math.round(city.averageCheckInsPerUser)}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            {isLoadingAnalytics ? (
              <div className="text-center py-12">Loading analytics...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Point Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Point Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics?.analytics?.distribution?.map((dist) => (
                          <div key={dist.pointRange} className="flex items-center justify-between">
                            <span className="text-sm">{dist.pointRange} points</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${(dist.userCount / analytics.analytics.summary.totalUsers) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">
                                {dist.userCount} users
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trend Data */}
                  {analytics?.analytics?.trends && analytics.analytics.trends.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          Activity Trends
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.analytics.trends.slice(-7).map((trend) => (
                            <div key={trend.date} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                              <div>
                                <p className="font-medium">{new Date(trend.date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600">{trend.activeUsers} active users</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatNumber(trend.totalPointsEarned)} points</p>
                                <p className="text-sm text-gray-600">{trend.totalCheckIns} check-ins</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Summary Stats */}
                {analytics?.analytics?.summary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Summary Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatNumber(analytics.analytics.summary.avgPointsPerUser)}
                          </p>
                          <p className="text-sm text-gray-600">Avg Points/User</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {formatNumber(analytics.analytics.summary.maxPoints)}
                          </p>
                          <p className="text-sm text-gray-600">Max Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">
                            {formatNumber(analytics.analytics.summary.totalPointsEarned)}
                          </p>
                          <p className="text-sm text-gray-600">Total Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {formatNumber(analytics.analytics.summary.uniqueDealsUsed)}
                          </p>
                          <p className="text-sm text-gray-600">Unique Deals</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-6">
            {isLoadingInsights ? (
              <div className="text-center py-12">Loading insights...</div>
            ) : (
              <>
                {/* Engagement Segments */}
                {insights?.insights?.engagementSegments && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        User Engagement Segments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.insights.engagementSegments.map((segment) => (
                          <div key={segment.segment} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div>
                              <h4 className="font-semibold">{segment.segment}</h4>
                              <p className="text-sm text-gray-600">
                                {segment.count} users ({segment.percentage}%)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(segment.averagePoints)}</p>
                              <p className="text-sm text-gray-600">avg points</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Performers */}
                {insights?.insights?.topPerformers && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Top Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {insights.insights.topPerformers.map((performer) => (
                          <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={performer.avatarUrl || undefined} />
                                <AvatarFallback>
                                  {performer.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{performer.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {performer.uniqueMerchantsVisited} merchants, {performer.uniqueDealsCheckedIn} deals
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-yellow-600">{formatNumber(performer.periodPoints)}</p>
                              <p className="text-sm text-gray-600">points</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
