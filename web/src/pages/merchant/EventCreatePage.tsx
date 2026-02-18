import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Settings,
  Image as ImageIcon,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  EventCreationProvider,
  useEventCreation,
} from '@/context/EventCreationContext';
import {
  useCreateEvent,
  EVENT_TYPES,
  TICKET_TIERS,
  type CreateEventPayload,
} from '@/hooks/useMerchantEvents';
import { useMediaUpload } from '@/hooks/useMediaUpload';

// ─── Step Definition ────────────────────────────────────────────────

const STEPS = [
  { id: 'basics', label: 'Basics', icon: Sparkles },
  { id: 'datetime', label: 'Date & Location', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'tickets', label: 'Tickets', icon: Ticket },
] as const;

// ─── Stepper ────────────────────────────────────────────────────────

function Stepper({
  currentStep,
  onStepClick,
}: {
  currentStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <button
              key={step.id}
              onClick={() => onStepClick(i)}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full items-center">
                {i > 0 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isCompleted ? 'bg-brand-primary-500' : 'bg-neutral-200',
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isActive
                      ? 'border-brand-primary-500 bg-brand-primary-500 text-white'
                      : isCompleted
                        ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-600'
                        : 'border-neutral-200 bg-white text-neutral-400 group-hover:border-neutral-300',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isCompleted ? 'bg-brand-primary-500' : 'bg-neutral-200',
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive
                    ? 'text-brand-primary-600'
                    : isCompleted
                      ? 'text-brand-primary-500'
                      : 'text-neutral-400',
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Basics ─────────────────────────────────────────────────

function BasicsStep() {
  const { state, dispatch } = useEventCreation();
  const [tagInput, setTagInput] = useState('');

  const setField = (field: string, value: unknown) =>
    dispatch({ type: 'SET_FIELD', field: field as keyof typeof state, value });

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Event Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EVENT_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setField('eventType', value)}
              className={cn(
                'rounded-xl border-2 p-3 text-sm font-medium transition-all',
                state.eventType === value
                  ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={state.title}
          onChange={(e) => setField('title', e.target.value)}
          placeholder="Give your event a catchy name..."
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-neutral-400">
          {state.title.length}/100 characters
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={state.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Describe what your event is about..."
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          rows={4}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Short Description
        </label>
        <input
          type="text"
          value={state.shortDescription}
          onChange={(e) => setField('shortDescription', e.target.value)}
          placeholder="A one-liner for previews..."
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          maxLength={200}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {state.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-brand-primary-50 px-3 py-1 text-xs font-medium text-brand-primary-700"
            >
              {tag}
              <button
                onClick={() => dispatch({ type: 'REMOVE_TAG', tag })}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && tagInput.trim()) {
                e.preventDefault();
                dispatch({ type: 'ADD_TAG', tag: tagInput.trim() });
                setTagInput('');
              }
            }}
            placeholder="Add a tag and press Enter..."
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Date & Location ────────────────────────────────────────

function DateLocationStep() {
  const { state, dispatch } = useEventCreation();

  const setField = (field: string, value: unknown) =>
    dispatch({ type: 'SET_FIELD', field: field as keyof typeof state, value });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={state.startDate}
            onChange={(e) => setField('startDate', e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            End Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={state.endDate}
            onChange={(e) => setField('endDate', e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Timezone
          </label>
          <select
            value={state.timezone}
            onChange={(e) => setField('timezone', e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          >
            <option value="America/New_York">Eastern (ET)</option>
            <option value="America/Chicago">Central (CT)</option>
            <option value="America/Denver">Mountain (MT)</option>
            <option value="America/Los_Angeles">Pacific (PT)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={state.isMultiDay}
              onChange={(e) => setField('isMultiDay', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-brand-primary-500 focus:ring-brand-primary-500"
            />
            <span className="text-sm font-medium text-neutral-700">Multi-day event</span>
          </label>
        </div>
      </div>

      <hr className="border-neutral-200" />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={state.isVirtualEvent}
          onChange={(e) => setField('isVirtualEvent', e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300 text-brand-primary-500 focus:ring-brand-primary-500"
        />
        <span className="text-sm font-medium text-neutral-700">This is a virtual event</span>
      </label>

      {state.isVirtualEvent ? (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Virtual Event URL
          </label>
          <input
            type="url"
            value={state.virtualEventUrl}
            onChange={(e) => setField('virtualEventUrl', e.target.value)}
            placeholder="https://zoom.us/j/..."
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>
      ) : (
        <>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              <MapPin className="mr-1 inline h-4 w-4" />
              Venue Name
            </label>
            <input
              type="text"
              value={state.venueName}
              onChange={(e) => setField('venueName', e.target.value)}
              placeholder="e.g., The Grand Ballroom"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Venue Address
            </label>
            <input
              type="text"
              value={state.venueAddress}
              onChange={(e) => setField('venueAddress', e.target.value)}
              placeholder="123 Main St, City, State"
              className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 3: Settings ───────────────────────────────────────────────

function SettingsStep() {
  const { state, dispatch } = useEventCreation();

  const setField = (field: string, value: unknown) =>
    dispatch({ type: 'SET_FIELD', field: field as keyof typeof state, value });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Max Attendees
          </label>
          <input
            type="number"
            value={state.maxAttendees ?? ''}
            onChange={(e) =>
              setField('maxAttendees', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Unlimited"
            min={1}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Minimum Age
          </label>
          <input
            type="number"
            value={state.minAge ?? ''}
            onChange={(e) =>
              setField('minAge', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="No restriction"
            min={0}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-neutral-200 p-4">
        <h3 className="text-sm font-bold text-neutral-700">Event Options</h3>

        {[
          { field: 'isFreeEvent', label: 'Free Event', desc: 'No ticket purchases required' },
          { field: 'enableWaitlist', label: 'Enable Waitlist', desc: 'Allow users to join a waitlist when sold out' },
          { field: 'isPrivate', label: 'Private Event', desc: 'Only accessible with an access code' },
          { field: 'requiresApproval', label: 'Require Approval', desc: 'Attendees need approval to join' },
          { field: 'ageVerificationReq', label: 'Age Verification', desc: 'Require age verification at check-in' },
        ].map(({ field, label, desc }) => (
          <label
            key={field}
            className="flex items-start gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!state[field as keyof typeof state]}
              onChange={(e) => setField(field, e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-brand-primary-500 focus:ring-brand-primary-500"
            />
            <div>
              <span className="text-sm font-medium text-neutral-700">{label}</span>
              <p className="text-xs text-neutral-400">{desc}</p>
            </div>
          </label>
        ))}
      </div>

      {state.enableWaitlist && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Waitlist Capacity
          </label>
          <input
            type="number"
            value={state.waitlistCapacity ?? ''}
            onChange={(e) =>
              setField('waitlistCapacity', e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Unlimited"
            min={1}
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
          />
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Media ──────────────────────────────────────────────────

function MediaStep() {
  const { state, dispatch } = useEventCreation();
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [coverDragging, setCoverDragging] = useState(false);
  const [galleryDragging, setGalleryDragging] = useState(false);
  const [showCoverUrlInput, setShowCoverUrlInput] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMediaUpload();

  const setField = (field: string, value: unknown) =>
    dispatch({ type: 'SET_FIELD', field: field as keyof typeof state, value });

  // ── Cover Image Upload ──
  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5 MB');
      return;
    }
    setCoverUploading(true);
    try {
      const result = await uploadMutation.mutateAsync({ file, context: 'event_cover' });
      setField('coverImageUrl', result.url);
    } catch {
      alert('Failed to upload cover image. Please try again.');
    } finally {
      setCoverUploading(false);
    }
  }, [uploadMutation, dispatch]);

  const handleCoverDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setCoverDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleCoverUpload(file);
  }, [handleCoverUpload]);

  // ── Gallery Upload ──
  const handleGalleryUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (fileArray.length === 0) return;
    setGalleryUploading(true);
    try {
      for (const file of fileArray) {
        const result = await uploadMutation.mutateAsync({ file, context: 'event_gallery' });
        dispatch({ type: 'ADD_GALLERY_IMAGE', url: result.url });
      }
    } catch {
      alert('Some images failed to upload. Please try again.');
    } finally {
      setGalleryUploading(false);
    }
  }, [uploadMutation, dispatch]);

  const handleGalleryDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setGalleryDragging(false);
    if (e.dataTransfer.files?.length) handleGalleryUpload(e.dataTransfer.files);
  }, [handleGalleryUpload]);

  return (
    <div className="space-y-8">
      {/* ── Cover Image ── */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-neutral-700">
          Cover Image <span className="text-red-500">*</span>
        </label>

        {state.coverImageUrl ? (
          /* Preview */
          <div className="group relative overflow-hidden rounded-xl border border-neutral-200">
            <img
              src={state.coverImageUrl}
              alt="Cover preview"
              className="h-48 w-full object-cover sm:h-56"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-neutral-700 shadow hover:bg-neutral-50"
              >
                Replace
              </button>
              <button
                onClick={() => setField('coverImageUrl', '')}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* Drop zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
            onDragLeave={() => setCoverDragging(false)}
            onDrop={handleCoverDrop}
            onClick={() => !coverUploading && coverInputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors',
              coverDragging
                ? 'border-brand-primary-500 bg-brand-primary-500/5'
                : 'border-neutral-300 bg-neutral-50 hover:border-brand-primary-400 hover:bg-neutral-100',
              coverUploading && 'pointer-events-none opacity-60',
            )}
          >
            {coverUploading ? (
              <>
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-brand-primary-500" />
                <p className="text-sm font-medium text-neutral-600">Uploading…</p>
              </>
            ) : (
              <>
                <Upload className="mb-2 h-8 w-8 text-neutral-400" />
                <p className="text-sm font-medium text-neutral-600">
                  Drag & drop or <span className="text-brand-primary-600">browse</span>
                </p>
                <p className="mt-1 text-xs text-neutral-400">JPG, PNG, WebP · Max 5 MB</p>
              </>
            )}
          </div>
        )}

        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCoverUpload(file);
            e.target.value = '';
          }}
        />

        {/* URL fallback toggle */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowCoverUrlInput((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-700"
          >
            <LinkIcon className="h-3 w-3" />
            {showCoverUrlInput ? 'Hide URL input' : 'Or paste an image URL'}
          </button>
          {showCoverUrlInput && (
            <input
              type="url"
              value={state.coverImageUrl}
              onChange={(e) => setField('coverImageUrl', e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="mt-1.5 w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
            />
          )}
        </div>

        <p className="mt-1 text-xs text-neutral-400">
          Required to publish. Use a high-quality landscape image.
        </p>
      </div>

      {/* ── Video URL ── */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Video URL
        </label>
        <input
          type="url"
          value={state.videoUrl}
          onChange={(e) => setField('videoUrl', e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-brand-primary-500 focus:outline-none focus:ring-2 focus:ring-brand-primary-500/20"
        />
        <p className="mt-1 text-xs text-neutral-400">
          YouTube or Vimeo link for your event promo video.
        </p>
      </div>

      {/* ── Image Gallery ── */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-neutral-700">
          Image Gallery
        </label>

        {/* Existing gallery thumbnails */}
        {state.imageGallery.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {state.imageGallery.map((url, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-neutral-200">
                <img
                  src={url}
                  alt={`Gallery ${i + 1}`}
                  className="h-28 w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  onClick={() => dispatch({ type: 'REMOVE_GALLERY_IMAGE', index: i })}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Gallery drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setGalleryDragging(true); }}
          onDragLeave={() => setGalleryDragging(false)}
          onDrop={handleGalleryDrop}
          onClick={() => !galleryUploading && galleryInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-colors',
            galleryDragging
              ? 'border-brand-primary-500 bg-brand-primary-500/5'
              : 'border-neutral-300 bg-neutral-50 hover:border-brand-primary-400 hover:bg-neutral-100',
            galleryUploading && 'pointer-events-none opacity-60',
          )}
        >
          {galleryUploading ? (
            <>
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-brand-primary-500" />
              <p className="text-sm font-medium text-neutral-600">Uploading…</p>
            </>
          ) : (
            <>
              <Plus className="mb-1 h-6 w-6 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-600">Add gallery images</p>
              <p className="mt-0.5 text-xs text-neutral-400">Drag files or click to browse</p>
            </>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleGalleryUpload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

// ─── Step 5: Tickets ────────────────────────────────────────────────

function TicketsStep() {
  const { state, dispatch } = useEventCreation();
  const [adding, setAdding] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // New tier form state
  const [tierForm, setTierForm] = useState({
    name: '',
    tier: 'GENERAL_ADMISSION' as string,
    price: 0,
    totalQuantity: 100,
    description: '',
    maxPerOrder: 10,
  });

  const resetForm = () => {
    setTierForm({
      name: '',
      tier: 'GENERAL_ADMISSION',
      price: 0,
      totalQuantity: 100,
      description: '',
      maxPerOrder: 10,
    });
    setAdding(false);
    setEditIndex(null);
  };

  const handleSaveTier = () => {
    if (!tierForm.name || tierForm.totalQuantity < 1) return;
    const payload = {
      name: tierForm.name,
      tier: tierForm.tier as 'GENERAL_ADMISSION',
      price: tierForm.price,
      totalQuantity: tierForm.totalQuantity,
      description: tierForm.description || undefined,
      maxPerOrder: tierForm.maxPerOrder,
    };
    if (editIndex !== null) {
      dispatch({ type: 'UPDATE_TICKET_TIER', index: editIndex, tier: payload });
    } else {
      dispatch({ type: 'ADD_TICKET_TIER', tier: payload });
    }
    resetForm();
  };

  const startEdit = (index: number) => {
    const t = state.ticketTiers[index];
    setTierForm({
      name: t.name,
      tier: t.tier,
      price: t.price,
      totalQuantity: t.totalQuantity,
      description: t.description ?? '',
      maxPerOrder: t.maxPerOrder ?? 10,
    });
    setEditIndex(index);
    setAdding(true);
  };

  if (state.isFreeEvent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Ticket className="mb-4 h-12 w-12 text-green-500" />
        <h3 className="mb-2 text-lg font-bold text-neutral-700">Free Event</h3>
        <p className="text-sm text-neutral-500">
          This is a free event — no ticket tiers needed. You can change this in
          the Settings step.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900">Ticket Tiers</h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-primary-50 px-3 py-1.5 text-sm font-medium text-brand-primary-600 hover:bg-brand-primary-100"
          >
            <Plus className="h-4 w-4" />
            Add Tier
          </button>
        )}
      </div>

      {/* Existing tiers */}
      {state.ticketTiers.length > 0 && (
        <div className="space-y-3">
          {state.ticketTiers.map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">{t.name}</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                    {TICKET_TIERS.find((tt) => tt.value === t.tier)?.label ?? t.tier}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  ${t.price.toFixed(2)} · {t.totalQuantity} available · Max {t.maxPerOrder ?? 10}/order
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(i)}
                  className="rounded p-1 text-neutral-400 hover:text-brand-primary-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_TICKET_TIER', index: i })}
                  className="rounded p-1 text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form */}
      {adding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="rounded-xl border-2 border-brand-primary-200 bg-brand-primary-50/30 p-4"
        >
          <h4 className="mb-4 text-sm font-bold text-neutral-700">
            {editIndex !== null ? 'Edit Tier' : 'New Ticket Tier'}
          </h4>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Name *
                </label>
                <input
                  value={tierForm.name}
                  onChange={(e) => setTierForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., General Admission"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Tier Type *
                </label>
                <select
                  value={tierForm.tier}
                  onChange={(e) => setTierForm((f) => ({ ...f, tier: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none"
                >
                  {TICKET_TIERS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Price ($) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={tierForm.price}
                  onChange={(e) =>
                    setTierForm((f) => ({ ...f, price: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={1}
                  value={tierForm.totalQuantity}
                  onChange={(e) =>
                    setTierForm((f) => ({ ...f, totalQuantity: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-neutral-600">
                  Max Per Order
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={tierForm.maxPerOrder}
                  onChange={(e) =>
                    setTierForm((f) => ({ ...f, maxPerOrder: Number(e.target.value) }))
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-600">
                Description
              </label>
              <input
                value={tierForm.description}
                onChange={(e) =>
                  setTierForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What's included in this tier..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTier}
              disabled={!tierForm.name || tierForm.totalQuantity < 1}
              className="rounded-lg bg-brand-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-600 disabled:opacity-50"
            >
              {editIndex !== null ? 'Update Tier' : 'Add Tier'}
            </button>
          </div>
        </motion.div>
      )}

      {state.ticketTiers.length === 0 && !adding && (
        <p className="py-8 text-center text-sm text-neutral-400">
          Add at least one ticket tier for paid events before publishing.
        </p>
      )}
    </div>
  );
}

// ─── Wizard Content ─────────────────────────────────────────────────

function CreateEventWizard() {
  const { state, dispatch } = useEventCreation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const createEvent = useCreateEvent();

  const stepComponents = [
    <BasicsStep key="basics" />,
    <DateLocationStep key="datetime" />,
    <SettingsStep key="settings" />,
    <MediaStep key="media" />,
    <TicketsStep key="tickets" />,
  ];

  // Validation per step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Basics
        return !!state.eventType && state.title.length >= 3 && state.description.length >= 10;
      case 1: // Date & Location
        return !!state.startDate && !!state.endDate;
      case 2: // Settings
        return true; // All optional
      case 3: // Media
        return true; // Cover required only for publish, not create
      case 4: // Tickets
        return true; // Can add later
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      navigate(PATHS.MERCHANT_EVENTS);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Build payload
      const payload: CreateEventPayload = {
        title: state.title,
        description: state.description,
        eventType: state.eventType!,
        startDate: new Date(state.startDate).toISOString(),
        endDate: new Date(state.endDate).toISOString(),
      };

      // Optional fields
      if (state.shortDescription) payload.shortDescription = state.shortDescription;
      if (state.timezone) payload.timezone = state.timezone;
      if (state.isMultiDay) payload.isMultiDay = true;
      if (state.isVirtualEvent) {
        payload.isVirtualEvent = true;
        if (state.virtualEventUrl) payload.virtualEventUrl = state.virtualEventUrl;
      }
      if (state.venueName) payload.venueName = state.venueName;
      if (state.venueAddress) payload.venueAddress = state.venueAddress;
      if (state.maxAttendees) payload.maxAttendees = state.maxAttendees;
      if (state.enableWaitlist) payload.enableWaitlist = true;
      if (state.waitlistCapacity) payload.waitlistCapacity = state.waitlistCapacity;
      if (state.isFreeEvent) payload.isFreeEvent = true;
      if (state.isPrivate) payload.isPrivate = true;
      if (state.requiresApproval) payload.requiresApproval = true;
      if (state.minAge) payload.minAge = state.minAge;
      if (state.ageVerificationReq) payload.ageVerificationReq = true;
      if (state.coverImageUrl) payload.coverImageUrl = state.coverImageUrl;
      if (state.imageGallery.length > 0) payload.imageGallery = state.imageGallery;
      if (state.videoUrl) payload.videoUrl = state.videoUrl;
      if (state.tags.length > 0) payload.tags = state.tags;

      const event = await createEvent.mutateAsync(payload);

      // Create ticket tiers if any were defined
      if (state.ticketTiers.length > 0) {
        // We need to create tiers via separate API calls after event creation
        // We'll use the event ID from the created event
        for (const tier of state.ticketTiers) {
          try {
            const res = await (await import('@/services/api')).apiPost(
              `/events/events/${event.id}/ticket-tiers`,
              tier,
            );
            if (!res.success) {
              console.warn('Failed to create tier:', res.error);
            }
          } catch {
            console.warn('Failed to create tier');
          }
        }
      }

      dispatch({ type: 'RESET' });

      toast({
        title: 'Event Created!',
        description:
          'Your event is saved as a draft. Add a cover image and ticket tiers, then publish when ready.',
      });
      navigate(`/merchant/events/${event.id}`);
    } catch (err: unknown) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create event',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <h1 className="text-3xl font-bold text-neutral-900">Create Event</h1>
            <p className="mt-1 text-neutral-500">
              Fill in the details to create your event. You can edit and publish later.
            </p>
          </motion.div>

          {/* Stepper */}
          <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-xl font-bold text-neutral-800">
                {STEPS[currentStep].label}
              </h2>
              {stepComponents[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white shadow-lg">
        <div className="h-1.5 bg-neutral-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-1.5 bg-gradient-to-r from-brand-primary-400 to-brand-primary-600"
          />
        </div>
        <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={isSubmitting}
            className="rounded-lg"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <span className="text-sm font-medium text-neutral-500">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="rounded-lg"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !isStepValid(0) ||
                !isStepValid(1)
              }
              className="rounded-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Create Event
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

// ─── Exported Page ──────────────────────────────────────────────────

export const CreateEventPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only event organizers can create events. Apply as a merchant to get started.">
    <EventCreationProvider>
      <CreateEventWizard />
    </EventCreationProvider>
  </MerchantProtectedRoute>
);
