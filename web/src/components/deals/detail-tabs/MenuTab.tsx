// web/src/components/deals/detail-tabs/MenuTab.tsx
import { useState, useEffect, useMemo } from 'react';
import { Clock, Users, Trophy, ShoppingCart } from 'lucide-react';
import type { DetailedDeal } from '@/hooks/useDealDetail';
import { cn } from '@/lib/utils';
import { ActivityFeed } from '@/components/deals/ActivityFeed';

type TabId = 'menu' | 'leaderboard' | 'table-reservations' | 'shop' | 'overview' | 'events' | 'jobs' | 'gallery' | 'podcast' | 'news' | 'book-rooms' | 'reviews' | 'social';

interface MenuTabProps {
  deal: DetailedDeal;
  onNavigateToTab?: (tabId: TabId) => void;
}

export const MenuTab = ({ deal, onNavigateToTab }: MenuTabProps) => {
  // Initialize with appropriate default tab
  const getDefaultTab = () => {
    if (deal.context.isHappyHour) return 'happy-hour';
    return 'daily';
  };
  
  const [selectedSubMenu, setSelectedSubMenu] = useState(getDefaultTab());
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Calculate countdown for Happy Hour
  useEffect(() => {
    if (!deal.context.isHappyHour || !deal.status.isActive) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(deal.endTime).getTime();
      const diff = end - now;

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining({ hours, minutes, seconds });
      } else {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deal.endTime, deal.context.isHappyHour, deal.status.isActive]);

  // Get recent check-ins for avatars
  const recentCheckIns = deal.socialProof?.recentCheckIns || [];
  const totalCheckIns = deal.socialProof?.totalCheckIns || 0;
  const displayedAvatars = recentCheckIns.slice(0, 3);
  const remainingCount = Math.max(0, totalCheckIns - displayedAvatars.length);

  // Format Happy Hour time range
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Get recurring days formatted
  const formatRecurringDays = () => {
    if (!deal.recurringDays || deal.recurringDays.length === 0) return '';
    const dayMap: Record<string, string> = {
      'MONDAY': 'Mon',
      'TUESDAY': 'Tue',
      'WEDNESDAY': 'Wed',
      'THURSDAY': 'Thu',
      'FRIDAY': 'Fri',
      'SATURDAY': 'Sat',
      'SUNDAY': 'Sun',
    };
    const days = deal.recurringDays.map(day => dayMap[day.toUpperCase()] || day).slice(0, 3);
    if (deal.recurringDays.length > 3) {
      return `${days.join(', ')} +${deal.recurringDays.length - 3} more`;
    }
    return days.join(', ');
  };

  const happyHourTimeRange = deal.context.isHappyHour && deal.startTime && deal.endTime
    ? `${formatTime(deal.startTime)} - ${formatTime(deal.endTime)}`
    : '3PM - 7PM';
  
  const recurringDaysText = formatRecurringDays();
  
  // Get discount information
  const discountText = deal.discountPercentage 
    ? `${deal.discountPercentage}% OFF`
    : deal.discountAmount 
    ? `$${deal.discountAmount} OFF`
    : deal.offerDisplay || 'Special Offer';
  
  // Get menu items count
  const menuItemsCount = deal.menuItems?.length || 0;

  const menuItems = deal.menuItems || [];

  // Get unique categories from menu items
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    menuItems.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    return Array.from(categories).sort();
  }, [menuItems]);

  // Build sub-menus: fixed tabs + dynamic category tabs
  const subMenus = useMemo(() => {
    const fixedTabs = [
      { id: 'happy-hour', label: 'Happy Hour Menu', enabled: true, type: 'fixed' as const },
      { id: 'daily', label: 'Daily Menu', enabled: true, type: 'fixed' as const },
      { id: 'drinks', label: 'Drinks', enabled: true, type: 'fixed' as const },
      { id: 'kids', label: 'Kids Menu', enabled: false, type: 'fixed' as const },
      { id: 'deals', label: 'Daily Deals', enabled: false, type: 'fixed' as const },
      { id: 'wall-street', label: 'Wall Street Menu', enabled: false, type: 'fixed' as const },
      { id: 'catering', label: 'Catering', enabled: false, type: 'fixed' as const },
    ];

    // Add dynamic category tabs (exclude categories that might conflict with fixed tabs)
    const categoryTabs = uniqueCategories
      .filter(cat => {
        const lowerCat = cat.toLowerCase();
        // Don't add if it's already covered by a fixed tab
        return !lowerCat.includes('kids') && 
               !lowerCat.includes('deal') && 
               !lowerCat.includes('wall street') && 
               !lowerCat.includes('catering') &&
               !lowerCat.includes('drink') && // Don't duplicate drinks tab
               !lowerCat.includes('beverage');
      })
      .map(category => ({
        id: category,
        label: category,
        enabled: true,
        type: 'category' as const,
      }));

    return [...fixedTabs, ...categoryTabs];
  }, [uniqueCategories]);

  // Ensure selected tab is valid
  useEffect(() => {
    const validTabIds = subMenus.map(m => m.id);
    if (!validTabIds.includes(selectedSubMenu)) {
      const defaultTab = deal.context.isHappyHour ? 'happy-hour' : 'daily';
      setSelectedSubMenu(defaultTab);
    }
  }, [subMenus, selectedSubMenu, deal.context.isHappyHour]);

  // Organize menu items by meal type for Daily Menu
  const organizeByMealType = (items: typeof menuItems) => {
    const breakfastItems: typeof menuItems = [];
    const brunchItems: typeof menuItems = [];
    const dinnerItems: typeof menuItems = [];
    const otherItems: typeof menuItems = [];

    items.forEach(item => {
      const category = item.category?.toLowerCase() || '';
      const name = item.name?.toLowerCase() || '';
      const description = item.description?.toLowerCase() || '';
      
      // Check if item belongs to breakfast
      if (
        category.includes('breakfast') ||
        name.includes('breakfast') ||
        name.includes('pancake') ||
        name.includes('waffle') ||
        name.includes('french toast') ||
        name.includes('omelette') ||
        name.includes('eggs') ||
        name.includes('bacon') ||
        name.includes('hash brown') ||
        description.includes('breakfast') ||
        description.includes('morning')
      ) {
        breakfastItems.push(item);
      }
      // Check if item belongs to brunch
      else if (
        category.includes('brunch') ||
        name.includes('brunch') ||
        name.includes('avocado toast') ||
        name.includes('eggs benedict') ||
        description.includes('brunch')
      ) {
        brunchItems.push(item);
      }
      // Check if item belongs to dinner
      else if (
        category.includes('dinner') ||
        category.includes('main') ||
        category.includes('entree') ||
        name.includes('steak') ||
        name.includes('pasta') ||
        name.includes('burger') ||
        name.includes('pizza') ||
        description.includes('dinner') ||
        description.includes('evening')
      ) {
        dinnerItems.push(item);
      }
      // Everything else goes to "other" or we can categorize based on common patterns
      else {
        // Try to infer from common patterns
        if (
          name.includes('salad') ||
          name.includes('soup') ||
          name.includes('appetizer') ||
          category.includes('appetizer') ||
          category.includes('starter')
        ) {
          dinnerItems.push(item); // Appetizers typically for dinner
        } else {
          otherItems.push(item);
        }
      }
    });

    return { breakfastItems, brunchItems, dinnerItems, otherItems };
  };

  // Filter menu items based on selected tab
  const filteredMenuItems = useMemo(() => {
    if (selectedSubMenu === 'happy-hour' && deal.context.isHappyHour) {
      // Show ALL items for happy hour deals
      return menuItems;
    }
    
    if (selectedSubMenu === 'daily') {
      // For daily menu, return all items (will be organized by meal type in UI)
      return menuItems;
    }
    
    if (selectedSubMenu === 'drinks') {
      // Show items where category includes "drink"
      return menuItems.filter(item => 
        item.category?.toLowerCase().includes('drink') || 
        item.category?.toLowerCase().includes('beverage') ||
        item.category?.toLowerCase().includes('cocktail')
      );
    }
    
    // Dynamic category tabs - show items matching the selected category
    if (uniqueCategories.includes(selectedSubMenu)) {
      return menuItems.filter(item => item.category === selectedSubMenu);
    }
    
    // Default: show all items
    return menuItems;
  }, [menuItems, selectedSubMenu, deal.context.isHappyHour, uniqueCategories]);

  // Render menu item card component
  const renderMenuItemCard = (item: typeof menuItems[0]) => {
    const discount = deal.discountPercentage || 0;
    const discountAmount = item.originalPrice - item.discountedPrice;
    const discountPercent = Math.round((discountAmount / item.originalPrice) * 100);

    return (
      <div
        key={item.id}
        className="relative bg-white rounded-xl overflow-hidden border border-neutral-200 hover:shadow-lg transition-all hover:scale-[1.02]"
      >
        {/* Image Section */}
        {item.imageUrl && (
          <div className="relative h-56 overflow-hidden bg-neutral-100">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                {discountPercent}% OFF
              </div>
            )}
          </div>
        )}
        
        {/* Content Section */}
        <div className="p-5">
          <h4 className="font-bold text-xl text-neutral-900 mb-2">{item.name}</h4>
          {item.description && (
            <p className="text-sm text-neutral-600 mb-4 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
          
          {/* Pricing */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl font-bold text-neutral-900">
              ${item.discountedPrice.toFixed(2)}
            </span>
            {item.originalPrice > item.discountedPrice && (
              <span className="text-base text-neutral-500 line-through">
                ${item.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Add to Cart Button */}
          <button className="w-full bg-neutral-900 text-white rounded-lg px-4 py-3 font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Happy Hour Banner */}
      {deal.context.isHappyHour && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Left Section */}
            <div className="flex items-center gap-3 flex-1">
              <Clock className="h-6 w-6 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold">Happy Hour Deals</h3>
                  {discountText && (
                    <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold">
                      {discountText}
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-90 mb-1">
                  {deal.description || `Order now and save big! Available ${happyHourTimeRange}${recurringDaysText ? ` on ${recurringDaysText}` : ' daily'}`}
                </p>
                {menuItemsCount > 0 && (
                  <p className="text-xs opacity-75">
                    {menuItemsCount} {menuItemsCount === 1 ? 'item' : 'items'} available
                  </p>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Check-ins Section */}
              {totalCheckIns > 0 && (
                <div className="text-center bg-pink-600/30 rounded-lg px-4 py-3 backdrop-blur-sm min-w-[180px]">
                  <p className="text-sm opacity-90 mb-2">
                    {totalCheckIns} {totalCheckIns === 1 ? 'person' : 'people'} checked in now
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="flex -space-x-2">
                      {displayedAvatars.map((checkIn: any, idx: number) => (
                        <div
                          key={checkIn.id || idx}
                          className="w-8 h-8 rounded-full bg-white/20 border-2 border-white overflow-hidden"
                        >
                          {checkIn.avatarUrl ? (
                            <img
                              src={checkIn.avatarUrl}
                              alt={checkIn.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/30 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {checkIn.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {remainingCount > 0 && (
                      <span className="text-sm font-semibold bg-white/20 rounded-full px-2 py-0.5">
                        +{remainingCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onNavigateToTab?.('leaderboard')}
                    className="flex items-center justify-center gap-1 text-sm underline hover:no-underline transition-all w-full"
                  >
                    <Trophy className="h-3 w-3" />
                    See Leaderboard
                  </button>
                </div>
              )}

              {/* Countdown Section */}
              {deal.status.isActive && (
                <div className="text-center bg-pink-600/30 rounded-lg px-4 py-3 backdrop-blur-sm min-w-[140px]">
                  <p className="text-xs opacity-90 mb-1 uppercase tracking-wide">ENDS IN</p>
                  <p className="text-2xl font-bold">
                    {String(timeRemaining.hours).padStart(2, '0')}h{' '}
                    {String(timeRemaining.minutes).padStart(2, '0')}m{' '}
                    {String(timeRemaining.seconds).padStart(2, '0')}s
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Feed with Marquee */}
      {deal.socialProof?.recentActivity && deal.socialProof.recentActivity.length > 0 && (
        <ActivityFeed
          activities={deal.socialProof.recentActivity.map((activity: any) => ({
            id: activity.id || activity.user?.id || Math.random(),
            name: activity.name || activity.user?.name || 'Anonymous',
            avatarUrl: activity.avatarUrl || activity.user?.avatarUrl,
            type: activity.type || (activity.checkedInAt ? 'checked_in' : 'saved'),
            timestamp: activity.savedAt || activity.checkedInAt,
          }))}
          dealTitle={deal.context?.isHappyHour ? 'Happy Hour' : deal.title}
          menuItems={menuItems}
        />
      )}

      {/* Daily Menu Banner */}
      {selectedSubMenu === 'daily' && (
        <div className="bg-blue-600 text-white rounded-xl p-4">
          <h3 className="text-lg font-bold mb-2">Daily Menu</h3>
          <p className="text-sm opacity-90">
            Breakfast (6am-11am) • Brunch (11am-3pm) • Dinner (5pm-10pm)
          </p>
        </div>
      )}

      {/* Sub-menu Navigation */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide border-b border-neutral-200">
        {subMenus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => menu.enabled && setSelectedSubMenu(menu.id)}
            disabled={!menu.enabled}
            className={cn(
              'px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              !menu.enabled && 'cursor-not-allowed opacity-50',
              selectedSubMenu === menu.id && menu.enabled
                ? 'border-orange-500 text-orange-600'
                : menu.enabled
                ? 'border-transparent text-neutral-600 hover:text-neutral-900'
                : 'border-transparent text-neutral-400'
            )}
          >
            {menu.label}
          </button>
        ))}
      </div>

      {/* Menu Items - Organized by meal type for Daily Menu */}
      {selectedSubMenu === 'daily' && filteredMenuItems.length > 0 ? (
        <div className="space-y-8">
          {(() => {
            const { breakfastItems, brunchItems, dinnerItems, otherItems } = organizeByMealType(filteredMenuItems);
            const sections = [
              { title: 'Breakfast', items: breakfastItems, timeRange: 'Available 6:00 AM - 11:00 AM' },
              { title: 'Brunch', items: brunchItems, timeRange: 'Available 11:00 AM - 3:00 PM' },
              { title: 'Dinner', items: dinnerItems, timeRange: 'Available 5:00 PM - 10:00 PM' },
            ].filter(section => section.items.length > 0);

            // If no items match meal types, show all items in a single section
            if (sections.length === 0 && filteredMenuItems.length > 0) {
              return (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenuItems.map((item) => renderMenuItemCard(item))}
                  </div>
                </div>
              );
            }

            return sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <h3 className="text-xl font-bold text-neutral-900">{section.title}</h3>
                </div>
                <p className="text-sm text-neutral-600 mb-4">{section.timeRange}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.items.map((item) => renderMenuItemCard(item))}
                </div>
              </div>
            ));
          })()}
        </div>
      ) : filteredMenuItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => renderMenuItemCard(item))}
        </div>
      ) : (
        <div className="text-center py-12 text-neutral-500">
          <p>No menu items available in this category.</p>
        </div>
      )}
    </div>
  );
};

