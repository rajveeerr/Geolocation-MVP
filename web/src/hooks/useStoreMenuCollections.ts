import { useMemo } from 'react';
import { useMenuCollections } from './useMenuCollections';
import { parseCollectionMetadata } from '@/components/merchant/menu-tab/utils';
import type { MenuCollectionMetadata } from '@/components/merchant/menu-tab/types';
import type { MenuCollection } from './useMenuCollections';

export interface ParsedMenuCollection extends MenuCollection {
  parsedMetadata: MenuCollectionMetadata | null;
  displayDescription: string;
}

export function useStoreMenuCollections(storeId: number | null) {
  const { data, ...rest } = useMenuCollections();

  const collections = useMemo<ParsedMenuCollection[]>(() => {
    if (!data?.collections) return [];
    return data.collections
      .map((c) => {
        const { metadata, displayDescription } = parseCollectionMetadata(c);
        return { ...c, parsedMetadata: metadata, displayDescription };
      })
      .filter((c) => {
        if (!storeId) return true;
        return c.parsedMetadata?.storeId === storeId;
      });
  }, [data, storeId]);

  return { collections, ...rest };
}
