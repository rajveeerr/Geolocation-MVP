import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiPostFormData } from '@/services/api';

interface UploadedImage {
  id: string;
  url: string;
  publicId: string;
  name: string;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  context?: string;
  className?: string;
}

export const ImageUpload = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  context = 'menu_item',
  className
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `File type not supported. Please upload ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} files.`;
    }
    
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB.`;
    }
    
    return null;
  };

  const uploadImage = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('context', context);

    const response = await apiPostFormData<{
      success: boolean;
      data: {
        url: string;
        publicId: string;
      };
      error?: string;
    }>('/media/upload', formData);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to upload image');
    }

    return {
      id: response.data.publicId,
      url: response.data.url,
      publicId: response.data.publicId,
      name: file.name
    };
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > maxImages) {
      setUploadError(`You can only upload up to ${maxImages} images.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        const validationError = validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }
        return uploadImage(file);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedImages]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange, context]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeImage = (imageId: string) => {
    onImagesChange(images.filter(img => img.id !== imageId));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          isDragging
            ? 'border-brand-primary-500 bg-brand-primary-50'
            : 'border-neutral-300 hover:border-neutral-400',
          uploading && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
              <p className="text-sm text-neutral-600">Uploading images...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-neutral-400" />
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  Drop images here or click to browse
                </p>
                <p className="text-xs text-neutral-500">
                  {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeInMB}MB each
                </p>
                <p className="text-xs text-neutral-500">
                  Maximum {maxImages} images
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-700">
              Uploaded Images ({images.length}/{maxImages})
            </h4>
            {images.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onImagesChange([])}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(image.id);
                  }}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
                
                {/* Image Name */}
                <p className="mt-1 text-xs text-neutral-600 truncate" title={image.name}>
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button (Alternative) */}
      {images.length === 0 && (
        <div className="text-center">
          <Button
            type="button"
            variant="secondary"
            onClick={openFileDialog}
            disabled={uploading}
            className="w-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Choose Images
          </Button>
        </div>
      )}
    </div>
  );
};
