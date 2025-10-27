import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import type { Booking } from '@/hooks/useTableBooking';

interface BookingCalendarViewProps {
  bookings: Booking[];
  onDateClick: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '⏳';
    case 'CONFIRMED':
      return '✅';
    case 'CANCELLED':
      return '❌';
    case 'COMPLETED':
      return '🎉';
    default:
      return '📅';
  }
};

export const BookingCalendarView = ({ bookings, onDateClick, onBookingClick }: BookingCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return isSameDay(bookingDate, date);
    });
  };

  // Get booking counts by status for a date
  const getBookingStats = (date: Date) => {
    const dateBookings = getBookingsForDate(date);
    const stats = {
      pending: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
      total: dateBookings.length
    };

    dateBookings.forEach(booking => {
      switch (booking.status) {
        case 'PENDING':
          stats.pending++;
          break;
        case 'CONFIRMED':
          stats.confirmed++;
          break;
        case 'CANCELLED':
          stats.cancelled++;
          break;
        case 'COMPLETED':
          stats.completed++;
          break;
      }
    });

    return stats;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-sm font-medium text-center p-2 text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map(day => {
            const dayBookings = getBookingsForDate(day);
            const stats = getBookingStats(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[100px] border border-neutral-200 rounded p-2 cursor-pointer transition-colors",
                  !isCurrentMonth && "opacity-30",
                  isToday && "bg-blue-50 border-blue-300",
                  dayBookings.length > 0 && "bg-green-50 hover:bg-green-100",
                  dayBookings.length === 0 && "hover:bg-neutral-50"
                )}
                onClick={() => onDateClick(day)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday && "text-blue-600 font-bold"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {stats.total > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {stats.total}
                    </Badge>
                  )}
                </div>

                {/* Booking Indicators */}
                {dayBookings.length > 0 && (
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map(booking => (
                      <div
                        key={booking.id}
                        className={cn(
                          "text-xs p-1 rounded border cursor-pointer hover:shadow-sm",
                          getStatusColor(booking.status)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick(booking);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>{getStatusIcon(booking.status)}</span>
                          <span className="truncate">
                            {booking.timeSlot.startTime} - {booking.table.name}
                          </span>
                        </div>
                        <div className="text-xs opacity-75">
                          {booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}
                        </div>
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayBookings.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
            <span>Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
            <span>Cancelled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
            <span>Completed</span>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter(b => b.status === 'CANCELLED').length}
            </div>
            <div className="text-sm text-muted-foreground">Cancelled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
