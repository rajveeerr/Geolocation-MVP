import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ChefHat, Loader2, ShoppingBag } from 'lucide-react';
import { CateringItemCard } from '@/components/catering/CateringItemCard';
import { CateringItemDetailModal } from '@/components/catering/CateringItemDetailModal';
import { CateringCartDrawer } from '@/components/catering/CateringCartDrawer';
import { CateringCartProvider, useCateringCart } from '@/context/CateringCartContext';
import { usePublicCateringMenu } from '@/hooks/useCatering';
import { cn } from '@/lib/utils';
import type { CateringItem } from '@/types/catering';
import type { PublicCateringMerchant } from '@/hooks/useCatering';

const DIETARY_FILTERS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'];
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

function CateringMenuContent({
  merchant,
  items,
}: {
  merchant: PublicCateringMerchant;
  items: CateringItem[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY);
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<CateringItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const sectionRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const visibleItems = useMemo(() => {
    if (!dietaryFilter) return items;
    return items.filter((it) => it.dietaryInfo.includes(dietaryFilter));
  }, [items, dietaryFilter]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, CateringItem[]>();
    for (const it of visibleItems) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleItems]);

  const categories = useMemo(() => itemsByCategory.map(([c]) => c), [itemsByCategory]);

  useEffect(() => {
    if (activeCategory === ALL_CATEGORY) return;
    const el = sectionRefs.current.get(activeCategory);
    if (el) {
      const headerOffset = 140;
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-neutral-50 pt-20">
      {/* Restaurant header */}
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 sm:h-20 sm:w-20">
              {merchant.logoUrl ? (
                <img src={merchant.logoUrl} alt={merchant.businessName} className="h-full w-full object-cover" />
              ) : (
                <ChefHat className="h-8 w-8 text-neutral-300" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Catering menu
              </div>
              <h1 className="mt-1 truncate font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">
                {merchant.businessName}
              </h1>
              {merchant.description && (
                <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-neutral-600">
                  {merchant.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
                {merchant.priceRange && <span>Price range: {merchant.priceRange}</span>}
                {merchant.city && <span>{merchant.city}</span>}
                <span>{items.length} catering item{items.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky tabs + filters */}
      <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveCategory(ALL_CATEGORY)}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition',
                activeCategory === ALL_CATEGORY
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100',
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition',
                  activeCategory === cat
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100',
                )}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={dietaryFilter ?? ''}
                onChange={(e) => setDietaryFilter(e.target.value || null)}
                className="h-8 rounded-full border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700"
                aria-label="Dietary filter"
              >
                <option value="">All dietary</option>
                {DIETARY_FILTERS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="mx-auto max-w-screen-xl px-4 pb-24 pt-8 sm:px-6">
        {itemsByCategory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
            <ChefHat className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
            <h3 className="text-lg font-semibold text-neutral-900">No catering items match your filters</h3>
            <p className="mt-1 text-sm text-neutral-500">Try clearing the dietary filter or browse all categories.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {itemsByCategory.map(([cat, list]) => (
              <section
                key={cat}
                ref={(el) => sectionRefs.current.set(cat, el)}
                className="space-y-4"
              >
                <h2 className="text-lg font-bold text-neutral-900 sm:text-xl">{cat}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {list.map((it) => (
                    <CateringItemCard key={it.id} item={it} onClick={setOpenItem} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <CateringItemDetailModal
        item={openItem}
        onClose={() => setOpenItem(null)}
        merchantId={merchant.id}
        merchantName={merchant.businessName}
        onAddedToCart={() => setCartOpen(true)}
      />

      <CartFab onOpen={() => setCartOpen(true)} />
      <CateringCartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

export const CateringMenuPage = () => {
  const { merchantId: rawId } = useParams<{ merchantId: string }>();
  const merchantId = rawId ? Number(rawId) : null;
  const isValid = merchantId != null && Number.isFinite(merchantId);

  const { data, isLoading, error } = usePublicCateringMenu(isValid ? merchantId : null);

  if (!isValid) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Catering not found</h1>
        <p className="mt-2 text-sm text-neutral-500">The link you used is missing a merchant id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Catering not available</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {(error as Error | undefined)?.message ?? 'This merchant has no catering menu yet.'}
        </p>
      </div>
    );
  }

  return (
    <CateringCartProvider>
      <CateringMenuContent merchant={data.merchant} items={data.items} />
    </CateringCartProvider>
  );
};

export default CateringMenuPage;
