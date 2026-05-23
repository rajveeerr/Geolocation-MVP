import { MapPin, Phone, Mail, Clock, Building2, CheckCircle, Wifi, Car, Utensils, CreditCard, Users } from 'lucide-react';
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

interface StoreReviewStepProps {
  data: StoreWizardData;
  cities: City[];
}

const FEATURE_ICONS = {
  wifi: Wifi,
  parking: Car,
  dining: Utensils,
  card_payment: CreditCard,
  group_friendly: Users,
};

const DEFAULT_DAY_HOURS = { open: '09:00', close: '17:00', closed: true };

const DEFAULT_BUSINESS_HOURS: Record<string, { open: string; close: string; closed: boolean }> = {
  monday: { ...DEFAULT_DAY_HOURS },
  tuesday: { ...DEFAULT_DAY_HOURS },
  wednesday: { ...DEFAULT_DAY_HOURS },
  thursday: { ...DEFAULT_DAY_HOURS },
  friday: { ...DEFAULT_DAY_HOURS },
  saturday: { ...DEFAULT_DAY_HOURS },
  sunday: { ...DEFAULT_DAY_HOURS },
};

export const StoreReviewStep = ({ data, cities }: StoreReviewStepProps) => {
  const selectedCity = cities.find(city => city.id === data.cityId);

  // Existing stores may come in with businessHours = null/undefined (legacy rows
  // before hours were captured). Normalize so review-screen reads never crash.
  const businessHours: Record<string, { open: string; close: string; closed: boolean }> =
    data.businessHours && typeof data.businessHours === 'object'
      ? { ...DEFAULT_BUSINESS_HOURS, ...data.businessHours }
      : DEFAULT_BUSINESS_HOURS;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayStatus = (day: string) => {
    const dayHours = businessHours[day] ?? DEFAULT_DAY_HOURS;
    if (dayHours.closed) {
      return 'Closed';
    }
    return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/40">
          <CheckCircle className="h-8 w-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Review Your Store</h2>
        <p className="mt-2 text-muted-foreground">
          Please review all the information before creating your store
        </p>
      </div>

      {/* Store Preview Card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-brand-primary-500 to-brand-primary-600 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-card/20 dark:bg-card p-3">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{data.businessName}</h3>
              <p className="text-brand-primary-100 capitalize">{data.storeType.replace('_', ' ')}</p>
            </div>
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              data.active 
                ? 'bg-green-500 text-white' 
                : 'bg-muted-foreground/50 text-white'
            )}>
              {data.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{data.address}</span>
              </div>
              {selectedCity && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{selectedCity.name}, {selectedCity.state}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{data.phoneNumber}</span>
              </div>
              {data.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{data.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Details */}
          {data.latitude && data.longitude && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Location Details</h4>
              <div className="rounded-lg bg-muted p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="ml-2 font-mono text-foreground">{data.latitude.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="ml-2 font-mono text-foreground">{data.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Hours */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Business Hours</h4>
            <div className="space-y-2">
              {Object.entries(businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium text-foreground capitalize">{day}</span>
                  <span className="text-sm text-muted-foreground">{getDayStatus(day)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          {data.features && data.features.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Features & Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {data.features.map((feature) => {
                  const Icon = FEATURE_ICONS[feature as keyof typeof FEATURE_ICONS];
                  return (
                    <div key={feature} className="flex items-center gap-2 rounded-full bg-brand-primary-50 px-3 py-1">
                      {Icon && <Icon className="h-3 w-3 text-brand-primary-600" />}
                      <span className="text-xs font-medium text-brand-primary-700 capitalize">
                        {feature.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {data.description && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Preview */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">How Your Store Will Appear to Customers</h4>
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-foreground">{data.businessName}</h5>
              <p className="text-sm text-muted-foreground">{data.address}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {businessHours.monday.closed ? 'Closed' : `${formatTime(businessHours.monday.open)} - ${formatTime(businessHours.monday.close)}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{data.phoneNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Checklist */}
      <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 p-6">
        <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3">Ready to Create!</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <span>All required information is complete</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <span>Location has been verified</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <span>Business hours are set</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <span>Store is ready to receive customers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
