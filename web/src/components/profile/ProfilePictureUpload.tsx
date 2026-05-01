import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useMediaUpload';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  userEmail?: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadButton?: boolean;
  className?: string;
}

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedFile = async (
  imageSrc: string,
  pixelCrop: Area,
  outputSize: number,
  fileName: string,
) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not initialize image editor');
  }

  canvas.width = outputSize;
  canvas.height = outputSize;

  // Match the round crop preview by exporting a circular avatar.
  ctx.clearRect(0, 0, outputSize, outputSize);
  ctx.save();
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );
  ctx.restore();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png');
  });

  if (!blob) {
    throw new Error('Could not crop image');
  }

  return new File([blob], fileName.replace(/\.[^.]+$/, '') + '.png', { type: 'image/png' });
};

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
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState('avatar.jpg');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [targetSize, setTargetSize] = useState<number>(512);
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

    const sourceUrl = URL.createObjectURL(file);
    setCropSourceUrl(sourceUrl);
    setCropFileName(file.name);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
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
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeCropper = () => {
    if (cropSourceUrl) {
      URL.revokeObjectURL(cropSourceUrl);
    }
    setCropSourceUrl(null);
    setCroppedAreaPixels(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!cropSourceUrl) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !avatarUpload.isPending) {
        closeCropper();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [cropSourceUrl, avatarUpload.isPending]);

  const handleConfirmCrop = async () => {
    if (!cropSourceUrl || !croppedAreaPixels) {
      toast.error('Please adjust the crop area first');
      return;
    }

    try {
      const croppedFile = await getCroppedFile(cropSourceUrl, croppedAreaPixels, targetSize, cropFileName);
      const localPreview = URL.createObjectURL(croppedFile);
      setPreviewUrl(localPreview);

      avatarUpload.mutate(croppedFile, {
        onSuccess: (data) => {
          toast.success('Profile picture updated successfully!');
          onAvatarUpdate?.(data.url);
          closeCropper();
          setPreviewUrl(null);
          URL.revokeObjectURL(localPreview);
        },
        onError: (error) => {
          console.error('Upload error:', error);
          toast.error(error.message || 'Failed to upload profile picture');
          URL.revokeObjectURL(localPreview);
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to crop image');
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
        <Avatar
          className={cn(
            'relative overflow-hidden border-2 border-neutral-200 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.12)]',
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

      {cropSourceUrl && createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 sm:p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
            <div className="border-b border-neutral-100 px-4 py-3 sm:px-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Crop and resize profile photo</h3>
                <button
                  type="button"
                  className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
                  onClick={closeCropper}
                  disabled={avatarUpload.isPending}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Move and zoom your image to frame it. Press <kbd className="rounded bg-neutral-100 px-1 py-0.5">Esc</kbd> to cancel.
              </p>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-5">
              <div className="relative h-[320px] sm:h-[380px] overflow-hidden rounded-xl bg-neutral-900">
                <Cropper
                  image={cropSourceUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-neutral-600">
                  Zoom
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="mt-1 w-full"
                  />
                </label>

                <label className="text-xs font-medium text-neutral-600">
                  Output size
                  <select
                    value={targetSize}
                    onChange={(e) => setTargetSize(Number(e.target.value))}
                    className="mt-1 h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm text-neutral-800"
                  >
                    <option value={256}>256 x 256</option>
                    <option value={512}>512 x 512</option>
                    <option value={1024}>1024 x 1024</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="border-t border-neutral-100 bg-white px-4 py-3 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCrop({ x: 0, y: 0 });
                    setZoom(1);
                  }}
                  disabled={avatarUpload.isPending}
                >
                  Reset
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={closeCropper} disabled={avatarUpload.isPending}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmCrop} disabled={avatarUpload.isPending}>
                    {avatarUpload.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Done'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};
