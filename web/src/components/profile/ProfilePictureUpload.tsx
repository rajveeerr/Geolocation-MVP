import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string | null;
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
  className,
}: ProfilePictureUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarUpload = useAvatarUpload();

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24',
    xl: 'h-32 w-32',
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
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    avatarUpload.mutate(file, {
      onSuccess: (data) => {
        toast.success('Profile picture updated successfully!');
        onAvatarUpdate?.(data.url);
        setPreviewUrl(null);
      },
      onError: (error) => {
        console.error('Upload error:', error);
        toast.error(error.message || 'Failed to upload profile picture');
        setPreviewUrl(null);
      },
    });
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
      <div
        className={cn(
          'group relative cursor-pointer transition-all duration-300',
          sizeClasses[size],
          isDragOver && 'scale-[1.03]',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.95),rgba(235,239,247,0.7),rgba(213,219,232,0.45))] blur-md" />
        <Avatar
          className={cn(
            'relative border-[6px] border-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.16)]',
            sizeClasses[size],
          )}
        >
          <AvatarImage src={displayUrl} alt={userName || userEmail} />
          <AvatarFallback className="bg-[linear-gradient(135deg,#1f2937,#6b7280,#d4d4d8)] text-2xl font-semibold text-white">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-full bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
            sizeClasses[size],
          )}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>

        {isDragOver && (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full border-2 border-dashed border-white/90 bg-white/20 backdrop-blur-sm',
              sizeClasses[size],
            )}
          >
            <Upload className="h-6 w-6 text-white" />
          </div>
        )}

        {previewUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemovePreview();
            }}
            className="absolute -right-1 -top-1 rounded-full bg-black/80 p-1 text-white transition-colors hover:bg-black"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

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
            disabled={avatarUpload.isPending}
            className="h-10 rounded-full border-black/10 bg-white/80 px-5 text-[13px] font-medium text-neutral-800 shadow-[0_10px_25px_rgba(15,23,42,0.08)] backdrop-blur hover:bg-white"
          >
            {avatarUpload.isPending ? (
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

          <p className="max-w-48 text-center text-[11px] leading-5 text-neutral-500">
            Drag & drop or click to upload
            <br />
            Max 5MB, JPG/PNG/GIF
          </p>
        </div>
      )}
    </div>
  );
};
