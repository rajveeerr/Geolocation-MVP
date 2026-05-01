import { useCallback, useMemo, useState } from 'react';

const STORAGE_KEY = 'bulk-order-cart-v1';

export interface BulkCartItem {
  menuItemId: number;
  merchantId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  variantId?: number | null;
  variantLabel?: string | null;
  servesCount?: number | null;
}

type BulkCartState = {
  peopleCount: number;
  items: BulkCartItem[];
};

const DEFAULT_STATE: BulkCartState = {
  peopleCount: 10,
  items: [],
};

function readCart(): BulkCartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return DEFAULT_STATE;
    const peopleCount = Number(parsed.peopleCount);
    return {
      peopleCount: Number.isInteger(peopleCount) && peopleCount > 0 ? peopleCount : DEFAULT_STATE.peopleCount,
      items: parsed.items,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeCart(next: BulkCartState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function useBulkOrderCart() {
  const [state, setState] = useState<BulkCartState>(() => readCart());

  const updateState = useCallback((updater: (prev: BulkCartState) => BulkCartState) => {
    setState((prev) => {
      const next = updater(prev);
      writeCart(next);
      return next;
    });
  }, []);

  const setPeopleCount = useCallback(
    (count: number) => {
      updateState((prev) => ({
        ...prev,
        peopleCount: Number.isInteger(count) && count > 0 ? count : prev.peopleCount,
      }));
    },
    [updateState],
  );

  const addItem = useCallback(
    (item: BulkCartItem) => {
      updateState((prev) => {
        const existingIndex = prev.items.findIndex(
          (line) => line.menuItemId === item.menuItemId && (line.variantId ?? null) === (item.variantId ?? null),
        );
        if (existingIndex >= 0) {
          const nextItems = [...prev.items];
          const existing = nextItems[existingIndex]!;
          nextItems[existingIndex] = { ...existing, quantity: existing.quantity + item.quantity };
          return { ...prev, items: nextItems };
        }
        return { ...prev, items: [...prev.items, item] };
      });
    },
    [updateState],
  );

  const removeItem = useCallback(
    (menuItemId: number, variantId?: number | null) => {
      updateState((prev) => ({
        ...prev,
        items: prev.items.filter(
          (line) => !(line.menuItemId === menuItemId && (line.variantId ?? null) === (variantId ?? null)),
        ),
      }));
    },
    [updateState],
  );

  const clearCart = useCallback(() => {
    updateState(() => DEFAULT_STATE);
  }, [updateState]);

  const subtotal = useMemo(
    () => state.items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [state.items],
  );

  return {
    ...state,
    subtotal,
    setPeopleCount,
    addItem,
    removeItem,
    clearCart,
  };
}
