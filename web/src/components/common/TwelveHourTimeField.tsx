import { Label } from '@/components/ui/label';

const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1));
const minuteOptions = ['00', '15', '30', '45'];

export const to12HourParts = (value: string) => {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return { hour: '', minute: '00', period: 'AM' as 'AM' | 'PM' };
  }

  const [hourString, minute] = value.split(':');
  const hour24 = Number(hourString);
  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour24 % 12 || 12;

  return { hour: String(normalizedHour), minute, period };
};

export const from12HourParts = (hour: string, minute: string, period: 'AM' | 'PM') => {
  if (!hour) return '';

  const hourNumber = Number(hour);
  if (!Number.isFinite(hourNumber)) return '';

  let hour24 = hourNumber % 12;
  if (period === 'PM') hour24 += 12;

  return `${String(hour24).padStart(2, '0')}:${minute}`;
};

interface TwelveHourTimeFieldProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TwelveHourTimeField = ({
  id,
  label,
  value,
  onChange,
  className,
}: TwelveHourTimeFieldProps) => {
  const parts = to12HourParts(value);

  return (
    <div className={className ?? 'space-y-2'}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2">
        <select
          id={id}
          value={parts.hour}
          onChange={(e) => onChange(from12HourParts(e.target.value, parts.minute, parts.period))}
          className="bg-transparent text-sm text-neutral-900 outline-none"
        >
          <option value="">Hour</option>
          {hourOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-neutral-400">:</span>
        <select
          value={parts.minute}
          onChange={(e) => onChange(from12HourParts(parts.hour, e.target.value, parts.period))}
          className="bg-transparent text-sm text-neutral-900 outline-none"
        >
          {minuteOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={parts.period}
          onChange={(e) => onChange(from12HourParts(parts.hour, parts.minute, e.target.value as 'AM' | 'PM'))}
          className="bg-transparent text-sm font-medium text-neutral-900 outline-none"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
};

export default TwelveHourTimeField;
