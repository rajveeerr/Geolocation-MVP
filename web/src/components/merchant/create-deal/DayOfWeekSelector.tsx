import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DayOfWeekSelector: React.FC<{ selectedDays: string[]; onDayToggle: (day: string) => void }> = ({ selectedDays, onDayToggle }) => {
  return (
    <div className="flex gap-2">
      {DAYS.map((d) => {
        const selected = selectedDays.includes(d);
        return (
          <button key={d} onClick={() => onDayToggle(d)} className={`px-3 py-1 rounded ${selected ? 'bg-black text-white' : 'bg-neutral-100'}`}>
            {d}
          </button>
        );
      })}
    </div>
  );
};

export default DayOfWeekSelector;
