import type { MenuCollection, MenuCollectionItem } from '@/hooks/useMenuCollections';
import type { PublicMenuCollection, PublicMenuCollectionItem } from '@/hooks/useDealDetail';

type AnyCollection = MenuCollection | PublicMenuCollection;
type AnyCollectionItem = MenuCollectionItem | PublicMenuCollectionItem;

export function getCollectionItems(collection: AnyCollection | null | undefined): AnyCollectionItem[] {
  return collection?.items || [];
}

export function getCollectionCoverImage(collection: AnyCollection | null | undefined) {
  if (!collection) return null;
  if (collection.coverImageUrl) return collection.coverImageUrl;

  for (const item of collection.items || []) {
    const firstImage = item.menuItem.imageUrl || item.menuItem.imageUrls?.[0] || null;
    if (firstImage) return firstImage;
  }

  return null;
}

export function getCollectionEffectiveItemPrice(item: AnyCollectionItem) {
  const basePrice = Number(item.menuItem.price || 0);

  if (item.customPrice !== null && item.customPrice !== undefined) {
    return Number(item.customPrice);
  }

  if (item.customDiscount !== null && item.customDiscount !== undefined) {
    return Math.max(0, basePrice * (1 - Number(item.customDiscount) / 100));
  }

  return basePrice;
}

export function getCollectionSuggestedSubtotal(collection: AnyCollection | null | undefined) {
  return getCollectionItems(collection).reduce((sum, item) => sum + getCollectionEffectiveItemPrice(item), 0);
}

export function getCollectionItemCount(collection: AnyCollection | null | undefined) {
  return collection?._count?.items ?? collection?.items?.length ?? 0;
}

export function formatServesLabel(servesCount: number | null | undefined) {
  if (!servesCount || servesCount < 1) return null;
  return `Serves ${servesCount}`;
}

/**
 * Stable pseudo-random serves count in 2–12 when the merchant has not set one
 * (same seed → same value across reloads).
 */
export function getPlaceholderServesCount(seed: number | string): number {
  const mixed =
    typeof seed === 'string'
      ? [...seed].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7)
      : Math.floor(Math.abs(seed)) * 31 + 7;
  return (Math.abs(mixed) % 11) + 2;
}

/** Prefer real `servesCount`; otherwise a deterministic placeholder from `seed`. */
export function getEffectiveServesCount(
  servesCount: number | null | undefined,
  seed: number | string,
): number {
  if (servesCount != null && servesCount >= 1) return servesCount;
  return getPlaceholderServesCount(seed);
}

/**
 * When the merchant has not set `packagePrice`, synthesize a stable “bundle” price
 * strictly below the sum of dish prices (same seed → same value).
 */
export function getPlaceholderBundlePriceBelowSum(sum: number, seed: number | string): number | null {
  if (!Number.isFinite(sum) || sum <= 0) return null;
  const mixed =
    typeof seed === 'string'
      ? [...seed].reduce((acc, ch) => (acc * 33) ^ ch.charCodeAt(0), 1)
      : Math.floor(Math.abs(Number(seed))) + 1;
  const h = Math.abs(mixed * 1103515245);
  const discountPct = 10 + (h % 17); // 10% … 26%
  let price = sum * (1 - discountPct / 100);
  if (sum >= 8) {
    const floored = Math.floor(price);
    price = Math.min(floored + 0.99, sum - 0.01);
  } else {
    price = Math.round(price * 100) / 100;
  }
  const maxPrice = Math.round((sum - 0.05) * 100) / 100;
  if (price >= sum) price = maxPrice;
  if (price <= 0) price = Math.min(0.99, maxPrice);
  return Math.max(0.01, Math.round(price * 100) / 100);
}
