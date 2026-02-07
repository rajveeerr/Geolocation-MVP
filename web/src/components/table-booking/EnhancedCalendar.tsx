import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';

interface EnhancedCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  disabledDates?: (date: Date) => boolean;
  className?: string;
}

export const EnhancedCalendar = ({ 
  selectedDate, 
  onDateSelect, 
  disabledDates,
  className = '' 
}: EnhancedCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [secondMonth, setSecondMonth] = useState(addMonths(new Date(), 1));

  const navigateMonths = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
      setSecondMonth(subMonths(secondMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
      setSecondMonth(addMonths(secondMonth, 1));
    }
  };

  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = start.getDay();
    const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);
    
    return [...emptyDays, ...days];
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const isPast = isBefore(date, today);
    const isCustomDisabled = disabledDates ? disabledDates(date) : false;
    return isPast || isCustomDisabled;
  };

  const renderCalendar = (month: Date, isSecondMonth: boolean = false) => {
    const days = getDaysInMonth(month);
    const monthName = format(month, 'MMMM yyyy');
    
    return (
      <div className={`flex flex-col w-full`}>
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-800">{monthName}</h3>
        </div>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-10 w-10" />;
            }
            
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, month);
            const isTodayDate = isToday(day);
            const isDisabled = isDateDisabled(day);
            
            return (
              <Button
                key={day.toISOString()}
                variant="ghost"
                size="sm"
                className={`
                  h-10 w-10 p-0 text-sm font-medium rounded-md flex items-center justify-center
                  ${!isCurrentMonth ? 'text-neutral-300' : ''}
                  ${isTodayDate ? 'bg-red-100 text-red-800 font-bold' : ''}
                  ${isSelected ? 'bg-red-800 text-white font-bold hover:bg-red-900' : ''}
                  ${isDisabled ? 'text-neutral-300 cursor-not-allowed' : 'hover:bg-red-50'}
                  ${!isDisabled && isCurrentMonth && !isSelected && !isTodayDate ? 'text-neutral-800' : ''}
                `}
                disabled={isDisabled}
                onClick={() => !isDisabled && onDateSelect(day)}
              >
                {day.getDate()}
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonths('prev')}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="text-sm text-neutral-600">
          {format(currentMonth, 'MMMM yyyy')} - {format(secondMonth, 'MMMM yyyy')}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonths('next')}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Dual Calendar */}
      <div className="flex gap-12">
        {renderCalendar(currentMonth)}
        {renderCalendar(secondMonth, true)}
      </div>
    </div>
  );
};
