import React, { useState, useCallback } from 'react';
import {
  Utensils,
  Clock,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useMenuCollections,
  useDeleteMenuCollection,
  type MenuCollection,
  type MenuCollectionType,
} from '@/hooks/useMenuCollections';
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

  const { toast: _toast } = useToast();

  // --- Data ---
  const { data: collectionsData, isLoading } = useMenuCollections(activeTab as MenuCollectionType);
  const deleteCollection = useDeleteMenuCollection();

  const collections = collectionsData?.collections ?? [];

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

      {/* Pill tabs */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-neutral-100 w-fit mb-8 border border-neutral-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content — always a two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column: Create section */}
        <div className="space-y-4">
          {activeTab === 'SPECIAL' ? (
            <SpecialMenuSection
              collections={collections}
              onDeleteCollection={handleDeleteCollection}
            />
          ) : (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                {activeTab === 'STANDARD' ? 'Create a Menu' : 'Create Happy Hour'}
              </h2>
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
                  onEdit={handleEditCollection}
                  onDelete={handleDeleteCollection}
                />
              ))}
            </div>
          )}
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
      />
    </div>
  );
};

export default MenuManagementPageV2;
