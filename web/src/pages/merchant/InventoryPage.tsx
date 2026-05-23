import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Boxes,
  AlertTriangle,
  PackageX,
  PackageCheck,
  Search,
  Plus,
  Minus,
  RefreshCcw,
  Filter,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Loader2,
  CheckCircle2,
  Wand2,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMerchantMenu,
  useUpdateMenuItemInventory,
  useUpdateVariantInventory,
  type MenuItem,
  type MenuItemVariant,
} from '@/hooks/useMerchantMenu';
import {
  useAiInventoryAnalysis,
  useAiInventoryBulkSetup,
  useAiStatus,
  type AiInventoryAnalysis,
  type AiBulkSetupSuggestion,
} from '@/hooks/useAi';
import { Button } from '@/components/common/Button';
import IngredientsTab from '@/components/inventory/IngredientsTab';

type StatusFilter = 'all' | 'low' | 'out' | 'tracked' | 'untracked';
type InventoryTab = 'menu' | 'ingredients';

const STATUS_TONES: Record<NonNullable<MenuItem['inventoryStatus']>, string> = {
  IN_STOCK: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50',
  LOW_STOCK: 'bg-amber-50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50',
  OUT_OF_STOCK: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50',
  UNTRACKED: 'bg-accent text-muted-foreground border border-border',
};

const STATUS_LABEL: Record<NonNullable<MenuItem['inventoryStatus']>, string> = {
  IN_STOCK: 'In stock',
  LOW_STOCK: 'Low stock',
  OUT_OF_STOCK: 'Out of stock',
  UNTRACKED: 'Untracked',
};

const cardClass =
  'rounded-2xl border border-border bg-card p-5 shadow-[0_4px_14px_rgba(15,23,42,0.04)]';

const InventoryPage: React.FC = () => {
  const { data, isLoading, refetch, isRefetching } = useMerchantMenu();
  const updateInventory = useUpdateMenuItemInventory();
  const updateVariantInventory = useUpdateVariantInventory();
  const { data: aiStatus } = useAiStatus();
  const aiAnalysis = useAiInventoryAnalysis();
  const aiBulkSetup = useAiInventoryBulkSetup();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [analysisResult, setAnalysisResult] = useState<AiInventoryAnalysis | null>(null);
  const [bulkSetupResult, setBulkSetupResult] = useState<AiBulkSetupSuggestion[] | null>(null);
  const [appliedBulkIds, setAppliedBulkIds] = useState<Set<number>>(new Set());
  const [appliedRestockNames, setAppliedRestockNames] = useState<Set<string>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<InventoryTab>(
    (searchParams.get('tab') === 'ingredients' ? 'ingredients' : 'menu') as InventoryTab,
  );

  const aiEnabled = aiStatus?.aiEnabled ?? false;

  // Auto-trigger analysis from dashboard link
  useEffect(() => {
    if (searchParams.get('analyze') === 'true' && aiEnabled && !analysisResult && !aiAnalysis.isPending) {
      aiAnalysis.mutate(undefined, {
        onSuccess: (data) => {
          setAnalysisResult(data.analysis);
          setSearchParams({}, { replace: true });
        },
      });
    }
  }, [searchParams, aiEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpanded = (itemId: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const adjustVariantQty = (itemId: number, variant: MenuItemVariant, delta: number) => {
    const next = Math.max(0, (variant.inventoryQuantity ?? 0) + delta);
    updateVariantInventory.mutate({
      itemId,
      variantId: variant.id,
      data: {
        inventoryQuantity: next,
        ...(delta > 0 ? { isAvailable: true } : {}),
      },
    });
  };

  const items = data?.menuItems ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => it.category && set.add(it.category));
    return Array.from(set).sort();
  }, [items]);

  const stats = useMemo(() => {
    const acc = { inStock: 0, lowStock: 0, outOfStock: 0, untracked: 0, totalUnits: 0 };
    items.forEach((it) => {
      if (it.hasVariants && it.variants && it.variants.length > 0) {
        // Count each variant individually
        it.variants.forEach((v) => {
          const vs = v.inventoryStatus ?? 'UNTRACKED';
          switch (vs) {
            case 'IN_STOCK': acc.inStock += 1; break;
            case 'LOW_STOCK': acc.lowStock += 1; break;
            case 'OUT_OF_STOCK': acc.outOfStock += 1; break;
            default: acc.untracked += 1;
          }
          if (typeof v.inventoryQuantity === 'number') acc.totalUnits += v.inventoryQuantity;
        });
      } else {
        switch (it.inventoryStatus) {
          case 'IN_STOCK': acc.inStock += 1; break;
          case 'LOW_STOCK': acc.lowStock += 1; break;
          case 'OUT_OF_STOCK': acc.outOfStock += 1; break;
          default: acc.untracked += 1;
        }
        if (it.inventoryTrackingEnabled && typeof it.inventoryQuantity === 'number') {
          acc.totalUnits += it.inventoryQuantity;
        }
      }
    });
    return acc;
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && it.category !== categoryFilter) return false;
      const status = it.inventoryStatus ?? 'UNTRACKED';
      if (statusFilter === 'low' && status !== 'LOW_STOCK') return false;
      if (statusFilter === 'out' && status !== 'OUT_OF_STOCK') return false;
      if (statusFilter === 'tracked' && !it.inventoryTrackingEnabled) return false;
      if (statusFilter === 'untracked' && it.inventoryTrackingEnabled) return false;
      return true;
    });
  }, [items, search, statusFilter, categoryFilter]);

  const adjustQty = (item: MenuItem, delta: number) => {
    if (!item.inventoryTrackingEnabled) return;
    const next = Math.max(0, (item.inventoryQuantity ?? 0) + delta);
    updateInventory.mutate({
      itemId: item.id,
      data: {
        inventoryQuantity: next,
        // restock implicitly makes the item available again
        ...(delta > 0 ? { isAvailable: true } : {}),
      },
    });
  };

  const toggleTracking = (item: MenuItem) => {
    updateInventory.mutate({
      itemId: item.id,
      data: {
        inventoryTrackingEnabled: !item.inventoryTrackingEnabled,
        // when enabling for the first time, seed quantity to 0
        ...(item.inventoryTrackingEnabled
          ? {}
          : { inventoryQuantity: item.inventoryQuantity ?? 0, lowStockThreshold: item.lowStockThreshold ?? 5 }),
      },
    });
  };

  const markSoldOut = (item: MenuItem) => {
    updateInventory.mutate({
      itemId: item.id,
      data: {
        isAvailable: false,
        ...(item.inventoryTrackingEnabled ? { inventoryQuantity: 0 } : {}),
      },
    });
  };

  const markAvailable = (item: MenuItem) => {
    updateInventory.mutate({
      itemId: item.id,
      data: { isAvailable: true },
    });
  };

  const switchTab = (tab: InventoryTab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === 'ingredients') next.set('tab', 'ingredients');
    else next.delete('tab');
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
              <Boxes className="h-5 w-5 text-brand" />
            </span>
            Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 ml-0.5">
            Track stock levels, restock items, and prevent overselling.
          </p>
        </div>
        {activeTab === 'menu' && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              <RefreshCcw className={cn('mr-2 h-4 w-4', isRefetching && 'animate-spin')} />
              Refresh
            </Button>
            <Link to="/merchant/menu/create">
              <Button size="sm" className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                New item
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-xl border border-border bg-accent p-1">
        <button
          type="button"
          onClick={() => switchTab('menu')}
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-semibold transition',
            activeTab === 'menu' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Menu Inventory
        </button>
        <button
          type="button"
          onClick={() => switchTab('ingredients')}
          className={cn(
            'rounded-lg px-4 py-1.5 text-sm font-semibold transition',
            activeTab === 'ingredients' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Ingredients
        </button>
      </div>

      {activeTab === 'ingredients' && <IngredientsTab />}

      {activeTab === 'menu' && (
        <>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">In stock</p>
            <PackageCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.inStock}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stats.totalUnits} total units</p>
        </div>
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Low stock</p>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.lowStock}</p>
          <button
            type="button"
            className="mt-1 text-xs text-amber-700 dark:text-amber-300 hover:underline"
            onClick={() => setStatusFilter('low')}
          >
            Show low-stock items →
          </button>
        </div>
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Out of stock</p>
            <PackageX className="h-5 w-5 text-red-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.outOfStock}</p>
          <button
            type="button"
            className="mt-1 text-xs text-red-700 dark:text-red-300 hover:underline"
            onClick={() => setStatusFilter('out')}
          >
            Show out-of-stock items →
          </button>
        </div>
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Untracked</p>
            <Boxes className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground/80">{stats.untracked}</p>
          <p className="mt-1 text-xs text-muted-foreground">No quantity tracked</p>
        </div>
      </div>

      {/* AI Inventory Section */}
      {aiEnabled && (
        <div className="mb-6 space-y-4">
          {/* AI Analyzer */}
          {!analysisResult ? (
            <div className="rounded-2xl border border-ai-border bg-ai-surface p-5 shadow-[0_8px_24px_rgba(82,58,40,0.06)] dark:shadow-none">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-card/80 dark:bg-card p-2.5 text-ai-accent">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ai-text">AI Inventory Analyzer</p>
                    <p className="mt-0.5 text-sm text-ai-text-muted">
                      Get a health score, restock suggestions, and category insights — all in one click.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 rounded-xl border-ai-border-strong bg-card/80 dark:bg-card text-ai-text hover:bg-card"
                  variant="secondary"
                  onClick={() => {
                    aiAnalysis.mutate(undefined, {
                      onSuccess: (data) => setAnalysisResult(data.analysis),
                    });
                  }}
                  disabled={aiAnalysis.isPending}
                >
                  {aiAnalysis.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                  ) : (
                    <><Wand2 className="mr-2 h-4 w-4" />Analyze Inventory</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-ai-accent" />
                  <h3 className="font-bold text-foreground">AI Inventory Analysis</h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setAnalysisResult(null); setAppliedRestockNames(new Set()); }}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Health Score + Summary */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className={cn(
                    'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold',
                    analysisResult.healthScore >= 70
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                      : analysisResult.healthScore >= 40
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-600',
                  )}
                >
                  {analysisResult.healthScore}
                </div>
                <div>
                  <p className={cn(
                    'text-sm font-bold',
                    analysisResult.healthScore >= 70 ? 'text-emerald-700 dark:text-emerald-300' : analysisResult.healthScore >= 40 ? 'text-amber-700 dark:text-amber-300' : 'text-red-700 dark:text-red-300',
                  )}>
                    {analysisResult.healthLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{analysisResult.summary}</p>
                </div>
              </div>

              {/* Category Health */}
              {analysisResult.categoryHealth.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Category Health</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {analysisResult.categoryHealth.map((ch) => (
                      <div key={ch.category} className="rounded-xl border border-border bg-accent/50 p-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'h-2 w-2 rounded-full',
                            ch.status === 'healthy' ? 'bg-emerald-500' : ch.status === 'warning' ? 'bg-amber-500' : 'bg-red-500',
                          )} />
                          <span className="text-sm font-semibold text-foreground">{ch.category}</span>
                          {ch.itemsNeedingAttention > 0 && (
                            <span className="rounded-full bg-amber-100 dark:bg-amber-950/40 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                              {ch.itemsNeedingAttention} need attention
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{ch.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Restock Suggestions */}
              {analysisResult.restockSuggestions.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Restock Suggestions</p>
                  <div className="space-y-2">
                    {analysisResult.restockSuggestions.map((rs) => {
                      const matchedItem = items.find((i) => i.name.toLowerCase() === rs.itemName.toLowerCase());
                      const isApplied = appliedRestockNames.has(rs.itemName);
                      return (
                        <div key={rs.itemName} className="flex items-center justify-between rounded-xl border border-border bg-accent/50 px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                              rs.urgency === 'high' ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300' : rs.urgency === 'medium' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-accent text-muted-foreground',
                            )}>
                              {rs.urgency}
                            </span>
                            <div>
                              <span className="text-sm font-medium text-foreground">{rs.itemName}</span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                {rs.currentQty} now → +{rs.suggestedRestockQty}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{rs.reason}</span>
                            {matchedItem && !isApplied ? (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-lg text-xs"
                                onClick={() => {
                                  updateInventory.mutate({
                                    itemId: matchedItem.id,
                                    data: {
                                      inventoryQuantity: (matchedItem.inventoryQuantity ?? 0) + rs.suggestedRestockQty,
                                      isAvailable: true,
                                    },
                                  });
                                  setAppliedRestockNames((prev) => new Set(prev).add(rs.itemName));
                                }}
                                disabled={updateInventory.isPending}
                              >
                                <ArrowRight className="mr-1 h-3 w-3" />
                                Restock
                              </Button>
                            ) : isApplied ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Applied
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {analysisResult.actionItems.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Action Items</p>
                  <ul className="space-y-1">
                    {analysisResult.actionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {analysisResult.tips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {analysisResult.tips.map((tip, i) => (
                    <span key={i} className="rounded-full bg-amber-50 dark:bg-amber-950/30 px-3 py-1 text-xs font-medium text-amber-900 dark:text-amber-200">
                      {tip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bulk Setup Banner */}
          {stats.untracked > 0 && !bulkSetupResult && (
            <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Wand2 className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                      {stats.untracked} item{stats.untracked > 1 ? 's' : ''} without inventory tracking
                    </p>
                    <p className="text-xs text-indigo-600">Let AI suggest initial stock levels and thresholds.</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0 rounded-xl border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:bg-indigo-950/40"
                  onClick={() => {
                    aiBulkSetup.mutate(undefined, {
                      onSuccess: (data) => setBulkSetupResult(data.suggestions),
                    });
                  }}
                  disabled={aiBulkSetup.isPending}
                >
                  {aiBulkSetup.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Setup All with AI</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Bulk Setup Results */}
          {bulkSetupResult && bulkSetupResult.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-foreground">AI Setup Suggestions</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-lg text-xs"
                    onClick={() => {
                      bulkSetupResult.forEach((s) => {
                        if (!appliedBulkIds.has(s.itemId)) {
                          updateInventory.mutate({
                            itemId: s.itemId,
                            data: {
                              inventoryTrackingEnabled: true,
                              inventoryQuantity: s.inventoryQuantity,
                              lowStockThreshold: s.lowStockThreshold,
                              allowBackorder: s.allowBackorder,
                            },
                          });
                        }
                      });
                      setAppliedBulkIds(new Set(bulkSetupResult.map((s) => s.itemId)));
                    }}
                    disabled={updateInventory.isPending}
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Apply All
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setBulkSetupResult(null); setAppliedBulkIds(new Set()); }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {bulkSetupResult.map((s) => {
                  const matchedItem = items.find((i) => i.id === s.itemId);
                  const isApplied = appliedBulkIds.has(s.itemId);
                  return (
                    <div key={s.itemId} className="flex items-center justify-between rounded-xl border border-border bg-accent/50 px-4 py-3">
                      <div>
                        <span className="text-sm font-medium text-foreground">{matchedItem?.name || `Item #${s.itemId}`}</span>
                        <span className="ml-3 text-xs text-muted-foreground">
                          Qty: {s.inventoryQuantity} · Threshold: {s.lowStockThreshold} · Backorder: {s.allowBackorder ? 'Yes' : 'No'}
                        </span>
                        {s.rationale && (
                          <p className="mt-0.5 text-xs text-muted-foreground">{s.rationale}</p>
                        )}
                      </div>
                      {!isApplied ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="shrink-0 rounded-lg text-xs"
                          onClick={() => {
                            updateInventory.mutate({
                              itemId: s.itemId,
                              data: {
                                inventoryTrackingEnabled: true,
                                inventoryQuantity: s.inventoryQuantity,
                                lowStockThreshold: s.lowStockThreshold,
                                allowBackorder: s.allowBackorder,
                              },
                            });
                            setAppliedBulkIds((prev) => new Set(prev).add(s.itemId));
                          }}
                          disabled={updateInventory.isPending}
                        >
                          Apply
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Applied
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="all">All statuses</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
            <option value="tracked">Tracked only</option>
            <option value="untracked">Untracked only</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Threshold</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Loading inventory…
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No items match these filters.
                  </td>
                </tr>
              )}
              {filtered.map((item) => {
                const status = item.inventoryStatus ?? 'UNTRACKED';
                const hasVariantRows = item.hasVariants && item.variants && item.variants.length > 0;
                const isExpanded = expandedItems.has(item.id);
                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-accent/50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {hasVariantRows && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(item.id)}
                              className="rounded p-0.5 text-muted-foreground hover:text-foreground/80"
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          )}
                          <div>
                            <Link
                              to={`/merchant/menu/${item.id}`}
                              className="font-medium text-foreground hover:text-brand"
                            >
                              {item.name}
                            </Link>
                            {hasVariantRows && (
                              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 border border-indigo-100 dark:border-indigo-900/40">
                                <Layers className="h-3 w-3" />
                                {item.variants!.length} variants
                              </span>
                            )}
                            {!item.isAvailable && (
                              <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.category || '—'}</td>
                      <td className="px-4 py-3">
                        {!hasVariantRows && (
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                              STATUS_TONES[status],
                            )}
                          >
                            {STATUS_LABEL[status]}
                          </span>
                        )}
                        {hasVariantRows && (
                          <span className="text-xs text-muted-foreground italic">per variant</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {hasVariantRows
                          ? '—'
                          : item.inventoryTrackingEnabled
                            ? (item.inventoryQuantity ?? 0)
                            : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {hasVariantRows
                          ? '—'
                          : item.inventoryTrackingEnabled
                            ? (item.lowStockThreshold ?? 0)
                            : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {!hasVariantRows && (
                          <div className="flex items-center justify-end gap-1">
                            {item.inventoryTrackingEnabled ? (
                              <>
                                <button
                                  type="button"
                                  title="Decrement by 1"
                                  onClick={() => adjustQty(item, -1)}
                                  disabled={updateInventory.isPending}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Add 1"
                                  onClick={() => adjustQty(item, 1)}
                                  disabled={updateInventory.isPending}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => adjustQty(item, 10)}
                                  disabled={updateInventory.isPending}
                                  className="ml-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 disabled:opacity-40"
                                >
                                  +10
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleTracking(item)}
                                disabled={updateInventory.isPending}
                                className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground/80 hover:bg-accent/50 disabled:opacity-40"
                              >
                                Enable tracking
                              </button>
                            )}
                            {item.isAvailable ? (
                              <button
                                type="button"
                                onClick={() => markSoldOut(item)}
                                disabled={updateInventory.isPending}
                                className="ml-1 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:bg-red-950/40 disabled:opacity-40"
                              >
                                Sold out
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => markAvailable(item)}
                                disabled={updateInventory.isPending}
                                className="ml-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 disabled:opacity-40"
                              >
                                Make available
                              </button>
                            )}
                          </div>
                        )}
                        {hasVariantRows && !isExpanded && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(item.id)}
                              className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground/80 hover:bg-accent/50"
                            >
                              Expand
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Variant sub-rows */}
                    {hasVariantRows && isExpanded && item.variants!.map((variant) => {
                      const vStatus = variant.inventoryStatus ?? 'UNTRACKED';
                      return (
                        <tr key={`v-${variant.id}`} className="bg-accent/50/40">
                          <td className="py-2.5 pl-12 pr-4">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                {variant.sku}
                              </span>
                              <span className="text-sm text-foreground/80">{variant.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground">—</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                                STATUS_TONES[vStatus],
                              )}
                            >
                              {STATUS_LABEL[vStatus]}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-foreground">
                            {variant.inventoryQuantity ?? '—'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-muted-foreground">
                            {variant.lowStockThreshold ?? '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Decrement by 1"
                                onClick={() => adjustVariantQty(item.id, variant, -1)}
                                disabled={updateVariantInventory.isPending}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                title="Add 1"
                                onClick={() => adjustVariantQty(item.id, variant, 1)}
                                disabled={updateVariantInventory.isPending}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-40"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => adjustVariantQty(item.id, variant, 10)}
                                disabled={updateVariantInventory.isPending}
                                className="ml-1 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 disabled:opacity-40"
                              >
                                +10
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default InventoryPage;
