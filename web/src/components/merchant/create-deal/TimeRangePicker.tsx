import { DealCreationContext } from '@/context/DealCreationContext';
import { HappyHourContext } from '@/context/HappyHourContext';
import { useContext } from 'react';
import { Button } from '@/components/common/Button';
import { Plus, X } from 'lucide-react';

export const TimeRangePicker = () => {
  // Prefer the DealCreationContext; fall back to HappyHourContext if present
  const dealCtx = useContext(DealCreationContext as any);
  const hhCtx = useContext(HappyHourContext as any);

  const context = dealCtx ?? hhCtx;
  if (!context) {
    throw new Error('TimeRangePicker must be used within a DealCreationProvider or HappyHourProvider');
  }

  type TR = { id: number; start: string; end: string; day?: string }[];
  const { state, dispatch } = context as { state: { timeRanges: TR; selectedMenuItems?: any[] }; dispatch: any };

  return (
    <div className="space-y-3">
      {state.timeRanges.map((range, index) => (
        <div key={range.id} className="flex items-center gap-2">
          <select value={range.day ?? 'All'} onChange={(e) => dispatch({ type: 'UPDATE_TIME_RANGE', payload: { id: range.id, field: 'day', value: e.target.value }})} className="h-11 rounded-lg border border-neutral-300 bg-white px-3">
            <option value="All">All</option>
            <option value="Mon">Mon</option>
            <option value="Tue">Tue</option>
            <option value="Wed">Wed</option>
            <option value="Thu">Thu</option>
            <option value="Fri">Fri</option>
            <option value="Sat">Sat</option>
            <option value="Sun">Sun</option>
          </select>
          <input type="time" value={range.start} onChange={(e) => dispatch({ type: 'UPDATE_TIME_RANGE', payload: { id: range.id, field: 'start', value: e.target.value }})} className="input-class" />
          <span>to</span>
          <input type="time" value={range.end} onChange={(e) => dispatch({ type: 'UPDATE_TIME_RANGE', payload: { id: range.id, field: 'end', value: e.target.value }})} className="input-class" />
          {index > 0 && (
            <Button onClick={() => dispatch({ type: 'REMOVE_TIME_RANGE', payload: { id: range.id }})} variant="ghost" size="sm" className="text-status-expired">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button onClick={() => dispatch({ type: 'ADD_TIME_RANGE' })} variant="secondary" className="rounded-lg">
        <Plus className="mr-2 h-4 w-4" />
        Add another day
      </Button>
    </div>
  );
};

// Add this CSS to global.css or a relevant style file:
// .input-class { @apply h-11 w-full rounded-lg border border-neutral-300 bg-white px-3; }
