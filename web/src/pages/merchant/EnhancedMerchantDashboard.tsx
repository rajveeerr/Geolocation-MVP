import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  Building2,
  UserCheck,
  Zap,
  Star,
  Heart,
  Eye,
  Clock
} from 'lucide-react';
import { 
  useMerchantDealPerformance,
  useMerchantCustomerInsights,
  useMerchantRevenueAnalytics,
  useMerchantEngagementMetrics,
  useMerchantPerformanceComparison
} from '@/hooks/useMerchantAdvancedAnalytics';
import { MerchantTableBookingDashboard } from '@/components/table-booking/MerchantTableBookingDashboard';
import { motion } from 'framer-motion';

export const EnhancedMerchantDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('last_30_days');

  // Fetch data
  const { data: dealPerformance, isLoading: isLoadingDeals } = useMerchantDealPerformance({
    period: selectedPeriod,
    limit: 10
  });

  const { data: customerInsights, isLoading: isLoadingCustomers } = useMerchantCustomerInsights({
    period: selectedPeriod
  });

  const { data: revenueAnalytics, isLoading: isLoadingRevenue } = useMerchantRevenueAnalytics({
    period: selectedPeriod
  });

  const { data: engagementMetrics, isLoading: isLoadingEngagement } = useMerchantEngagementMetrics({
    period: selectedPeriod
  });

  const { data: performanceComparison, isLoading: isLoadingComparison } = useMerchantPerformanceComparison({
    currentPeriod: selectedPeriod,
    comparePeriod: 'previous_30_days'
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Merchant Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your business performance</p>
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="booking">Table Booking</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Performance Comparison */}
            {performanceComparison && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Performance Comparison
                  </CardTitle>
                  <CardDescription>
                    Comparing {selectedPeriod.replace('_', ' ')} vs previous period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Check-ins</span>
                        {getTrendIcon(performanceComparison.trends.checkIns)}
                      </div>
                      <p className="text-2xl font-bold">{formatCount(performanceComparison.currentMetrics.checkIns)}</p>
                      <p className={`text-sm ${getTrendColor(performanceComparison.trends.checkIns)}`}>
                        {performanceComparison.changes.checkIns > 0 ? '+' : ''}
                        {performanceComparison.changes.checkIns} vs previous
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Deal Saves</span>
                        {getTrendIcon(performanceComparison.trends.dealSaves)}
                      </div>
                      <p className="text-2xl font-bold">{formatCount(performanceComparison.currentMetrics.dealSaves)}</p>
                      <p className={`text-sm ${getTrendColor(performanceComparison.trends.dealSaves)}`}>
                        {performanceComparison.changes.dealSaves > 0 ? '+' : ''}
                        {performanceComparison.changes.dealSaves} vs previous
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Gross Sales</span>
                        {getTrendIcon(performanceComparison.trends.grossSales)}
                      </div>
                      <p className="text-2xl font-bold">{formatNumber(performanceComparison.currentMetrics.grossSales)}</p>
                      <p className={`text-sm ${getTrendColor(performanceComparison.trends.grossSales)}`}>
                        {performanceComparison.changes.grossSales > 0 ? '+' : ''}
                        {formatNumber(performanceComparison.changes.grossSales)} vs previous
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Unique Users</span>
                        {getTrendIcon(performanceComparison.trends.uniqueUsers)}
                      </div>
                      <p className="text-2xl font-bold">{formatCount(performanceComparison.currentMetrics.uniqueUsers)}</p>
                      <p className={`text-sm ${getTrendColor(performanceComparison.trends.uniqueUsers)}`}>
                        {performanceComparison.changes.uniqueUsers > 0 ? '+' : ''}
                        {performanceComparison.changes.uniqueUsers} vs previous
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Engagement Metrics */}
            {engagementMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      Engagement Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Deal Views</span>
                        <span className="font-semibold">{formatCount(engagementMetrics.funnelMetrics.totalDealViews)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Deal Saves</span>
                        <span className="font-semibold">{formatCount(engagementMetrics.funnelMetrics.totalDealSaves)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Check-ins</span>
                        <span className="font-semibold">{formatCount(engagementMetrics.funnelMetrics.totalCheckIns)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Kickback Events</span>
                        <span className="font-semibold">{formatCount(engagementMetrics.funnelMetrics.totalKickbackEvents)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Conversion Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Save Rate</span>
                        <span className="font-semibold">{(engagementMetrics.funnelMetrics.conversionRates.saveRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Check-in Rate</span>
                        <span className="font-semibold">{(engagementMetrics.funnelMetrics.conversionRates.checkInRate * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Kickback Rate</span>
                        <span className="font-semibold">{(engagementMetrics.funnelMetrics.conversionRates.kickbackRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            {isLoadingDeals ? (
              <div className="text-center py-12">Loading deal performance...</div>
            ) : (
              <>
                {/* Deal Performance Summary */}
                {dealPerformance?.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Deals</p>
                            <p className="text-2xl font-bold">{dealPerformance.summary.totalDeals}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Active Deals</p>
                            <p className="text-2xl font-bold">{dealPerformance.summary.activeDeals}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Check-ins</p>
                            <p className="text-2xl font-bold">{formatCount(dealPerformance.summary.totalCheckIns)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Saves</p>
                            <p className="text-2xl font-bold">{formatCount(dealPerformance.summary.totalSaves)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Individual Deal Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Deal Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dealPerformance?.deals?.map((deal) => (
                        <div key={deal.id} className="p-4 rounded-lg border bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-lg">{deal.title}</h4>
                              <p className="text-sm text-gray-600">{deal.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={deal.isActive ? 'default' : 'secondary'}>
                                  {deal.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant="outline">
                                  {deal.category.name}
                                </Badge>
                                <Badge variant="outline">
                                  {deal.dealType.name}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                {formatCount(deal.performance.checkIns)}
                              </p>
                              <p className="text-sm text-gray-600">check-ins</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <p className="text-lg font-semibold">{formatCount(deal.performance.saves)}</p>
                              <p className="text-sm text-gray-600">Saves</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold">{formatCount(deal.performance.kickbackEvents)}</p>
                              <p className="text-sm text-gray-600">Kickbacks</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold">{formatCount(deal.performance.uniqueUsers)}</p>
                              <p className="text-sm text-gray-600">Unique Users</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold">{formatCount(deal.performance.returningUsers)}</p>
                              <p className="text-sm text-gray-600">Returning</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Save to Check-in Rate</p>
                                <p className="font-semibold">
                                  {(deal.performance.conversionRates.saveToCheckIn * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Check-in to Kickback Rate</p>
                                <p className="font-semibold">
                                  {(deal.performance.conversionRates.checkInToKickback * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            {isLoadingCustomers ? (
              <div className="text-center py-12">Loading customer insights...</div>
            ) : (
              <>
                {/* Customer Overview */}
                {customerInsights?.customerOverview && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Customers</p>
                            <p className="text-2xl font-bold">{formatCount(customerInsights.customerOverview.totalCustomers)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">New Customers</p>
                            <p className="text-2xl font-bold">{formatCount(customerInsights.customerOverview.newCustomers)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Retention Rate</p>
                            <p className="text-2xl font-bold">{(customerInsights.customerOverview.customerRetentionRate * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Avg Customer Value</p>
                            <p className="text-2xl font-bold">{formatNumber(customerInsights.customerOverview.averageCustomerValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Activity Levels */}
                {customerInsights?.activityLevels && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-500" />
                        Customer Activity Levels
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-green-50">
                          <p className="text-2xl font-bold text-green-600">{formatCount(customerInsights.activityLevels.high)}</p>
                          <p className="text-sm text-gray-600">High Activity</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-yellow-50">
                          <p className="text-2xl font-bold text-yellow-600">{formatCount(customerInsights.activityLevels.medium)}</p>
                          <p className="text-sm text-gray-600">Medium Activity</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-red-50">
                          <p className="text-2xl font-bold text-red-600">{formatCount(customerInsights.activityLevels.low)}</p>
                          <p className="text-sm text-gray-600">Low Activity</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Customers */}
                {customerInsights?.customerValue?.topCustomers && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Top Customers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {customerInsights.customerValue.topCustomers.slice(0, 10).map((customer, index) => (
                          <div key={customer.user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                              <div>
                                <h4 className="font-semibold">{customer.user.name}</h4>
                                <p className="text-sm text-gray-600">{formatCount(customer.kickbackEvents)} kickbacks</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(customer.totalSpent)}</p>
                              <p className="text-sm text-gray-600">spent</p>
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

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            {isLoadingRevenue ? (
              <div className="text-center py-12">Loading revenue analytics...</div>
            ) : (
              <>
                {/* Revenue Summary */}
                {revenueAnalytics?.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatNumber(revenueAnalytics.summary.totalRevenue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-600">Kickback Paid</p>
                            <p className="text-2xl font-bold">{formatNumber(revenueAnalytics.summary.totalKickbackPaid)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-600">Total Transactions</p>
                            <p className="text-2xl font-bold">{formatCount(revenueAnalytics.summary.totalTransactions)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-orange-500" />
                          <div>
                            <p className="text-sm text-gray-600">Avg Transaction</p>
                            <p className="text-2xl font-bold">{formatNumber(revenueAnalytics.summary.averageTransactionValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Revenue by Category */}
                {revenueAnalytics?.revenueByCategory && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-green-500" />
                        Revenue by Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {revenueAnalytics.revenueByCategory.map((category) => (
                          <div key={category.category.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{category.category.icon}</span>
                              <div>
                                <h4 className="font-semibold">{category.category.name}</h4>
                                <p className="text-sm text-gray-600">{formatCount(category.transactions)} transactions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(category.revenue)}</p>
                              <p className="text-sm text-gray-600">{formatNumber(category.kickbackPaid)} kickback</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top Deals by Revenue */}
                {revenueAnalytics?.topDeals && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Top Deals by Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {revenueAnalytics.topDeals.slice(0, 10).map((deal, index) => (
                          <div key={deal.deal.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                              <div>
                                <h4 className="font-semibold">{deal.deal.title}</h4>
                                <p className="text-sm text-gray-600">{deal.deal.category.name} • {deal.deal.dealType.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatNumber(deal.revenue)}</p>
                              <p className="text-sm text-gray-600">{formatCount(deal.uniqueCustomers)} customers</p>
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

          {/* Table Booking Tab */}
          <TabsContent value="booking" className="space-y-6">
            <MerchantTableBookingDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
