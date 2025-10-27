import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlotQuickCardProps {
  merchantId: number;
  merchantName: string;
  slot: {
    id: number;
    startTime: string;
    endTime: string;
    availableSpots: number;
  };
  date: string;
  onBook?: () => void;
  compact?: boolean;
}

export const TimeSlotQuickCard = ({ 
  merchantId, 
  merchantName, 
  slot, 
  date, 
  onBook,
  compact = false 
}: TimeSlotQuickCardProps) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isLowAvailability = slot.availableSpots <= 1;
  const isFullyBooked = slot.availableSpots === 0;

  return (
    <div 
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-colors duration-200",
        compact ? "p-2" : "p-3",
        isFullyBooked 
          ? "border-red-200 bg-red-50 cursor-not-allowed opacity-60" 
          : isLowAvailability
          ? "border-orange-200 bg-orange-50 hover:bg-orange-100 cursor-pointer"
          : "border-orange-200 bg-orange-50 hover:bg-orange-100 cursor-pointer"
      )}
      onClick={!isFullyBooked ? onBook : undefined}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Clock className={cn("text-neutral-600", compact ? "h-3 w-3" : "h-4 w-4")} />
          <span className={cn("font-semibold text-neutral-800", compact ? "text-sm" : "text-base")}>
            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Users className={cn("text-neutral-500", compact ? "h-3 w-3" : "h-4 w-4")} />
          <Badge 
            variant={isFullyBooked ? "destructive" : isLowAvailability ? "secondary" : "default"}
            className={cn("text-xs", compact ? "px-1 py-0" : "px-2 py-1")}
          >
            {isFullyBooked ? "Fully booked" : `${slot.availableSpots} spot${slot.availableSpots === 1 ? '' : 's'} available`}
          </Badge>
        </div>
      </div>
      
      {!isFullyBooked && (
        <Button 
          size={compact ? "sm" : "default"}
          className={cn(
            "ml-3 flex-shrink-0 bg-orange-600 hover:bg-orange-700 text-white",
            compact ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onBook?.();
          }}
        >
          Book
        </Button>
      )}
    </div>
  );
};
