// src/components/merchant/create-deal/DealScheduleStep.tsx
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { ChevronDown } from 'lucide-react';

export const DealScheduleStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  // Helper: split an ISO datetime-local string into date and time parts
  const splitDateTime = (iso?: string) => {
    if (!iso) return { date: '', time: '' };
    // Accept formats like '2025-09-11T14:30' or full ISO
    const [datePart, timePart] = iso.split('T');
    if (!timePart) return { date: iso, time: '' };
    return { date: datePart, time: timePart.slice(0,5) };
  };

  // Helper: get current local date and time parts (YYYY-MM-DD, HH:MM)
  const getNowParts = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return { date, time };
  };

  // Helper: default end time is +1 hour from now (or +1 hour from given start)
  const getDefaultEndParts = (from?: { date: string; time: string }) => {
    let base: Date;
    if (from && from.date) {
      const t = from.time || '00:00';
      base = new Date(`${from.date}T${t}`);
    } else {
      base = new Date();
    }
    base = new Date(base.getTime() + 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const date = `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
    const time = `${pad(base.getHours())}:${pad(base.getMinutes())}`;
    return { date, time };
  };

  // Local UI state for controlled date + time inputs
  const initialStart = state.startTime ? splitDateTime(state.startTime) : getNowParts();
  const initialEnd = state.endTime ? splitDateTime(state.endTime) : getDefaultEndParts(initialStart);

  const [startDate, setStartDate] = useState(initialStart.date);
  const [startTime, setStartTime] = useState(initialStart.time);
  const [endDate, setEndDate] = useState(initialEnd.date);
  const [endTime, setEndTime] = useState(initialEnd.time);

  // When local date/time change, combine and update global state.startTime/state.endTime
  useEffect(() => {
    if (startDate && startTime) {
      dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: `${startDate}T${startTime}` });
    } else if (startDate && !startTime) {
      dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: `${startDate}` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, startTime]);

  useEffect(() => {
    if (endDate && endTime) {
      dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: `${endDate}T${endTime}` });
    } else if (endDate && !endTime) {
      dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: `${endDate}` });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate, endTime]);

  return (
    <OnboardingStepLayout
      title="When will your deal be available?"
      onNext={() => navigate('/merchant/deals/create/instructions')}
      onBack={() => navigate(-1)}
      isNextDisabled={!state.startTime || !state.endTime}
      progress={60}
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="startDate" className="text-lg font-semibold">
            Start Time
          </Label>
          <p className="mb-2 text-neutral-500">When customers can start claiming this deal.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTimeSelect" className="sr-only">Start time</Label>
              <div className="relative">
                <select
                  id="startTimeSelect"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-14 w-full rounded-md border border-input bg-transparent px-3 pr-10 text-base appearance-none"
                >
                  {/* 30-minute increments - value is 24h so internal logic stays the same; label shows AM/PM */}
                  {Array.from({ length: 48 }).map((_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = i % 2 === 0 ? '00' : '30';
                    const val = `${String(hour).padStart(2,'0')}:${minute}`;
                    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const label = `${displayHour}:${minute} ${period}`;
                    return <option key={val} value={val}>{label}</option>;
                  })}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="startDate" className="sr-only">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-14 text-lg"
              />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="endDate" className="text-lg font-semibold">
            End Time
          </Label>
          <p className="mb-2 text-neutral-500">The deal will no longer be visible after this time.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endTimeSelect" className="sr-only">End time</Label>
              <div className="relative">
                <select
                  id="endTimeSelect"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-14 w-full rounded-md border border-input bg-transparent px-3 pr-10 text-base appearance-none"
                >
                  {Array.from({ length: 48 }).map((_, i) => {
                    const hour = Math.floor(i / 2);
                    const minute = i % 2 === 0 ? '00' : '30';
                    const val = `${String(hour).padStart(2,'0')}:${minute}`;
                    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const label = `${displayHour}:${minute} ${period}`;
                    return <option key={val} value={val}>{label}</option>;
                  })}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                </span>
              </div>
            </div>
            <div>
              <Label htmlFor="endDate" className="sr-only">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-14 text-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </OnboardingStepLayout>
  );
};
