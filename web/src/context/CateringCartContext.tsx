import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CateringPricingType } from '@/types/catering';

/**
 * Catering cart — per-merchant, persisted to localStorage.
 *
 * Each line snapshots the item display fields (name, image) at add-time so the
 * cart survives even if the underlying item is later edited/archived. Pricing
 * is also cached for display, but the BE recomputes everything at order time.
 */

export interface CateringCartLine {
  /** Stable local id used for editing/removal. Not the catering item id. */
  uid: string;
  cateringItemId: number;
  itemName: string;
  itemImageUrl: string | null;
  itemCategory: string;
  pricingType: CateringPricingType;
  quantity: number;
  /** basePrice + sum of selected option modifiers. */
  pricePerUnit: number;
  /** PER_PERSON: pricePerUnit × quantity. FIXED: pricePerUnit. */
  totalPrice: number;
  selectedChoiceIds: number[];
  /** Comma-joined choice labels for compact display in the cart. */
  selectedOptionsLabel: string;
  specialInstructions: string | null;
}

export interface CateringCartState {
  merchantId: number | null;
  merchantName: string | null;
  lines: CateringCartLine[];
}

interface AddLineArgs extends Omit<CateringCartLine, 'uid'> {
  merchantId: number;
  merchantName: string;
}

interface AddLineResult {
  success: boolean;
  conflict?: { existingMerchantName: string };
}

interface CateringCartContextValue {
  cart: CateringCartState;
  itemCount: number;
  totalAmount: number;
  addLine: (args: AddLineArgs, opts?: { force?: boolean }) => AddLineResult;
  updateQuantity: (uid: string, quantity: number) => void;
  removeLine: (uid: string) => void;
  clear: () => void;
}

const STORAGE_KEY = 'catering-cart-v1';
const EMPTY_CART: CateringCartState = { merchantId: null, merchantName: null, lines: [] };

const CateringCartContext = createContext<CateringCartContextValue | null>(null);

const newUid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const recomputeLineTotal = (line: CateringCartLine, quantity: number): number =>
  line.pricingType === 'FIXED' ? line.pricePerUnit : line.pricePerUnit * quantity;

const loadCart = (): CateringCartState => {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw) as Partial<CateringCartState>;
    if (!parsed || !Array.isArray(parsed.lines)) return EMPTY_CART;
    return {
      merchantId: parsed.merchantId ?? null,
      merchantName: parsed.merchantName ?? null,
      lines: parsed.lines as CateringCartLine[],
    };
  } catch {
    return EMPTY_CART;
  }
};

export const CateringCartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CateringCartState>(EMPTY_CART);

  // Hydrate after mount to avoid SSR mismatch (this app is CSR but be safe).
  useEffect(() => {
    setCart(loadCart());
  }, []);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore quota errors — cart is non-critical
    }
  }, [cart]);

  const addLine = useCallback<CateringCartContextValue['addLine']>(
    (args, opts) => {
      const { merchantId, merchantName, ...lineData } = args;

      // Single-merchant cart enforcement. Caller can pass force:true to clear
      // and start fresh with the new merchant.
      if (cart.merchantId !== null && cart.merchantId !== merchantId && cart.lines.length > 0) {
        if (!opts?.force) {
          return {
            success: false,
            conflict: { existingMerchantName: cart.merchantName ?? 'another merchant' },
          };
        }
        setCart({
          merchantId,
          merchantName,
          lines: [{ uid: newUid(), ...lineData }],
        });
        return { success: true };
      }

      setCart((prev) => ({
        merchantId,
        merchantName,
        lines: [...prev.lines, { uid: newUid(), ...lineData }],
      }));
      return { success: true };
    },
    [cart.merchantId, cart.merchantName, cart.lines.length],
  );

  const updateQuantity = useCallback<CateringCartContextValue['updateQuantity']>((uid, quantity) => {
    if (quantity < 1) return;
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.map((l) =>
        l.uid === uid
          ? { ...l, quantity, totalPrice: recomputeLineTotal(l, quantity) }
          : l,
      ),
    }));
  }, []);

  const removeLine = useCallback<CateringCartContextValue['removeLine']>((uid) => {
    setCart((prev) => {
      const lines = prev.lines.filter((l) => l.uid !== uid);
      return lines.length === 0
        ? EMPTY_CART
        : { ...prev, lines };
    });
  }, []);

  const clear = useCallback<CateringCartContextValue['clear']>(() => {
    setCart(EMPTY_CART);
  }, []);

  const itemCount = useMemo(() => cart.lines.reduce((acc, l) => acc + l.quantity, 0), [cart.lines]);
  const totalAmount = useMemo(
    () => Math.round(cart.lines.reduce((acc, l) => acc + l.totalPrice, 0) * 100) / 100,
    [cart.lines],
  );

  const value = useMemo<CateringCartContextValue>(
    () => ({ cart, itemCount, totalAmount, addLine, updateQuantity, removeLine, clear }),
    [cart, itemCount, totalAmount, addLine, updateQuantity, removeLine, clear],
  );

  return <CateringCartContext.Provider value={value}>{children}</CateringCartContext.Provider>;
};

export const useCateringCart = (): CateringCartContextValue => {
  const ctx = useContext(CateringCartContext);
  if (!ctx) throw new Error('useCateringCart must be used inside CateringCartProvider');
  return ctx;
};
