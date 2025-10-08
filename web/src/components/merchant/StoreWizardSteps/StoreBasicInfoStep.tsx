import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
// Local types to avoid import issues
interface StoreWizardData {
  businessName: string;
  address: string;
  phoneNumber: string;
  email?: string;
  storeType: string;
  cityId: number;
  latitude?: number;
  longitude?: number;
  verifiedAddress?: string;
  businessHours: any;
  description?: string;
  features: string[];
  storeImages: File[];
  active: boolean;
}

interface City {
  id: number;
  name: string;
  state: string;
  active: boolean;
}

interface StoreBasicInfoStepProps {
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
  cities: City[];
}

const STORE_TYPES = [
  { value: 'restaurant', label: 'Restaurant', description: 'Food service establishment' },
  { value: 'retail', label: 'Retail Store', description: 'Product sales and merchandise' },
  { value: 'service', label: 'Service Business', description: 'Professional or personal services' },
  { value: 'entertainment', label: 'Entertainment', description: 'Recreation and entertainment venue' },
  { value: 'healthcare', label: 'Healthcare', description: 'Medical and wellness services' },
  { value: 'other', label: 'Other', description: 'Other business type' },
];

export const StoreBasicInfoStep = ({ data, onUpdate, cities }: StoreBasicInfoStepProps) => {
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
          Business Type *
        </Label>
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

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-semibold text-neutral-700">
          Store Address *
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            id="address"
            placeholder="Enter the full address of your store"
            value={data.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-neutral-500">
          We'll help you verify and locate this address on the next step
        </p>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-semibold text-neutral-700">
            Phone Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="(555) 123-4567"
              value={data.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold text-neutral-700">
            Email Address
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
            Optional - for customer inquiries and notifications
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
              Business type
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              data.address ? 'bg-green-500' : 'bg-neutral-300'
            )} />
            <span className={data.address ? 'text-green-700' : 'text-neutral-500'}>
              Store address
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
