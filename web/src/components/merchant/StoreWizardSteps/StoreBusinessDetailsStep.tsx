import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { Switch } from '@/components/ui/switch';
import { Clock, Wifi, Car, Utensils, CreditCard, Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
// Local types to avoid import issues
interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

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
  businessHours: BusinessHours;
  description?: string;
  features: string[];
  storeImages: File[];
  active: boolean;
}

interface StoreBusinessDetailsStepProps {
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
}

const BUSINESS_FEATURES = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi, description: 'Complimentary internet access' },
  { id: 'parking', label: 'Parking Available', icon: Car, description: 'Customer parking spaces' },
  { id: 'dining', label: 'Dine-in', icon: Utensils, description: 'Indoor seating available' },
  { id: 'card_payment', label: 'Card Payments', icon: CreditCard, description: 'Credit/debit card accepted' },
  { id: 'group_friendly', label: 'Group Friendly', icon: Users, description: 'Accommodates large groups' },
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const TIME_OPTIONS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
  '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
];

export const StoreBusinessDetailsStep = ({ data, onUpdate }: StoreBusinessDetailsStepProps) => {
  const [showAdvancedHours, setShowAdvancedHours] = useState(false);

  const handleInputChange = (field: keyof StoreWizardData, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleFeatureToggle = (featureId: string) => {
    const currentFeatures = data.features || [];
    const updatedFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(f => f !== featureId)
      : [...currentFeatures, featureId];
    
    onUpdate({ features: updatedFeatures });
  };

  const handleBusinessHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    const updatedHours = {
      ...data.businessHours,
      [day]: {
        ...data.businessHours[day],
        [field]: value,
      },
    };
    onUpdate({ businessHours: updatedHours });
  };

  const copyHoursToAllDays = (sourceDay: string) => {
    const sourceHours = data.businessHours[sourceDay];
    const updatedHours = { ...data.businessHours };
    
    DAYS_OF_WEEK.forEach(day => {
      updatedHours[day.key] = { ...sourceHours };
    });
    
    onUpdate({ businessHours: updatedHours });
  };

  const setAllDaysClosed = () => {
    const updatedHours = { ...data.businessHours };
    DAYS_OF_WEEK.forEach(day => {
      updatedHours[day.key] = { open: '09:00', close: '17:00', closed: true };
    });
    onUpdate({ businessHours: updatedHours });
  };

  const setStandardHours = () => {
    const updatedHours = { ...data.businessHours };
    DAYS_OF_WEEK.forEach(day => {
      if (day.key === 'sunday') {
        updatedHours[day.key] = { open: '10:00', close: '16:00', closed: false };
      } else {
        updatedHours[day.key] = { open: '09:00', close: '17:00', closed: false };
      }
    });
    onUpdate({ businessHours: updatedHours });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Clock className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900">Business Details</h2>
        <p className="mt-2 text-neutral-600">
          Set your business hours, features, and additional information
        </p>
      </div>

      {/* Business Hours */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold text-neutral-700">
            Business Hours
          </Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={setStandardHours}
            >
              Set Standard
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={setAllDaysClosed}
            >
              All Closed
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="p-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayHours = data.businessHours[day.key];
              const Icon = day.key === 'sunday' ? CheckCircle : Clock;
              
              return (
                <div key={day.key} className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-b-0">
                  <div className="w-20 text-sm font-medium text-neutral-700">
                    {day.label}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!dayHours.closed}
                      onCheckedChange={(checked) => handleBusinessHoursChange(day.key, 'closed', !checked)}
                    />
                    <span className="text-sm text-neutral-600">
                      {dayHours.closed ? 'Closed' : 'Open'}
                    </span>
                  </div>
                  
                  {!dayHours.closed && (
                    <div className="flex items-center gap-2">
                      <select
                        value={dayHours.open}
                        onChange={(e) => handleBusinessHoursChange(day.key, 'open', e.target.value)}
                        className="text-sm border border-neutral-300 rounded px-2 py-1"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-sm text-neutral-500">to</span>
                      <select
                        value={dayHours.close}
                        onChange={(e) => handleBusinessHoursChange(day.key, 'close', e.target.value)}
                        className="text-sm border border-neutral-300 rounded px-2 py-1"
                      >
                        {TIME_OPTIONS.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {!dayHours.closed && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyHoursToAllDays(day.key)}
                      className="text-xs"
                    >
                      Copy to All
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Features */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-neutral-700">
          Business Features
        </Label>
        <p className="text-sm text-neutral-600">
          Select the features and amenities your store offers
        </p>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BUSINESS_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const isSelected = data.features?.includes(feature.id) || false;
            
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureToggle(feature.id)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-200',
                  isSelected
                    ? 'border-brand-primary-500 bg-brand-primary-50 ring-1 ring-brand-primary-500'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
                )}
              >
                <div className={cn(
                  'mt-1 h-4 w-4 rounded-full border-2',
                  isSelected
                    ? 'border-brand-primary-500 bg-brand-primary-500'
                    : 'border-neutral-300'
                )}>
                  {isSelected && (
                    <div className="h-full w-full rounded-full bg-white scale-50" />
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <Icon className={cn(
                    'h-5 w-5 mt-0.5',
                    isSelected ? 'text-brand-primary-600' : 'text-neutral-500'
                  )} />
                  <div>
                    <p className="font-medium text-neutral-900">{feature.label}</p>
                    <p className="text-sm text-neutral-600">{feature.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Store Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-neutral-700">
          Store Description
        </Label>
        <textarea
          id="description"
          placeholder="Tell customers about your store, what makes it special, and what they can expect..."
          rows={4}
          value={data.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="flex min-h-[100px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <p className="text-xs text-neutral-500">
          Optional - Help customers understand what your store offers
        </p>
      </div>

      {/* Store Status */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="active" className="text-sm font-semibold text-neutral-700">
              Store Status
            </Label>
            <p className="text-sm text-neutral-600">
              Active stores can receive deals and customer visits
            </p>
          </div>
          <Switch
            id="active"
            checked={data.active}
            onCheckedChange={(checked) => handleInputChange('active', checked)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-neutral-50 p-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-2">Business Details Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              data.businessHours ? 'bg-green-500' : 'bg-neutral-300'
            )} />
            <span className={data.businessHours ? 'text-green-700' : 'text-neutral-500'}>
              Business hours configured
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              data.features && data.features.length > 0 ? 'bg-green-500' : 'bg-neutral-300'
            )} />
            <span className={data.features && data.features.length > 0 ? 'text-green-700' : 'text-neutral-500'}>
              {data.features?.length || 0} features selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              data.description ? 'bg-green-500' : 'bg-neutral-300'
            )} />
            <span className={data.description ? 'text-green-700' : 'text-neutral-500'}>
              Description added
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
