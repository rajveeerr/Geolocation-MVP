import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { Building2, Phone, Mail, Copy } from 'lucide-react';
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
// Local types - prefer storeRegistrationTypes for shared shape
interface StoreWizardData {
  businessName: string;
  phoneNumber: string;
  email?: string;
  storeType: string;
  [key: string]: unknown;
}

interface City {
  id: number;
  name: string;
  state: string;
  active?: boolean;
}

interface StoreBasicInfoStepProps {
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
  cities: City[];
  /** When provided, show "Use merchant contact info" button */
  merchantPhone?: string;
  merchantEmail?: string;
}

const STORE_TYPES = [
  { value: 'restaurant', label: 'Restaurant', description: 'Food service establishment' },
  { value: 'retail', label: 'Retail Store', description: 'Product sales and merchandise' },
  { value: 'service', label: 'Service Business', description: 'Professional or personal services' },
  { value: 'entertainment', label: 'Entertainment', description: 'Recreation and entertainment venue' },
  { value: 'healthcare', label: 'Healthcare', description: 'Medical and wellness services' },
  { value: 'other', label: 'Other', description: 'Other business type' },
];

export const StoreBasicInfoStep = ({ data, onUpdate, cities, merchantPhone, merchantEmail }: StoreBasicInfoStepProps) => {
  const handleInputChange = (field: keyof StoreWizardData, value: any) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-100">
          <Building2 className="h-8 w-8 text-brand-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Basic Information</h2>
        <p className="mt-2 text-neutral-600">
          Tell us about your store and how customers can reach you
        </p>
      </div>

      {/* Business Name */}
      <div className="space-y-2">
        <Label htmlFor="businessName" className="text-sm font-semibold text-neutral-700">
          Business Name *
        </Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            id="businessName"
            placeholder="Enter your business name"
            value={data.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-neutral-500">
          This is how your business will appear to customers
        </p>
      </div>

      {/* Store Type */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-neutral-700">
          Store type *
        </Label>
        <p className="text-xs text-neutral-500">
          What type of place is this? (e.g. restaurant, retail)
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STORE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleInputChange('storeType', type.value)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200',
                data.storeType === type.value
                  ? 'border-brand-primary-500 bg-brand-primary-50 ring-1 ring-brand-primary-500'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
              )}
            >
              <div className={cn(
                'mt-1 h-4 w-4 rounded-full border-2',
                data.storeType === type.value
                  ? 'border-brand-primary-500 bg-brand-primary-500'
                  : 'border-neutral-300'
              )}>
                {data.storeType === type.value && (
                  <div className="h-full w-full rounded-full bg-white scale-50" />
                )}
              </div>
              <div>
                <p className="font-medium text-neutral-900">{type.label}</p>
                <p className="text-sm text-neutral-600">{type.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      {(merchantPhone || merchantEmail) && (
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (merchantPhone) onUpdate({ phoneNumber: merchantPhone });
              if (merchantEmail) onUpdate({ email: merchantEmail });
            }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Use merchant contact info
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-semibold text-neutral-700">
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
              onChange={(e) => handleInputChange('phoneNumber', stripPhoneToDigits(e.target.value))}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-neutral-500">
            Customers will use this to call this location
          </p>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">
            Store email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              id="email"
              type="email"
              placeholder="contact@yourbusiness.com"
              value={data.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-neutral-500">
            Optional - for customer inquiries
          </p>
        </div>
      </div>

      {/* Validation Summary */}
      <div className="rounded-lg bg-neutral-50 p-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-2">Required Information</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              data.businessName ? 'bg-green-500' : 'bg-neutral-300'
            )} />
            <span className={data.businessName ? 'text-green-700' : 'text-neutral-500'}>
              Business name
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              data.storeType ? 'bg-green-500' : 'bg-neutral-300'
            )} />
            <span className={data.storeType ? 'text-green-700' : 'text-neutral-500'}>
              Store type
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              data.phoneNumber ? 'bg-green-500' : 'bg-neutral-300'
            )} />
            <span className={data.phoneNumber ? 'text-green-700' : 'text-neutral-500'}>
              Phone number
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
