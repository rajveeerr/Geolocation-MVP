import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Utensils,
  Clock,
  Sparkles,
  LayoutGrid,
  Boxes,
  Plus,
  Store,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import {
  useMenuCollections,
  useDeleteMenuCollection,
  useAddItemsToCollection,
  type MenuCollection,
  type MenuCollectionType,
} from '@/hooks/useMenuCollections';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import {
  STANDARD_TEMPLATES,
  HAPPY_HOUR_TEMPLATES,
  MENU_TYPE_LABELS,
  MENU_TYPE_DESCRIPTIONS,
  type MenuTemplate,
} from '@/config/menuTemplates';

// Sub-components
import { BulkMenuUpload } from '@/components/merchant/BulkMenuUpload';
import { StoreSelector } from '@/components/merchant/menu/StoreSelector';
import { MenuTemplateCard } from '@/components/merchant/menu/MenuTemplateCard';
import { MenuListCard } from '@/components/merchant/menu/MenuListCard';
import { StandardMenuEditor } from '@/components/merchant/menu/StandardMenuEditor';
import { HappyHourMenuEditor } from '@/components/merchant/menu/HappyHourMenuEditor';
import { SpecialMenuSection } from '@/components/merchant/menu/SpecialMenuSection';

// ─── Types ────────────────────────────────────────────────────────────
type Tab = 'STANDARD' | 'HAPPY_HOUR' | 'SPECIAL';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'STANDARD', label: 'Standard', icon: Utensils },
  { key: 'HAPPY_HOUR', label: 'Happy Hour', icon: Clock },
  { key: 'SPECIAL', label: 'Special', icon: Sparkles },
];

const panelClass =
  'rounded-[1.45rem] border border-neutral-200/80 bg-white/95 shadow-[0_8px_22px_rgba(15,23,42,0.045)]';
const EMPTY_COLLECTIONS: MenuCollection[] = [];
const EMPTY_MENU_ITEMS: MenuItem[] = [];

const tabIntroCopy: Record<Tab, { title: string; description: string }> = {
  STANDARD: {
    title: 'Start with a reusable menu',
    description: 'Use pre-built structures for your everyday, category-based, and family-friendly menus.',
  },
  HAPPY_HOUR: {
    title: 'Launch timed offers faster',
    description: 'Create time-bound menus that stay clear for staff and easy to browse for guests.',
  },
  SPECIAL: {
    title: 'Build menus around occasions',
    description: 'Spin up themed menus for events, holidays, or one-off campaigns without cluttering your core catalog.',
  },
};

// ─── Component ────────────────────────────────────────────────────────
const MenuManagementPageV2: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('STANDARD');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [showAllMenus, setShowAllMenus] = useState(false);

  // Standard editor state
  const [showStdEditor, setShowStdEditor] = useState(false);
  const [editingStdCollection, setEditingStdCollection] = useState<MenuCollection | null>(null);
  const [stdTemplateName, setStdTemplateName] = useState('');
  const [stdSubType, setStdSubType] = useState<string | undefined>();

  // Happy hour editor state
  const [showHhEditor, setShowHhEditor] = useState(false);
  const [editingHhCollection, setEditingHhCollection] = useState<MenuCollection | null>(null);
  const [hhTemplateName, setHhTemplateName] = useState('');
  const [hhSubType, setHhSubType] = useState<string | undefined>();
  const [hhStartTime, setHhStartTime] = useState('16:00');
  const [hhEndTime, setHhEndTime] = useState('19:00');
  const [assignCollectionId, setAssignCollectionId] = useState<number | null>(null);

  const { toast: _toast } = useToast();

  // --- Data ---
  const { data: storesData } = useMerchantStores();
  const { data: merchantMenuData, isLoading: isLoadingMerchantMenu } = useMerchantMenu();
  const { data: collectionsData, isLoading } = useMenuCollections(
    activeTab as MenuCollectionType,
    selectedStoreId
  );
  const { data: allCollectionsData } = useMenuCollections(undefined, selectedStoreId);
  const deleteCollection = useDeleteMenuCollection();
  const addItemsToCollection = useAddItemsToCollection();

  const collections = collectionsData?.collections ?? EMPTY_COLLECTIONS;
  const allCollections = allCollectionsData?.collections ?? EMPTY_COLLECTIONS;
  const merchantItems = merchantMenuData?.menuItems ?? EMPTY_MENU_ITEMS;
  const stores = storesData?.stores ?? [];
  const selectedStore = stores.find((store) => store.id === selectedStoreId);
  const selectedStoreLabel = selectedStore
    ? selectedStore.isFoodTruck
      ? `Food Truck — ${selectedStore.city?.name ?? selectedStore.address}`
      : selectedStore.address
    : `All Stores (${storesData?.total ?? stores.length})`;

  const inventoryStats = useMemo(() => {
    return merchantItems.reduce(
      (acc, item) => {
        if (item.hasVariants && item.variants && item.variants.length > 0) {
          item.variants.forEach((variant) => {
            const status = variant.inventoryStatus ?? 'UNTRACKED';
            if (status === 'IN_STOCK') acc.inStock += 1;
            if (status === 'LOW_STOCK') acc.lowStock += 1;
            if (status === 'OUT_OF_STOCK') acc.outOfStock += 1;
            if (status === 'UNTRACKED') acc.untracked += 1;
          });
          return acc;
        }

        const status = item.inventoryStatus ?? 'UNTRACKED';
        if (status === 'IN_STOCK') acc.inStock += 1;
        if (status === 'LOW_STOCK') acc.lowStock += 1;
        if (status === 'OUT_OF_STOCK') acc.outOfStock += 1;
        if (status === 'UNTRACKED') acc.untracked += 1;
        return acc;
      },
      { inStock: 0, lowStock: 0, outOfStock: 0, untracked: 0 },
    );
  }, [merchantItems]);

  const assignedMenuItemIds = useMemo(() => {
    const assigned = new Set<number>();
    for (const collection of allCollections) {
      for (const item of collection.items ?? []) {
        if (item.menuItemId) assigned.add(item.menuItemId);
      }
    }
    return assigned;
  }, [allCollections]);

  const unassignedItems = useMemo(
    () => merchantItems.filter((item) => !assignedMenuItemIds.has(item.id)),
    [merchantItems, assignedMenuItemIds],
  );

  const assignableCollections = collections.length > 0 ? collections : allCollections;
  const merchantItemsById = useMemo(
    () =>
      merchantItems.reduce<Record<number, (typeof merchantItems)[number]>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [merchantItems],
  );

  const activeAssignCollectionId =
    assignCollectionId && assignableCollections.some((c) => c.id === assignCollectionId)
      ? assignCollectionId
      : assignableCollections[0]?.id ?? null;
  const activeAssignCollection = assignableCollections.find(
    (collection) => collection.id === activeAssignCollectionId,
  );

  const menuCountsByType = useMemo(
    () =>
      allCollections.reduce<Record<Tab, number>>(
        (acc, collection) => {
          acc[collection.menuType as Tab] += 1;
          return acc;
        },
        { STANDARD: 0, HAPPY_HOUR: 0, SPECIAL: 0 },
      ),
    [allCollections],
  );

  const activeCollectionCount = useMemo(
    () => allCollections.filter((collection) => collection.isActive).length,
    [allCollections],
  );

  const coverageCount = merchantItems.length - unassignedItems.length;
  const coveragePercentage =
    merchantItems.length > 0 ? Math.round((coverageCount / merchantItems.length) * 100) : 0;
  const activeTemplates = activeTab === 'STANDARD' ? STANDARD_TEMPLATES : HAPPY_HOUR_TEMPLATES;
  const activeTabCopy = tabIntroCopy[activeTab];
  const isSpecialTab = activeTab === 'SPECIAL';
  const visibleCollections = showAllMenus ? collections : collections.slice(0, 4);
  const hiddenCollectionCount = Math.max(collections.length - visibleCollections.length, 0);

  useEffect(() => {
    setShowAllMenus(false);
  }, [activeTab, selectedStoreId]);

  // --- Handlers ---
  const handleTemplateClick = useCallback((template: MenuTemplate) => {
    if (template.menuType === 'HAPPY_HOUR') {
      setHhTemplateName(template.name);
      setHhSubType(template.subType);
      // Set default times based on subType
      if (template.subType === 'evening') {
        setHhStartTime('16:00');
        setHhEndTime('19:00');
      } else if (template.subType === 'lunch') {
        setHhStartTime('11:00');
        setHhEndTime('14:00');
      } else if (template.subType === 'late-night') {
        setHhStartTime('21:00');
        setHhEndTime('00:00');
      }
      setEditingHhCollection(null);
      setShowHhEditor(true);
    } else {
      setStdTemplateName(template.name);
      setStdSubType(template.subType);
      setEditingStdCollection(null);
      setShowStdEditor(true);
    }
  }, []);

  const handleEditCollection = useCallback((collection: MenuCollection) => {
    if (collection.menuType === 'HAPPY_HOUR') {
      setEditingHhCollection(collection);
      setHhTemplateName(collection.name);
      setShowHhEditor(true);
    } else {
      setEditingStdCollection(collection);
      setStdTemplateName(collection.name);
      setShowStdEditor(true);
    }
  }, []);

  const handleDeleteCollection = useCallback(
    (collection: MenuCollection) => {
      if (window.confirm(`Delete "${collection.name}"? This action cannot be undone.`)) {
        deleteCollection.mutate(collection.id);
      }
    },
    [deleteCollection]
  );

  const handleAssignItemToCollection = useCallback(
    async (menuItemId: number) => {
      if (!activeAssignCollectionId) {
        _toast({
          title: 'Create a collection first',
          description: 'You need at least one collection before assigning items.',
          variant: 'destructive',
        });
        return;
      }

      try {
        await addItemsToCollection.mutateAsync({
          collectionId: activeAssignCollectionId,
          menuItems: [{ id: menuItemId }],
        });
      } catch {
        // toast handled in mutation hook
      }
    },
    [activeAssignCollectionId, addItemsToCollection, _toast],
  );

  // --- Render ---
  return (
    <div className="mx-auto max-w-7xl px-4 py-3 sm:px-1 sm:py-4">
      <section className={cn(panelClass, 'overflow-hidden bg-gradient-to-br from-white via-white to-[#f6f7f9] p-5 sm:p-6')}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Commerce</div>
            <div className="mt-3 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-brand/10">
                <LayoutGrid className="h-6 w-6 text-brand" />
              </div>
              <div>
                <h1 className="text-[1.9rem] font-semibold tracking-tight text-neutral-900">Menu</h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-6 text-neutral-600 sm:text-sm">
                  Keep your menu system structured, current, and ready to publish across stores, service windows, and special occasions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <StoreSelector
              selectedStoreId={selectedStoreId}
              onSelectStore={setSelectedStoreId}
            />
            <div className="flex flex-wrap gap-2">
              <Link to={PATHS.MERCHANT_MENU_CREATE}>
                <Button size="md" className="rounded-full bg-neutral-950 px-5 text-white hover:bg-neutral-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Menu Item
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                className="rounded-full border-neutral-200 bg-white px-5 text-neutral-700 hover:bg-neutral-50"
                onClick={() => setIsBulkUploadOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.1rem] border border-neutral-200/80 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              <Store className="h-3.5 w-3.5" />
              Store Focus
            </div>
            <p className="mt-2 text-sm font-semibold text-neutral-900">{selectedStoreLabel}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {selectedStoreId ? 'You are managing menus for a single location.' : 'You are viewing the combined menu system across all stores.'}
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-neutral-200/80 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              <CheckCircle className="h-3.5 w-3.5" />
              Active Menus
            </div>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {activeCollectionCount} live menu{activeCollectionCount === 1 ? '' : 's'}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {allCollections.length} total collections spanning standard menus, happy hours, and specials.
            </p>
          </div>
          <div className="rounded-[1.1rem] border border-neutral-200/80 bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              <Boxes className="h-3.5 w-3.5" />
              Catalog Coverage
            </div>
            <p className="mt-2 text-sm font-semibold text-neutral-900">
              {coverageCount}/{merchantItems.length} items assigned
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-neutral-900 transition-all"
                style={{ width: `${coveragePercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              {unassignedItems.length === 0
                ? 'Everything in the catalog is already attached to a menu.'
                : `${unassignedItems.length} item${unassignedItems.length === 1 ? '' : 's'} still need a menu home.`}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={cn(panelClass, 'p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] text-neutral-500">In stock</p>
              <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-emerald-600">
                {inventoryStats.inStock}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Track items ready to sell right now.</p>
            </div>
            <div className="rounded-[0.95rem] border border-emerald-200/80 bg-emerald-50 p-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className={cn(panelClass, 'p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] text-neutral-500">Low stock</p>
              <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-amber-600">
                {inventoryStats.lowStock}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Items that may need restocking soon.</p>
            </div>
            <div className="rounded-[0.95rem] border border-amber-200/80 bg-amber-50 p-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className={cn(panelClass, 'p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] text-neutral-500">Out of stock</p>
              <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-rose-600">
                {inventoryStats.outOfStock}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Items currently unavailable in your catalog.</p>
            </div>
            <div className="rounded-[0.95rem] border border-rose-200/80 bg-rose-50 p-2.5">
              <Boxes className="h-5 w-5 text-rose-600" />
            </div>
          </div>
        </div>

        <div className={cn(panelClass, 'p-5')}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] text-neutral-500">{MENU_TYPE_LABELS[activeTab]} menus</p>
              <p className="mt-2 text-[1.7rem] font-semibold tracking-tight text-neutral-900">
                {menuCountsByType[activeTab]}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{MENU_TYPE_DESCRIPTIONS[activeTab]}</p>
            </div>
            <div className="rounded-[0.95rem] border border-neutral-200/80 bg-neutral-100 p-2.5">
              <LayoutGrid className="h-5 w-5 text-neutral-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <section className={cn(panelClass, 'p-5 sm:p-6')}>
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Step 1 • Choose a menu type</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-[1.35rem] font-semibold tracking-tight text-neutral-900">Start with the kind of menu you want to publish</h2>
                <p className="mt-1 text-[13px] text-neutral-600 sm:text-sm">
                  Pick one lane, then choose a starter below. This keeps creation focused and easier to scan.
                </p>
              </div>
              <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-500">
                {menuCountsByType[activeTab]} existing {MENU_TYPE_LABELS[activeTab].toLowerCase()} menu{menuCountsByType[activeTab] === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'rounded-[1.15rem] border p-4 text-left transition-all duration-200',
                    isActive
                      ? 'border-orange-300 bg-orange-50 text-orange-900 shadow-[0_14px_30px_rgba(251,146,60,0.22)]'
                      : 'border-neutral-200/80 bg-white hover:border-neutral-300 hover:shadow-sm',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={cn('rounded-xl p-2.5', isActive ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-700')}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        isActive ? 'bg-orange-100 text-orange-700' : 'bg-neutral-100 text-neutral-600',
                      )}
                    >
                      {menuCountsByType[tab.key]}
                    </span>
                  </div>
                  <p className={cn('mt-4 text-sm font-semibold', isActive ? 'text-orange-900' : 'text-neutral-900')}>
                    {tab.label}
                  </p>
                  <p className={cn('mt-1 text-xs leading-5', isActive ? 'text-orange-700' : 'text-neutral-500')}>
                    {MENU_TYPE_DESCRIPTIONS[tab.key]}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[1.25rem] border border-neutral-200/80 bg-neutral-50/60 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Step 2 • Pick a starter</div>
                <h3 className="text-lg font-semibold tracking-tight text-neutral-900">{activeTabCopy.title}</h3>
                <p className="mt-1 max-w-2xl text-[13px] leading-6 text-neutral-600 sm:text-sm">
                  {activeTabCopy.description}
                </p>
              </div>
              {!isSpecialTab ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-600 shadow-sm">
                  {activeTemplates.length} starter template{activeTemplates.length === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>

            {isSpecialTab ? (
              <SpecialMenuSection
                collections={collections}
                onDeleteCollection={handleDeleteCollection}
                selectedStoreId={selectedStoreId}
                selectedStoreLabel={selectedStoreLabel}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {activeTemplates.map((template) => (
                  <MenuTemplateCard
                    key={template.id}
                    template={template}
                    onClick={handleTemplateClick}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <div>
          <section className={cn(panelClass, 'p-5 sm:p-6')}>
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Step 3 • Fill gaps</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <h2 className="text-[1.15rem] font-semibold tracking-tight text-neutral-900">Items without a menu</h2>
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                    {unassignedItems.length} open
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-[13px] leading-6 text-neutral-600 sm:text-sm">
                  Quickly attach loose catalog items to the right menu.
                </p>
              </div>

              {assignableCollections.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="assignment-collection"
                    className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400"
                  >
                    Assign into
                  </label>
                  <select
                    id="assignment-collection"
                    value={activeAssignCollectionId ?? ''}
                    onChange={(e) => setAssignCollectionId(Number(e.target.value))}
                    className="w-full rounded-[1rem] border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 outline-none transition focus:border-neutral-300"
                  >
                    {assignableCollections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name} ({MENU_TYPE_LABELS[collection.menuType]})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[1.15rem] border border-neutral-200/80 bg-neutral-50/70 p-4">
              {assignableCollections.length === 0 ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">Create a menu collection first</p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Once you create a menu, you can quickly assign loose catalog items here instead of editing them one by one.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('STANDARD')}
                    className="inline-flex items-center gap-2 self-start rounded-full bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
                  >
                    Start with Standard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : isLoadingMerchantMenu ? (
                <div className="h-16 animate-pulse rounded-xl bg-white" />
              ) : unassignedItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                  Everything in the catalog is already assigned to a menu.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                    New assignments will go to{' '}
                    <span className="font-semibold">{activeAssignCollection?.name}</span>.
                  </div>
                  <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                    {unassignedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white bg-white px-3 py-3 shadow-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-neutral-900">{item.name}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            ${item.price.toFixed(2)} {item.category ? `• ${item.category}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAssignItemToCollection(item.id)}
                          disabled={addItemsToCollection.isPending || assignableCollections.length === 0}
                          className={cn(
                            'inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors',
                            assignableCollections.length === 0
                              ? 'cursor-not-allowed bg-neutral-100 text-neutral-400'
                              : 'bg-neutral-950 text-white hover:bg-neutral-800',
                          )}
                        >
                          Assign
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className={cn(panelClass, 'mt-6 p-5 sm:p-6')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Current Menus</div>
            <h2 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-neutral-900">
              Your {MENU_TYPE_LABELS[activeTab]} menus
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] leading-6 text-neutral-600 sm:text-sm">
              Review, edit, and expand menus here without the page growing out of control.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-500">
              Showing {visibleCollections.length} of {collections.length}
            </span>
          </div>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-[1.2rem] bg-neutral-100"
                />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-neutral-200 bg-neutral-50/70 px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white shadow-sm">
                <LayoutGrid className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="mt-4 text-sm font-semibold text-neutral-800">
                No {MENU_TYPE_LABELS[activeTab].toLowerCase()} menus yet
              </p>
              <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">
                {isSpecialTab
                  ? 'Create a themed menu above to make promotions and events easier to publish.'
                  : 'Choose a starter template above and we will open the editor with the right structure prefilled.'}
              </p>
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-neutral-200/80 bg-neutral-50/60 p-3 sm:p-4">
              <div className={cn('pr-1', showAllMenus && collections.length > 4 && 'max-h-[42rem] overflow-y-auto')}>
                <div className="grid gap-3 lg:grid-cols-2">
                  {visibleCollections.map((col) => (
                    <MenuListCard
                      key={col.id}
                      collection={col}
                      merchantItemsById={merchantItemsById}
                      onEdit={handleEditCollection}
                      onDelete={handleDeleteCollection}
                    />
                  ))}
                </div>
              </div>

              {collections.length > 4 ? (
                <div className="mt-4 border-t border-neutral-200/80 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllMenus((current) => !current)}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    {showAllMenus ? 'Show fewer menus' : `Show ${hiddenCollectionCount} more menu${hiddenCollectionCount === 1 ? '' : 's'}`}
                    <ArrowRight className={cn('h-3.5 w-3.5 transition-transform', showAllMenus && '-rotate-90')} />
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <BulkMenuUpload
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
      />

      {/* ──── Modals ──── */}
      <StandardMenuEditor
        isOpen={showStdEditor}
        onClose={() => {
          setShowStdEditor(false);
          setEditingStdCollection(null);
        }}
        menuType="STANDARD"
        existingCollection={editingStdCollection}
        defaultName={stdTemplateName}
        defaultSubType={stdSubType}
        selectedStoreId={selectedStoreId}
        selectedStoreLabel={selectedStoreLabel}
      />

      <HappyHourMenuEditor
        isOpen={showHhEditor}
        onClose={() => {
          setShowHhEditor(false);
          setEditingHhCollection(null);
        }}
        existingCollection={editingHhCollection}
        defaultName={hhTemplateName}
        defaultSubType={hhSubType}
        defaultStartTime={hhStartTime}
        defaultEndTime={hhEndTime}
        selectedStoreId={selectedStoreId}
        selectedStoreLabel={selectedStoreLabel}
      />
    </div>
  );
};

export default MenuManagementPageV2;
