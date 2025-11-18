import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useFeaturedDeals } from '@/hooks/useFeaturedDeals';
import { usePopularDeals } from '@/hooks/usePopularDeals';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  MapPin, 
  ArrowRight, 
  Award,
  Fish,
  Utensils,
  Coffee,
  Pizza,
  Beer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

// Icon mapping for restaurants
const restaurantIconMap: Record<string, ReactNode> = {
  'seafood': <Fish className="w-5 h-5 text-blue-500" />,
  'oyster': <Fish className="w-5 h-5 text-blue-500" />,
  'mexican': <Utensils className="w-5 h-5 text-blue-500" />,
  'taco': <Utensils className="w-5 h-5 text-blue-500" />,
  'pizza': <Pizza className="w-5 h-5 text-blue-500" />,
  'gastropub': <Beer className="w-5 h-5 text-blue-500" />,
  'brew': <Beer className="w-5 h-5 text-blue-500" />,
  'sushi': <Fish className="w-5 h-5 text-blue-500" />,
  'japanese': <Fish className="w-5 h-5 text-blue-500" />,
  'coffee': <Coffee className="w-5 h-5 text-blue-500" />,
  'burger': <Utensils className="w-5 h-5 text-blue-500" />,
};

// Get restaurant icon based on category/name
const getRestaurantIcon = (name: string, category?: string): ReactNode => {
  const searchText = `${name} ${category || ''}`.toLowerCase();
  for (const [key, icon] of Object.entries(restaurantIconMap)) {
    if (searchText.includes(key)) {
      return icon;
    }
  }
  return <Utensils className="w-5 h-5 text-blue-500" />;
};

// Activity description generator
const getActivityDescription = (user: any, breakdown?: any[]): string => {
  if (!breakdown || breakdown.length === 0) {
    return 'Active member';
  }

  // Check for referrals
  const referrals = breakdown.find(e => 
    e.eventType?.includes('REFERRAL') || e.eventTypeName?.toLowerCase().includes('referral')
  );
  if (referrals && referrals.count > 0) {
    return `Brought ${referrals.count} friend${referrals.count > 1 ? 's' : ''} today`;
  }

  // Check for check-ins
  const checkIns = breakdown.find(e => 
    e.eventType?.includes('CHECK') || e.eventTypeName?.toLowerCase().includes('check')
  );
  if (checkIns && checkIns.count > 0) {
    if (checkIns.count >= 3) {
      return `${checkIns.count}-day check-in streak 🔥`;
    }
    return `Just checked in`;
  }

  // Check for steals
  const steals = breakdown.find(e => 
    e.eventType?.includes('STEAL') || e.eventTypeName?.toLowerCase().includes('steal')
  );
  if (steals && steals.count > 0) {
    return `Stole ${steals.points || steals.count * 100} pts from friends`;
  }

  // Check for shares
  const shares = breakdown.find(e => 
    e.eventType?.includes('SHARE') || e.eventTypeName?.toLowerCase().includes('share')
  );
  if (shares && shares.count > 0) {
    return `Shared ${shares.count} food pic${shares.count > 1 ? 's' : ''}`;
  }

  return 'Regular check-in champion';
};

export const LeaderboardSection = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useLeaderboard({
    period: selectedPeriod,
    limit: 6,
    showMore: true,
    includeBreakdown: true,
  });

  // Fetch new/featured deals (for new restaurants)
  const { data: featuredDeals, isLoading: isLoadingFeatured } = useFeaturedDeals();

  // Fetch popular/trending deals
  const { data: popularDeals, isLoading: isLoadingPopular } = usePopularDeals();

  const topUsers = leaderboardData?.top || [];
  const pointBreakdowns = leaderboardData?.pointBreakdowns || {};

  // Get friends who checked in (mock for now - would come from API)
  const getFriendsWhoCheckedIn = (userId: number) => {
    // This would come from an API endpoint like /api/users/:id/friends-checked-in
    return [
      { name: 'Mike', avatarUrl: null },
      { name: 'Emma', avatarUrl: null },
      { name: 'Jake', avatarUrl: null },
      { name: 'Lisa', avatarUrl: null },
    ];
  };

  // Get recent orders (mock for now - would come from API)
  const getRecentOrders = (userId: number) => {
    // This would come from an API endpoint like /api/users/:id/recent-orders
    return ['Spicy Tuna Roll', 'Miso Soup', 'Edamame'];
  };

  if (isLoadingLeaderboard && isLoadingFeatured && isLoadingPopular) {
    return (
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-20 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white py-12 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Column 1: Top People Checking In */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Top people checking in</h3>
              <button 
                onClick={() => navigate(PATHS.LEADERBOARD || '/leaderboard')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Period Dropdown */}
            <div className="relative mb-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="space-y-3">
              {topUsers.slice(0, 6).map((user, index) => {
                const breakdown = pointBreakdowns[user.userId] || [];
                const isExpanded = expandedUser === user.userId;
                const friends = getFriendsWhoCheckedIn(user.userId);
                const orders = getRecentOrders(user.userId);

                return (
                  <div
                    key={user.userId}
                    className={cn(
                      "border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors cursor-pointer",
                      isExpanded && "border-blue-300 bg-blue-50/30"
                    )}
                    onClick={() => setExpandedUser(isExpanded ? null : user.userId)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                          {user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{user.name || 'Anonymous'}</h4>
                          <span className="text-gray-600 font-medium text-sm">{user.points || 0}</span>
                        </div>
                        <p className="text-gray-600 text-xs mb-2">
                          {getActivityDescription(user, breakdown)}
                        </p>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3 pt-3 border-t border-gray-200">
                            {/* Friends who checked in */}
                            {friends.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">Friends who checked in:</p>
                                <div className="flex -space-x-2">
                                  {friends.map((friend, i) => (
                                    <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                        {friend.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recent orders */}
                            {orders.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-500 mb-2">Recent orders:</p>
                                <div className="space-y-1">
                                  {orders.map((order, i) => (
                                    <p key={i} className="text-xs text-gray-700">{order}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: New Restaurants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">New restaurants</h3>
              <button 
                onClick={() => navigate(PATHS.ALL_DEALS || '/deals')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {featuredDeals?.slice(0, 5).map((deal) => {
                const hasSpecialOffer = deal.bountyRewardAmount && deal.bountyRewardAmount > 0;
                const category = deal.category?.toLowerCase() || '';

                return (
                  <div
                    key={deal.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {getRestaurantIcon(deal.name || deal.merchantName || '', category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{deal.name || deal.merchantName}</h4>
                          <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">New</Badge>
                        </div>
                        <p className="text-gray-600 text-xs mb-1">
                          {category || 'Restaurant'}
                        </p>
                        {deal.startTime && (
                          <p className="text-gray-500 text-xs">
                            Opens at {new Date(deal.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} today
                          </p>
                        )}
                        {deal.bountyRewardAmount && (
                          <p className="text-gray-600 text-xs mt-1">
                            ${deal.bountyRewardAmount} per friend special
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Happy Hour Specials */}
                    {(deal.dealType === 'HAPPY_HOUR' || deal.dealType === 'Happy Hour' || (typeof deal.dealType === 'object' && deal.dealType?.name === 'Happy Hour')) && (
                      <div className="mb-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Happy Hour Specials:</p>
                        <div className="space-y-1.5">
                          {deal.offers?.slice(0, 3).map((offer, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700">{offer.title}</span>
                              <div className="flex items-center gap-2">
                                {offer.category === 'Drinks' && (
                                  <span className="text-emerald-600 font-medium">{offer.time}</span>
                                )}
                                {offer.category === 'Bites' && (
                                  <span className="text-orange-600 font-medium">{offer.time}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Limited Time Offer */}
                    {hasSpecialOffer && (
                      <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-900 font-medium">
                            Limited Time Offer! Come NOW and get an EXTRA ${deal.bountyRewardAmount} cash on top of regular rewards!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Phone number would come from merchant data - for now, navigate to deal detail
                          navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                        }}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (deal.merchantAddress) {
                            window.open(`https://maps.google.com/?q=${encodeURIComponent(deal.merchantAddress)}`, '_blank');
                          }
                        }}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Direction
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                        }}
                      >
                        I'm Coming
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Trending on Site */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Trending on site</h3>
              <button 
                onClick={() => navigate(PATHS.ALL_DEALS || '/deals')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {popularDeals?.slice(0, 5).map((deal) => {
                const checkInCount = deal.claimedBy?.totalCount || 0;
                const trendingScore = checkInCount * 42; // Mock calculation
                const category = deal.category?.toLowerCase() || '';
                const hasSpecialOffer = deal.bountyRewardAmount && deal.bountyRewardAmount > 0;

                return (
                  <div
                    key={deal.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {getRestaurantIcon(deal.name || deal.merchantName || '', category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{deal.name || deal.merchantName}</h4>
                        <p className="text-gray-600 text-xs mb-1">
                          {checkInCount} people checked in
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs">
                            {deal.dealType === 'HIDDEN' || deal.dealType === 'Hidden Deal' ? 'Secret deal unlocked' : 
                             deal.dealType === 'HAPPY_HOUR' || deal.dealType === 'Happy Hour' ? `Happy hour until ${deal.endTime ? new Date(deal.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '9 PM'}` :
                             'Viral deal alert 🍔'}
                          </span>
                          <span className="text-gray-700 font-semibold text-sm">{trendingScore.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Happy Hour Specials */}
                    {deal.dealType === 'HAPPY_HOUR' && deal.offers && deal.offers.length > 0 && (
                      <div className="mb-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Happy Hour Specials:</p>
                        <div className="space-y-1.5">
                          {deal.offers.slice(0, 3).map((offer, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700">{offer.title}</span>
                              <div className="flex items-center gap-2">
                                {offer.category === 'Drinks' && (
                                  <span className="text-emerald-600 font-medium">{offer.time}</span>
                                )}
                                {offer.category === 'Bites' && (
                                  <span className="text-orange-600 font-medium">{offer.time}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Limited Time Offer */}
                    {hasSpecialOffer && (
                      <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-emerald-900 font-medium">
                            Limited Time Offer! Come NOW and get an EXTRA ${deal.bountyRewardAmount} cash on top of regular rewards!
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Phone number would come from merchant data - for now, navigate to deal detail
                          navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                        }}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (deal.merchantAddress) {
                            window.open(`https://maps.google.com/?q=${encodeURIComponent(deal.merchantAddress)}`, '_blank');
                          }
                        }}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        Direction
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                        }}
                      >
                        I'm Coming
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

