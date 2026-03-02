import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';

const TIMES = ['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'];

type Hours = Record<string, { open: string; close: string; closed: boolean }>;

interface Props {
  data: { businessHours: Hours };
  onUpdate: (d: { businessHours: Hours }) => void;
  mode: 'weekday' | 'weekend';
}

const WD = ['monday','tuesday','wednesday','thursday','friday'];
const WE = ['saturday','sunday'];

export const StoreHoursStep = ({ data, onUpdate, mode }: Props) => {
  const keys = mode === 'weekday' ? WD : WE;
  const opp = mode === 'weekday' ? WE : WD;
  const setAll = (t: string[], o: string, c: string, cl: boolean) => {
    const u = { ...data.businessHours };
    t.forEach((k) => { u[k] = { ...u[k], open: o, close: c, closed: cl }; });
    onUpdate({ businessHours: u });
  };
  const copy = () => { const s = data.businessHours[opp[0]]; if (s) setAll(keys, s.open, s.close, s.closed); };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">{mode === 'weekday' ? 'Set weekday hours' : 'Set weekend hours'}</h2>
        <p className="mt-2 text-neutral-600">{mode === 'weekday' ? 'Mon-Fri. Weekend next.' : 'Sat-Sun.'}</p>
      </div>
      {mode === 'weekend' && (
        <button type="button" onClick={copy} className="flex w-full items-center gap-4 rounded-xl border-2 border-neutral-200 p-4 text-left hover:bg-neutral-50">
          <span className="text-2xl">📋</span>
          <div><p className="font-semibold">Same as weekdays</p><p className="text-sm text-neutral-500">Copy Mon-Fri</p></div>
        </button>
      )}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Label>{mode === 'weekday' ? 'Mon-Fri' : 'Sat-Sun'}</Label>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setAll(keys,'09:00','17:00',false)}>9-5</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setAll(keys,'10:00','22:00',false)}>10-10</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setAll(keys,'09:00','17:00',true)}>Closed</Button>
          </div>
        </div>
        <div className="rounded-xl border divide-y">
          {keys.map((key) => {
            const h = data.businessHours[key] || { open:'09:00', close:'17:00', closed:false };
            const lbl = key.charAt(0).toUpperCase() + key.slice(1);
            return (
              <div key={key} className="flex items-center gap-4 p-4">
                <span className="w-24 text-sm font-medium">{lbl}</span>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!h.closed} onChange={(e)=>{const u={...data.businessHours,[key]:{...h,closed:!e.target.checked}};onUpdate({businessHours:u});}} className="rounded" />
                  Open
                </label>
                {!h.closed && (
                  <>
                    <select value={h.open} onChange={(e)=>{const u={...data.businessHours,[key]:{...h,open:e.target.value}};onUpdate({businessHours:u});}} className="rounded border px-3 py-2 text-sm">
                      {TIMES.map((t)=><option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-neutral-400">to</span>
                    <select value={h.close} onChange={(e)=>{const u={...data.businessHours,[key]:{...h,close:e.target.value}};onUpdate({businessHours:u});}} className="rounded border px-3 py-2 text-sm">
                      {TIMES.map((t)=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
