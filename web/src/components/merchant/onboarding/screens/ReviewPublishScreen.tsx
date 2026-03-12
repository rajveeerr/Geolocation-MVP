import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import {
  businessHoursToOperatingHours,
} from '@/components/merchant/store-registration/storeRegistrationTypes';
import { Loader2, Store, Image, Phone, AlertCircle, MapPin, Pencil } from 'lucide-react';
import { Button } from '@/components/common/Button';

const PRICE_LABELS: Record<string, string> = {
  $: 'Budget-friendly',
  $$: 'Moderate',
  $$$: 'Upscale',
  $$$$: 'Fine dining',
};

const VIBE_LABELS: Record<string, string> = {
  HAPPY_HOUR: 'Happy hour vibe', DATE_NIGHT: 'Date night', QUICK_BITE: 'Quick bite',
  FINE_DINING: 'Fine dining', TRENDY: 'Trendy', COZY: 'Cozy',
  FAMILY_FRIENDLY: 'Family-friendly', UPSCALE: 'Upscale', CASUAL: 'Casual',
  LIVE_MUSIC: 'Live music', CENTRAL: 'Central location', SPACIOUS: 'Spacious',
};

const AMENITY_LABELS: Record<string, string> = {
  WIFI: 'Free WiFi', PARKING: 'Parking', DINE_IN: 'Dine-in',
  CARD_PAYMENT: 'Card payments', GROUP_FRIENDLY: 'Group friendly',
  LIVE_MUSIC: 'Live music / DJ', OUTDOOR_SEATING: 'Outdoor seating',
  PET_FRIENDLY: 'Pet friendly', FULL_BAR: 'Full bar',
  TABLE_BOOKING: 'Table reservations', LOYALTY_PROGRAM: 'Loyalty program',
  HAPPY_HOUR: 'Happy hour',
};

const formatLabel = (id: string, labels: Record<string, string>) =>
  labels[id] ?? id.replace(/_/g, ' ');

export const ReviewPublishScreen = () => {
  const { state, dispatch } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        tiktokUrl: state.tiktokUrl || undefined,
        youtubeUrl: state.youtubeUrl || undefined,
        ownerName: state.ownerName || undefined,
        ownerEmail: state.ownerEmail || undefined,
        ownerPhone: state.ownerPhone || undefined,
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

  const handleSaveDraft = () => {
    toast({ title: 'Draft saved', description: 'Your progress is saved. Continue anytime from the dashboard.' });
    navigate(PATHS.MERCHANT_DASHBOARD);
  };

  const goTo = (step: number) => dispatch({ type: 'SET_STEP', payload: step });

  return (
    <OnboardingLayout
      currentStep={2}
      onBack={() => dispatch({ type: 'SET_STEP', payload: 1 })}
      showFooter={false}
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Review everything before you submit
        </h1>
        <p className="mt-2 text-neutral-600">
          Double-check your details. Click Edit on any section to make changes.
        </p>

        {/* Recheck banner */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Take a moment to recheck</p>
            <p className="mt-0.5 text-sm text-amber-800">
              Ensure your business name, type, description, logo, photos, location, vibes, amenities, and contact info are correct.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Business information */}
          <SectionCard icon={Store} title="Business information" onEdit={() => goTo(0)}>
            <dl className="space-y-3">
              <Row label="Business name" value={state.businessName} />
              <Row label="Category" value={state.businessCategory} />
              <Row label="Type" value={state.businessType === 'NATIONAL' ? 'National Chain' : state.businessType === 'LOCAL' ? 'Local Business' : null} />
              <Row label="Price range" value={state.priceRange ? `${state.priceRange} — ${PRICE_LABELS[state.priceRange] || state.priceRange}` : null} />
              <Row label="Description" value={state.description} />
            </dl>
          </SectionCard>

          {/* Media */}
          <SectionCard icon={Image} title="Logo & photos" onEdit={() => goTo(0)}>
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-neutral-500">Business logo</dt>
                <dd className="mt-1">
                  {state.logoUrl ? (
                    <img src={state.logoUrl} alt="Logo" className="h-20 w-20 rounded-xl border border-neutral-200 object-contain bg-white p-2" />
                  ) : <span className="text-neutral-500">—</span>}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-neutral-500">Gallery ({state.galleryUrls.length} photo{state.galleryUrls.length !== 1 ? 's' : ''})</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {state.galleryUrls.length > 0 ? (
                    <>
                      {state.galleryUrls.slice(0, 6).map((url, i) => (
                        <img key={i} src={url} alt={`Gallery ${i + 1}`} className="h-14 w-14 rounded-lg border border-neutral-200 object-cover" />
                      ))}
                      {state.galleryUrls.length > 6 && (
                        <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-xs font-medium text-neutral-600">+{state.galleryUrls.length - 6}</span>
                      )}
                    </>
                  ) : <span className="text-neutral-500">—</span>}
                </dd>
              </div>
            </div>
          </SectionCard>

          {/* Vibe tags & amenities */}
          {(state.vibeTags.length > 0 || state.amenities.length > 0 || state.thingsToNote) && (
            <SectionCard icon={Store} title="Highlights & amenities" onEdit={() => goTo(0)}>
              <div className="space-y-3">
                {state.vibeTags.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Vibe</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {state.vibeTags.map((t) => <span key={t} className="rounded-lg bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-800">{formatLabel(t, VIBE_LABELS)}</span>)}
                    </dd>
                  </div>
                )}
                {state.amenities.length > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Amenities</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {state.amenities.map((a) => <span key={a} className="rounded-lg bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-800">{formatLabel(a, AMENITY_LABELS)}</span>)}
                    </dd>
                  </div>
                )}
                {state.thingsToNote && <Row label="Things to note" value={state.thingsToNote} />}
              </div>
            </SectionCard>
          )}

          {/* Location */}
          {firstStore && firstStore.address && firstStore.cityId > 0 && (
            <SectionCard icon={MapPin} title="Location" onEdit={() => goTo(1)}>
              <dl className="space-y-3">
                <Row label="Address" value={firstStore.address} />
                <Row label="Store name" value={firstStore.businessName} />
                <Row label="Type" value={firstStore.isFoodTruck ? 'Food truck' : 'Physical store'} />
                <Row label="Phone" value={firstStore.phoneNumber} />
              </dl>
            </SectionCard>
          )}

          {/* Contact & social */}
          <SectionCard icon={Phone} title="Contact & social" onEdit={() => goTo(0)}>
            <dl className="space-y-3">
              <Row label="Phone" value={state.phoneNumber} />
              <Row label="Email" value={state.contactEmail} />
              <Row label="Website" value={state.websiteUrl} />
              <Row label="Instagram" value={state.instagramUrl} />
              <Row label="Facebook" value={state.facebookUrl} />
              <Row label="X (Twitter)" value={state.twitterUrl} />
            </dl>
          </SectionCard>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            className="rounded-full px-6"
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full px-6"
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              'Publish for Review'
            )}
          </Button>
        </div>

        {isSubmitting && (
          <div className="mt-4 flex items-center gap-2 text-neutral-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Submitting your merchant profile...</span>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

// ---- Helpers ----

function SectionCard({ icon: Icon, title, onEdit, children }: { icon: React.ElementType; title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-neutral-500" />
          <h3 className="font-heading text-lg font-bold text-neutral-900">{title}</h3>
        </div>
        <button type="button" onClick={onEdit} className="flex items-center gap-1 text-sm font-medium text-brand-primary-600 hover:underline">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-sm font-medium text-neutral-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-neutral-900 whitespace-pre-wrap break-all">{value || '—'}</dd>
    </div>
  );
}
