import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ExternalLink, Loader2, ShoppingBag } from 'lucide-react';
import { CateringItemCard } from '@/components/catering/CateringItemCard';
import { CateringItemDetailModal } from '@/components/catering/CateringItemDetailModal';
import { CateringCartDrawer } from '@/components/catering/CateringCartDrawer';
import { CateringCartProvider, useCateringCart } from '@/context/CateringCartContext';
import { usePublicCateringMenu } from '@/hooks/useCatering';
import { cn } from '@/lib/utils';
import type { CateringItem } from '@/types/catering';

interface CateringTabProps {
  merchantId: number | string;
  merchantName: string;
}

const ALL_CATEGORY = '__all__';

function CartFab({ onOpen }: { onOpen: () => void }) {
  const { itemCount, totalAmount } = useCateringCart();
  if (itemCount === 0) return null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-3 rounded-full bg-neutral-950 px-5 py-3 text-white shadow-2xl transition hover:bg-neutral-800"
    >
      <span className="relative">
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold">
          {itemCount}
        </span>
      </span>
      <span className="text-sm font-semibold">View cart · ${totalAmount.toFixed(2)}</span>
    </button>
  );
}

function CateringTabInner({ merchantId, merchantName }: { merchantId: number; merchantName: string }) {
  const { data, isLoading, error } = usePublicCateringMenu(merchantId);
  const [openItem, setOpenItem] = useState<CateringItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [cartOpen, setCartOpen] = useState(false);

  const items = data?.items ?? [];
  const merchant = data?.merchant ?? null;

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, CateringItem[]>();
    for (const it of items) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const visibleSections = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return itemsByCategory;
    return itemsByCategory.filter(([cat]) => cat === activeCategory);
  }, [itemsByCategory, activeCategory]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !merchant || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
        <ChefHat className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
        <h3 className="text-base font-semibold text-neutral-900">No catering menu yet</h3>
        <p className="mt-1 text-sm text-neutral-500">
          {merchantName} hasn't published a catering menu. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">Catering</div>
          <h3 className="mt-0.5 text-lg font-bold tracking-tight text-neutral-900">
            {items.length} item{items.length === 1 ? '' : 's'} from {merchant.businessName}
          </h3>
        </div>
        <Link
          to={`/catering/${merchantId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline"
        >
          Open full menu
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Category chips */}
      {itemsByCategory.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(ALL_CATEGORY)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-medium transition',
              activeCategory === ALL_CATEGORY
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            All
          </button>
          {itemsByCategory.map(([cat]) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition',
                activeCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="space-y-6">
        {visibleSections.map(([cat, list]) => (
          <section key={cat} className="space-y-3">
            <h4 className="text-sm font-semibold text-neutral-700">{cat}</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((it) => (
                <CateringItemCard key={it.id} item={it} onClick={setOpenItem} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <CateringItemDetailModal
        item={openItem}
        onClose={() => setOpenItem(null)}
        merchantId={merchantId}
        merchantName={merchant.businessName}
        onAddedToCart={() => setCartOpen(true)}
      />

      <CartFab onOpen={() => setCartOpen(true)} />
      <CateringCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export const CateringTab = ({ merchantId, merchantName }: CateringTabProps) => {
  const id = typeof merchantId === 'number' ? merchantId : Number(merchantId);
  if (!Number.isFinite(id)) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center text-sm text-neutral-500">
        Catering not available for this venue.
      </div>
    );
  }
  return (
    <CateringCartProvider>
      <CateringTabInner merchantId={id} merchantName={merchantName} />
    </CateringCartProvider>
  );
};

export default CateringTab;
