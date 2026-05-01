import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));
const minuteOptions = ['00', '15', '30', '45'];

export const to12HourParts = (value: string) => {
  if (!value || typeof value !== 'string') {
    return { hour: '', minute: '00', period: 'AM' as 'AM' | 'PM' };
  }

  const trimmed = value.trim().toUpperCase();
  const withPeriodMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (withPeriodMatch) {
    const hour12 = Number(withPeriodMatch[1]);
    const minute = withPeriodMatch[2]!;
    const period = withPeriodMatch[3] as 'AM' | 'PM';
    if (!Number.isFinite(hour12) || hour12 < 1 || hour12 > 12) {
      return { hour: '', minute: '00', period: 'AM' as 'AM' | 'PM' };
    }
    return { hour: String(hour12).padStart(2, '0'), minute, period };
  }

  const twentyFourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!twentyFourMatch) {
    return { hour: '', minute: '00', period: 'AM' as 'AM' | 'PM' };
  }

  const hour24 = Number(twentyFourMatch[1]);
  const minute = twentyFourMatch[2]!;
  if (!Number.isFinite(hour24) || hour24 < 0 || hour24 > 23) {
    return { hour: '', minute: '00', period: 'AM' as 'AM' | 'PM' };
  }

  const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour24 % 12 || 12;
  return { hour: String(normalizedHour).padStart(2, '0'), minute, period };
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
  const baseSelectClassName =
    'h-10 w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 pr-8 text-base font-semibold text-neutral-900 outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100';

  return (
    <div className={className ?? 'space-y-2'}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_minmax(72px,0.9fr)] items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2">
        <div className="relative">
          <select
            id={id}
            value={parts.hour}
            onChange={(e) => onChange(from12HourParts(e.target.value, parts.minute, parts.period))}
            className={baseSelectClassName}
          >
            <option value="">Hour</option>
            {hourOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
        <span className="px-0.5 text-center text-xl font-semibold text-neutral-400">:</span>
        <div className="relative">
          <select
            value={parts.minute}
            onChange={(e) => onChange(from12HourParts(parts.hour, e.target.value, parts.period))}
            className={baseSelectClassName}
          >
            {minuteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
        <div className="relative">
          <select
            value={parts.period}
            onChange={(e) => onChange(from12HourParts(parts.hour, parts.minute, e.target.value as 'AM' | 'PM'))}
            className="h-10 w-full appearance-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 pr-7 text-base font-semibold text-neutral-900 outline-none transition focus:border-brand-primary-400 focus:ring-2 focus:ring-brand-primary-100"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>
    </div>
  );
};

export default TwelveHourTimeField;
