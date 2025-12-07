// web/src/components/merchant/create-deal/DealImageUpload.tsx
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Camera
} from 'lucide-react';
import { apiPostFormData } from '@/services/api';

interface DealImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const DealImageUpload = ({ 
  images, 
  onImagesChange, 
  maxImages = 5 
}: DealImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, maxImages - images.length);
    if (newFiles.length === 0) {
      setUploadError(`Maximum ${maxImages} images allowed`);
      return;
    }

    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        setUploadError(`${file.name} is not a valid image file`);
        return false;
      }
      
      if (!isValidSize) {
        setUploadError(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('context', 'deal_images');

        const response = await apiPostFormData('/media/upload', formData);

        // Check if response is valid and has the expected structure
        if (!response || !response.data || !(response.data as any).url) {
          throw new Error(`Upload failed for ${file.name}: Invalid response from server`);
        }

        return (response.data as any).url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload images. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Invalid file format or size. Please check your images and try again.';
        } else if (error.message.includes('413')) {
          errorMessage = 'File too large. Please use smaller images.';
        } else if (error.message.includes('Invalid response')) {
          errorMessage = 'Server error during upload. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-brand-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Featured Media</h3>
          <span className="text-sm text-neutral-500">({images.length}/{maxImages})</span>
        </div>
        <p className="text-sm text-neutral-600">
          Upload high-quality images that showcase your deal. First image will be the main display image.
        </p>

        {/* Upload Dropzone */}
        <motion.div
          onClick={openFileDialog}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            uploading 
              ? 'border-brand-primary-300 bg-brand-primary-50' 
              : 'border-neutral-300 hover:border-brand-primary-400 hover:bg-brand-primary-25'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="space-y-4">
            <motion.div
              animate={{ 
                scale: uploading ? [1, 1.1, 1] : 1,
                rotate: uploading ? [0, 5, -5, 0] : 0
              }}
              transition={{ 
                duration: uploading ? 1 : 0.3,
                repeat: uploading ? Infinity : 0
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-100"
            >
              {uploading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary-600 border-t-transparent" />
              ) : (
                <Upload className="h-8 w-8 text-brand-primary-600" />
              )}
            </motion.div>
            
            <div>
              <p className="text-lg font-medium text-neutral-900">
                {uploading ? 'Uploading images...' : 'Click to upload images'}
              </p>
              <p className="text-sm text-neutral-500">
                {uploading 
                  ? 'Please wait while we process your images' 
                  : 'PNG, JPG, GIF up to 5MB each'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Upload Error */}
        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-red-50 border border-red-200 p-3"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{uploadError}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">Uploaded Images</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((imageUrl, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-white"
              >
                <img
                  src={imageUrl}
                  alt={`Deal image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                
                {/* Primary image indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 rounded-full bg-brand-primary-500 px-2 py-1 text-xs font-medium text-white">
                    Main
                  </div>
                )}
                
                {/* Remove button */}
                <motion.button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
                
                {/* Reorder indicator */}
                <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Add more images button */}
          {images.length < maxImages && (
            <motion.button
              onClick={openFileDialog}
              disabled={uploading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-600 hover:border-brand-primary-300 hover:bg-brand-primary-25 hover:text-brand-primary-700 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">
                Add {maxImages - images.length} more image{maxImages - images.length !== 1 ? 's' : ''}
              </span>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
      >
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
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
      </motion.div>
    </div>
  );
};
