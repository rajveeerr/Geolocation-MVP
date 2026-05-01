import React, { useState, useCallback, useMemo } from 'react';
import {
  Utensils,
  Clock,
  Sparkles,
  LayoutGrid,
  Boxes,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useMenuCollections,
  useDeleteMenuCollection,
  useAddItemsToCollection,
  type MenuCollection,
  type MenuCollectionType,
} from '@/hooks/useMenuCollections';
import { useMerchantStores } from '@/hooks/useMerchantStores';
import { useMerchantMenu } from '@/hooks/useMerchantMenu';
import {
  STANDARD_TEMPLATES,
  HAPPY_HOUR_TEMPLATES,
  MENU_TYPE_LABELS,
  type MenuTemplate,
} from '@/config/menuTemplates';

// Sub-components
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

// ─── Component ────────────────────────────────────────────────────────
const MenuManagementPageV2: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<Tab>('STANDARD');
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

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

  const collections = collectionsData?.collections ?? [];
  const allCollections = allCollectionsData?.collections ?? [];
  const merchantItems = merchantMenuData?.menuItems ?? [];
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
    <div className="min-h-screen">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
              <LayoutGrid className="h-5 w-5 text-brand" />
            </span>
            Menu Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 ml-0.5">
            Create and manage your menus, happy hours, and specials
          </p>
        </div>

        <StoreSelector
          selectedStoreId={selectedStoreId}
          onSelectStore={setSelectedStoreId}
        />
      </div>

      {/* Tab content — always a two-column grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">In Stock</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{inventoryStats.inStock}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Low Stock</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{inventoryStats.lowStock}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Out Of Stock</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Inventory Coverage</p>
              <p className="mt-2 text-2xl font-bold text-neutral-900">
                {merchantItems.length === 0 ? '0/0' : `${merchantItems.length - unassignedItems.length}/${merchantItems.length}`}
              </p>
              <p className="mt-1 text-xs text-neutral-500">{unassignedItems.length} catalog items still unassigned</p>
            </div>
            <Boxes className="h-8 w-8 text-brand" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Create section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Create a Menu
            </h2>
            <div className="mt-3 flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1 w-fit">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'border border-neutral-200 bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'SPECIAL' ? (
            <SpecialMenuSection
              collections={collections}
              onDeleteCollection={handleDeleteCollection}
              selectedStoreId={selectedStoreId}
              selectedStoreLabel={selectedStoreLabel}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(activeTab === 'STANDARD' ? STANDARD_TEMPLATES : HAPPY_HOUR_TEMPLATES).map(
                  (template) => (
                    <MenuTemplateCard
                      key={template.id}
                      template={template}
                      onClick={handleTemplateClick}
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>

        {/* Right column: Your Menus */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Your {MENU_TYPE_LABELS[activeTab]} Menus
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-neutral-100"
                />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 py-16 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 mb-4">
                <LayoutGrid className="h-6 w-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-600">
                No {MENU_TYPE_LABELS[activeTab].toLowerCase()} menus yet
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                {activeTab === 'SPECIAL'
                  ? 'Pick a theme or create a custom one to get started'
                  : 'Pick a template on the left to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {collections.map((col) => (
                <MenuListCard
                  key={col.id}
                  collection={col}
                  merchantItemsById={merchantItemsById}
                  onEdit={handleEditCollection}
                  onDelete={handleDeleteCollection}
                />
              ))}
            </div>
          )}

          <div className="mt-6 space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                  Unassigned Items
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Items created directly in catalog but not yet assigned to any menu collection.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                  {unassignedItems.length}
                </span>
                {assignableCollections.length > 0 && (
                  <select
                    value={activeAssignCollectionId ?? ''}
                    onChange={(e) => setAssignCollectionId(Number(e.target.value))}
                    className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-medium text-neutral-700"
                  >
                    {assignableCollections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name} ({collection.menuType})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {isLoadingMerchantMenu ? (
              <div className="h-14 animate-pulse rounded-lg bg-neutral-100" />
            ) : unassignedItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4 text-center text-xs text-neutral-500">
                No unassigned items in this tab.
              </p>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {unassignedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-neutral-800">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        ${item.price.toFixed(2)} {item.category ? `• ${item.category}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAssignItemToCollection(item.id)}
                      disabled={addItemsToCollection.isPending || assignableCollections.length === 0}
                      className={cn(
                        'rounded-lg px-2.5 py-1.5 text-xs font-semibold',
                        assignableCollections.length === 0
                          ? 'cursor-not-allowed bg-neutral-100 text-neutral-400'
                          : 'bg-brand/10 text-brand hover:bg-brand/20',
                      )}
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
