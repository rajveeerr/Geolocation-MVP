import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/hooks/useTableBooking';

interface WeeklyScheduleGridProps {
  timeSlots: TimeSlot[];
  onEdit: (slot: TimeSlot) => void;
  onDelete: (slotId: number) => void;
  onCreate: (dayOfWeek: number, time: string) => void;
}

const DAYS_OF_WEEK = [
  { name: 'Sunday', short: 'Sun', value: 0 },
  { name: 'Monday', short: 'Mon', value: 1 },
  { name: 'Tuesday', short: 'Tue', value: 2 },
  { name: 'Wednesday', short: 'Wed', value: 3 },
  { name: 'Thursday', short: 'Thu', value: 4 },
  { name: 'Friday', short: 'Fri', value: 5 },
  { name: 'Saturday', short: 'Sat', value: 6 },
];

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', 
  '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const WeeklyScheduleGrid = ({ timeSlots, onEdit, onDelete, onCreate }: WeeklyScheduleGridProps) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; time: string } | null>(null);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getSlotsForDayAndTime = (dayOfWeek: number, time: string) => {
    return timeSlots.filter(slot => 
      slot.dayOfWeek === dayOfWeek && 
      slot.startTime === time
    );
  };

  const handleCellClick = (dayOfWeek: number, time: string) => {
    const existingSlots = getSlotsForDayAndTime(dayOfWeek, time);
    if (existingSlots.length > 0) {
      // If there are existing slots, edit the first one
      onEdit(existingSlots[0]);
    } else {
      // If no slots exist, create a new one
      onCreate(dayOfWeek, time);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Weekly Schedule
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Click on any cell to add or edit time slots. Hover to see details.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-sm font-medium text-muted-foreground p-2">Time</div>
              {DAYS_OF_WEEK.map(day => (
                <div key={day.value} className="text-sm font-medium text-center p-2">
                  {day.short}
                </div>
              ))}
            </div>

            {/* Time Rows */}
            {TIME_SLOTS.map(time => (
              <div key={time} className="grid grid-cols-8 gap-1 mb-1">
                {/* Time Column */}
                <div className="text-sm text-muted-foreground p-2 text-right">
                  {formatTime(time)}
                </div>

                {/* Day Columns */}
                {DAYS_OF_WEEK.map(day => {
                  const slots = getSlotsForDayAndTime(day.value, time);
                  const isHovered = hoveredCell?.day === day.value && hoveredCell?.time === time;
                  
                  return (
                    <div
                      key={`${day.value}-${time}`}
                      className={cn(
                        "min-h-[40px] border border-neutral-200 rounded cursor-pointer transition-colors",
                        slots.length > 0 
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100" 
                          : "hover:bg-neutral-50",
                        isHovered && "ring-2 ring-blue-300"
                      )}
                      onClick={() => handleCellClick(day.value, time)}
                      onMouseEnter={() => setHoveredCell({ day: day.value, time })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {slots.length > 0 ? (
                        <div className="p-1 space-y-1">
                          {slots.map(slot => (
                            <div
                              key={slot.id}
                              className="bg-blue-500 text-white text-xs p-1 rounded flex items-center justify-between"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(slot);
                              }}
                            >
                              <span className="truncate">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </span>
                              <div className="flex gap-1">
                                <Edit className="h-3 w-3" />
                                <Trash2 
                                  className="h-3 w-3 hover:text-red-200" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(slot.id);
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          {isHovered && (
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Time slot configured</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-neutral-200 rounded"></div>
            <span>Available to configure</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {timeSlots.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Slots</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {new Set(timeSlots.map(slot => slot.dayOfWeek)).size}
            </div>
            <div className="text-sm text-muted-foreground">Active Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {timeSlots.reduce((sum, slot) => sum + slot.maxBookings, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Max Bookings</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
