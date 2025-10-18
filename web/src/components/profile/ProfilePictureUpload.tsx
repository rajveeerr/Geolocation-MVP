import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  userName?: string;
  userEmail?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadButton?: boolean;
  className?: string;
}

export const ProfilePictureUpload = ({
  currentAvatarUrl,
  userName,
  userEmail,
  onAvatarUpdate,
  size = 'lg',
  showUploadButton = true,
  className
}: ProfilePictureUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const mediaUpload = useMediaUpload();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  const getUserInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
    return userEmail?.[0]?.toUpperCase() ?? 'U';
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', 'user_avatar');

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      if (result.url) {
        toast.success('Profile picture updated successfully!');
        onAvatarUpdate?.(result.url);
        setPreviewUrl(null);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload profile picture');
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemovePreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Avatar Display */}
      <div
        className={cn(
          'relative group cursor-pointer transition-all duration-200',
          sizeClasses[size],
          isDragOver && 'scale-105'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className={cn('border-4 border-white shadow-lg', sizeClasses[size])}>
          <AvatarImage src={displayUrl} alt={userName || userEmail} />
          <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Upload Overlay */}
        <div className={cn(
          'absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          sizeClasses[size]
        )}>
          <Camera className="h-6 w-6 text-white" />
        </div>

        {/* Drag Over Indicator */}
        {isDragOver && (
          <div className={cn(
            'absolute inset-0 bg-blue-500 bg-opacity-30 rounded-full flex items-center justify-center border-2 border-dashed border-blue-400',
            sizeClasses[size]
          )}>
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
        )}

        {/* Preview Remove Button */}
        {previewUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePreview();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Button */}
      {showUploadButton && (
        <div className="flex flex-col items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={mediaUpload.isPending}
            className="flex items-center gap-2"
          >
            {mediaUpload.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                {currentAvatarUrl ? 'Change Photo' : 'Add Photo'}
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center max-w-48">
            Drag & drop or click to upload
            <br />
            Max 5MB, JPG/PNG/GIF
          </p>
        </div>
      )}

    </div>
  );
};
