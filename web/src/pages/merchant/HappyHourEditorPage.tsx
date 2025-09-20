import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHappyHour } from '@/context/HappyHourContext'; // <-- Use the new hook
import { Button } from '@/components/common/Button';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import { FormSection } from '@/components/merchant/create-deal/FormSection';
import { DayOfWeekSelector } from '@/components/merchant/create-deal/DayOfWeekSelector';
import { TimeRangePicker } from '@/components/merchant/create-deal/TimeRangePicker';
import { AnimatePresence, motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import clsx from 'clsx';

export const HappyHourEditorPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useHappyHour();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!state.timeRanges || state.timeRanges.length === 0) {
        toast({ title: 'Error', description: 'Please add at least one time range.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      const payload: any = {
        title: state.title || `${state.happyHourType} Happy Hour`,
        description: state.description || `Special offers available during our ${state.happyHourType} happy hour.`,
        category: state.category,
        dealType: 'HAPPY_HOUR',
        // use first time range as the backend expects a single start/end
        startTime: state.timeRanges[0]
          ? `${state.activeStartDate || new Date().toISOString().split('T')[0]}T${state.timeRanges[0].start}:00.000Z`
          : undefined,
        endTime: state.timeRanges[0]
          ? `${state.activeEndDate || new Date().toISOString().split('T')[0]}T${state.timeRanges[0].end}:00.000Z`
          : undefined,
        // Convert recurring days to comma-separated string as backend expects
        recurringDays:
          state.periodType === 'Recurring' && state.recurringDays.length > 0 ? state.recurringDays.join(',') : undefined,

        // Ensure redemption instructions are always included (backend requires this)
        redemptionInstructions:
          (state as any).redemptionInstructions ||
          'Show this screen to your server to redeem the happy hour offer.',

        kickbackEnabled: state.kickbackEnabled,
        kickbackPercent: state.kickbackEnabled ? state.kickbackPercent ?? undefined : undefined,
        selectedMenuItems: state.selectedMenuItems?.map((i: any) => ({ id: i.id, price: i.price })) || [],
      };

      console.log('Submitting Payload to /api/deals:', payload);

      const response = await apiPost('/deals', payload);

      if (response.success) {
        toast({ title: 'Happy Hour Published!', description: 'Your new happy hour deal is now live.' });
        navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
        throw new Error(response.error || 'Failed to publish happy hour deal.');
      }

    } catch (err) {
      toast({ title: 'Submission Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 py-36">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/merchant/deals/create')} variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Happy Hour Deal</h1>
            <p className="text-sm text-neutral-500">Create a limited-time happy hour to drive visits.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* --- NEW: Add Title and Description fields --- */}
              <FormSection title="Deal Details">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Happy Hour Title</Label>
                    <Input id="title" value={state.title} onChange={e => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })} placeholder={`${state.happyHourType} Happy Hour`} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea id="description" value={state.description} onChange={e => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })} placeholder="Let customers know what's special about this happy hour." />
                  </div>
                </div>
              </FormSection>
              <FormSection title="Happy Hour Type" subtitle="Select which type of happy hour">
                <div className="mb-4">
                  <div className="flex items-center gap-3">
                    {['Mornings', 'Midday', 'Late night'].map((type: string) => (
                      <button
                        key={type}
                        onClick={() => dispatch({ type: 'SET_FIELD', field: 'happyHourType', value: type })}
                        className={`py-2 px-3 rounded-md text-sm font-semibold ${state.happyHourType === type ? 'bg-brand-primary-600 text-white shadow' : 'bg-white text-neutral-700 border border-neutral-200'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4"><TimeRangePicker /></div>
              </FormSection>

              <FormSection title="Set Active Date" subtitle="Set date range for the deal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hh-start-date">Start Date</Label>
                    <Input id="hh-start-date" type="date" value={state.activeStartDate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'activeStartDate', value: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="hh-end-date">End Date</Label>
                    <Input id="hh-end-date" type="date" value={state.activeEndDate} onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'activeEndDate', value: e.target.value })} />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Deal Items" subtitle="Select menu items included in this happy hour">
             <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-2 mb-4">
                {['Single day', 'Recurring'].map((type) => (
                  <button key={type} onClick={() => dispatch({ type: 'SET_FIELD', field: 'periodType', value: type as any })} className={clsx("flex-1 rounded-md py-2 text-sm font-semibold", state.periodType === type ? "bg-black text-white shadow" : "text-neutral-600")}>
                    {type}
                  </button>
                ))}
             </div>
             {state.periodType === 'Recurring' && (
                <DayOfWeekSelector 
                  selectedDays={state.recurringDays}
                  onDayToggle={(day: string) => dispatch({ type: 'TOGGLE_RECURRING_DAY', payload: day })}
                />
             )}
            <div className="mt-4">
              <Button onClick={() => navigate('/merchant/deals/create/happy-hour/add-menu')} variant="secondary" className="w-full rounded-lg border-dashed border-2 py-3">
                  <Plus className="mr-2 h-4 w-4" /> Add items from menu ({state.selectedMenuItems.length})
              </Button>
            </div>
            {/* ... (Display selected items) ... */}
          </FormSection>

              <FormSection title="Kickback" subtitle="Reward users who bring friends">
                <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hh-kickback-switch" className="font-semibold text-neutral-800">Enable kickback</Label>
                      <p className="text-sm text-neutral-500 mt-1">Offer a percentage of sales back to customers who referred the paying guests.</p>
                    </div>
                    <Switch id="hh-kickback-switch" checked={state.kickbackEnabled} onCheckedChange={(checked: boolean) => dispatch({ type: 'SET_FIELD', field: 'kickbackEnabled', value: checked })} />
                  </div>

                  <AnimatePresence>
                    {state.kickbackEnabled && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-neutral-200 pt-4 mt-4">
                          <Label htmlFor="kickback-percent" className="block font-medium text-neutral-700">Kickback Percentage</Label>
                          <div className="mt-2 flex items-center gap-2 max-w-xs">
                            <Input
                              id="kickback-percent"
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              aria-label="Kickback percentage"
                              placeholder="5"
                              value={state.kickbackPercent ?? ''}
                              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'kickbackPercent', value: e.target.value === '' ? null : Math.max(0, Math.min(100, parseInt(e.target.value))) })}
                              className="flex-1"
                            />
                            <span className="text-sm text-neutral-500">%</span>
                          </div>
                          <p className="mt-2 text-xs text-neutral-500">We recommend keeping kickbacks small (e.g., 3–10%) to maintain margin.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FormSection>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-lg bg-white p-4 border border-neutral-100">
                <h3 className="font-semibold">Summary</h3>
                <p className="text-sm text-neutral-500 mt-2">Happy Hour: <span className="font-medium">{state.happyHourType}</span></p>
                <p className="text-sm text-neutral-500">Time ranges: <span className="font-medium">{state.timeRanges.length}</span></p>
                <p className="text-sm text-neutral-500">Items: <span className="font-medium">{state.selectedMenuItems.length}</span></p>
              </div>
            </div>
          </aside>
        </div>

        <div className="fixed left-0 right-0 bottom-6 px-4">
          <div className="max-w-7xl mx-auto">
            <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="w-full rounded-lg">
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Save Happy Hour Deal'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HappyHourEditorPage;
