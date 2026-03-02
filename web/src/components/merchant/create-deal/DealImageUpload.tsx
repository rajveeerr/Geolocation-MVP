// web/src/components/merchant/create-deal/DealImageUpload.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Plus, CheckCircle, Camera } from 'lucide-react';
import { ImageUploadModal } from '@/components/common/ImageUploadModal';

interface DealImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const DealImageUpload = ({
  images,
  onImagesChange,
  maxImages = 5,
}: DealImageUploadProps) => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const handleUploadComplete = (urls: string[]) => {
    const remaining = maxImages - images.length;
    const toAdd = urls.slice(0, remaining);
    onImagesChange([...images, ...toAdd]);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5 text-brand-primary-600" />
        <h3 className="text-lg font-semibold text-neutral-900">Featured Media</h3>
        <span className="text-sm text-neutral-500">({images.length}/{maxImages})</span>
      </div>
      <p className="text-sm text-neutral-600">
        Upload high-quality images that showcase your deal. First image will be the main display image.
      </p>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((imageUrl, index) => (
            <motion.div
              key={`${imageUrl}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <img
                src={imageUrl}
                alt={`Deal image ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {index === 0 && (
                <div className="absolute left-2 top-2 rounded-full bg-brand-primary-500 px-2 py-1 text-xs font-medium text-white">
                  Main
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                {index + 1}
              </div>
            </motion.div>
          ))}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 text-neutral-400 transition-colors hover:border-brand-primary-300 hover:bg-brand-primary-25 hover:text-brand-primary-700"
              aria-label="Add more images"
            >
              <Plus className="h-10 w-10" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setUploadModalOpen(true)}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 py-12 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <ImageIcon className="h-8 w-8 text-neutral-400" />
          </div>
          <p className="mt-4 text-base font-semibold text-neutral-900">Add photos</p>
          <p className="mt-1 text-sm text-neutral-500">Drag and drop or browse. PNG, JPG, GIF up to 5MB.</p>
        </button>
      )}

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
          <div>
            <h4 className="font-medium text-neutral-900">Image Tips</h4>
            <ul className="mt-2 space-y-1 text-sm text-neutral-600">
              <li>• Use high-quality, well-lit images</li>
              <li>• Show your product or service clearly</li>
              <li>• First image will be the main display image</li>
              <li>• Square images (1:1 ratio) work best</li>
            </ul>
          </div>
        </div>
      </div>

      <ImageUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUploadComplete={handleUploadComplete}
        context="deal_images"
        maxFiles={maxImages - images.length}
        title="Upload photos"
      />
    </div>
  );
};
