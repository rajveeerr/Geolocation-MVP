import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Store, Image, Phone, AlertCircle, MapPin } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';
import {
  businessHoursToOperatingHours,
} from '@/components/merchant/store-registration/storeRegistrationTypes';

const PRICE_LABELS: Record<string, string> = {
  $: 'Budget-friendly',
  $$: 'Moderate',
  $$$: 'Upscale',
  $$$$: 'Fine dining',
};

const VIBE_LABELS: Record<string, string> = {
  HAPPY_HOUR: 'Happy hour vibe',
  DATE_NIGHT: 'Date night',
  QUICK_BITE: 'Quick bite',
  FINE_DINING: 'Fine dining',
  TRENDY: 'Trendy',
  COZY: 'Cozy',
  FAMILY_FRIENDLY: 'Family-friendly',
  UPSCALE: 'Upscale',
  CASUAL: 'Casual',
  LIVE_MUSIC: 'Live music',
  CENTRAL: 'Central location',
  SPACIOUS: 'Spacious',
};

const AMENITY_LABELS: Record<string, string> = {
  WIFI: 'Free WiFi',
  PARKING: 'Parking',
  DINE_IN: 'Dine-in',
  CARD_PAYMENT: 'Card payments',
  GROUP_FRIENDLY: 'Group friendly',
  LIVE_MUSIC: 'Live music / DJ',
  OUTDOOR_SEATING: 'Outdoor seating',
  PET_FRIENDLY: 'Pet friendly',
  FULL_BAR: 'Full bar',
  TABLE_BOOKING: 'Table reservations',
  LOYALTY_PROGRAM: 'Loyalty program',
  HAPPY_HOUR: 'Happy hour',
};

const formatLabel = (id: string, labels: Record<string, string>) =>
  labels[id] ?? id.replace(/_/g, ' ');

export const FinalReviewStep = () => {
  const { state, dispatch } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const step = 25;

  const firstStore = state.firstStore;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const stores =
        firstStore &&
        firstStore.address &&
        firstStore.cityId &&
        firstStore.latitude != null &&
        firstStore.longitude != null
          ? [
              {
                address: firstStore.address,
                cityId: firstStore.cityId,
                latitude: firstStore.latitude,
                longitude: firstStore.longitude,
                active: firstStore.active ?? true,
                description: firstStore.description || null,
                operatingHours: businessHoursToOperatingHours(firstStore.businessHours),
                galleryUrls: firstStore.galleryUrls?.length ? firstStore.galleryUrls : undefined,
                isFoodTruck: firstStore.isFoodTruck ?? false,
              },
            ]
          : undefined;

      const payload = {
        businessName: state.businessName,
        description: state.description || undefined,
        logoUrl: state.logoUrl || undefined,
        phoneNumber: state.phoneNumber || undefined,
        businessType: state.businessType || 'LOCAL',
        businessCategory: state.businessCategory || undefined,
        categoryId: state.categoryId || undefined,
        websiteUrl: state.websiteUrl || undefined,
        instagramUrl: state.instagramUrl || undefined,
        facebookUrl: state.facebookUrl || undefined,
        twitterUrl: state.twitterUrl || undefined,
        priceRange: state.priceRange || undefined,
        galleryUrls: state.galleryUrls.length > 0 ? state.galleryUrls : undefined,
        vibeTags: state.vibeTags.length > 0 ? state.vibeTags : undefined,
        amenities: state.amenities.length > 0 ? state.amenities : undefined,
        thingsToNote: state.thingsToNote || undefined,
        stores,
      };

      const response = await apiPost('/merchants/register', payload);
      if (response.success) {
        toast({
          title: 'Application submitted!',
          description:
            'Your profile and location are pending approval. Add more locations, create deals, and manage your menu from the dashboard next.',
        });
        localStorage.removeItem('merchantOnboardingState');
        navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
        throw new Error(response.error || 'Something went wrong.');
      }
    } catch (err) {
      toast({
        title: 'Submission failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={handleSubmit}
      nextLabel={isSubmitting ? 'Submitting...' : 'Finish & Submit'}
      nextDisabled={isSubmitting}
      nextDisabledReason="Please wait while we submit your application."
      showFooter={true}
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Review everything before you submit
        </h1>
        <p className="mt-2 text-neutral-600">
          Double-check everything before we submit your profile. Use Back to make changes.
        </p>

        {/* Recheck banner */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Take a moment to recheck</p>
            <p className="mt-0.5 text-sm text-amber-800">
              Ensure your business name, type, description, logo, photos, location, vibes, amenities, and contact
              info are correct.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Business information */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-neutral-500" />
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Business information
              </h3>
            </div>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Business name</dt>
                <dd className="mt-1 font-medium text-neutral-900">{state.businessName || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Category</dt>
                <dd className="mt-1 font-medium text-neutral-900">
                  {state.businessCategory || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Type of business</dt>
                <dd className="mt-1 font-medium text-neutral-900">
                  {state.businessType === 'NATIONAL' ? 'National Chain' : state.businessType === 'LOCAL' ? 'Local Business' : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Price range</dt>
                <dd className="mt-1 font-medium text-neutral-900">
                  {state.priceRange
                    ? `${state.priceRange} — ${PRICE_LABELS[state.priceRange] || state.priceRange}`
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">About / Description</dt>
                <dd className="mt-1 font-medium text-neutral-900 whitespace-pre-wrap">
                  {state.description || '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Media */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-neutral-500" />
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Logo & photos
              </h3>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Business logo</dt>
                <dd className="mt-1">
                  {state.logoUrl ? (
                    <img
                      src={state.logoUrl}
                      alt="Logo"
                      className="h-24 w-24 rounded-xl border border-neutral-200 object-contain bg-white p-2"
                    />
                  ) : (
                    <span className="text-neutral-500">—</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">
                  Gallery ({state.galleryUrls.length} photo{state.galleryUrls.length !== 1 ? 's' : ''})
                </dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {state.galleryUrls.length > 0 ? (
                    <>
                      {state.galleryUrls.slice(0, 6).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Gallery ${i + 1}`}
                          className="h-16 w-16 rounded-xl border border-neutral-200 object-cover"
                        />
                      ))}
                      {state.galleryUrls.length > 6 && (
                        <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-xs font-medium text-neutral-600">
                          +{state.galleryUrls.length - 6}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-neutral-500">—</span>
                  )}
                </dd>
              </div>
            </div>
          </div>

          {/* Vibe tags & amenities */}
          {(state.vibeTags.length > 0 || state.amenities.length > 0 || state.thingsToNote) && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Highlights & amenities
              </h3>
              <div className="mt-4 space-y-3">
                {state.vibeTags.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Vibe</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {state.vibeTags.map((t) => (
                        <span
                          key={t}
                          className="rounded-lg bg-neutral-200 px-2.5 py-1 text-sm font-medium text-neutral-800"
                        >
                          {formatLabel(t, VIBE_LABELS)}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {state.amenities.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Amenities</dt>
                    <dd className="mt-1 flex flex-wrap gap-2">
                      {state.amenities.map((a) => (
                        <span
                          key={a}
                          className="rounded-lg bg-neutral-200 px-2.5 py-1 text-sm font-medium text-neutral-800"
                        >
                          {formatLabel(a, AMENITY_LABELS)}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {state.thingsToNote && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Things to note</dt>
                    <dd className="mt-1 font-medium text-neutral-900 whitespace-pre-wrap">
                      {state.thingsToNote}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location */}
          {firstStore && firstStore.address && firstStore.cityId && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-neutral-500" />
                <h3 className="font-heading text-lg font-bold text-neutral-900">
                  Location
                </h3>
              </div>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Address</dt>
                  <dd className="mt-1 font-medium text-neutral-900">{firstStore.address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-500">Type</dt>
                  <dd className="mt-1 font-medium text-neutral-900">
                    {firstStore.isFoodTruck ? 'Food truck' : 'Physical store'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Contact & social */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-neutral-500" />
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                Contact & social
              </h3>
            </div>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Phone</dt>
                <dd className="mt-1 font-medium text-neutral-900">{state.phoneNumber || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Website</dt>
                <dd className="mt-1 font-medium text-neutral-900 break-all">{state.websiteUrl || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Instagram</dt>
                <dd className="mt-1 font-medium text-neutral-900 break-all">{state.instagramUrl || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Facebook</dt>
                <dd className="mt-1 font-medium text-neutral-900 break-all">{state.facebookUrl || '—'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">X (Twitter)</dt>
                <dd className="mt-1 font-medium text-neutral-900 break-all">{state.twitterUrl || '—'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {isSubmitting && (
          <div className="mt-6 flex items-center gap-2 text-neutral-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Submitting your merchant profile...</span>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};
