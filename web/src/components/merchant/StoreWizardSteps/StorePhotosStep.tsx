/**
 * "Add photos of this location" - Single focused step.
 */
import { useState } from 'react';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';
import { Plus, X } from 'lucide-react';

interface StorePhotosStepProps {
  data: { galleryUrls: string[] };
  onUpdate: (data: { galleryUrls: string[] }) => void;
}

export const StorePhotosStep = ({ data, onUpdate }: StorePhotosStepProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const urls = data.galleryUrls || [];

  const handleUpload = (newUrls: string[]) => {
    onUpdate({ galleryUrls: [...urls, ...newUrls] });
  };

  const remove = (i: number) => {
    onUpdate({ galleryUrls: urls.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Add photos of this location</h2>
        <p className="mt-2 text-neutral-600">
          Photos help customers find you and get excited about your deals. You can add more later.
        </p>
      </div>
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url, i) => {
            const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url) || /\/video\//i.test(url);
            return (
              <div key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border">
                {isVideo ? (
                  <video src={url} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <img src={url} alt="" className="h-full w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 py-8 text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
      >
        <Plus className="h-6 w-6" />
        Add photo or video
      </button>
      <ImageUploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUploadComplete={handleUpload}
        context="venue_gallery"
        maxFiles={20}
        title="Upload store photos & videos"
        acceptVideos
      />
    </div>
  );
};
