import { useState } from 'react';
import type { BusinessHours, HolidayHoursEntry } from '@/components/merchant/store-registration/storeRegistrationTypes';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { to12h, to24h } from '@/lib/formatUtils';
import { Plus, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const SHORT_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 15, 30, 45];

/** Parse a 24h string like "14:30" into {hour12, minute, period} */
function parse24h(time: string): { hour12: number; minute: number; period: 'AM' | 'PM' } {
  const [h, m] = time.split(':').map(Number);
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { hour12, minute: m, period };
}

interface TimePicker12Props {
  value: string; // 24h format "14:00"
  onChange: (val: string) => void;
  label?: string;
}

const TimePicker12 = ({ value, onChange, label }: TimePicker12Props) => {
  const { hour12, minute, period } = parse24h(value || '09:00');
  const nearestMin = MINUTES.reduce((prev, curr) =>
    Math.abs(curr - minute) < Math.abs(prev - minute) ? curr : prev
  );

  return (
    <div className="flex items-center gap-1">
      {label && <span className="sr-only">{label}</span>}
      {/* Hour */}
      <select
        value={hour12}
        onChange={(e) => onChange(to24h(Number(e.target.value), nearestMin, period))}
        className="rounded-lg border border-neutral-200 bg-white px-1.5 py-1.5 text-xs font-medium appearance-none cursor-pointer"
      >
        {HOURS_12.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className="text-neutral-400">:</span>
      {/* Minute */}
      <select
        value={nearestMin}
        onChange={(e) => onChange(to24h(hour12, Number(e.target.value), period))}
        className="rounded-lg border border-neutral-200 bg-white px-1.5 py-1.5 text-xs font-medium appearance-none cursor-pointer"
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>
      {/* AM/PM */}
      <div className="ml-0.5 flex rounded-lg border border-neutral-200 overflow-hidden">
        {(['AM', 'PM'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(to24h(hour12, nearestMin, p))}
            className={cn(
              'px-2 py-1.5 text-xs font-medium transition-colors',
              period === p
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-500 hover:bg-neutral-50'
            )}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

interface HoursSectionProps {
  hours: BusinessHours;
  onChange: (hours: BusinessHours) => void;
  isFoodTruck?: boolean;
  holidayHours?: HolidayHoursEntry[];
  onHolidayHoursChange?: (entries: HolidayHoursEntry[]) => void;
}

export const HoursSection = ({ hours, onChange, isFoodTruck, holidayHours = [], onHolidayHoursChange }: HoursSectionProps) => {
  const [showHoliday, setShowHoliday] = useState(false);

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

  const addHolidayEntry = () => {
    onHolidayHoursChange?.([
      ...holidayHours,
      { date: '', open: '09:00', close: '17:00', closed: true, label: '' },
    ]);
  };

  const updateHolidayEntry = (index: number, patch: Partial<HolidayHoursEntry>) => {
    const updated = [...holidayHours];
    updated[index] = { ...updated[index], ...patch };
    onHolidayHoursChange?.(updated);
  };

  const removeHolidayEntry = (index: number) => {
    onHolidayHoursChange?.(holidayHours.filter((_, i) => i !== index));
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
          Weekdays 9–5
        </button>
        <button type="button" onClick={() => setAll(['saturday', 'sunday'], '', '', true)} className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Closed weekends
        </button>
      </div>

      {/* Day rows */}
      <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100">
        {ALL_DAYS.map((day) => {
          const h = hours[day] || { open: '09:00', close: '17:00', closed: false };
          return (
            <div key={day} className="flex items-center gap-3 px-4 py-3">
              <span className="w-10 text-sm font-medium text-neutral-700">{SHORT_LABELS[day]}</span>
              <Switch
                checked={!h.closed}
                onCheckedChange={(checked) => setDay(day, 'closed', !checked)}
              />
              {h.closed ? (
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                  Closed
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <TimePicker12 value={h.open} onChange={(v) => setDay(day, 'open', v)} label="Opens" />
                  <span className="text-xs text-neutral-400">to</span>
                  <TimePicker12 value={h.close} onChange={(v) => setDay(day, 'close', v)} label="Closes" />
                </div>
              )}
              {!h.closed && (
                <span className="ml-auto hidden text-xs text-neutral-400 sm:block">
                  {to12h(h.open)} – {to12h(h.close)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Holiday hours */}
      {onHolidayHoursChange && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowHoliday(!showHoliday)}
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
          >
            <Calendar className="h-4 w-4" />
            Holiday hours
            <span className="text-xs font-normal text-neutral-400">
              ({holidayHours.length} {holidayHours.length === 1 ? 'entry' : 'entries'})
            </span>
          </button>

          {showHoliday && (
            <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-500">
                Add specific dates with different hours (e.g. holidays, special events).
              </p>
              {holidayHours.map((entry, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
                  <Input
                    type="date"
                    value={entry.date}
                    onChange={(e) => updateHolidayEntry(i, { date: e.target.value })}
                    className="h-9 w-36 text-xs"
                  />
                  <Input
                    value={entry.label || ''}
                    onChange={(e) => updateHolidayEntry(i, { label: e.target.value })}
                    placeholder="Label (e.g. Christmas)"
                    className="h-9 w-36 text-xs"
                  />
                  <Switch
                    checked={!entry.closed}
                    onCheckedChange={(checked) => updateHolidayEntry(i, { closed: !checked })}
                  />
                  <span className="text-xs text-neutral-500">{entry.closed ? 'Closed' : 'Open'}</span>
                  {!entry.closed && (
                    <>
                      <TimePicker12 value={entry.open} onChange={(v) => updateHolidayEntry(i, { open: v })} />
                      <span className="text-xs text-neutral-400">to</span>
                      <TimePicker12 value={entry.close} onChange={(v) => updateHolidayEntry(i, { close: v })} />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeHolidayEntry(i)}
                    className="ml-auto rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHolidayEntry}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-white"
              >
                <Plus className="h-3.5 w-3.5" />
                Add holiday
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
