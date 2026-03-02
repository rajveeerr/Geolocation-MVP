import { useState, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/common/Button';
import { apiPostFormData } from '@/services/api';
import { validateCloudinaryResponse } from '@/lib/cloudinary';
import { X, Plus, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime'];
const DEFAULT_VIDEO_MAX_MB = 50;

export interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (urls: string[]) => void;
  context?: string;
  maxSizeMB?: number;
  maxFiles?: number;
  acceptedFormats?: string[];
  uploadEndpoint?: string;
  title?: string;
  /** When true, accept video files (mp4, webm, mov) with higher size limit */
  acceptVideos?: boolean;
}

type PendingFile = { file: File; id: string; preview: string };

export const ImageUploadModal = ({
  open,
  onOpenChange,
  onUploadComplete,
  context = 'venue_gallery',
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  maxFiles = 20,
  acceptedFormats = DEFAULT_ACCEPTED,
  uploadEndpoint = '/media/upload',
  title = 'Upload photos',
  acceptVideos = false,
}: ImageUploadModalProps) => {
  const effectiveFormats = acceptVideos ? [...DEFAULT_ACCEPTED, ...VIDEO_FORMATS] : acceptedFormats;
  const effectiveMaxMB = acceptVideos ? Math.max(maxSizeMB, DEFAULT_VIDEO_MAX_MB) : maxSizeMB;
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [failures, setFailures] = useState<{ name: string; reason: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!effectiveFormats.includes(file.type)) {
        return acceptVideos
          ? 'Invalid format. Use images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV).'
          : 'Invalid format. Use JPEG, PNG, GIF, or WebP.';
      }
      if (file.size > effectiveMaxMB * 1024 * 1024) {
        return `File too large. Max ${effectiveMaxMB}MB.`;
      }
      return null;
    },
    [effectiveFormats, effectiveMaxMB, acceptVideos]
  );

  const addFiles = useCallback(
    (files: FileList | File[] | null) => {
      if (!files || files.length === 0) return;
      const arr = Array.from(files);
      const remaining = maxFiles - pending.length;
      const toAdd = arr.slice(0, remaining);

      const newPending: PendingFile[] = [];
      toAdd.forEach((file) => {
        const err = validateFile(file);
        if (err) {
          setFailures((f) => [...f, { name: file.name, reason: err }]);
          return;
        }
        newPending.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          preview: URL.createObjectURL(file),
        });
      });

      setPending((p) => {
        const combined = [...p, ...newPending];
        return combined.slice(0, maxFiles);
      });
      setFailures((f) => f.filter((x) => !toAdd.some((fi) => fi.name === x.name)));
    },
    [maxFiles, pending.length, validateFile]
  );

  const removePending = useCallback((id: string) => {
    setPending((p) => {
      const next = p.filter((x) => x.id !== id);
      next.forEach((x) => URL.revokeObjectURL(x.preview));
      return next;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = '';
    },
    [addFiles]
  );

  const handleUpload = useCallback(async () => {
    if (pending.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    setFailures([]);

    const total = pending.length;
    const uploadedUrls: string[] = [];
    const newFailures: { name: string; reason: string }[] = [];

    for (let i = 0; i < pending.length; i++) {
      const { file } = pending[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('context', context);
        const response = await apiPostFormData<{ url: string }>(uploadEndpoint, formData);
        if (response.success && response.data && validateCloudinaryResponse(response.data)) {
          uploadedUrls.push(response.data.url);
        } else {
          newFailures.push({ name: file.name, reason: response.error || 'Upload failed' });
        }
      } catch (err) {
        newFailures.push({ name: file.name, reason: (err as Error).message });
      }
      setUploadProgress(Math.round(((i + 1) / total) * 100));
    }

    setFailures(newFailures);
    setIsUploading(false);

    if (uploadedUrls.length > 0) {
      onUploadComplete(uploadedUrls);
      setPending([]);
      pending.forEach((x) => URL.revokeObjectURL(x.preview));
      if (newFailures.length === 0) {
        onOpenChange(false);
      }
    }
  }, [pending, context, uploadEndpoint, onUploadComplete, onOpenChange]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (isUploading) return;
      if (!newOpen) {
        setPending((prev) => {
          prev.forEach((x) => URL.revokeObjectURL(x.preview));
          return [];
        });
        setFailures([]);
        setUploadProgress(0);
        onOpenChange(false);
      }
    },
    [isUploading, onOpenChange]
  );

  const formatHint = acceptVideos
    ? `Images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV). Max ${effectiveMaxMB}MB per file.`
    : maxFiles === 1
      ? `JPEG, PNG, GIF or WebP. Max ${effectiveMaxMB}MB.`
      : `JPEG, PNG, GIF or WebP. Max ${effectiveMaxMB}MB per image.`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl"
        onPointerDownOutside={(e) => isUploading && e.preventDefault()}
        onEscapeKeyDown={(e) => isUploading && e.preventDefault()}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-6">
          <DialogHeader className="space-y-1 pb-4">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <span className="text-sm text-neutral-500">
              {pending.length === 0
                ? 'No items selected'
                : `${pending.length} item${pending.length !== 1 ? 's' : ''} selected`}
            </span>
            {isUploading && (
              <div className="space-y-2 pt-3">
                <p className="text-sm font-medium text-neutral-700">
                  {Math.round((pending.length * uploadProgress) / 100)} of {pending.length} items uploaded
                </p>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full bg-neutral-900 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Drop zone or preview grid */}
          {pending.length === 0 ? (
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => e.preventDefault()}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-colors',
                dragActive ? 'border-brand-primary-400 bg-brand-primary-50' : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300 hover:bg-neutral-100/50'
              )}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={effectiveFormats.join(',')}
                multiple={maxFiles > 1}
                className="hidden"
                onChange={handleInputChange}
              />
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/80">
                <ImageIcon className="h-10 w-10 text-neutral-400" />
              </div>
              <p className="mt-5 text-lg font-semibold text-neutral-900">Drag and drop</p>
              <p className="mt-1 text-sm text-neutral-500">or browse to select</p>
              <Button
                type="button"
                variant="primary"
                className="mt-5"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                Browse
              </Button>
              <p className="mt-4 text-xs text-neutral-400">{formatHint}</p>
            </div>
          ) : (
            <div className="max-h-[50vh] min-h-0 space-y-4 overflow-y-auto">
              <div
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  'grid grid-cols-2 gap-3 rounded-xl border border-neutral-200 bg-neutral-50/30 p-4 sm:grid-cols-3 md:grid-cols-4',
                  dragActive && 'border-brand-primary-400 bg-brand-primary-50/50'
                )}
              >
              <input
                ref={fileInputRef}
                type="file"
                accept={effectiveFormats.join(',')}
                multiple={maxFiles > 1}
                className="hidden"
                onChange={handleInputChange}
              />
              {pending.map((p) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                  {p.file.type.startsWith('video/') ? (
                    <video src={p.preview} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={p.preview} alt={p.file.name} className="h-full w-full object-cover" />
                  )}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePending(p.id); }}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
                {pending.length < maxFiles && !isUploading && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white text-neutral-400 transition-colors hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-600"
                    aria-label="Add more"
                  >
                    <Plus className="h-10 w-10" />
                  </button>
                )}
              </div>

              {failures.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Some uploads failed</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-red-600">
                  {failures.map((f, i) => (
                    <li key={i}>
                      <strong>{f.name}</strong>: {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4 border-t border-neutral-200 px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
            className="text-neutral-600"
          >
            Done
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleUpload}
            disabled={pending.length === 0 || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
