// web/src/hooks/useHappyHourTimer.ts
import { useState, useEffect } from 'react';

interface HappyHourTimerResult {
  hours: number;
  minutes: number;
  seconds: number;
  isActive: boolean;
  formatted: string;
}

interface DealWithHappyHour {
  dealType?: string | { name: string };
  startTime?: string;
  endTime?: string;
  recurringDays?: string[];
  status?: {
    isActive: boolean;
    timeRemaining?: {
      total: number;
      hours: number;
      minutes: number;
      formatted: string;
    };
  };
  expiresAt?: string;
}

/**
 * Calculate the next happy hour occurrence for recurring deals
 */
function getNextHappyHourTime(
  startTime: string,
  endTime: string,
  recurringDays: string[]
): Date | null {
  if (!recurringDays || recurringDays.length === 0) {
    return null;
  }

  const now = new Date();
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const currentDay = dayNames[now.getDay()];
  
  // Parse start and end times
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  
  // Extract time components
  const startHours = startDate.getHours();
  const startMinutes = startDate.getMinutes();
  const endHours = endDate.getHours();
  const endMinutes = endDate.getMinutes();

  // Check if today is a recurring day and if we're before the end time
  const isTodayRecurring = recurringDays.some(day => 
    day.toUpperCase() === currentDay || 
    day.toUpperCase().includes(currentDay)
  );

  if (isTodayRecurring) {
    // Check if we're currently in the happy hour window
    const todayStart = new Date(now);
    todayStart.setHours(startHours, startMinutes, 0, 0);
    
    const todayEnd = new Date(now);
    todayEnd.setHours(endHours, endMinutes, 0, 0);
    
    // If end time is before start time, it means it spans midnight
    if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) {
      todayEnd.setDate(todayEnd.getDate() + 1);
    }
    
    // If we're currently in the window, return the end time
    if (now >= todayStart && now < todayEnd) {
      return todayEnd;
    }
    
    // If we're past today's end time, find next occurrence
    if (now >= todayEnd) {
      // Find next recurring day
      for (let i = 1; i <= 7; i++) {
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + i);
        const nextDay = dayNames[nextDate.getDay()];
        
        if (recurringDays.some(day => 
          day.toUpperCase() === nextDay || 
          day.toUpperCase().includes(nextDay)
        )) {
          const nextStart = new Date(nextDate);
          nextStart.setHours(startHours, startMinutes, 0, 0);
          return nextStart;
        }
      }
    } else {
      // We're before today's start time, return today's start
      return todayStart;
    }
  } else {
    // Today is not a recurring day, find next occurrence
    for (let i = 1; i <= 7; i++) {
      const nextDate = new Date(now);
      nextDate.setDate(nextDate.getDate() + i);
      const nextDay = dayNames[nextDate.getDay()];
      
      if (recurringDays.some(day => 
        day.toUpperCase() === nextDay || 
        day.toUpperCase().includes(nextDay)
      )) {
        const nextStart = new Date(nextDate);
        nextStart.setHours(startHours, startMinutes, 0, 0);
        return nextStart;
      }
    }
  }

  return null;
}

/**
 * Hook to calculate countdown timer for Happy Hour deals
 */
export function useHappyHourTimer(deal: DealWithHappyHour): HappyHourTimerResult {
  const [timer, setTimer] = useState<HappyHourTimerResult>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isActive: false,
    formatted: '00.00.00',
  });

  useEffect(() => {
    if (!deal) {
      return;
    }

    const normalizedDealType = typeof deal.dealType === 'string' 
      ? deal.dealType.toLowerCase() 
      : deal.dealType?.name?.toLowerCase() || '';
    
    const isHappyHour = normalizedDealType.includes('happy');

    if (!isHappyHour) {
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      
      // If deal has status.timeRemaining, use that (most accurate) - works for both active and upcoming
      if (deal.status?.timeRemaining) {
        const remaining = deal.status.timeRemaining;
        const totalSeconds = Math.floor(remaining.total / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        setTimer({
          hours,
          minutes,
          seconds,
          isActive: deal.status.isActive || false,
          formatted: `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`,
        });
        return;
      }

      // For recurring happy hour deals, calculate next occurrence
      if (deal.recurringDays && deal.recurringDays.length > 0 && deal.startTime && deal.endTime) {
        const nextTime = getNextHappyHourTime(deal.startTime, deal.endTime, deal.recurringDays);
        
        if (nextTime) {
          const diff = nextTime.getTime() - now.getTime();
          
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            // Check if we're currently in the active window
            const startDate = new Date(deal.startTime);
            const endDate = new Date(deal.endTime);
            const isCurrentlyActive = now >= startDate && now <= endDate;
            
            setTimer({
              hours,
              minutes,
              seconds,
              isActive: isCurrentlyActive,
              formatted: `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`,
            });
            return;
          }
        }
      }

      // Fallback to expiresAt if available
      if (deal.expiresAt) {
        const endDate = new Date(deal.expiresAt);
        const diff = endDate.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setTimer({
            hours,
            minutes,
            seconds,
            isActive: deal.status?.isActive || false,
            formatted: `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`,
          });
          return;
        }
      }

      // Fallback to endTime if available
      if (deal.endTime) {
        const endDate = new Date(deal.endTime);
        const diff = endDate.getTime() - now.getTime();
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setTimer({
            hours,
            minutes,
            seconds,
            isActive: deal.status?.isActive || false,
            formatted: `${String(hours).padStart(2, '0')}.${String(minutes).padStart(2, '0')}.${String(seconds).padStart(2, '0')}`,
          });
          return;
        }
      }

      // No valid timer
      setTimer({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isActive: false,
        formatted: '00.00.00',
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deal]);

  return timer;
}

