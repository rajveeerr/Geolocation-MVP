import React, { useState, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiPostFormData } from '@/services/api';
import { validateCloudinaryResponse, getOptimizedImageUrl, isCloudinaryUrl } from '@/lib/cloudinary';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  onError?: (error: string) => void;
  label?: string;
  description?: string;
  context?: string;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onError,
  label = "Upload Image",
  description,
  context = "business_logo",
  maxSize = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  className,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!acceptedFormats.includes(file.type)) {
      onError?.(`Invalid file type. Please upload ${acceptedFormats.join(', ')} files.`);
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      onError?.(`File size too large. Please upload files smaller than ${maxSize}MB.`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', context);

      const response = await apiPostFormData<{ url: string; publicId: string; message: string }>('/media/upload', formData);
      
      if (response.success && response.data) {
        // Validate Cloudinary response
        if (validateCloudinaryResponse(response.data)) {
          // Use the Cloudinary URL directly - it's already optimized
          onChange(response.data.url);
        } else {
          onError?.('Invalid response from upload service. Please try again.');
        }
      } else {
        onError?.(response.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      {description && <p className="text-sm text-neutral-500">{description}</p>}
      
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive && "border-brand-primary-500 bg-brand-primary-50",
          value && "border-green-300 bg-green-50",
          disabled && "opacity-50 cursor-not-allowed",
          !value && !dragActive && "border-neutral-300 hover:border-neutral-400"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {value ? (
          <div className="flex items-center justify-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={value}
                alt="Uploaded logo"
                className="h-20 w-20 object-cover rounded-lg border border-neutral-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">Logo uploaded successfully</p>
              <p className="text-xs text-green-600 truncate">{value}</p>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600" />
                <p className="text-sm text-neutral-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-neutral-100 rounded-full">
                  <ImageIcon className="h-6 w-6 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-700">
                    {dragActive ? 'Drop your logo here' : 'Upload your business logo'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Drag and drop or click to browse
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    PNG, JPG, GIF up to {maxSize}MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleClick}
                  disabled={disabled}
                  className="mt-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
