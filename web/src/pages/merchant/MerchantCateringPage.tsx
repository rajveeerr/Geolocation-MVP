import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ChefHat,
  DollarSign,
  Filter,
  Pencil,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { MerchantProtectedRoute } from '@/components/auth/MerchantProtectedRoute';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { cn } from '@/lib/utils';
import { useCateringItems, useDeleteCateringItem } from '@/hooks/useCatering';
import type { CateringItem } from '@/types/catering';

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';

const formatPrice = (item: CateringItem) => {
  if (item.pricingType === 'FIXED' && item.fixedPrice != null) {
    return `$${item.fixedPrice.toFixed(2)} flat`;
  }
  return `$${item.pricePerPerson.toFixed(2)} / person`;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cn(panelClass, 'p-4')}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{label}</div>
      <div className="mt-1 text-[1.6rem] font-semibold tracking-tight text-neutral-950">{value}</div>
    </div>
  );
}

function CateringItemCard({
  item,
  onDelete,
}: {
  item: CateringItem;
  onDelete: (id: number) => void;
}) {
  const editPath = PATHS.MERCHANT_CATERING_EDIT.replace(':itemId', String(item.id));
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(panelClass, 'overflow-hidden', !item.isActive && 'opacity-60')}
    >
      <div className="flex gap-4 p-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <ChefHat className="h-7 w-7 text-neutral-300" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[1rem] font-semibold text-neutral-900">{item.name}</h3>
            {item.isPopular && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">
                Most ordered
              </span>
            )}
            {!item.isActive && (
              <span className="inline-flex items-center rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                Archived
              </span>
            )}
          </div>

          {item.description && (
            <p className="line-clamp-1 text-xs text-neutral-500">{item.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {formatPrice(item)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Min {item.minPeople}
              {item.maxPeople ? ` · Max ${item.maxPeople}` : ''}
            </span>
            {item.options.length > 0 && (
              <span className="text-xs text-neutral-500">
                {item.options.length} option group{item.options.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Link to={editPath}>
            <Button size="sm" variant="secondary" className="rounded-full">
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-full border border-neutral-200 p-1.5 text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Remove catering item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function MerchantCateringContent() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [showArchived, setShowArchived] = useState(false);
  const { data, isLoading, error } = useCateringItems({ includeInactive: true });
  const deleteItem = useDeleteCateringItem();

  const items = data?.items ?? [];

  const visibleItems = useMemo(() => {
    return items.filter((it) => {
      if (!showArchived && !it.isActive) return false;
      if (activeCategory !== 'ALL' && it.category !== activeCategory) return false;
      return true;
    });
  }, [items, activeCategory, showArchived]);

  const categories = useMemo(() => {
    const set = new Set(items.map((it) => it.category));
    return Array.from(set).sort();
  }, [items]);

  const itemsByCategory = useMemo(() => {
    const map = new Map<string, CateringItem[]>();
    for (const it of visibleItems) {
      const arr = map.get(it.category) ?? [];
      arr.push(it);
      map.set(it.category, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [visibleItems]);

  const stats = useMemo(() => {
    const active = items.filter((it) => it.isActive).length;
    return {
      total: items.length,
      active,
      categories: categories.length,
    };
  }, [items, categories.length]);

  const handleDelete = (id: number) => {
    if (!confirm('Archive this catering item? It will be hidden from customers but kept in your records.')) return;
    deleteItem.mutate({ id });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(panelClass, 'border-rose-200 bg-rose-50 p-4 text-sm text-rose-700')}>
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 px-4 py-3 sm:px-1 sm:py-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Catering</div>
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-neutral-900">Catering menu</h1>
          <p className="mt-2 max-w-xl text-[13px] text-neutral-500 sm:text-sm">
            Build a separate catering menu — per-person packages, platters, and customization options. Customers see this on your catering page.
          </p>
        </div>
        <Link to={PATHS.MERCHANT_CATERING_CREATE}>
          <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
            <Plus className="mr-2 h-4 w-4" />
            Create item
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total items" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Categories" value={stats.categories} />
      </div>

      {items.length === 0 ? (
        <div className={cn(panelClass, 'border-dashed py-16 text-center')}>
          <ChefHat className="mx-auto mb-3 h-10 w-10 text-neutral-300" aria-hidden />
          <h3 className="text-[1.4rem] font-semibold tracking-tight text-neutral-900">No catering items yet</h3>
          <p className="mt-1 text-[13px] text-neutral-500 sm:text-sm">
            Create your first item — name, category, price, and any customization options. Takes a couple of minutes.
          </p>
          <div className="mt-5">
            <Link to={PATHS.MERCHANT_CATERING_CREATE}>
              <Button size="md" className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800">
                <Plus className="mr-2 h-4 w-4" />
                Create your first item
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className={cn(panelClass, 'flex flex-wrap items-center gap-2 overflow-x-auto p-3')}>
            <Filter className="ml-1 mr-1 h-4 w-4 shrink-0 text-neutral-400" aria-hidden />
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition',
                activeCategory === 'ALL' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
              )}
            >
              All
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                  activeCategory === 'ALL' ? 'bg-white/20' : 'bg-neutral-200',
                )}
              >
                {items.length}
              </span>
            </button>
            {categories.map((cat) => {
              const count = items.filter((it) => it.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition',
                    activeCategory === cat ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                  )}
                >
                  {cat}
                  <span
                    className={cn(
                      'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                      activeCategory === cat ? 'bg-white/20' : 'bg-neutral-200',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            <label className="ml-auto inline-flex items-center gap-2 px-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              Show archived
            </label>
          </div>

          <div className="space-y-6">
            {itemsByCategory.map(([cat, list]) => (
              <section key={cat} className="space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {cat} <span className="text-neutral-400">· {list.length}</span>
                </h2>
                <div className="space-y-2">
                  {list.map((it) => (
                    <CateringItemCard key={it.id} item={it} onDelete={handleDelete} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export const MerchantCateringPage = () => (
  <MerchantProtectedRoute fallbackMessage="Only merchants can manage catering.">
    <MerchantCateringContent />
  </MerchantProtectedRoute>
);
