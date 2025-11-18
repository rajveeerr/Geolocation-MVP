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
  Award,
  Fish,
  Utensils,
  Coffee,
  Pizza,
  Beer,
  Trophy,
  TrendingUp,
  Sparkles,
  ChevronDown,
  DollarSign,
  Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [expandedIndex, setExpandedIndex] = useState<{ type: 'checkins' | 'new' | 'trending'; index: number } | null>(null);

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

  // Generate placeholder avatar URL if avatarUrl is missing
  const getPlaceholderAvatar = (name: string | null | undefined): string => {
    const displayName = name || 'User';
    // Use ui-avatars.com for placeholder avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=128&bold=true`;
  };

  const toggleExpanded = (type: 'checkins' | 'new' | 'trending', index: number) => {
    if (expandedIndex?.type === type && expandedIndex?.index === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex({ type, index });
    }
  };

  if (isLoadingLeaderboard && isLoadingFeatured && isLoadingPopular) {
    return (
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-16 bg-gray-100 rounded-lg"></div>
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
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-gray-900" />
                <h3 className="text-xl text-gray-900">Top people checking in</h3>
              </div>
              <button 
                onClick={() => navigate(PATHS.LEADERBOARD || '/leaderboard')}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                View all →
              </button>
            </div>

            {/* Period Dropdown */}
            <div className="relative mb-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="space-y-2">
              {topUsers.slice(0, 6).map((user, index) => {
                const breakdown = pointBreakdowns[user.userId] || [];
                const isExpanded = expandedIndex?.type === 'checkins' && expandedIndex?.index === index;
                const checkins = breakdown.find(e => 
                  e.eventType?.includes('CHECK') || e.eventTypeName?.toLowerCase().includes('check')
                )?.count || 0;
                const userAvatarUrl = user.avatarUrl || getPlaceholderAvatar(user.name);

                return (
                  <div key={user.userId}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleExpanded('checkins', index)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer group border border-gray-100"
                    >
                      {/* Avatar with rank badge */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                          <Avatar className="w-full h-full">
                            <AvatarImage 
                              src={userAvatarUrl} 
                              alt={user.name || 'User'}
                              onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                const target = e.target as HTMLImageElement;
                                if (user.avatarUrl) {
                                  target.src = getPlaceholderAvatar(user.name);
                                }
                              }}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-semibold">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        {/* Rank Number Badge */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 mb-0.5">{user.name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-600">{getActivityDescription(user, breakdown)}</div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-xs text-gray-600">{checkins > 0 ? checkins : user.points || 0}</div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </motion.div>

                    {/* Expanded Content - Only show if there's meaningful data */}
                    <AnimatePresence>
                      {isExpanded && breakdown.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-11 mr-3 mt-2 bg-white border border-gray-100 rounded-lg p-4 space-y-4">
                            {/* Point Breakdown */}
                            <div>
                              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                Activity Breakdown:
                              </div>
                              <div className="space-y-1">
                                {breakdown.slice(0, 5).map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                                    <span className="text-gray-700">{item.eventTypeName || item.eventType}</span>
                                    <span className="text-gray-900 font-medium">{item.count}x (+{item.points} pts)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: New Restaurants */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-gray-900" />
                <h3 className="text-xl text-gray-900">New restaurants</h3>
              </div>
              <button 
                onClick={() => navigate(PATHS.ALL_DEALS || '/deals')}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2">
              {featuredDeals?.slice(0, 5).map((deal, index) => {
                const hasSpecialOffer = deal.bountyRewardAmount && deal.bountyRewardAmount > 0;
                const category = deal.category?.toLowerCase() || '';
                const isExpanded = expandedIndex?.type === 'new' && expandedIndex?.index === index;
                const dealImage = deal.image || deal.merchantLogo || '';

                return (
                  <div key={deal.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleExpanded('new', index)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer group border border-gray-100"
                    >
                      {/* Image/Icon with rank badge */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100 relative">
                          {/* Icon fallback - always present */}
                          <div className="w-full h-full flex items-center justify-center absolute inset-0 z-0">
                            {getRestaurantIcon(deal.name || deal.merchantName || '', category)}
                          </div>
                          {/* Image overlay - hides icon when loaded successfully */}
                          {dealImage && (
                            <img
                              src={dealImage}
                              alt={deal.name || deal.merchantName || 'Restaurant'}
                              className="w-full h-full object-cover absolute inset-0 z-10"
                              onError={(e) => {
                                // Hide image on error, icon will show as fallback
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold z-20">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 mb-0.5">{deal.name || deal.merchantName}</div>
                        {category && (
                          <div className="text-xs text-gray-600">{category}</div>
                        )}
                        {deal.startTime && (
                          <div className="text-xs text-gray-500">Opens at {new Date(deal.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} today</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className="bg-gray-900 text-white border-0 text-xs">
                          New
                        </Badge>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </motion.div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-11 mr-3 mt-2 bg-white border border-gray-100 rounded-lg p-4 space-y-4">
                            {/* Happy Hour Specials */}
                            {(deal.dealType === 'HAPPY_HOUR' || deal.dealType === 'Happy Hour' || (typeof deal.dealType === 'object' && deal.dealType?.name === 'Happy Hour')) && deal.offers && deal.offers.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-900 mb-2">Happy Hour Specials:</div>
                                <div className="space-y-2">
                                  {deal.offers.slice(0, 3).map((offer, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded">
                                      <div>
                                        <div className="text-gray-900">{offer.title}</div>
                                        <div className="text-gray-500">{offer.time || offer.discount || ''}</div>
                                      </div>
                                      <div className="text-gray-900">{offer.price || ''}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Limited Time Offer */}
                            {hasSpecialOffer && (
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-sm">Limited Time Offer!</span>
                                </div>
                                <p className="text-xs opacity-90">
                                  Come NOW and get an EXTRA ${deal.bountyRewardAmount} cash on top of regular rewards!
                                </p>
                              </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                                }}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (deal.merchantAddress) {
                                    window.open(`https://maps.google.com/?q=${encodeURIComponent(deal.merchantAddress)}`, '_blank');
                                  }
                                }}
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Directions
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                                }}
                              >
                                I'm Coming
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Trending on Site */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-gray-900" />
                <h3 className="text-xl text-gray-900">Trending on site</h3>
              </div>
              <button 
                onClick={() => navigate(PATHS.ALL_DEALS || '/deals')}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2">
              {popularDeals?.slice(0, 5).map((deal, index) => {
                const checkInCount = deal.claimedBy?.totalCount || 0;
                const views = checkInCount * 42; // Mock calculation for views
                const category = deal.category?.toLowerCase() || '';
                const hasSpecialOffer = deal.bountyRewardAmount && deal.bountyRewardAmount > 0;
                const isExpanded = expandedIndex?.type === 'trending' && expandedIndex?.index === index;
                const dealImage = deal.image || deal.merchantLogo || '';

                return (
                  <div key={deal.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => toggleExpanded('trending', index)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white hover:shadow-md transition-all cursor-pointer group border border-gray-100"
                    >
                      {/* Image/Icon with rank badge */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100 relative">
                          {/* Icon fallback - always present */}
                          <div className="w-full h-full flex items-center justify-center absolute inset-0 z-0">
                            {getRestaurantIcon(deal.name || deal.merchantName || '', category)}
                          </div>
                          {/* Image overlay - hides icon when loaded successfully */}
                          {dealImage && (
                            <img
                              src={dealImage}
                              alt={deal.name || deal.merchantName || 'Restaurant'}
                              className="w-full h-full object-cover absolute inset-0 z-10"
                              onError={(e) => {
                                // Hide image on error, icon will show as fallback
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold z-20">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 mb-0.5">{deal.name || deal.merchantName}</div>
                        <div className="text-xs text-gray-600">
                          {deal.dealType === 'HIDDEN' || deal.dealType === 'Hidden Deal' ? 'Secret deal unlocked' : 
                           deal.dealType === 'HAPPY_HOUR' || deal.dealType === 'Happy Hour' ? `Happy hour until ${deal.endTime ? new Date(deal.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '9 PM'}` :
                           'Viral deal alert 🍔'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-xs text-gray-600">{views.toLocaleString()}</div>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </div>
                    </motion.div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-11 mr-3 mt-2 bg-white border border-gray-100 rounded-lg p-4 space-y-4">
                            {/* Happy Hour Specials */}
                            {(deal.dealType === 'HAPPY_HOUR' || deal.dealType === 'Happy Hour' || (typeof deal.dealType === 'object' && deal.dealType?.name === 'Happy Hour')) && deal.offers && deal.offers.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-900 mb-2">Happy Hour Specials:</div>
                                <div className="space-y-2">
                                  {deal.offers.slice(0, 3).map((offer, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 rounded">
                                      <div>
                                        <div className="text-gray-900">{offer.title}</div>
                                        <div className="text-gray-500">{offer.time || offer.discount || ''}</div>
                                      </div>
                                      <div className="text-gray-900">{offer.price || ''}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Limited Time Offer */}
                            {hasSpecialOffer && (
                              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span className="text-sm">Limited Time Offer!</span>
                                </div>
                                <p className="text-xs opacity-90">
                                  Come NOW and get an EXTRA ${deal.bountyRewardAmount} cash on top of regular rewards!
                                </p>
                              </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                                }}
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (deal.merchantAddress) {
                                    window.open(`https://maps.google.com/?q=${encodeURIComponent(deal.merchantAddress)}`, '_blank');
                                  }
                                }}
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Directions
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gray-900 hover:bg-gray-800 text-white text-xs h-9"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                                }}
                              >
                                I'm Coming
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

