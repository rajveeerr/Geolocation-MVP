import { useState } from 'react';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';
import { AccordionSection } from '../sections/AccordionSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { useToast } from '@/hooks/use-toast';
import { useAiMerchantSuggestion, useAiStatus } from '@/hooks/useAi';
import { cn } from '@/lib/utils';
import {
  Building2,
  MapPin,
  DollarSign,
  Plus,
  X,
  ImageIcon,
  Truck,
  Home,
  Coffee,
  ShoppingBag,
  Utensils,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Zap,
  Heart,
  Users,
  Sparkles,
  LayoutGrid,
  Sunset,
  Flame,
  Wifi,
  Car,
  CreditCard,
  Music,
  Sun,
  PawPrint,
  Wine,
  Calendar,
  Gift,
} from 'lucide-react';

// ---- Data constants (extracted from old step components) ----

const CATEGORIES = [
  { name: 'Restaurant', icon: Utensils },
  { name: 'Cafe', icon: Coffee },
  { name: 'Retail', icon: ShoppingBag },
  { name: 'Other', icon: Home },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: 'LOCAL' as const, label: 'Local Business', sublabel: 'Independent, single-location venue', icon: MapPin, color: 'green' },
  { value: 'NATIONAL' as const, label: 'National Chain', sublabel: 'Multi-location business or franchise', icon: Building2, color: 'blue' },
];

const PRICE_RANGES = [
  { value: '$', label: '$', desc: 'Budget-friendly' },
  { value: '$$', label: '$$', desc: 'Moderate' },
  { value: '$$$', label: '$$$', desc: 'Upscale' },
  { value: '$$$$', label: '$$$$', desc: 'Fine dining' },
];

const MAX_VIBES = 3;
const VIBE_OPTIONS = [
  { id: 'HAPPY_HOUR', label: 'Happy hour vibe', icon: Sunset },
  { id: 'DATE_NIGHT', label: 'Date night', icon: Heart },
  { id: 'QUICK_BITE', label: 'Quick bite', icon: Utensils },
  { id: 'FINE_DINING', label: 'Fine dining', icon: Sparkles },
  { id: 'TRENDY', label: 'Trendy', icon: Zap },
  { id: 'COZY', label: 'Cozy', icon: Flame },
  { id: 'FAMILY_FRIENDLY', label: 'Family-friendly', icon: Users },
  { id: 'UPSCALE', label: 'Upscale', icon: Sparkles },
  { id: 'CASUAL', label: 'Casual', icon: LayoutGrid },
  { id: 'LIVE_MUSIC', label: 'Live music', icon: Zap },
  { id: 'CENTRAL', label: 'Central location', icon: MapPin },
  { id: 'SPACIOUS', label: 'Spacious', icon: LayoutGrid },
];

const AMENITY_OPTIONS = [
  { id: 'WIFI', label: 'Free WiFi', icon: Wifi },
  { id: 'PARKING', label: 'Parking', icon: Car },
  { id: 'DINE_IN', label: 'Dine-in', icon: Utensils },
  { id: 'CARD_PAYMENT', label: 'Card payments', icon: CreditCard },
  { id: 'GROUP_FRIENDLY', label: 'Group friendly', icon: Users },
  { id: 'LIVE_MUSIC', label: 'Live music / DJ', icon: Music },
  { id: 'OUTDOOR_SEATING', label: 'Outdoor seating', icon: Sun },
  { id: 'PET_FRIENDLY', label: 'Pet friendly', icon: PawPrint },
  { id: 'FULL_BAR', label: 'Full bar', icon: Wine },
  { id: 'TABLE_BOOKING', label: 'Table reservations', icon: Calendar },
  { id: 'LOYALTY_PROGRAM', label: 'Loyalty program', icon: Gift },
  { id: 'HAPPY_HOUR', label: 'Happy hour', icon: Sunset },
];

const CONTACT_FIELDS = [
  { id: 'phone', label: 'Phone number', stateKey: 'phoneNumber', action: 'SET_PHONE_NUMBER' as const, placeholder: '+1 234 567 8900', type: 'tel' as const, icon: Phone, iconColor: 'text-neutral-500' },
  { id: 'contactEmail', label: 'Contact email', stateKey: 'contactEmail', action: 'SET_CONTACT_EMAIL' as const, placeholder: 'hello@yourbusiness.com', type: 'email' as const, icon: Mail, iconColor: 'text-neutral-500' },
  { id: 'website', label: 'Website', stateKey: 'websiteUrl', action: 'SET_WEBSITE_URL' as const, placeholder: 'https://yoursite.com', type: 'url' as const, icon: Globe, iconColor: 'text-neutral-500' },
] as const;

const SOCIAL_FIELDS = [
  { id: 'instagram', label: 'Instagram', stateKey: 'instagramUrl', action: 'SET_INSTAGRAM_URL' as const, placeholder: 'https://instagram.com/yourhandle', type: 'url' as const, icon: Instagram, iconColor: 'text-pink-500' },
  { id: 'facebook', label: 'Facebook', stateKey: 'facebookUrl', action: 'SET_FACEBOOK_URL' as const, placeholder: 'https://facebook.com/yourpage', type: 'url' as const, icon: Facebook, iconColor: 'text-blue-600' },
  { id: 'twitter', label: 'X (Twitter)', stateKey: 'twitterUrl', action: 'SET_TWITTER_URL' as const, placeholder: 'https://x.com/yourhandle', type: 'url' as const, icon: Twitter, iconColor: 'text-neutral-700' },
] as const;

// ---- Component ----

export const BusinessProfileScreen = () => {
  const { state, dispatch } = useOnboarding();
  const { toast } = useToast();
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [aiDescriptionInput, setAiDescriptionInput] = useState('');

  const { data: aiStatus } = useAiStatus();
  const aiEnabled = aiStatus?.aiEnabled ?? false;
  const merchantSuggestMutation = useAiMerchantSuggestion();

  const hasContactData = !!(state.phoneNumber || state.contactEmail || state.websiteUrl || state.instagramUrl || state.facebookUrl || state.twitterUrl);

  const handleContinue = () => {
    if (!state.businessName.trim()) {
      toast({ title: 'Business name required', description: 'Please enter your business name to continue.', variant: 'warn' });
      return;
    }
    dispatch({ type: 'SET_STEP', payload: 1 });
  };

  const toggleVibe = (id: string) => {
    if (state.vibeTags.includes(id)) {
      dispatch({ type: 'SET_VIBE_TAGS', payload: state.vibeTags.filter((t) => t !== id) });
    } else if (state.vibeTags.length < MAX_VIBES) {
      dispatch({ type: 'TOGGLE_VIBE_TAG', payload: id });
    }
  };

  const applyAiSuggestion = async () => {
    const prompt = aiDescriptionInput.trim() || state.description.trim();
    if (!prompt) {
      toast({ title: 'Add a short description first', description: 'Tell AI what kind of place you run.', variant: 'warn' });
      return;
    }

    try {
      const result = await merchantSuggestMutation.mutateAsync({ description: prompt.slice(0, 500) });
      const suggestion = result.suggestion;

      if (suggestion.businessType === 'LOCAL' || suggestion.businessType === 'NATIONAL') {
        dispatch({ type: 'SET_BUSINESS_TYPE', payload: suggestion.businessType });
      }

      if (suggestion.description) {
        dispatch({ type: 'SET_DESCRIPTION', payload: suggestion.description });
      }

      if (suggestion.priceRange) {
        dispatch({ type: 'SET_PRICE_RANGE', payload: suggestion.priceRange });
      }

      toast({
        title: 'Profile draft created',
        description: 'We pre-filled your description and basics. You can tweak anything before publishing.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong while talking to AI.';
      toast({
        title: 'Could not generate suggestion',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <OnboardingLayout
      currentStep={0}
      onBack={() => {}} // No back on first screen
      onNext={handleContinue}
      nextLabel="Save & Continue"
      nextDisabled={!state.businessName.trim()}
      nextDisabledReason="Please enter your business name to continue."
    >
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Tell us about your business
        </h1>
        <p className="mt-2 text-neutral-600">
          Fill in your business details. Only the business name is required — complete the rest now or later from your dashboard.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Left column — main form */}
          <div className="space-y-10 md:col-span-8">

            {/* Food truck toggle */}
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
              <Truck className="h-5 w-5 text-neutral-500" />
              <div className="flex-1">
                <span className="text-sm font-medium text-neutral-900">Is this a mobile / food truck?</span>
                <p className="text-xs text-neutral-500">Different hour and location controls will apply</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={state.isFoodTruck}
                onClick={() => dispatch({ type: 'SET_IS_FOOD_TRUCK', payload: !state.isFoodTruck })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  state.isFoodTruck ? 'bg-brand-primary-600' : 'bg-neutral-300'
                )}
              >
                <span className={cn('inline-block h-4 w-4 rounded-full bg-white transition-transform', state.isFoodTruck ? 'translate-x-6' : 'translate-x-1')} />
              </button>
            </div>

            {/* ====== BUSINESS INFO SECTION ====== */}
            <section>
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Business Info
              </h2>

              {/* Business name */}
              <div className="mt-4">
                <Label htmlFor="businessName" className="text-sm font-medium text-neutral-700">
                  Business name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={state.businessName}
                  onChange={(e) => dispatch({ type: 'SET_BUSINESS_NAME', payload: e.target.value.slice(0, 80) })}
                  placeholder="e.g. Joe's Coffee, Maria's Taco Truck"
                  className="mt-1 h-12 rounded-xl border-neutral-300 text-base"
                  maxLength={80}
                  autoFocus
                />
                <span className="mt-1 block text-xs text-neutral-500">{state.businessName.length}/80</span>
              </div>

              {/* Category */}
              <div className="mt-6">
                <Label className="text-sm font-medium text-neutral-700">Category</Label>
                <p className="mt-0.5 text-xs text-neutral-500">Helps customers find deals at places like yours</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_BUSINESS_CATEGORY', payload: cat.name })}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all',
                        state.businessCategory === cat.name
                          ? 'border-brand-primary-500 bg-brand-primary-50 shadow-card'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <cat.icon className="h-7 w-7 text-neutral-600" />
                      <span className="text-sm font-semibold text-neutral-900">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business type */}
              <div className="mt-6">
                <Label className="text-sm font-medium text-neutral-700">Business type</Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {BUSINESS_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_BUSINESS_TYPE', payload: opt.value })}
                      className={cn(
                        'flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all',
                        state.businessType === opt.value
                          ? 'border-brand-primary-500 bg-brand-primary-50 shadow-card'
                          : 'border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', opt.color === 'green' ? 'bg-green-100' : 'bg-blue-100')}>
                        <opt.icon className={cn('h-5 w-5', opt.color === 'green' ? 'text-green-600' : 'text-blue-600')} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-neutral-900">{opt.label}</span>
                        <p className="text-xs text-neutral-500">{opt.sublabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="mt-6">
                <Label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
                  <DollarSign className="h-4 w-4 text-neutral-500" />
                  Price range
                </Label>
                <p className="mt-0.5 text-xs text-neutral-500">Optional. Helps customers choose where to use their deals.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRICE_RANGES.map((pr) => (
                    <button
                      key={pr.value}
                      type="button"
                      onClick={() => dispatch({ type: 'SET_PRICE_RANGE', payload: state.priceRange === pr.value ? null : pr.value })}
                      className={cn(
                        'rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors',
                        state.priceRange === pr.value
                          ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                      )}
                    >
                      <span className="font-bold">{pr.label}</span>
                      <span className="ml-1.5 text-xs text-neutral-500">{pr.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ====== BRANDING SECTION ====== */}
            <section>
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Make it stand out
              </h2>

              {/* Description */}
              <div className="mt-4">
                <Label htmlFor="description" className="text-sm font-medium text-neutral-700">
                  Description
                </Label>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Appears on your profile and deal pages when customers discover you.
                </p>
                <Textarea
                  id="description"
                  value={state.description}
                  onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
                  placeholder="What makes your place special? Cuisine, atmosphere, happy hours, events..."
                  className="mt-2 min-h-[100px] rounded-xl border-neutral-300 text-sm"
                  rows={4}
                />
                {aiEnabled && (
                  <div className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-primary-600" />
                        <p className="text-xs font-medium text-neutral-800">
                          Let AI draft this for you
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 space-y-2">
                      <Input
                        value={aiDescriptionInput}
                        onChange={(e) => setAiDescriptionInput(e.target.value)}
                        placeholder="e.g. Rooftop bar, cocktails & tapas in downtown..."
                        className="h-9 rounded-lg border-neutral-300 text-xs"
                      />
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={applyAiSuggestion}
                          disabled={merchantSuggestMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
                        >
                          {merchantSuggestMutation.isPending ? (
                            <>
                              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Thinking...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3" />
                              Draft with AI
                            </>
                          )}
                        </button>
                        <p className="text-[11px] text-neutral-500">
                          You can edit everything after it&apos;s filled in.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {!aiEnabled && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Tip: Describe your business in 2-3 words and we&apos;ll help generate a full description once AI is enabled.
                  </p>
                )}
              </div>

              {/* Vibe tags */}
              <div className="mt-6">
                <Label className="text-sm font-medium text-neutral-700">
                  Vibes <span className="text-xs font-normal text-neutral-500">(up to {MAX_VIBES})</span>
                </Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {VIBE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = state.vibeTags.includes(opt.id);
                    const disabled = !selected && state.vibeTags.length >= MAX_VIBES;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleVibe(opt.id)}
                        disabled={disabled}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all',
                          selected
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : disabled
                              ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400'
                              : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amenities */}
              <div className="mt-6">
                <Label className="text-sm font-medium text-neutral-700">Amenities</Label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AMENITY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const selected = state.amenities.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => dispatch({ type: 'TOGGLE_AMENITY', payload: opt.id })}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all',
                          selected
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-neutral-600" />
                        <span className="text-xs font-medium text-neutral-900">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Things to note */}
              <div className="mt-4">
                <Textarea
                  value={state.thingsToNote}
                  onChange={(e) => dispatch({ type: 'SET_THINGS_TO_NOTE', payload: e.target.value })}
                  placeholder="Anything else? e.g. Rooftop terrace, valet parking, wheelchair accessible..."
                  className="min-h-16 resize-none rounded-xl border-neutral-300 text-sm"
                  rows={2}
                />
              </div>
            </section>

            {/* ====== CONTACT & SOCIAL (accordion) ====== */}
            <AccordionSection title="Contact & Social" defaultOpen={hasContactData}>
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Contact</h3>
                {CONTACT_FIELDS.map((field) => {
                  const Icon = field.icon;
                  const value = (state as Record<string, unknown>)[field.stateKey] as string;
                  return (
                    <div key={field.id}>
                      <label htmlFor={`bp-${field.id}`} className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <Icon className={cn('h-4 w-4', field.iconColor)} />
                        {field.label}
                      </label>
                      <Input
                        id={`bp-${field.id}`}
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => dispatch({ type: field.action, payload: e.target.value })}
                        placeholder={field.placeholder}
                        className="h-11 rounded-xl border-neutral-300"
                      />
                    </div>
                  );
                })}

                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Social</h3>
                </div>
                {SOCIAL_FIELDS.map((field) => {
                  const Icon = field.icon;
                  const value = (state as Record<string, unknown>)[field.stateKey] as string;
                  return (
                    <div key={field.id}>
                      <label htmlFor={`bp-${field.id}`} className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700">
                        <Icon className={cn('h-4 w-4', field.iconColor)} />
                        {field.label}
                      </label>
                      <Input
                        id={`bp-${field.id}`}
                        type={field.type}
                        value={value || ''}
                        onChange={(e) => dispatch({ type: field.action, payload: e.target.value })}
                        placeholder={field.placeholder}
                        className="h-11 rounded-xl border-neutral-300"
                      />
                    </div>
                  );
                })}
              </div>
            </AccordionSection>
          </div>

          {/* Right column — Media (sticky on desktop) */}
          <div className="md:col-span-4">
            <div className="md:sticky md:top-24 space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Logo & Photos
              </h2>

              {/* Logo */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700">Business logo</h3>
                <p className="text-xs text-neutral-500">Appears on your deals</p>
                <div className="mt-2">
                  {state.logoUrl ? (
                    <div className="space-y-2">
                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
                        <img src={state.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setLogoModalOpen(true)} className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
                          <ImageIcon className="h-3 w-3" /> Change
                        </button>
                        <button type="button" onClick={() => dispatch({ type: 'SET_LOGO_URL', payload: '' })} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setLogoModalOpen(true)}
                      className="flex w-28 h-28 flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="mt-1 text-xs font-medium">Add logo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Gallery */}
              <div>
                <h3 className="text-sm font-medium text-neutral-700">Gallery photos</h3>
                <p className="text-xs text-neutral-500">Showcase your venue</p>
                <div className="mt-2">
                  {state.galleryUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {state.galleryUrls.map((url, i) => (
                        <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200">
                          <img src={url} alt={`Gallery ${i + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => dispatch({ type: 'REMOVE_GALLERY_URL', payload: i })}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setGalleryModalOpen(true)}
                        className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-400 hover:bg-neutral-50"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setGalleryModalOpen(true)}
                      className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 py-8 text-neutral-400 hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      <Plus className="h-6 w-6" />
                      <span className="mt-1 text-xs font-medium">Add photos</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ImageUploadModal
        open={logoModalOpen}
        onOpenChange={setLogoModalOpen}
        onUploadComplete={(urls: string[]) => { if (urls[0]) dispatch({ type: 'SET_LOGO_URL', payload: urls[0] }); }}
        context="business_logo"
        maxFiles={1}
        maxSizeMB={5}
        acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
        title="Upload logo (1 image only)"
      />
      <ImageUploadModal
        open={galleryModalOpen}
        onOpenChange={setGalleryModalOpen}
        onUploadComplete={(urls: string[]) => { urls.forEach((url) => dispatch({ type: 'ADD_GALLERY_URL', payload: url })); }}
        context="venue_gallery"
        maxFiles={20}
        title="Upload photos"
      />
    </OnboardingLayout>
  );
};
