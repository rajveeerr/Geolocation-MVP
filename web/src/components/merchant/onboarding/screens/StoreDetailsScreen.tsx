import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';
import { LocationSection } from '../sections/LocationSection';
import { HoursSection } from '../sections/HoursSection';
import { AccordionSection } from '../sections/AccordionSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import { useToast } from '@/hooks/use-toast';
import { getDefaultFirstStore } from '@/components/merchant/store-registration/storeRegistrationTypes';
import type { BusinessHours } from '@/components/merchant/store-registration/storeRegistrationTypes';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import {
  Utensils, ShoppingBag, Briefcase, Music2, Heart, MoreHorizontal,
  Phone, Mail, Copy, Check, Plus, X,
  Wifi, Car, CreditCard, Users, ExternalLink,
  CheckCircle2, Sparkles, Truck,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Phone formatting utilities
const formatPhoneDisplay = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};
const stripPhoneToDigits = (value: string) => value.replace(/\D/g, '').slice(0, 10);

// ---- Store type options ----
const STORE_TYPES = [
  { value: 'restaurant', label: 'Restaurant', icon: Utensils },
  { value: 'retail', label: 'Retail', icon: ShoppingBag },
  { value: 'service', label: 'Service', icon: Briefcase },
  { value: 'entertainment', label: 'Entertainment', icon: Music2 },
  { value: 'healthcare', label: 'Healthcare', icon: Heart },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const FEATURES = [
  { id: 'wifi', label: 'Free WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'dining', label: 'Dine-in', icon: Utensils },
  { id: 'card_payment', label: 'Card Payments', icon: CreditCard },
  { id: 'group_friendly', label: 'Group Friendly', icon: Users },
];

export const StoreDetailsScreen = () => {
  const { state, dispatch } = useOnboarding();
  const { toast } = useToast();
  const { data: citiesData } = useWhitelistedCities();
  const cities = citiesData?.cities ?? [];
  const [photosModalOpen, setPhotosModalOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const store = state.firstStore;

  // Initialize firstStore on mount with pre-filled merchant data
  useEffect(() => {
    if (!store) {
      dispatch({
        type: 'SET_FIRST_STORE',
        payload: {
          ...getDefaultFirstStore(),
          businessName: state.businessName,
          phoneNumber: state.phoneNumber,
        },
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStore = (data: Record<string, unknown>) => {
    dispatch({ type: 'SET_FIRST_STORE', payload: data });
  };

  const handleContinue = () => {
    if (!store) return;
    if (!store.address || !store.cityId || store.latitude == null || store.longitude == null) {
      setAttempted(true);
      toast({ title: 'Address required', description: 'Please search and select your store address.', variant: 'destructive' });
      return;
    }
    if (!store.businessName?.trim()) {
      setAttempted(true);
      toast({ title: 'Store name required', description: 'Please enter a name for this location.', variant: 'destructive' });
      return;
    }
    if (!store.phoneNumber?.trim()) {
      setAttempted(true);
      toast({ title: 'Phone required', description: 'Please enter a phone number for this location.', variant: 'destructive' });
      return;
    }
    dispatch({ type: 'SET_STEP', payload: 2 });
  };

  if (!store) return null;

  const canUseMerchantContact = !!(state.phoneNumber || state.contactEmail);
  const isUsingMerchantContact = (state.phoneNumber && store.phoneNumber === state.phoneNumber) || (state.contactEmail && store.email === state.contactEmail);

  const hasFeatures = (store.features?.length ?? 0) > 0;
  const hasPhotos = (store.galleryUrls?.length ?? 0) > 0;
  const hasHoursData = Object.values(store.businessHours || {}).some(h => !h.closed);
  const hasLocationData = !!(store.address && store.cityId);
  const hasStoreInfoData = (store.businessName || '').trim().length > 0;
  const hasContactDataLocal = (store.phoneNumber || '').trim().length > 0;

  return (
    <OnboardingLayout
      currentStep={1}
      onBack={() => dispatch({ type: 'SET_STEP', payload: 0 })}
      onNext={handleContinue}
      nextLabel="Save & Continue"
      nextDisabled={!store.address || !store.cityId || !store.businessName?.trim() || !store.phoneNumber?.trim()}
      nextDisabledReason="Please complete the required fields (address, store name, phone)."
    >
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">
          Add your first location
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tell us about this venue — address, hours, and details. Customers will use this to find you.
        </p>

        <div className="mt-8 space-y-10">

          {/* ====== LOCATION ====== */}
          <section>
            <LocationSection
              data={{
                address: store.address,
                addressStreet: store.addressStreet,
                addressCity: store.addressCity,
                addressState: store.addressState,
                addressPostcode: store.addressPostcode,
                cityId: store.cityId,
                latitude: store.latitude,
                longitude: store.longitude,
                verifiedAddress: store.verifiedAddress,
              }}
              onUpdate={(d) => updateStore(d)}
              cities={cities}
              attempted={attempted}
            />
          </section>

          {/* ====== MOBILE / FOOD TRUCK ====== */}
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
                  <Truck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Food truck or mobile venue</p>
                  <p className="text-xs text-muted-foreground">
                    Does this location move? You'll post stops on a schedule instead of fixed hours.
                  </p>
                </div>
              </div>
              <Switch
                checked={store.isFoodTruck ?? false}
                onCheckedChange={(checked) => updateStore({ isFoodTruck: checked })}
                aria-label="Food truck or mobile venue"
              />
            </div>
          </section>

          {/* ====== STORE INFO ====== */}
          <section>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Store Info
              {hasStoreInfoData && <CheckCircle2 className="h-4 w-4 text-brand-primary-500" />}
            </h2>

            <div className="mt-4">
              <Label htmlFor="storeName" className="text-sm font-medium text-foreground">
                Store name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="storeName"
                value={store.businessName}
                onChange={(e) => { setAttempted(false); updateStore({ businessName: e.target.value }); }}
                placeholder="e.g. Joe's Coffee — Downtown"
                className={cn(
                  'mt-1 h-11 rounded-xl text-sm transition-colors',
                  attempted && !store.businessName?.trim()
                    ? 'border-red-400 ring-1 ring-red-200 focus:border-red-500 focus:ring-red-300'
                    : 'border-border'
                )}
              />
            </div>

            <div className="mt-4">
              <Label className="text-sm font-medium text-foreground">Store type</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {STORE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const selected = store.storeType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => updateStore({ storeType: t.value })}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all',
                        selected ? 'border-brand-primary-500 bg-brand-primary-50' : 'border-border hover:border-border'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', selected ? 'text-brand-primary-600' : 'text-muted-foreground')} />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ====== CONTACT ====== */}
          <section>
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact
              {hasContactDataLocal && <CheckCircle2 className="h-4 w-4 text-brand-primary-500" />}
            </h2>

            {canUseMerchantContact && (
              <button
                type="button"
                onClick={() => {
                  if (state.phoneNumber) updateStore({ phoneNumber: state.phoneNumber });
                  if (state.contactEmail) updateStore({ email: state.contactEmail });
                }}
                className={cn(
                  'mt-3 flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                  isUsingMerchantContact ? 'border-brand-primary-500 bg-brand-primary-50' : 'border-border hover:border-border'
                )}
              >
                <Copy className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">Use merchant contact info</p>
                  <p className="text-xs text-muted-foreground">
                    {state.phoneNumber && <span>{state.phoneNumber}</span>}
                    {state.phoneNumber && state.contactEmail && ' · '}
                    {state.contactEmail && <span>{state.contactEmail}</span>}
                  </p>
                </div>
                {isUsingMerchantContact && <Check className="h-5 w-5 shrink-0 text-brand-primary-600" />}
              </button>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="storePhone" className="text-sm font-medium text-foreground">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="storePhone"
                    type="text"
                    inputMode="numeric"
                    value={formatPhoneDisplay(store.phoneNumber || '')}
                    onChange={(e) => { setAttempted(false); updateStore({ phoneNumber: stripPhoneToDigits(e.target.value) }); }}
                    placeholder="(555) 123-4567"
                    className={cn(
                      'h-11 pl-10 transition-colors',
                      attempted && !store.phoneNumber?.trim()
                        ? 'border-red-400 ring-1 ring-red-200 focus:border-red-500 focus:ring-red-300'
                        : ''
                    )}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="storeEmail" className="text-sm font-medium text-foreground">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="storeEmail"
                    type="email"
                    value={store.email || ''}
                    onChange={(e) => updateStore({ email: e.target.value })}
                    placeholder="store@example.com"
                    className="h-11 pl-10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ====== HOURS ====== */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hours
              {hasHoursData && <CheckCircle2 className="h-4 w-4 text-brand-primary-500" />}
            </h2>
            <HoursSection
              hours={store.businessHours}
              onChange={(h: BusinessHours) => updateStore({ businessHours: h })}
              isFoodTruck={store.isFoodTruck}
              holidayHours={store.holidayHours || []}
              onHolidayHoursChange={(entries) => updateStore({ holidayHours: entries })}
            />
          </section>

          {/* ====== FEATURES & PHOTOS (accordion) ====== */}
          <AccordionSection title="Features & Photos" defaultOpen={hasFeatures || hasPhotos} completed={hasFeatures || hasPhotos}>
            <div className="space-y-6">
              {/* Features */}
              <div>
                <Label className="text-sm font-medium text-foreground">Store features</Label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FEATURES.map((f) => {
                    const Icon = f.icon;
                    const checked = (store.features || []).includes(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          const cur = store.features || [];
                          const next = cur.includes(f.id) ? cur.filter((x) => x !== f.id) : [...cur, f.id];
                          updateStore({ features: next });
                        }}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all',
                          checked ? 'border-brand-primary-500 bg-brand-primary-50' : 'border-border hover:border-border'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', checked ? 'text-brand-primary-600' : 'text-muted-foreground')} />
                        <span className="text-xs font-medium">{f.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Store photos */}
              <div>
                <Label className="text-sm font-medium text-foreground">Store photos/videos</Label>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Photos help customers find you. You can add more later.</p>
                  <div className="flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-1 text-[10px] font-medium text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 w-fit">
                    <Sparkles className="h-3 w-3" />
                    Premium merchants can also add short videos
                  </div>
                </div>
                <div className="mt-2">
                  {(store.galleryUrls?.length ?? 0) > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {store.galleryUrls.map((url, i) => (
                        <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const next = store.galleryUrls.filter((_, idx) => idx !== i);
                              updateStore({ galleryUrls: next });
                            }}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/60 text-background opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setPhotosModalOpen(true)} className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:bg-muted">
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setPhotosModalOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground hover:bg-muted">
                      <Plus className="h-5 w-5" />
                      Add store photos/videos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </AccordionSection>

          {/* Multi-location hint */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3">
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Have multiple locations?{' '}
              <Link to={PATHS.MERCHANT_STORES} className="font-medium text-brand-primary-600 hover:underline">
                Add other locations later in Dashboard
              </Link>
            </p>
          </div>
        </div>
      </div>

      <ImageUploadModal
        open={photosModalOpen}
        onOpenChange={setPhotosModalOpen}
        onUploadComplete={(urls: string[]) => {
          const current = store.galleryUrls || [];
          updateStore({ galleryUrls: [...current, ...urls] });
        }}
        context="venue_gallery"
        maxFiles={20}
        title="Upload store photos"
        acceptVideos
      />
    </OnboardingLayout>
  );
};
