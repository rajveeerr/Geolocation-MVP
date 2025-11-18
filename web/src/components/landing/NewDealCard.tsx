import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin, 
  Flame, 
  Sparkles, 
  Gift, 
  UtensilsCrossed, 
  X, 
  Banknote, 
  Coins, 
  Copy, 
  Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Deal } from '@/data/deals';
import { useMenuItems } from '@/hooks/useMenuSystem';
import { useTodayAvailability } from '@/hooks/useTableBooking';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCountdown } from '@/hooks/useCountdown';
import { useSavedDeals } from '@/hooks/useSavedDeals';
import { useAuth } from '@/context/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

interface NewDealCardProps {
  deal: Deal;
  onClick?: () => void;
  distance?: number; // Distance in miles
}

type IncentiveType = 'cash' | 'surprise' | 'coins' | 'redeem';

export const NewDealCard = ({ deal, onClick, distance }: NewDealCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMenuPeek, setShowMenuPeek] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showIncentiveDetails, setShowIncentiveDetails] = useState(false);
  const [menuTab, setMenuTab] = useState<'bites' | 'drinks' | 'reservations'>('bites');
  const [linkCopied, setLinkCopied] = useState(false);

  // Hooks
  const { savedDealIds, saveDeal, unsaveDeal } = useSavedDeals();
  const isSaved = savedDealIds.has(deal.id);
  const { data: menuItems } = useMenuItems({ merchantId: deal.merchantId });
  const { data: availability } = useTodayAvailability(deal.merchantId || undefined);

  // Countdown timer
  const countdown = useCountdown(deal.expiresAt || deal.endTime || '');

  // Determine incentive type based on deal data
  const getIncentiveType = (): IncentiveType => {
    if (deal.dealType === 'BOUNTY' || deal.dealType === 'Bounty Deal') {
      return 'cash';
    }
    if (deal.dealType === 'HIDDEN' || deal.dealType === 'Hidden Deal') {
      return 'surprise';
    }
    if (deal.dealType === 'REDEEM_NOW' || deal.dealType === 'Redeem Now') {
      return 'redeem';
    }
    // Check for coins/loyalty points (if available in future)
    // For now, default to cash if bountyRewardAmount exists
    return 'cash';
  };

  const incentiveType = getIncentiveType();

  // Calculate cash per friend and max friends from bounty data (dynamic from backend)
  const hasBountyData = deal.bountyRewardAmount != null && deal.minReferralsRequired != null;
  const cashPerFriend = hasBountyData && deal.minReferralsRequired! > 0
    ? Math.floor((deal.bountyRewardAmount || 0) / deal.minReferralsRequired!)
    : 0;
  const maxFriends = deal.minReferralsRequired || 0;
  const maxCash = hasBountyData ? (deal.bountyRewardAmount || 0) : 0;

  // Tapped in count
  const tappedInCount = deal.claimedBy?.totalCount || 0;
  const tappedInUsers = deal.claimedBy?.visibleUsers || [];

  // Distance display
  const distanceDisplay = distance ? `${distance.toFixed(1)} mi` : '0.3 mi';

  // Time remaining display
  const timeDisplay = deal.status?.timeRemaining?.formatted || 
    (countdown ? `${countdown.hours}h ${countdown.minutes}m` : '3h 22m');
  const isActive = deal.status?.isActive || false;
  const isUpcoming = deal.status?.isUpcoming || false;

  // Handle save/favorite
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to save deals.',
      });
      return;
    }
    if (isSaved) {
      unsaveDeal(deal.id);
    } else {
      saveDeal(deal.id);
    }
  };

  // Handle copy link
  const handleCopyLink = () => {
    const link = `${window.location.origin}${PATHS.DEAL_DETAIL.replace(':dealId', deal.id)}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Filter menu items by category
  const biteItems = menuItems?.filter(item => 
    item.category?.toLowerCase().includes('food') || 
    item.category?.toLowerCase().includes('bite') ||
    item.category?.toLowerCase().includes('appetizer') ||
    item.category?.toLowerCase().includes('entree')
  ) || [];

  const drinkItems = menuItems?.filter(item => 
    item.category?.toLowerCase().includes('drink') || 
    item.category?.toLowerCase().includes('beverage') ||
    item.category?.toLowerCase().includes('cocktail')
  ) || [];

  return (
    <div className="flex flex-col w-full">
      {/* Main Card */}
      <motion.div
        className="group relative w-full rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
          }
        }}
      >
        {/* Full Image Background */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={deal.image || deal.images?.[0] || ''}
            alt={deal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />

          {/* Dark gradient overlay - stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70"></div>

          {/* Menu Peek Overlay */}
          <AnimatePresence>
            {showMenuPeek && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-white z-50 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenuPeek(false);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{deal.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">Select your favorite deals and reserve a table.</p>

                  <Tabs value={menuTab} onValueChange={(v) => setMenuTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 rounded-full p-1">
                      <TabsTrigger value="bites" className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                        BITES
                      </TabsTrigger>
                      <TabsTrigger value="drinks" className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                        DRINKS
                      </TabsTrigger>
                      <TabsTrigger value="reservations" className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                        RESERVATIONS
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bites" className="space-y-3">
                      {biteItems.length > 0 ? (
                        biteItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm mb-1">{item.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-600 font-semibold">${item.price}</span>
                                {deal.discountPercentage && (
                                  <Badge className="bg-orange-500 text-white text-xs">{deal.discountPercentage}% OFF</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No menu items available</p>
                      )}
                      <button className="w-full py-3 mt-4 border-2 border-gray-900 rounded-xl text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-colors">
                        See Full Menu
                      </button>
                    </TabsContent>

                    <TabsContent value="drinks" className="space-y-3">
                      {drinkItems.length > 0 ? (
                        drinkItems.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm mb-1">{item.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-600 font-semibold">${item.price}</span>
                                {deal.discountPercentage && (
                                  <Badge className="bg-orange-500 text-white text-xs">{deal.discountPercentage}% OFF</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No drinks available</p>
                      )}
                      <button className="w-full py-3 mt-4 border-2 border-gray-900 rounded-xl text-gray-900 font-semibold hover:bg-gray-900 hover:text-white transition-colors">
                        See Full Menu
                      </button>
                    </TabsContent>

                    <TabsContent value="reservations" className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-gray-600 text-sm">
                          Select a time for {deal.startTime && deal.endTime 
                            ? `${new Date(deal.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${new Date(deal.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                            : '4-7 PM Daily'}
                        </p>
                      </div>

                      {/* Date Selector */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {['Today', 'Tomorrow', 'Sat', 'Sun'].map((day, i) => (
                          <button
                            key={i}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                              i === 0 
                                ? 'bg-gray-900 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      {/* Party Size */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Party Size</label>
                        <select className="w-full p-3 border-2 border-gray-200 rounded-lg text-gray-900 font-medium">
                          <option>2 people</option>
                          <option>3 people</option>
                          <option>4 people</option>
                          <option>5 people</option>
                          <option>6 people</option>
                        </select>
                      </div>

                      {/* Time Slots */}
                      {availability?.availableTimeSlots && availability.availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availability.availableTimeSlots.slice(0, 8).map((slot) => (
                            <button
                              key={slot.id}
                              disabled={slot.availableSpots === 0}
                              className={`p-3 rounded-lg font-medium transition-all text-sm ${
                                slot.availableSpots > 0
                                  ? 'bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900'
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              {new Date(slot.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM'].map((time, index) => (
                            <button
                              key={index}
                              className="p-3 rounded-lg font-medium bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 text-sm"
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <Button className="w-full h-12 rounded-full mt-4 bg-[#FF6B5A] hover:bg-[#FF5A47] text-white">
                        Reserve Table
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Right: Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button 
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowIncentiveDetails(true);
              }}
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button 
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all shadow-lg"
              onClick={handleFavorite}
            >
              <Heart className={cn("w-5 h-5", isSaved ? "fill-red-500 text-red-500" : "text-white")} />
            </button>
            <button 
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:bg-white/30 transition-all shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenuPeek(true);
              }}
            >
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Top Left: People Tapped In */}
          {tappedInCount > 0 && (
            <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
              <div className="flex -space-x-2">
                {tappedInUsers.slice(0, 3).map((user, i) => (
                  <Avatar key={i} className="w-8 h-8 border-2 border-white">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs">
                      U
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-white text-sm font-medium">+{tappedInCount} tapped in</span>
            </div>
          )}

          {/* Bottom Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-6">
            {/* Bottom Content Overlay */}
            <div className="mt-auto space-y-3">
              {/* Main Title - Large Bold */}
              <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
                Earn Money for<br />Every Friend
              </h2>
              
              {/* Restaurant Name + Distance */}
              <div className="flex items-center gap-2">
                <p className="text-white/80 text-base">
                  {deal.name}
                </p>
                <span className="text-white/60 text-sm">•</span>
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{distanceDisplay}</span>
                </div>
              </div>

              {/* Compact Stats Row - Icons with Text */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                {/* Countdown Clock */}
                {isActive ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/40 backdrop-blur-sm rounded-full px-2.5 py-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    <span className="text-white text-[10px] font-medium">Ends {timeDisplay}</span>
                  </div>
                ) : isUpcoming ? (
                  <div className="flex items-center gap-1.5 bg-red-500/40 backdrop-blur-sm rounded-full px-2.5 py-1 flex-shrink-0">
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-medium">Starts {timeDisplay}</span>
                  </div>
                ) : null}

                {/* Cash reward (if applicable and has bounty data) */}
                {incentiveType === 'cash' && hasBountyData && maxCash > 0 && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/40 backdrop-blur-sm rounded-full px-2.5 py-1 flex-shrink-0">
                    <DollarSign className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-medium">Up to ${maxCash}</span>
                  </div>
                )}

                {/* Discount badge */}
                {deal.discountPercentage && (
                  <div className="flex items-center gap-1.5 bg-orange-500/40 backdrop-blur-sm rounded-full px-2.5 py-1 flex-shrink-0">
                    <span className="text-white text-[10px] font-medium">{deal.discountPercentage}% off</span>
                  </div>
                )}

                {/* Secret deal badge */}
                {incentiveType === 'surprise' && (
                  <div className="flex items-center gap-1.5 bg-purple-500/40 backdrop-blur-sm rounded-full px-2.5 py-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-medium">Secret</span>
                  </div>
                )}

                {/* Coins badge */}
                {incentiveType === 'coins' && (
                  <div className="flex items-center gap-1.5 bg-yellow-500/40 backdrop-blur-sm rounded-full px-2.5 py-1 flex-shrink-0">
                    <Flame className="w-3 h-3 text-white" />
                    <span className="text-white text-[10px] font-medium">Steal coins</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Incentive Details Overlay - Contained within card */}
          <AnimatePresence>
            {showIncentiveDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black z-50 rounded-[2rem] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIncentiveDetails(false);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="p-6 flex flex-col h-full justify-between min-h-full">
                  {/* Top Section: Amount Display */}
                  <div className="space-y-6 pt-8">
                    {incentiveType === 'cash' && hasBountyData && maxCash > 0 ? (
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-6xl md:text-8xl font-bold text-white">${maxCash}</span>
                        </div>
                        <p className="text-white/70 text-lg">Maximum Cash Reward</p>
                        {cashPerFriend > 0 && (
                          <p className="text-white/50 text-sm">${cashPerFriend} per friend</p>
                        )}
                      </div>
                    ) : incentiveType === 'cash' && (!hasBountyData || maxCash === 0) ? (
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center">
                            <Gift className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <p className="text-white/70 text-xl">Special Deal</p>
                        <p className="text-white/50">Check in to unlock rewards</p>
                      </div>
                    ) : incentiveType === 'redeem' ? (
                      <div className="text-center space-y-6">
                        <div className="flex items-center justify-center flex-col gap-4">
                          <div className="text-6xl md:text-8xl font-bold text-emerald-400">{deal.discountPercentage || 50}%</div>
                          <p className="text-white/90 text-2xl">OFF YOUR BILL</p>
                        </div>
                        {deal.discountAmount && (
                          <div className="bg-white/10 rounded-2xl p-4 space-y-2">
                            <p className="text-white/80 text-sm">Up to <span className="font-bold text-white">${deal.discountAmount}</span> discount</p>
                            <p className="text-white/60 text-xs">Min. spend $20</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
                            <Gift className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <p className="text-white/70 text-xl">Mystery Reward</p>
                        <p className="text-white/50">Unlocked at check-in</p>
                      </div>
                    )}

                    {/* Rules Section */}
                    <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                      <h4 className="text-white font-semibold text-sm uppercase tracking-wide">How it works</h4>
                      
                      {incentiveType === 'cash' && hasBountyData ? (
                        <div className="space-y-2 text-white/60 text-xs">
                          <p>• Friends must arrive before happy hour countdown ends</p>
                          <p>• When they check in, you get cash if they spend minimum $20</p>
                          {maxFriends > 0 && maxCash > 0 && (
                            <p>• Up to {maxFriends} friends = ${maxCash} total</p>
                          )}
                          <p>• If countdown ends, you get nothing</p>
                        </div>
                      ) : incentiveType === 'redeem' ? (
                        <div className="space-y-2 text-white/60 text-xs">
                          <p>• Can't be combined with other deals</p>
                          <p>• Use as many visits as you want</p>
                          <p>• One redeem per table (each person can't ask for their own redeem discount)</p>
                          <p>• Must check in to activate the discount</p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-white/60 text-xs">
                          <p>• Get a surprise discount or heavily discounted product</p>
                          <p>• Revealed when you check in</p>
                          <p>• Must spend minimum $20 to qualify</p>
                          <p>• Surprise changes each visit</p>
                        </div>
                      )}
                    </div>

                    {/* Countdown Warning */}
                    {isActive && (
                      <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                        <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-red-200 text-xs">Hurry! Deal ends in {timeDisplay}</p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: CTA Buttons */}
                  <div className="space-y-4 mt-8">
                    {incentiveType === 'cash' && hasBountyData && maxCash > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowIncentiveDetails(false);
                          setShowShareSheet(true);
                        }}
                        className="w-full h-14 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        Share & Invite Friends
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowIncentiveDetails(false);
                        if (onClick) {
                          onClick();
                        } else {
                          navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
                        }
                      }}
                      className="w-full h-14 bg-white text-gray-900 rounded-full font-semibold hover:bg-white/90 transition-colors"
                    >
                      I'll Bite
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Share Sheet Overlay - Contained within card */}
          <AnimatePresence>
            {showShareSheet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 bg-white z-50 rounded-[2rem] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareSheet(false);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <X className="w-5 h-5 text-gray-900" />
                </button>

                <div className="p-6 space-y-6 mt-12">
                  {/* Green Earnings Card */}
                  {hasBountyData && cashPerFriend > 0 && maxFriends > 0 && (
                    <div className="bg-emerald-500 rounded-3xl p-6 space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-bold text-white">${cashPerFriend}</span>
                        <span className="text-xl text-white/90">per friend</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <Users className="w-5 h-5" />
                        <span>Bring {maxFriends} friends = ${maxCash} max earnings</span>
                      </div>
                    </div>
                  )}

                  {/* Qualification Steps */}
                  <div className="space-y-4">
                    <h3 className="text-gray-500 uppercase tracking-wide text-sm">To qualify, friends must:</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm">
                          1
                        </div>
                        <p className="text-gray-900 pt-1 text-sm">Use your referral link to check in</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm">
                          2
                        </div>
                        <p className="text-gray-900 pt-1 text-sm">
                          Arrive before <span className="font-semibold">{timeDisplay}</span>
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 text-sm">
                          3
                        </div>
                        <p className="text-gray-900 pt-1 text-sm">Spend $20+ at checkout</p>
                      </div>
                    </div>
                  </div>

                  {/* Referral Link */}
                  <div className="space-y-3">
                    <h3 className="text-gray-500 uppercase tracking-wide text-sm">Share your link</h3>
                    <div className="flex items-center gap-2 p-4 border-2 border-gray-900 rounded-2xl bg-gray-50">
                      <input
                        type="text"
                        value={`${window.location.origin}${PATHS.DEAL_DETAIL.replace(':dealId', deal.id)}?ref=${user?.id || 'YOU'}`}
                        className="flex-1 bg-transparent text-blue-600 outline-none text-sm"
                        readOnly
                      />
                      <button 
                        className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2" 
                        onClick={handleCopyLink}
                      >
                        {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span className="text-sm">{linkCopied ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="space-y-3">
                    <h3 className="text-gray-500 uppercase tracking-wide text-sm">Or share via</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors flex flex-col items-center justify-center gap-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span className="text-xs">Facebook</span>
                      </button>
                      <button className="py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors flex flex-col items-center justify-center gap-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        <span className="text-xs">Twitter</span>
                      </button>
                      <button className="py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white rounded-xl transition-opacity flex flex-col items-center justify-center gap-1">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span className="text-xs">Instagram</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tap In Button - Split Design */}
      <div className="flex items-center gap-3 mt-4">
        {/* Left: I'll Bite button */}
        <button
          onClick={() => {
            if (onClick) {
              onClick();
            } else {
              navigate(PATHS.DEAL_DETAIL.replace(':dealId', deal.id));
            }
          }}
          className="flex-1 h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-between pl-6 pr-1 group relative overflow-hidden bg-gray-900"
        >
          <span className="text-white font-semibold text-base sm:text-lg relative z-10">I'll Bite</span>
          
          {/* White circle with arrow */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform relative z-10">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-900"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </div>
        </button>

        {/* Right: Reward badge */}
        {incentiveType === 'cash' && hasBountyData && maxCash > 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIncentiveDetails(true);
            }}
            className="h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center px-6 shadow-lg flex-shrink-0 hover:border-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-gray-900" />
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-600">up to</span>
                <span className="text-xl font-bold text-gray-900">${maxCash}</span>
                <span className="text-xs text-gray-600">cash</span>
              </div>
            </div>
          </button>
        ) : incentiveType === 'coins' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIncentiveDetails(true);
            }}
            className="h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center px-6 shadow-lg flex-shrink-0 hover:border-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-gray-900" />
              <span className="font-semibold text-gray-900">Steal coins</span>
            </div>
          </button>
        ) : incentiveType === 'redeem' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIncentiveDetails(true);
            }}
            className="h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center px-6 shadow-lg flex-shrink-0 hover:border-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-900" />
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-900">{deal.discountPercentage || 50}%</span>
                <span className="text-xs text-gray-600">off</span>
              </div>
            </div>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowIncentiveDetails(true);
            }}
            className="h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center px-6 shadow-lg flex-shrink-0 hover:border-gray-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-gray-900" />
              <span className="font-semibold text-gray-900">Surprise</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

