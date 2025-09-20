import { cn } from '@/lib/utils';

// Define the days of the week with both the full value and the display label
const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Mon' },
  { value: 'TUESDAY', label: 'Tue' },
  { value: 'WEDNESDAY', label: 'Wed' },
  { value: 'THURSDAY', label: 'Thu' },
  { value: 'FRIDAY', label: 'Fri' },
  { value: 'SATURDAY', label: 'Sat' },
  { value: 'SUNDAY', label: 'Sun' },
];

interface DayOfWeekSelectorProps {
  selectedDays: string[]; // Expects full day names like "MONDAY"
  onDayToggle: (day: string) => void;
}

export const DayOfWeekSelector = ({ selectedDays, onDayToggle }: DayOfWeekSelectorProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-neutral-100 p-2">
      {DAYS_OF_WEEK.map((day) => {
        const isSelected = selectedDays.includes(day.value);
        return (
          <button
            key={day.value}
            onClick={() => onDayToggle(day.value)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors sm:flex-initial',
              isSelected
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:bg-neutral-200'
            )}
            aria-pressed={isSelected}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
};

export default DayOfWeekSelector;
