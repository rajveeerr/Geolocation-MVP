import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TwelveHourTimeField, to12HourParts, from12HourParts } from './TwelveHourTimeField';

interface TwelveHourDateTimeFieldProps {
  /** Local date-time string in the same shape <input type="datetime-local"> uses: "YYYY-MM-DDTHH:mm". */
  value: string;
  onChange: (next: string) => void;
  label?: string;
  id?: string;
  min?: string; // YYYY-MM-DD
  className?: string;
}

const splitDateTime = (value: string): { date: string; time: string } => {
  if (!value || typeof value !== 'string') return { date: '', time: '' };
  const [date = '', time = ''] = value.split('T');
  return { date, time };
};

const joinDateTime = (date: string, time: string): string => {
  if (!date) return '';
  return time ? `${date}T${time}` : `${date}T00:00`;
};

/**
 * Date + 12-hour time picker. Emits the same shape as <input type="datetime-local">
 * ("YYYY-MM-DDTHH:mm"), so existing consumers that pass the value into `new Date(...)`
 * keep working unchanged.
 */
export const TwelveHourDateTimeField = ({
  value,
  onChange,
  label,
  id,
  min,
  className,
}: TwelveHourDateTimeFieldProps) => {
  const { date, time } = splitDateTime(value);

  const handleDateChange = (nextDate: string) => {
    onChange(joinDateTime(nextDate, time || '00:00'));
  };

  const handleTimeChange = (nextTime: string) => {
    if (!nextTime) {
      // Time cleared — preserve date with midnight default
      onChange(joinDateTime(date, ''));
      return;
    }
    // Normalize via the helpers so we always store 24h "HH:mm" internally.
    const parts = to12HourParts(nextTime);
    const normalized = from12HourParts(parts.hour, parts.minute, parts.period);
    onChange(joinDateTime(date, normalized || nextTime));
  };

  return (
    <div className={className ?? 'space-y-2'}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="grid gap-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]">
        <Input
          id={id}
          type="date"
          value={date}
          min={min}
          onChange={(e) => handleDateChange(e.target.value)}
          className="h-11"
          lang="en-US"
        />
        <TwelveHourTimeField value={time} onChange={handleTimeChange} className="" />
      </div>
    </div>
  );
};

export default TwelveHourDateTimeField;
