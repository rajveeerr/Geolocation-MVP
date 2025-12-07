// web/src/components/deals/ActivityFeed.tsx
import { MapPin, ShoppingCart, Coins, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface ActivityItem {
  id: number | string;
  name: string;
  avatarUrl?: string | null;
  type: 'checked_in' | 'saved' | 'ordered' | 'earned_coins';
  action?: string;
  item?: string;
  amount?: number;
  timestamp?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  dealTitle?: string;
  menuItems?: Array<{ name: string }>;
  className?: string;
}

export const ActivityFeed = ({ activities, dealTitle, menuItems, className }: ActivityFeedProps) => {
  // Enhance activities with mock orders and coin earnings for demo
  const enhancedActivities = useMemo(() => {
    if (!activities || activities.length === 0) return [];
    
    const enhanced: ActivityItem[] = [...activities];
    
    // Add mock order activities (30% chance per check-in)
    activities
      .filter(a => a.type === 'checked_in')
      .slice(0, 2)
      .forEach((checkIn) => {
        if (Math.random() > 0.7 && menuItems && menuItems.length > 0) {
          const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
          enhanced.push({
            id: `order-${checkIn.id}`,
            name: checkIn.name,
            avatarUrl: checkIn.avatarUrl,
            type: 'ordered',
            item: randomItem.name,
          });
        }
      });
    
    // Add mock coin earning activities (20% chance per check-in)
    activities
      .filter(a => a.type === 'checked_in')
      .slice(0, 1)
      .forEach((checkIn) => {
        if (Math.random() > 0.8) {
          enhanced.push({
            id: `coins-${checkIn.id}`,
            name: checkIn.name,
            avatarUrl: checkIn.avatarUrl,
            type: 'earned_coins',
            amount: Math.floor(Math.random() * 100) + 25, // 25-125 coins
          });
        }
      });
    
    // Sort by timestamp (most recent first)
    return enhanced.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : Date.now();
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : Date.now();
      return timeB - timeA;
    });
  }, [activities, menuItems]);

  if (enhancedActivities.length === 0) return null;

  // Format activity text
  const formatActivity = (activity: ActivityItem) => {
    const firstName = activity.name?.split(' ')[0] || 'Someone';
    const lastName = activity.name?.split(' ')[1]?.[0] || '';
    const displayName = `${firstName}${lastName ? ` ${lastName}.` : ''}`;

    switch (activity.type) {
      case 'checked_in':
        return {
          text: `${displayName} checked in`,
          highlight: dealTitle || 'Happy Hour',
          icon: MapPin,
          emoji: '✨✨',
        };
      case 'ordered':
        return {
          text: `${displayName} just ordered`,
          highlight: activity.item || 'an item',
          icon: ShoppingCart,
          emoji: '🍟',
        };
      case 'earned_coins':
        return {
          text: `${displayName} earned`,
          highlight: `${activity.amount || 50} coins`,
          icon: Coins,
          emoji: '🪙',
        };
      case 'saved':
        return {
          text: `${displayName} saved`,
          highlight: 'this deal',
          icon: Heart,
          emoji: '❤️',
        };
      default:
        return {
          text: `${displayName} interacted`,
          highlight: 'with this deal',
          icon: Heart,
          emoji: '✨',
        };
    }
  };

  // Only show marquee if we have enough activities (3+)
  // For seamless loop, duplicate once only if we have enough items
  const shouldAnimate = enhancedActivities.length >= 3;
  const displayActivities = shouldAnimate 
    ? [...enhancedActivities, ...enhancedActivities] // Duplicate once for seamless loop
    : enhancedActivities; // Show as-is if not enough for marquee

  return (
    <div className={cn('relative overflow-hidden bg-white border-2 border-yellow-400 rounded-xl p-4', className)}>
      <div className={cn(
        'flex items-center gap-3 whitespace-nowrap',
        shouldAnimate && 'animate-marquee'
      )}>
        {displayActivities.map((activity, idx) => {
          const formatted = formatActivity(activity);
          // Use original index for key to avoid duplicate keys
          const uniqueKey = shouldAnimate && idx >= enhancedActivities.length
            ? `${activity.id}-dup-${idx - enhancedActivities.length}`
            : `${activity.id}-${idx}`;
          
          return (
            <div
              key={uniqueKey}
              className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-lg flex-shrink-0 mr-3 shadow-sm border border-neutral-200"
            >
              <div className="w-10 h-10 rounded-full bg-neutral-100 border-2 border-orange-500 flex-shrink-0 overflow-hidden">
                {activity.avatarUrl ? (
                  <img
                    src={activity.avatarUrl}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <span className="text-neutral-600 text-xs font-semibold">
                      {activity.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-neutral-900 text-sm font-medium">
                <span>{formatted.text}</span>
                <span className="font-semibold text-orange-600">{formatted.highlight}</span>
                <span className="text-base leading-none">{formatted.emoji}</span>
              </div>
            </div>
          );
        })}
      </div>
      {shouldAnimate && (
        <style>{`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee ${Math.max(20, enhancedActivities.length * 2)}s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
      )}
    </div>
  );
};

