import { useState } from 'react';
import { 
  Crown, 
  Medal, 
  Award, 
  MapPin, 
  Users, 
  TrendingUp, 
  BarChart3,
  ChevronDown,
  Target,
  Star
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';
import { 
  useGlobalLeaderboardBasic,
  useCityLeaderboardBasic,
  useCategoriesLeaderboard,
  useLeaderboardInsightsBasic
} from '@/hooks/useLeaderboard';
import { useActiveCities } from '@/hooks/useActiveCities';
import { motion, AnimatePresence } from 'framer-motion';

const PERIOD_OPTIONS = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_year', label: 'This Year' },
  { value: 'all_time', label: 'All Time' },
];

export const ComprehensiveLeaderboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [selectedCity, setSelectedCity] = useState<number | undefined>();
  const { data: cities } = useActiveCities();

  return (
    <div className="bg-gradient-to-br from-brand-primary-50 via-blue-50 to-brand-primary-100 min-h-screen pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-1/4 w-16 h-16 bg-yellow-300 rounded-full opacity-20 blur-2xl animate-pulse" />
          <div className="absolute top-0 right-1/4 w-20 h-20 bg-brand-primary-300 rounded-full opacity-20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-10 w-10 text-yellow-500 fill-yellow-400 animate-bounce" />
              <h1 className="text-5xl font-bold text-brand-primary-700">
                Leaderboards
              </h1>
              <Trophy className="h-10 w-10 text-yellow-500 fill-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              Track top performers, explore city rankings, and see activity breakdowns
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-6">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="global">
              <Trophy className="h-4 w-4 mr-2" />
              Global
            </TabsTrigger>
            <TabsTrigger value="city">
              <MapPin className="h-4 w-4 mr-2" />
              City
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Target className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="insights">
              <BarChart3 className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Global Tab */}
          <TabsContent value="global">
            <GlobalLeaderboardTab period={selectedPeriod} />
          </TabsContent>

          {/* City Tab */}
          <TabsContent value="city">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <Select 
                  value={selectedCity?.toString()} 
                  onValueChange={(value) => setSelectedCity(Number(value))}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCity && (
                <CityLeaderboardTab cityId={selectedCity} period={selectedPeriod} />
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoriesLeaderboardTab period={selectedPeriod} />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <InsightsTab period={selectedPeriod} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Trophy icon component
const Trophy = ({ className }: { className?: string }) => (
  <Crown className={className} />
);

// Global Leaderboard Tab
const GlobalLeaderboardTab = ({ period }: { period: string }) => {
  const { data, isLoading } = useGlobalLeaderboardBasic({
    period,
    showMore: true,
    includeStats: true,
    includeBreakdown: true,
    limit: 10,
  });

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stats Cards */}
      {data?.pagination && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Total Users"
            value={data.pagination.currentLimit}
            icon={<Users className="h-5 w-5" />}
          />
          <StatsCard
            title="Showing"
            value={`${data.top.length} Users`}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatsCard
            title="Has More"
            value={data.pagination.hasMore ? 'Yes' : 'No'}
            icon={<BarChart3 className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Users with the highest points in this period</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaderboardList 
            users={data?.top || []} 
            pointBreakdowns={data?.pointBreakdowns}
            currentUserId={data?.me?.userId}
          />
        </CardContent>
      </Card>

      {/* Current User Position */}
      {data?.me && !data.me.inTop && (
        <Card className="border-brand-primary-200 bg-brand-primary-50">
          <CardHeader>
            <CardTitle className="text-lg">Your Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-brand-primary-600">
                  #{data.me.rank}
                </div>
                <div>
                  <p className="font-semibold">You</p>
                  <p className="text-sm text-neutral-600">
                    {(data.me.points || data.me.periodPoints || 0).toLocaleString()} points
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// City Leaderboard Tab
const CityLeaderboardTab = ({ cityId, period }: { cityId: number; period: string }) => {
  const { data, isLoading } = useCityLeaderboardBasic(cityId, {
    period,
    showMore: true,
    includeBreakdown: true,
    limit: 10,
  });

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>City Leaderboard</CardTitle>
        <CardDescription>Top performers in this city</CardDescription>
      </CardHeader>
      <CardContent>
        <LeaderboardList 
          users={data?.top || []} 
          pointBreakdowns={data?.pointBreakdowns}
          currentUserId={data?.me?.userId}
        />
      </CardContent>
    </Card>
  );
};

// Categories Leaderboard Tab
const CategoriesLeaderboardTab = ({ period }: { period: string }) => {
  const { data, isLoading } = useCategoriesLeaderboard({
    period,
    showMore: true,
    includeBreakdown: true,
    limit: 5,
  });

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {data?.categories && data.categories.length > 0 ? (
        data.categories.map((category) => (
          <Card key={category.categoryId}>
            <CardHeader>
              <CardTitle>{category.categoryName}</CardTitle>
              <CardDescription>Top performers in this category</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardList 
                users={category.top} 
                pointBreakdowns={category.pointBreakdowns}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Categories</CardTitle>
            <CardDescription>Overall top performers</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaderboardList 
              users={data?.top || []} 
              pointBreakdowns={data?.pointBreakdowns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Insights Tab
const InsightsTab = ({ period }: { period: string }) => {
  const { data, isLoading } = useLeaderboardInsightsBasic({
    period,
    includeBreakdown: true,
  });

  if (isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">No insights available for this period</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Growth */}
      {data.topGrowth && data.topGrowth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Fastest Growing Users
            </CardTitle>
            <CardDescription>Users with the highest point growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topGrowth.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-500">#{index + 1}</span>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-neutral-600">
                        +{user.pointsGained} points ({user.percentageChange.toFixed(1)}% growth)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Engagement */}
      {data.topEngagement && data.topEngagement.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Most Engaged Users
            </CardTitle>
            <CardDescription>Users with the highest engagement scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topEngagement.map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-500">#{index + 1}</span>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-neutral-600">
                        {user.checkIns} check-ins • Score: {user.engagementScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Leaderboard List Component
interface LeaderboardListProps {
  users: any[];
  pointBreakdowns?: Record<string, any[]>;
  currentUserId?: number;
}

const LeaderboardList = ({ users, pointBreakdowns, currentUserId }: LeaderboardListProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return (
      <div className="relative flex items-center justify-center">
        <Crown className="h-7 w-7 text-yellow-400 fill-yellow-400 drop-shadow-lg animate-pulse" />
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-sm" />
      </div>
    );
    if (rank === 2) return (
      <div className="relative flex items-center justify-center">
        <Medal className="h-6 w-6 text-gray-400 fill-gray-400 drop-shadow-md" />
        <div className="absolute inset-0 bg-gray-400/10 rounded-full blur-sm" />
      </div>
    );
    if (rank === 3) return (
      <div className="relative flex items-center justify-center">
        <Award className="h-6 w-6 text-amber-600 fill-amber-600 drop-shadow-md" />
        <div className="absolute inset-0 bg-amber-600/10 rounded-full blur-sm" />
      </div>
    );
    return (
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 border-2 border-neutral-300">
        <span className="font-bold text-xs text-neutral-600">#{rank}</span>
      </div>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
      case 'CHECKIN':
        return <MapPin className="h-4 w-4 text-blue-500" />;
      case 'REFERRAL':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'DEAL_SAVE':
        return <Award className="h-4 w-4 text-yellow-500" />;
      default:
        return <Star className="h-4 w-4 text-purple-500" />;
    }
  };

  if (users.length === 0) {
    return (
      <p className="text-center text-neutral-500 py-8">
        No users in this leaderboard yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const isCurrentUser = currentUserId === user.userId;
        const userBreakdown = pointBreakdowns?.[user.userId.toString()];
        const isExpanded = expandedId === user.userId;
        const points = user.points || user.periodPoints || 0;

        return (
          <div
            key={user.userId}
            className={cn(
              'rounded-lg border-2 transition-all hover:shadow-xl',
              isCurrentUser 
                ? 'bg-gradient-to-br from-brand-primary-50 to-brand-primary-100 border-brand-primary-300 ring-2 ring-brand-primary-400 shadow-lg' 
                : 'bg-white border-neutral-200 hover:border-brand-primary-200',
              user.rank === 1 && 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-xl shadow-yellow-200/50',
              user.rank === 2 && 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300 shadow-lg shadow-gray-200/50',
              user.rank === 3 && 'bg-gradient-to-br from-orange-50 to-amber-50 border-amber-400 shadow-lg shadow-amber-200/50',
              user.rank <= 3 && 'border-2'
            )}
          >
            {/* Main Row */}
            <div className="flex items-center p-3 relative">
              {/* Decorative corner for rank 1 */}
              {user.rank === 1 && (
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden">
                  <div className="absolute top-1 right-1 w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full opacity-20 blur-md" />
                </div>
              )}
              
              <div className="flex-shrink-0 w-10 flex items-center justify-center">
                {getRankIcon(user.rank)}
              </div>
              
              <Avatar className={cn(
                "ml-3 h-10 w-10 ring-2",
                user.rank === 1 && "ring-yellow-400 shadow-lg shadow-yellow-200",
                user.rank === 2 && "ring-gray-400 shadow-md shadow-gray-200",
                user.rank === 3 && "ring-amber-500 shadow-md shadow-amber-200",
                user.rank > 3 && "ring-neutral-200"
              )}>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className={cn(
                  user.rank === 1 && "bg-yellow-100 text-yellow-700",
                  user.rank === 2 && "bg-gray-100 text-gray-700",
                  user.rank === 3 && "bg-amber-100 text-amber-700"
                )}>{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="ml-3 flex-grow">
                <p className={cn(
                  "font-semibold flex items-center gap-2",
                  user.rank === 1 && "text-yellow-900",
                  user.rank === 2 && "text-gray-800",
                  user.rank === 3 && "text-amber-900",
                  user.rank > 3 && "text-neutral-800"
                )}>
                  {isCurrentUser ? 'You' : user.name}
                  {isCurrentUser && (
                    <span className="text-xs font-bold text-white bg-brand-primary-500 rounded-full px-2 py-0.5">
                      You
                    </span>
                  )}
                </p>
                {user.email && (
                  <p className="text-xs text-neutral-500">{user.email}</p>
                )}
              </div>
              
              <div className="text-right">
                <p className={cn(
                  "font-bold text-xl",
                  user.rank === 1 && "text-yellow-600",
                  user.rank === 2 && "text-gray-600",
                  user.rank === 3 && "text-amber-600",
                  user.rank > 3 && "text-brand-primary-600"
                )}>
                  {points.toLocaleString()}
                </p>
                <p className="text-xs text-neutral-500 font-medium">points</p>
              </div>

              {/* Expand Button */}
              {userBreakdown && userBreakdown.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => setExpandedId(isExpanded ? null : user.userId)}
                >
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </Button>
              )}
            </div>

            {/* Expanded Breakdown */}
            <AnimatePresence>
              {isExpanded && userBreakdown && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-3 border-t border-neutral-200 pt-3">
                    <h5 className="text-xs font-semibold text-neutral-600 mb-2 uppercase">
                      Point Breakdown
                    </h5>
                    <div className="space-y-2">
                      {userBreakdown.map((breakdown: any) => (
                        <div
                          key={breakdown.eventType}
                          className="flex items-center justify-between text-sm p-2 rounded-md bg-neutral-50"
                        >
                          <div className="flex items-center gap-2">
                            {getActivityIcon(breakdown.eventType)}
                            <div>
                              <span className="text-neutral-700 font-medium">
                                {breakdown.eventTypeName}
                              </span>
                              <span className="text-neutral-500 text-xs ml-1">
                                ({breakdown.count}x)
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-brand-primary-600">
                            {breakdown.points.toLocaleString()} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  icon 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
}) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-transparent hover:border-brand-primary-200">
    <CardContent className="pt-6 relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary-100 rounded-bl-full opacity-50" />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm text-neutral-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-brand-primary-700">
            {value}
          </p>
        </div>
        <div className="p-3 bg-brand-primary-100 rounded-xl shadow-inner">
          <div className="text-brand-primary-600">{icon}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton Loader
const LeaderboardSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-neutral-200 animate-pulse rounded-lg" />
    ))}
  </div>
);
