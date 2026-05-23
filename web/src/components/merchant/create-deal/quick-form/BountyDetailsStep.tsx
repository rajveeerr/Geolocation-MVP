// src/components/merchant/create-deal/quick-form/BountyDetailsStep.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { TimeWindowEditor, type TimeWindowValue } from './TimeWindowEditor';
import { RewardsSection } from './RewardsSection';

const DEFAULT_WINDOW: TimeWindowValue = { start: '17:00', end: '21:00' };

export const BountyDetailsStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [window, setWindow] = useState<TimeWindowValue>(DEFAULT_WINDOW);

  useEffect(() => {
    if (state.dealType !== 'BOUNTY') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'BOUNTY' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayIso = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);
  const startDateValue = state.activeStartDate ? state.activeStartDate.split('T')[0] : '';
  const endDateValue = state.activeEndDate ? state.activeEndDate.split('T')[0] : '';

  useEffect(() => {
    const ymd = startDateValue || todayIso;
    if (!ymd) return;
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return;
    const start = new Date(`${ymd}T00:00:00`);
    start.setHours(sh, sm, 0, 0);
    dispatch({ type: 'UPDATE_FIELD', field: 'startTime', value: start.toISOString() });
    dispatch({ type: 'UPDATE_FIELD', field: 'validHours', value: `${window.start}-${window.end}` });
    if (!endDateValue) {
      const end = new Date(start);
      end.setDate(end.getDate() + 30);
      end.setHours(23, 59, 59, 999);
      dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: end.toISOString() });
      dispatch({ type: 'UPDATE_FIELD', field: 'endTime', value: end.toISOString() });
    }
  }, [startDateValue, window.start, window.end, todayIso, dispatch, endDateValue]);

  const isWindowValid = (() => {
    const [sh, sm] = window.start.split(':').map(Number);
    const [eh, em] = window.end.split(':').map(Number);
    if ([sh, sm, eh, em].some((n) => !Number.isFinite(n))) return false;
    return eh * 60 + em > sh * 60 + sm;
  })();

  const canContinue =
    !!state.title?.trim() && !!startDateValue && !!endDateValue && isWindowValid;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/merchant/deals/create/bounty/review');
  };

  return (
    <QuickFormLayout
      title="Name your bounty"
      subtitle="Title, dates, and a short description — extras come next."
      wizardStep={{ current: 2, total: 3 }}
      onBack={() => navigate('/merchant/deals/create/bounty')}
      primary={{ label: 'Continue', onClick: handleContinue, disabled: !canContinue }}
    >
      <div className="space-y-3">
        <SectionCard>
          <FieldLabel label="Deal name" required htmlFor="deal-name" />
          <Input
            id="deal-name"
            value={state.title}
            onChange={(e) =>
              dispatch({ type: 'UPDATE_FIELD', field: 'title', value: e.target.value.slice(0, 100) })
            }
            placeholder="Bring 2 friends, earn $10"
            className="mt-1.5 h-10 rounded-lg border-border bg-card text-[13.5px]"
            maxLength={100}
          />

          <div className="mt-4">
            <FieldLabel label="Short description" htmlFor="deal-desc" />
            <Textarea
              id="deal-desc"
              value={state.description}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_FIELD', field: 'description', value: e.target.value.slice(0, 500) })
              }
              rows={2}
              placeholder="What guests need to know — restrictions, peak nights, etc."
              className="mt-2 resize-none rounded-xl border-border bg-card text-[14px]"
              maxLength={500}
            />
          </div>
        </SectionCard>

        <SectionCard>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4 sm:flex-nowrap">
            <div className="shrink-0">
              <FieldLabel label="Start date" htmlFor="bounty-start" />
              <Input
                id="bounty-start"
                type="date"
                lang="en-US"
                min={todayIso}
                value={startDateValue}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'activeStartDate', value: e.target.value ? `${e.target.value}T00:00:00.000Z` : '' })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div className="shrink-0">
              <FieldLabel label="End date" htmlFor="bounty-end" />
              <Input
                id="bounty-end"
                type="date"
                lang="en-US"
                min={startDateValue || todayIso}
                value={endDateValue}
                onChange={(e) =>
                  dispatch({ type: 'UPDATE_FIELD', field: 'activeEndDate', value: e.target.value ? `${e.target.value}T23:59:59.000Z` : '' })
                }
                className="mt-1.5 h-10 w-[180px] rounded-lg border-border bg-card text-[13.5px]"
              />
            </div>
            <div className="hidden h-16 w-px shrink-0 bg-accent sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <TimeWindowEditor value={window} onChange={setWindow} label="Active window (per day)" />
            </div>
          </div>
        </SectionCard>

        <RewardsSection bountyReadOnly />
      </div>
    </QuickFormLayout>
  );
};

export default BountyDetailsStep;
