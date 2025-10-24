import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  MapPin,
  Activity,
  Target,
  Building2,
  UserCheck,
  Zap,
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  useAdminPerformanceOverview,
  useAdminPerformanceCities,
  useAdminWeeklyChart,
  useAdminSalesByStore,
  useAdminTopMerchants,
  useAdminTopCities,
  useAdminTopCategories,
  useAdminCustomerOverview,
  useAdminCustomers,
  useAdminCustomerAnalytics,
  useAdminTapInsOverview,
  useAdminTapInsGeographic,
  useAdminBountiesOverview,
  useAdminBountiesLeaderboard
} from '@/hooks/useAdminAdvancedAnalytics';
import { AdminCityPerformanceCards } from '@/components/admin/AdminCityPerformanceCards';

export const AdminAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');
  const [isBountiesExpanded, setIsBountiesExpanded] = useState(false);

  // Fetch data
  const { data: performanceOverview, isLoading: isLoadingOverview } = useAdminPerformanceOverview({
    period: selectedPeriod
  });

  const { data: performanceCities, isLoading: isLoadingCities } = useAdminPerformanceCities({
    period: selectedPeriod,
    limit: 20
  });

  const { data: weeklyChart } = useAdminWeeklyChart({
    period: 'last_12_weeks'
  });

  const { data: salesByStore, isLoading: isLoadingSalesByStore } = useAdminSalesByStore({
    period: selectedPeriod,
    limit: 20
  });

  const { data: topMerchants, isLoading: isLoadingTopMerchants } = useAdminTopMerchants({
    period: selectedPeriod,
    limit: 20
  });

  const { data: topCities, isLoading: isLoadingTopCities } = useAdminTopCities({
    period: selectedPeriod,
    limit: 20
  });

  const { data: topCategories, isLoading: isLoadingCategories } = useAdminTopCategories({
    period: selectedPeriod,
    limit: 20
  });

  const { data: customerOverview, isLoading: isLoadingCustomerOverview } = useAdminCustomerOverview({
    period: selectedPeriod
  });

  const { data: customers, isLoading: isLoadingCustomers } = useAdminCustomers({
    period: selectedPeriod,
    limit: 50
  });

  const { data: customerAnalytics, isLoading: isLoadingCustomerAnalytics } = useAdminCustomerAnalytics({
    period: selectedPeriod
  });

  const { data: tapInsOverview, isLoading: isLoadingTapIns } = useAdminTapInsOverview({
    period: selectedPeriod
  });

  const { data: tapInsGeographic, isLoading: isLoadingTapInsGeo } = useAdminTapInsGeographic({
    period: selectedPeriod,
    limit: 20
  });

  const { data: bountiesOverview, isLoading: isLoadingBounties } = useAdminBountiesOverview({
    period: selectedPeriod
  });

  const { data: bountiesLeaderboard, isLoading: isLoadingBountiesLeaderboard } = useAdminBountiesLeaderboard({
    period: selectedPeriod,
    limit: 20
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <span className="text-gray-400">—</span>;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="merchants">Merchants</TabsTrigger>
            <TabsTrigger value="tapins">Tap-ins</TabsTrigger>
            <TabsTrigger value="bounties">Bounties</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {isLoadingOverview ? (
              <div className="text-center py-12">Loading overview...</div>
            ) : (
              <>

                {/* Top Performers */}
                {performanceOverview?.overview && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-500" />
                          Top City
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <h3 className="text-xl font-bold">{performanceOverview.overview.topPerformingCity.name}</h3>
                          <p className="text-gray-600">{formatNumber(performanceOverview.overview.topPerformingCity.revenue)} revenue</p>
                          <p className="text-sm text-gray-500">{formatCount(performanceOverview.overview.topPerformingCity.transactions)} transactions</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-blue-500" />
                          Top Merchant
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <h3 className="text-xl font-bold">{performanceOverview.overview.topPerformingMerchant.name}</h3>
                          <p className="text-gray-600">{formatNumber(performanceOverview.overview.topPerformingMerchant.revenue)} revenue</p>
                          <p className="text-sm text-gray-500">{formatCount(performanceOverview.overview.topPerformingMerchant.transactions)} transactions</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          Top Category
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <h3 className="text-xl font-bold">{performanceOverview.overview.topPerformingCategory.name}</h3>
                          <p className="text-gray-600">{formatNumber(performanceOverview.overview.topPerformingCategory.revenue)} revenue</p>
                          <p className="text-sm text-gray-500">{formatCount(performanceOverview.overview.topPerformingCategory.transactions)} transactions</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Tap-ins & Bounties Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tap-ins Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Tap-ins Analytics
                      </CardTitle>
                      <CardDescription>User engagement and check-in metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTapIns ? (
                        <div className="text-center py-4">Loading tap-ins data...</div>
                      ) : tapInsOverview?.overview ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-yellow-600">{formatCount(tapInsOverview.overview.totalTapIns)}</p>
                              <p className="text-sm text-gray-600">Total Tap-ins</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{formatCount(tapInsOverview.overview.uniqueUsers)}</p>
                              <p className="text-sm text-gray-600">Unique Users</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-sm text-gray-500 text-center">
                              {formatCount(tapInsOverview.overview.totalMerchants)} merchants across {formatCount(tapInsOverview.overview.totalCities)} cities
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">No tap-ins data available</div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Bounties Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-red-500" />
                        Bounty Analytics
                      </CardTitle>
                      <CardDescription>Reward system and bounty metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingBounties ? (
                        <div className="text-center py-4">Loading bounties data...</div>
                      ) : bountiesOverview?.overview ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-red-600">{formatCount(bountiesOverview.overview.totalBounties)}</p>
                              <p className="text-sm text-gray-600">Total Bounties</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{formatNumber(bountiesOverview.overview.totalBountyValue)}</p>
                              <p className="text-sm text-gray-600">Total Value</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-sm text-gray-500 text-center">
                              {formatCount(bountiesOverview.overview.totalBountyClaims)} claims by {formatCount(bountiesOverview.overview.totalBountyWinners)} winners
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">No bounties data available</div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Cities with Merchant Stores */}
                <AdminCityPerformanceCards period="7d" />
              </>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Quick Navigation to Detailed Analytics */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Detailed Analytics Available</h3>
                  <p className="text-sm text-blue-700">Click on the tabs above to view comprehensive Tap-ins and Bounties analytics</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('tapins')}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    View Tap-ins
                  </button>
                  <button
                    onClick={() => setActiveTab('bounties')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trophy className="h-4 w-4" />
                    View Bounties
                  </button>
                </div>
              </div>
            </div>

            {/* Tap-ins & Bounties Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tap-ins Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Tap-ins Analytics
                  </CardTitle>
                  <CardDescription>User engagement and check-in metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTapIns ? (
                    <div className="text-center py-4">Loading tap-ins data...</div>
                  ) : tapInsOverview?.overview ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-600">{formatCount(tapInsOverview.overview.totalTapIns)}</p>
                          <p className="text-sm text-gray-600">Total Tap-ins</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{formatCount(tapInsOverview.overview.uniqueUsers)}</p>
                          <p className="text-sm text-gray-600">Unique Users</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-500 text-center">
                          {formatCount(tapInsOverview.overview.totalMerchants)} merchants across {formatCount(tapInsOverview.overview.totalCities)} cities
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No tap-ins data available</div>
                  )}
                </CardContent>
              </Card>

              {/* Bounties Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-red-500" />
                    Bounty Analytics
                  </CardTitle>
                  <CardDescription>Reward system and bounty metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBounties ? (
                    <div className="text-center py-4">Loading bounties data...</div>
                  ) : bountiesOverview?.overview ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{formatCount(bountiesOverview.overview.totalBounties)}</p>
                          <p className="text-sm text-gray-600">Total Bounties</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{formatNumber(bountiesOverview.overview.totalBountyValue)}</p>
                          <p className="text-sm text-gray-600">Total Value</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm text-gray-500 text-center">
                          {formatCount(bountiesOverview.overview.totalBountyClaims)} claims by {formatCount(bountiesOverview.overview.totalBountyWinners)} winners
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No bounties data available</div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Cities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    Top Cities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTopCities ? (
                    <div className="text-center py-8">Loading cities...</div>
                  ) : (
                    <div className="space-y-3">
                      {topCities?.cities?.slice(0, 10).map((city, index) => (
                        <div key={city.city.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                            <div>
                              <h4 className="font-semibold">{city.city.name}</h4>
                              <p className="text-sm text-gray-600">{city.city.state}, {city.city.country}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatNumber(city.totalRevenue)}</p>
                            <p className="text-sm text-gray-600">{formatCount(city.totalTransactions)} txns</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Merchants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    Top Merchants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTopMerchants ? (
                    <div className="text-center py-8">Loading merchants...</div>
                  ) : (
                    <div className="space-y-3">
                      {topMerchants?.merchants?.slice(0, 10).map((merchant, index) => (
                        <div key={merchant.merchant.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                            <div>
                              <h4 className="font-semibold">{merchant.merchant.name}</h4>
                              <p className="text-sm text-gray-600">{merchant.merchant.city.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatNumber(merchant.totalRevenue)}</p>
                            <p className="text-sm text-gray-600">{formatCount(merchant.totalTransactions)} txns</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCategories ? (
                  <div className="text-center py-8">Loading categories...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topCategories?.categories?.map((category) => (
                      <div key={category.category.id} className="p-4 rounded-lg border bg-white">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{category.category.icon}</span>
                          <div>
                            <h4 className="font-semibold">{category.category.name}</h4>
                            <p className="text-sm text-gray-600">{formatCount(category.totalActiveMerchants)} merchants</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Revenue:</span>
                            <span className="font-semibold">{formatNumber(category.totalRevenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Transactions:</span>
                            <span className="font-semibold">{formatCount(category.totalTransactions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Customers:</span>
                            <span className="font-semibold">{formatCount(category.totalCustomers)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            {isLoadingCustomerOverview ? (
              <div className="text-center py-12">Loading customer data...</div>
            ) : (
              <>
                {/* Customer Overview Stats */}
                {customerOverview?.overview && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Customers</p>
                            <p className="text-2xl font-bold">{formatCount(customerOverview.overview.totalCustomers)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Active Customers</p>
                            <p className="text-2xl font-bold">{formatCount(customerOverview.overview.activeCustomers)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Avg Customer Value</p>
                            <p className="text-2xl font-bold">{formatNumber(customerOverview.overview.averageCustomerValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Retention Rate</p>
                            <p className="text-2xl font-bold">{(customerOverview.overview.customerRetentionRate * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tap-ins Stats */}
                    {tapInsOverview?.overview && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="text-sm text-gray-600">Total Tap-ins</p>
                              <p className="text-2xl font-bold">{formatCount(tapInsOverview.overview.totalTapIns)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Bounties Stats */}
                    {bountiesOverview?.overview && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                            <div>
                              <p className="text-sm text-gray-600">Total Bounties</p>
                              <p className="text-2xl font-bold">{formatCount(bountiesOverview.overview.totalBounties)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Customer List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCustomers ? (
                      <div className="text-center py-8">Loading customers...</div>
                    ) : (
                      <div className="space-y-3">
                        {customers?.customers?.slice(0, 20).map((customer) => (
                          <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div>
                              <h4 className="font-semibold">{customer.name}</h4>
                              <p className="text-sm text-gray-600">{customer.email}</p>
                              {customer.city && (
                                <p className="text-sm text-gray-500">{customer.city.name}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(customer.totalSpent)}</p>
                              <p className="text-sm text-gray-600">{formatCount(customer.kickbackEvents)} kickbacks</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Merchants Tab */}
          <TabsContent value="merchants" className="space-y-6">
            {/* Merchant Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Merchants */}
              {performanceOverview?.overview && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Merchants</p>
                        <p className="text-2xl font-bold">{formatCount(performanceOverview.overview.totalActiveMerchants)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Total Revenue */}
              {performanceOverview?.overview && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold">{formatNumber(performanceOverview.overview.totalRevenue)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tap-ins Stats */}
              {tapInsOverview?.overview && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Tap-ins</p>
                        <p className="text-2xl font-bold">{formatCount(tapInsOverview.overview.totalTapIns)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bounties Stats */}
              {bountiesOverview?.overview && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Bounties</p>
                        <p className="text-2xl font-bold">{formatCount(bountiesOverview.overview.totalBounties)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  Sales by Store
                </CardTitle>
              </CardHeader>
              <CardContent>
                  {isLoadingSalesByStore ? (
                  <div className="text-center py-8">Loading sales data...</div>
                ) : (
                  <div className="space-y-3">
                    {salesByStore?.stores?.slice(0, 20).map((store, index) => (
                      <div key={store.merchant.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                          <div>
                            <h4 className="font-semibold">{store.merchant.name}</h4>
                            <p className="text-sm text-gray-600">{store.merchant.city.name}</p>
                            <p className="text-sm text-gray-500">{store.merchant.category.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatNumber(store.totalRevenue)}</p>
                          <p className="text-sm text-gray-600">{formatCount(store.totalTransactions)} txns</p>
                          <p className="text-sm text-gray-500">{formatCount(store.totalCustomers)} customers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tap-ins Tab */}
          <TabsContent value="tapins" className="space-y-6">
            {isLoadingTapIns ? (
              <div className="text-center py-12">Loading tap-ins data...</div>
            ) : (
              <>
                {/* Tap-ins Overview */}
                {tapInsOverview?.overview && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Tap-ins</p>
                            <p className="text-2xl font-bold">{formatCount(tapInsOverview.overview.totalTapIns)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Unique Users</p>
                            <p className="text-2xl font-bold">{formatCount(tapInsOverview.overview.uniqueUsers)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Merchants</p>
                            <p className="text-2xl font-bold">{formatCount(tapInsOverview.overview.totalMerchants)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Cities</p>
                            <p className="text-2xl font-bold">{formatCount(tapInsOverview.overview.totalCities)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Geographic Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-500" />
                      Geographic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTapInsGeo ? (
                      <div className="text-center py-8">Loading geographic data...</div>
                    ) : (
                      <div className="space-y-3">
                        {tapInsGeographic?.geographic?.slice(0, 20).map((geo, index) => (
                          <div key={geo.city.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                              <div>
                                <h4 className="font-semibold">{geo.city.name}</h4>
                                <p className="text-sm text-gray-600">{geo.city.state}, {geo.city.country}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCount(geo.tapIns)}</p>
                              <p className="text-sm text-gray-600">{formatCount(geo.uniqueUsers)} users</p>
                              <p className="text-sm text-gray-500">{formatCount(geo.merchants)} merchants</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Bounties Tab */}
          <TabsContent value="bounties" className="space-y-6">
            {isLoadingBounties ? (
              <div className="text-center py-12">Loading bounties data...</div>
            ) : (
              <>
                {/* Bounties Overview */}
                {bountiesOverview?.overview && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Bounties</p>
                            <p className="text-2xl font-bold">{formatCount(bountiesOverview.overview.totalBounties)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Value</p>
                            <p className="text-2xl font-bold">{formatNumber(bountiesOverview.overview.totalBountyValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Claims</p>
                            <p className="text-2xl font-bold">{formatCount(bountiesOverview.overview.totalBountyClaims)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Winners</p>
                            <p className="text-2xl font-bold">{formatCount(bountiesOverview.overview.totalBountyWinners)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Bounties Leaderboard */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Bounties Leaderboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBountiesLeaderboard ? (
                      <div className="text-center py-8">Loading leaderboard...</div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {(isBountiesExpanded 
                            ? bountiesLeaderboard?.leaderboard 
                            : bountiesLeaderboard?.leaderboard?.slice(0, 5)
                          )?.map((user, index) => (
                            <div key={user.user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                                <div>
                                  <h4 className="font-semibold">{user.user.name}</h4>
                                  <p className="text-sm text-gray-600">{formatCount(user.totalBounties)} bounties</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatNumber(user.totalBountyValue)}</p>
                                <p className="text-sm text-gray-600">{formatCount(user.totalBountyClaims)} claims</p>
                                <p className="text-sm text-gray-500">{formatCount(user.totalBountyWinners)} wins</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {bountiesLeaderboard?.leaderboard && bountiesLeaderboard.leaderboard.length > 5 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Button
                              variant="ghost"
                              onClick={() => setIsBountiesExpanded(!isBountiesExpanded)}
                              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                            >
                              {isBountiesExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  Show All ({bountiesLeaderboard.leaderboard.length} users)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
