import type { MenuCollectionMetadata } from './types';
import { META_PREFIX, META_SEPARATOR } from './constants';
import type { MenuCollection } from '@/hooks/useMenuCollections';

export function parseCollectionMetadata(collection: MenuCollection): { metadata: MenuCollectionMetadata | null; displayDescription: string } {
  const desc = collection.description || '';
  if (!desc.startsWith(META_PREFIX)) {
    return { metadata: null, displayDescription: desc };
  }

  const withoutPrefix = desc.slice(META_PREFIX.length);
  const separatorIndex = withoutPrefix.indexOf(META_SEPARATOR);
  if (separatorIndex === -1) {
    try {
      const metadata = JSON.parse(withoutPrefix) as MenuCollectionMetadata;
      return { metadata, displayDescription: '' };
    } catch {
      return { metadata: null, displayDescription: desc };
    }
  }

  const jsonStr = withoutPrefix.slice(0, separatorIndex);
  const displayDescription = withoutPrefix.slice(separatorIndex + 1);

  try {
    const metadata = JSON.parse(jsonStr) as MenuCollectionMetadata;
    return { metadata, displayDescription };
  } catch {
    return { metadata: null, displayDescription: desc };
  }
}

export function encodeCollectionMetadata(meta: MenuCollectionMetadata, displayDescription: string): string {
  return `${META_PREFIX}${JSON.stringify(meta)}${META_SEPARATOR}${displayDescription}`;
}

export function calculateDuration(start: string, end: string): string {
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  if (endMinutes <= startMinutes) endMinutes += 24 * 60;
  const diff = endMinutes - startMinutes;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  return `${hours}h ${minutes}m`;
}

export function formatTimeDisplay(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}
