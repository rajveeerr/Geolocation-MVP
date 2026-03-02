import { useState } from 'react';
import { useOnboarding } from '@/context/MerchantOnboardingContext';
import { OnboardingLayout } from './OnboardingLayout';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { Plus, X, ImageIcon } from 'lucide-react';
import { getChapterProgress } from '@/context/MerchantOnboardingContext';

export const MediaStep = () => {
  const { state, dispatch } = useOnboarding();
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const step = 9;

  const handleLogoUpload = (urls: string[]) => {
    if (urls[0]) dispatch({ type: 'SET_LOGO_URL', payload: urls[0] });
  };

  const handleGalleryUpload = (urls: string[]) => {
    urls.forEach((url) => dispatch({ type: 'ADD_GALLERY_URL', payload: url }));
  };

  const hasLogo = Boolean(state.logoUrl);
  const hasGallery = state.galleryUrls.length > 0;

  return (
    <OnboardingLayout
      chapterProgress={getChapterProgress(step)}
      onBack={() => dispatch({ type: 'SET_STEP', payload: step - 1 })}
      onNext={() => dispatch({ type: 'SET_STEP', payload: step + 1 })}
      nextLabel="Next"
      nextDisabled={false}
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-heading text-2xl font-bold text-neutral-900 md:text-3xl">
          Add your logo and photos
        </h1>
        <p className="mt-2 text-neutral-600">
          Optional. Photos that stand out get more saves and check-ins. Logo appears on your deals.
        </p>

        <div className="mt-8 space-y-8">
          {/* Logo — 1 image only */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Business logo</h3>
            <p className="mt-0.5 text-sm text-neutral-500">Upload one image only</p>
            <div className="mt-3">
              {hasLogo ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
                    <img
                      src={state.logoUrl}
                      alt="Business logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setLogoModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Change logo
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SET_LOGO_URL', payload: '' })}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                      aria-label="Remove logo"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLogoModalOpen(true)}
                  className="flex w-full max-w-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 py-10 text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                >
                  <Plus className="h-10 w-10" />
                  <span className="mt-3 text-sm font-medium">Add logo</span>
                </button>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-800">Gallery photos</h3>
            <p className="mt-0.5 text-sm text-neutral-500">Showcase your venue with multiple photos</p>
            <div className="mt-3">
              {hasGallery ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {state.galleryUrls.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-neutral-200"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => dispatch({ type: 'REMOVE_GALLERY_URL', payload: i })}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setGalleryModalOpen(true)}
                    className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                    aria-label="Add more photos"
                  >
                    <Plus className="h-10 w-10" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(true)}
                  className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 py-12 text-neutral-500 transition-colors hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-600"
                >
                  <Plus className="h-10 w-10" />
                  <span className="mt-4 text-sm font-medium">Add photos</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <ImageUploadModal
          open={logoModalOpen}
          onOpenChange={setLogoModalOpen}
          onUploadComplete={handleLogoUpload}
          context="business_logo"
          maxFiles={1}
          maxSizeMB={5}
          acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']}
          title="Upload logo (1 image only)"
        />
        <ImageUploadModal
          open={galleryModalOpen}
          onOpenChange={setGalleryModalOpen}
          onUploadComplete={handleGalleryUpload}
          context="venue_gallery"
          maxFiles={20}
          title="Upload photos"
        />
      </div>
    </OnboardingLayout>
  );
};
