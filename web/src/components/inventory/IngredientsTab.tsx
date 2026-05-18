import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, RefreshCcw, Loader2, AlertTriangle, Scan, TrendingUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import {
  useIngredients,
  useMarketAlerts,
  useAcknowledgeAlert,
  useGenerateSupplierForecast,
  useGenerateCommodityWatch,
  useScanPriceSpikes,
  useUpdateIngredient,
  type Ingredient,
  type MarketAlert,
} from '@/hooks/useIngredients';
import { useToast } from '@/hooks/use-toast';
import IngredientTable from './IngredientTable';
import IngredientFormModal from './IngredientFormModal';
import MarketAlertBanner from './MarketAlertBanner';
import MarketAlertModal from './MarketAlertModal';

const cardClass =
  'rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_4px_14px_rgba(15,23,42,0.04)]';

const PRICE_SPIKE_TOAST_KEY = 'yohop:lastPriceSpikeToastIds';

function getRecentToastedIds(): Set<number> {
  try {
    const raw = sessionStorage.getItem(PRICE_SPIKE_TOAST_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function setRecentToastedIds(ids: Set<number>) {
  try {
    sessionStorage.setItem(PRICE_SPIKE_TOAST_KEY, JSON.stringify([...ids].slice(-50)));
  } catch {
    // ignore
  }
}

type StatusFilter = 'all' | 'healthy' | 'low' | 'out';
type TrendFilter = 'all' | 'rising' | 'stable' | 'falling';
type SortBy = 'name' | 'cost' | 'trend' | 'days-left';

function stockStatus(ing: Ingredient): 'healthy' | 'low' | 'out' {
  if (ing.daysLeft == null) return 'healthy';
  if (ing.daysLeft <= 0) return 'out';
  if (ing.daysLeft <= 14) return 'low';
  return 'healthy';
}

function trendBucket(pct: number | null): 'rising' | 'stable' | 'falling' {
  if (pct == null || Math.abs(pct) < 1.5) return 'stable';
  return pct > 0 ? 'rising' : 'falling';
}

const IngredientsTab: React.FC = () => {
  const ingredientsQuery = useIngredients();
  const alertsQuery = useMarketAlerts();
  const acknowledgeAlert = useAcknowledgeAlert();
  const supplierForecast = useGenerateSupplierForecast();
  const commodityWatch = useGenerateCommodityWatch();
  const scanSpikes = useScanPriceSpikes();
  const updateIngredient = useUpdateIngredient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [trendFilter, setTrendFilter] = useState<TrendFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [formOpen, setFormOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [activeAlert, setActiveAlert] = useState<MarketAlert | null>(null);

  const ingredients = ingredientsQuery.data ?? [];
  const alerts = alertsQuery.data ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    ingredients.forEach((i) => set.add(i.category));
    return Array.from(set).sort();
  }, [ingredients]);

  const filtered = useMemo(() => {
    const out = ingredients.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && stockStatus(i) !== statusFilter) return false;
      if (trendFilter !== 'all' && trendBucket(i.trendPct) !== trendFilter) return false;
      return true;
    });

    const sorted = [...out];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'cost':
          return b.currentCost - a.currentCost;
        case 'trend':
          return (b.trendPct ?? -Infinity) - (a.trendPct ?? -Infinity);
        case 'days-left':
          return (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return sorted;
  }, [ingredients, search, categoryFilter, statusFilter, trendFilter, sortBy]);

  const supplierAlert = useMemo(
    () => alerts.find((a) => a.type === 'SUPPLIER_FORECAST') ?? null,
    [alerts],
  );
  const commodityAlert = useMemo(
    () => alerts.find((a) => a.type === 'COMMODITY_WATCH') ?? null,
    [alerts],
  );

  useEffect(() => {
    const recentSpikeAlerts = alerts.filter((a) => {
      if (a.type !== 'PRICE_SPIKE') return false;
      if (a.acknowledgedAt) return false;
      const age = Date.now() - new Date(a.createdAt).getTime();
      return age < 24 * 60 * 60 * 1000;
    });
    if (recentSpikeAlerts.length === 0) return;

    const toasted = getRecentToastedIds();
    const newOnes = recentSpikeAlerts.filter((a) => !toasted.has(a.id));
    if (newOnes.length === 0) return;

    for (const alert of newOnes.slice(0, 3)) {
      toast({
        title: alert.title,
        description: alert.body.slice(0, 160),
      });
      toasted.add(alert.id);
    }
    setRecentToastedIds(toasted);
  }, [alerts, toast]);

  const openCreate = () => {
    setEditingIngredient(null);
    setFormOpen(true);
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setFormOpen(true);
  };

  const openByName = (name: string) => {
    const target =
      ingredients.find((i) => i.name.toLowerCase() === name.toLowerCase()) ??
      ingredients.find((i) => i.name.toLowerCase().includes(name.toLowerCase()));
    if (target) {
      setActiveAlert(null);
      openEdit(target);
    } else {
      toast({
        title: 'Ingredient not tracked yet',
        description: `"${name}" isn't in your inventory. Add it via + Add Item to start tracking.`,
      });
    }
  };

  const handleAcknowledge = async (id: number) => {
    await acknowledgeAlert.mutateAsync(id);
    setActiveAlert(null);
  };

  const handleAdjustStock = (ingredient: Ingredient, delta: number) => {
    const next = Math.max(0, ingredient.stockLevel + delta);
    updateIngredient.mutate({ id: ingredient.id, input: { stockLevel: next } });
  };

  const handleUpdateCost = (ingredient: Ingredient, nextCost: number) => {
    if (!Number.isFinite(nextCost) || nextCost < 0) return;
    if (Math.abs(nextCost - ingredient.currentCost) < 0.001) return;
    updateIngredient.mutate({ id: ingredient.id, input: { currentCost: nextCost } });
  };

  return (
    <div>
      {/* Top row: title + add button */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">Master Inventory</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tracking component costs and real-time stock levels.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl"
            onClick={() => scanSpikes.mutate()}
            disabled={scanSpikes.isPending}
            title="Scan ingredients for price spikes vs prior 30-day average"
          >
            {scanSpikes.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Scan className="mr-2 h-4 w-4" />
            )}
            Scan price spikes
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-xl"
            onClick={() => ingredientsQuery.refetch()}
            disabled={ingredientsQuery.isFetching}
          >
            <RefreshCcw className={cn('mr-2 h-4 w-4', ingredientsQuery.isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button size="sm" className="rounded-xl" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Market Intelligence banners */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MarketAlertBanner
          type="SUPPLIER_FORECAST"
          alert={supplierAlert}
          onClick={() => supplierAlert && setActiveAlert(supplierAlert)}
          onRefresh={() => supplierForecast.mutate()}
          refreshing={supplierForecast.isPending}
          emptyTitle="No supplier forecast yet"
          emptyDescription="Click refresh to generate one with AI."
        />
        <MarketAlertBanner
          type="COMMODITY_WATCH"
          alert={commodityAlert}
          onClick={() => commodityAlert && setActiveAlert(commodityAlert)}
          onRefresh={() => commodityWatch.mutate()}
          refreshing={commodityWatch.isPending}
          emptyTitle="No commodity watch yet"
          emptyDescription="Click refresh to generate market intel with AI."
        />
      </div>

      {/* Search + filters + sort */}
      <div className={cn(cardClass, 'mb-6 space-y-3')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ingredients..."
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="name">Sort: Name</option>
              <option value="trend">Sort: Trend (highest %)</option>
              <option value="cost">Sort: Cost (highest)</option>
              <option value="days-left">Sort: Days left (lowest)</option>
            </select>
          </div>
        </div>

        {/* Filter pill rows */}
        <FilterRow
          label="Category"
          all={{ value: 'all', label: 'All' }}
          value={categoryFilter}
          options={categories.map((c) => ({ value: c, label: c }))}
          onChange={setCategoryFilter}
        />
        <FilterRow
          label="Stock"
          all={{ value: 'all', label: 'Any' }}
          value={statusFilter}
          options={[
            { value: 'healthy', label: 'Healthy', tone: 'emerald' },
            { value: 'low', label: 'Low', tone: 'amber' },
            { value: 'out', label: 'Out / Critical', tone: 'red' },
          ]}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
        />
        <FilterRow
          label="Trend"
          all={{ value: 'all', label: 'Any' }}
          value={trendFilter}
          options={[
            { value: 'rising', label: 'Rising', tone: 'red', Icon: TrendingUp },
            { value: 'stable', label: 'Stable' },
            { value: 'falling', label: 'Falling', tone: 'emerald' },
          ]}
          onChange={(v) => setTrendFilter(v as TrendFilter)}
        />
      </div>

      {/* Table or loading */}
      {ingredientsQuery.isLoading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-400" />
          <p className="mt-3 text-sm text-neutral-500">Loading ingredients…</p>
        </div>
      ) : ingredientsQuery.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          <AlertTriangle className="mx-auto mb-2 h-5 w-5" />
          Could not load ingredients. Check the backend is running.
        </div>
      ) : (
        <IngredientTable
          ingredients={filtered}
          onEdit={openEdit}
          onAdjustStock={handleAdjustStock}
          onUpdateCost={handleUpdateCost}
          updatingId={updateIngredient.isPending ? updateIngredient.variables?.id ?? null : null}
        />
      )}

      <IngredientFormModal
        open={formOpen}
        ingredient={editingIngredient}
        onClose={() => setFormOpen(false)}
      />

      <MarketAlertModal
        alert={activeAlert}
        onClose={() => setActiveAlert(null)}
        onAcknowledge={handleAcknowledge}
        acknowledging={acknowledgeAlert.isPending}
        onOpenIngredientByName={openByName}
      />
    </div>
  );
};

// ────────────────────────────────────────────────
// FilterRow — reusable pill bar for one filter dimension
// ────────────────────────────────────────────────

interface FilterOption {
  value: string;
  label: string;
  tone?: 'emerald' | 'amber' | 'red';
  Icon?: React.ComponentType<{ className?: string }>;
}

const TONE_ACTIVE: Record<NonNullable<FilterOption['tone']>, string> = {
  emerald: 'bg-emerald-600 text-white',
  amber: 'bg-amber-500 text-white',
  red: 'bg-red-600 text-white',
};

const FilterRow: React.FC<{
  label: string;
  all: FilterOption;
  value: string;
  options: FilterOption[];
  onChange: (v: string) => void;
}> = ({ label, all, value, options, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(all.value)}
        className={cn(
          'rounded-full px-3 py-1.5 text-xs font-semibold transition',
          value === all.value
            ? 'bg-brand text-white shadow-sm'
            : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50 hover:text-brand',
        )}
      >
        {all.label}
      </button>
      {options.map((o) => {
        const active = value === o.value;
        const activeClass = active
          ? o.tone
            ? TONE_ACTIVE[o.tone]
            : 'bg-brand text-white shadow-sm'
          : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50 hover:text-brand';
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition', activeClass)}
          >
            {o.Icon && <o.Icon className="h-3 w-3" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
};

export default IngredientsTab;
