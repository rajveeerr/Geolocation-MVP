/**
 * "How can customers reach this location?" - Airbnb style with "Use merchant contact" card.
 */
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Phone formatting utilities
const formatPhoneDisplay = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};
const stripPhoneToDigits = (value: string) => value.replace(/\D/g, '').slice(0, 10);

interface StoreContactStepProps {
  data: { phoneNumber: string; email?: string };
  onUpdate: (data: Partial<{ phoneNumber: string; email?: string }>) => void;
  merchantPhone?: string;
  merchantEmail?: string;
}

export const StoreContactStep = ({
  data,
  onUpdate,
  merchantPhone,
  merchantEmail,
}: StoreContactStepProps) => {
  const canUseMerchant = !!(merchantPhone || merchantEmail);
  const isUsingMerchant =
    (merchantPhone && data.phoneNumber === merchantPhone) ||
    (merchantEmail && data.email === merchantEmail);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">How can customers reach this location?</h2>
        <p className="mt-2 text-neutral-600">
          We need the contact details for <em>this specific location</em>. Different locations can have different numbers.
        </p>
      </div>

      {canUseMerchant && (
        <button
          type="button"
          onClick={() => {
            if (merchantPhone) onUpdate({ phoneNumber: merchantPhone });
            if (merchantEmail) onUpdate({ email: merchantEmail });
          }}
          className={cn(
            'flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all',
            isUsingMerchant
              ? 'border-brand-primary-500 bg-brand-primary-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300'
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
            <Copy className="h-5 w-5 text-neutral-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-neutral-900">Use merchant contact info</p>
            <p className="text-sm text-neutral-600">
              {merchantPhone && <span>{merchantPhone}</span>}
              {merchantPhone && merchantEmail && ' · '}
              {merchantEmail && <span>{merchantEmail}</span>}
            </p>
          </div>
          {isUsingMerchant && (
            <Check className="h-5 w-5 shrink-0 text-brand-primary-600" />
          )}
        </button>
      )}

      {canUseMerchant && (
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-sm text-neutral-500">or enter different details</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium text-neutral-700">
            Store phone number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              id="phoneNumber"
              type="text"
              inputMode="numeric"
              placeholder="(555) 123-4567"
              value={formatPhoneDisplay(data.phoneNumber || '')}
              onChange={(e) => onUpdate({ phoneNumber: stripPhoneToDigits(e.target.value) })}
              className="pl-10 h-12"
            />
          </div>
          <p className="text-xs text-neutral-500">Customers call this number for this location</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
            Store email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              id="email"
              type="email"
              placeholder="store@example.com"
              value={data.email || ''}
              onChange={(e) => onUpdate({ email: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
          <p className="text-xs text-neutral-500">Optional — for inquiries</p>
        </div>
      </div>
    </div>
  );
};
