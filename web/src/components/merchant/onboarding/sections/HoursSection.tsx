import type { BusinessHours } from '@/components/merchant/store-registration/storeRegistrationTypes';
import { cn } from '@/lib/utils';

const TIMES = ['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'];

const ALL_DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const WEEKDAYS = ['monday','tuesday','wednesday','thursday','friday'];
const SHORT_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

interface HoursSectionProps {
  hours: BusinessHours;
  onChange: (hours: BusinessHours) => void;
  isFoodTruck?: boolean;
}

export const HoursSection = ({ hours, onChange, isFoodTruck }: HoursSectionProps) => {
  const setAll = (days: string[], open: string, close: string, closed: boolean) => {
    const updated = { ...hours };
    days.forEach((day) => { updated[day] = { ...updated[day], open, close, closed }; });
    onChange(updated);
  };

  const setDay = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const updated = { ...hours, [day]: { ...hours[day], [field]: value } };
    onChange(updated);
  };

  const copySameEveryDay = () => {
    const mon = hours.monday || { open: '09:00', close: '17:00', closed: false };
    setAll(ALL_DAYS, mon.open, mon.close, mon.closed);
  };

  const copyWeekdaysToWeekend = () => {
    const mon = hours.monday || { open: '09:00', close: '17:00', closed: false };
    setAll(['saturday', 'sunday'], mon.open, mon.close, mon.closed);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-neutral-700">
          {isFoodTruck ? 'Typical hours (location may vary)' : 'Operating hours'}
        </h3>
        <p className="text-xs text-neutral-500">Set weekly hours — quick presets available</p>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copySameEveryDay} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Same hours every day
        </button>
        <button type="button" onClick={() => setAll(WEEKDAYS, '09:00', '17:00', false)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Weekdays 9-5
        </button>
        <button type="button" onClick={copyWeekdaysToWeekend} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Copy weekdays → weekend
        </button>
        <button type="button" onClick={() => setAll(['saturday', 'sunday'], '', '', true)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Closed weekends
        </button>
      </div>

      {/* Day rows */}
      <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-200">
        {ALL_DAYS.map((day) => {
          const h = hours[day] || { open: '09:00', close: '17:00', closed: false };
          return (
            <div key={day} className="flex items-center gap-3 px-4 py-3">
              <span className="w-10 text-sm font-medium text-neutral-700">{SHORT_LABELS[day]}</span>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={!h.closed}
                  onChange={(e) => setDay(day, 'closed', !e.target.checked)}
                  className="rounded border-neutral-300"
                />
                <span className={cn('text-xs', h.closed ? 'text-neutral-400' : 'text-neutral-700')}>
                  {h.closed ? 'Closed' : 'Open'}
                </span>
              </label>
              {!h.closed && (
                <>
                  <select
                    value={h.open}
                    onChange={(e) => setDay(day, 'open', e.target.value)}
                    className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs"
                  >
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <span className="text-xs text-neutral-400">to</span>
                  <select
                    value={h.close}
                    onChange={(e) => setDay(day, 'close', e.target.value)}
                    className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs"
                  >
                    {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
