// src/components/merchant/create-deal/quick-form/HiddenConfigStep.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeOff, QrCode, Share2, Smartphone } from 'lucide-react';
import { useDealCreation } from '@/context/DealCreationContext';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { QuickFormLayout } from './QuickFormLayout';
import { SectionCard, FieldLabel } from './SectionCard';
import { generateAccessCode } from '@/utils/dealTypeUtils';

export const HiddenConfigStep = () => {
  const { state, dispatch } = useDealCreation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.dealType !== 'HIDDEN') {
      dispatch({ type: 'SET_FIELD', field: 'dealType', value: 'HIDDEN' });
    }
    if (!state.accessCode) {
      dispatch({ type: 'UPDATE_FIELD', field: 'accessCode', value: generateAccessCode() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibility = state.hiddenDealVisibility;
  const updateVisibility = (patch: Partial<typeof visibility>) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: 'hiddenDealVisibility',
      value: { ...visibility, ...patch },
    });
  };

  return (
    <QuickFormLayout
      title="Lock it down"
      subtitle="Generate an access code and pick how guests can discover it."
      wizardStep={{ current: 1, total: 3 }}
      onBack={() => navigate('/merchant/deals/create')}
      primary={{
        label: 'Continue',
        onClick: () => navigate('/merchant/deals/create/hidden/details'),
        disabled: !state.accessCode || state.accessCode.trim().length === 0,
      }}
    >
      <div className="space-y-3">
        <SectionCard>
          <FieldLabel label="Access code" hint="Share with VIP guests" htmlFor="access-code" />
          <div className="mt-2 flex gap-2">
            <Input
              id="access-code"
              value={state.accessCode ?? ''}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_FIELD',
                  field: 'accessCode',
                  value: e.target.value.toUpperCase().slice(0, 12),
                })
              }
              placeholder="VIP2026"
              className="h-10 rounded-lg border-border bg-card font-mono text-[13.5px] tracking-widest"
            />
            <button
              type="button"
              onClick={() =>
                dispatch({ type: 'UPDATE_FIELD', field: 'accessCode', value: generateAccessCode() })
              }
              className="h-10 shrink-0 rounded-lg border border-border bg-card px-3 text-[12px] font-semibold text-foreground hover:border-border hover:bg-muted"
            >
              Regenerate
            </button>
          </div>
        </SectionCard>

        <SectionCard>
          <FieldLabel label="Discovery channels" hint="Where guests can unlock the deal" />
          <div className="mt-3 space-y-3">
            <VisibilityToggle
              icon={<EyeOff className="h-4 w-4" />}
              label="Access code / shareable link"
              description="Direct customers to the link or share the code privately."
              checked
              onChange={() => {}}
              disabled
            />
            <VisibilityToggle
              icon={<QrCode className="h-4 w-4" />}
              label="QR code"
              description="Print or display a QR at your venue."
              checked={!!visibility?.qrCode}
              onChange={(v) => updateVisibility({ qrCode: v })}
            />
            <VisibilityToggle
              icon={<Smartphone className="h-4 w-4" />}
              label="Tap-in / check-in"
              description="Unlock for guests who check in at your location."
              checked={!!visibility?.tapIns}
              onChange={(v) => updateVisibility({ tapIns: v })}
            />
            <VisibilityToggle
              icon={<Share2 className="h-4 w-4" />}
              label="Social sharing"
              description="Let guests share the link on social."
              checked={!!visibility?.socialSharing}
              onChange={(v) => updateVisibility({ socialSharing: v })}
            />
          </div>
        </SectionCard>
      </div>
    </QuickFormLayout>
  );
};

interface VisibilityToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

const VisibilityToggle = ({ icon, label, description, checked, onChange, disabled }: VisibilityToggleProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-[13px] font-semibold text-foreground">{label}</div>
      <div className="text-[12px] text-muted-foreground">{description}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </div>
);

export default HiddenConfigStep;
