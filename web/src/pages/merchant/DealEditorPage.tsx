import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Plus } from 'lucide-react';
import { FormSection } from '@/components/merchant/create-deal/FormSection';
import { DayOfWeekSelector } from '@/components/merchant/create-deal/DayOfWeekSelector';
import { TimeRangePicker } from '@/components/merchant/create-deal/TimeRangePicker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const DealEditorPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDealCreation();

  const handleSubmit = () => {
    console.log('FINAL DEAL PAYLOAD TO SEND TO BACKEND:', state);
    alert('Deal submitted! Check the console for the final payload.');
    // Here you would make the apiPost call with the `state`
  };

  return (
    <div className="bg-white min-h-screen">
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-10 p-4 flex items-center gap-4">
        <Button onClick={() => navigate('/merchant/deals/create')} variant="ghost" size="sm" className="rounded-full">
          <ArrowLeft />
        </Button>
        <h1 className="font-bold text-lg">Create {state.dealType?.replace('_', ' ')} Deal</h1>
      </header>
      
      <main className="p-4 max-w-3xl mx-auto">
        {/* --- Happy Hour Specific Section --- */}
        {state.dealType === 'HAPPY_HOUR' && (
          <FormSection title="Happy Hour Type" subtitle="Select which type of happy hour">
            <div className="flex items-center gap-2 rounded-lg bg-neutral-100 p-1">
              {['Mornings', 'Midday', 'Late night'].map((type: string) => (
                <button 
                  key={type}
                  onClick={() => dispatch({ type: 'SET_FIELD', field: 'happyHourPeriod', value: type })}
                  className={cn("flex-1 rounded-md py-2 text-sm font-semibold", state.happyHourPeriod === type ? "bg-black text-white shadow" : "text-neutral-600")}
                >{type}</button>
              ))}
            </div>
            <div className="mt-4"><TimeRangePicker /></div>
          </FormSection>
        )}

        <FormSection title="Set Active Date" subtitle="Set date range for which the deal will run">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={state.activeStartDate} onChange={e => dispatch({ type: 'SET_FIELD', field: 'activeStartDate', value: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={state.activeEndDate} onChange={e => dispatch({ type: 'SET_FIELD', field: 'activeEndDate', value: e.target.value })} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Deal Items" subtitle="Select or upload deal items for customers">
          <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-2 mb-4">
        {['Single day', 'Recurring'].map((type: string) => (
          <button 
            key={type}
            onClick={() => dispatch({ type: 'SET_FIELD', field: 'periodType', value: type })}
            className={cn("flex-1 rounded-md py-2 text-sm font-semibold", state.periodType === type ? "bg-black text-white shadow" : "text-neutral-600")}
          >{type}</button>
        ))}
          </div>
      {state.periodType === 'Recurring' && (
        <DayOfWeekSelector 
          selectedDays={state.recurringDays}
          onDayToggle={(day: string) => dispatch({ type: 'TOGGLE_RECURRING_DAY', payload: day })}
        />
      )}
          <div className="mt-4">
              <Button onClick={() => navigate('/merchant/deals/create/add-menu')} variant="secondary" className="w-full rounded-lg border-dashed border-2">
                  <Plus className="mr-2 h-4 w-4" /> Add items from menu
              </Button>
          </div>
          {/* Display selected items */}
          <div className="mt-4">
              <h3 className="font-semibold text-sm">Added items ({state.selectedMenuItems.length})</h3>
              {state.selectedMenuItems.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                      {state.selectedMenuItems.map(item => (
                          <div key={item.id} className="border rounded-lg p-2 flex items-center gap-2">
                              <img src={item.imageUrl} className="h-12 w-12 rounded-md object-cover" />
                              <div>
                                  <p className="text-sm font-bold">{item.name}</p>
                                  <p className="text-xs">${item.price.toFixed(2)}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </FormSection>

        <FormSection title="Kickback" subtitle="Enable a kickback offer">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <Label htmlFor="kickback-switch" className="font-semibold">Enable kickback</Label>
        <Switch 
          id="kickback-switch"
          checked={state.kickbackEnabled}
          onCheckedChange={(checked: boolean) => dispatch({ type: 'SET_FIELD', field: 'kickbackEnabled', value: checked })}
        />
            </div>
        </FormSection>
      </main>

      <footer className="sticky bottom-0 bg-white border-t p-4">
        <Button onClick={handleSubmit} size="lg" className="w-full rounded-lg">
          Save Deal
        </Button>
      </footer>
    </div>
  );
};

export default DealEditorPage;
