import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, RefreshCcw, Loader2, AlertTriangle, Scan, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
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

      {/* Search + dropdown filters + sort — all on one row */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        trendFilter={trendFilter}
        onTrendChange={setTrendFilter}
      />

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
// FilterBar — search + 4 dropdowns on one row, with active-filter chips below
// ────────────────────────────────────────────────

const selectClass =
  'rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

interface FilterBarProps {
  search: string;
  onSearchChange: (s: string) => void;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  categoryFilter: string;
  onCategoryChange: (c: string) => void;
  categories: string[];
  statusFilter: StatusFilter;
  onStatusChange: (s: StatusFilter) => void;
  trendFilter: TrendFilter;
  onTrendChange: (t: TrendFilter) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  categoryFilter,
  onCategoryChange,
  categories,
  statusFilter,
  onStatusChange,
  trendFilter,
  onTrendChange,
}) => {
  const activeChips: { label: string; onClear: () => void }[] = [];
  if (categoryFilter !== 'all') activeChips.push({ label: `Category: ${categoryFilter}`, onClear: () => onCategoryChange('all') });
  if (statusFilter !== 'all') activeChips.push({ label: `Stock: ${statusFilter}`, onClear: () => onStatusChange('all') });
  if (trendFilter !== 'all') activeChips.push({ label: `Trend: ${trendFilter}`, onClear: () => onTrendChange('all') });

  return (
    <div className={cn(cardClass, 'mb-6 space-y-3')}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ingredients..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {/* Category dropdown */}
        <label className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={selectClass}
            title="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.length === 0 ? (
              <option value="" disabled>(no categories yet)</option>
            ) : (
              categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))
            )}
          </select>
        </label>

        {/* Status dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          className={selectClass}
          title="Filter by stock status"
        >
          <option value="all">All stock</option>
          <option value="healthy">🟢 Healthy</option>
          <option value="low">🟡 Low</option>
          <option value="out">🔴 Out / Critical</option>
        </select>

        {/* Trend dropdown */}
        <select
          value={trendFilter}
          onChange={(e) => onTrendChange(e.target.value as TrendFilter)}
          className={selectClass}
          title="Filter by price trend"
        >
          <option value="all">All trends</option>
          <option value="rising">↑ Rising</option>
          <option value="stable">→ Stable</option>
          <option value="falling">↓ Falling</option>
        </select>

        {/* Sort */}
        <label className="flex items-center gap-1.5">
          <ArrowUpDown className="h-4 w-4 text-neutral-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortBy)}
            className={selectClass}
            title="Sort"
          >
            <option value="name">Name</option>
            <option value="trend">Trend (highest %)</option>
            <option value="cost">Cost (highest)</option>
            <option value="days-left">Days left (lowest)</option>
          </select>
        </label>
      </div>

      {/* Active filter chips + clear-all */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Active
          </span>
          {activeChips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={c.onClear}
              className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand transition hover:bg-brand/20"
              title="Clear this filter"
            >
              {c.label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              onCategoryChange('all');
              onStatusChange('all');
              onTrendChange('all');
            }}
            className="text-xs font-semibold text-neutral-500 underline-offset-2 hover:text-brand hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default IngredientsTab;
