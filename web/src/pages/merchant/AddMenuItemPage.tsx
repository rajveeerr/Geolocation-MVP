import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHappyHour } from '@/context/HappyHourContext';
import type { MenuItem as MenuItemType, SelectedMenuItem } from '@/context/HappyHourContext';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Loader2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import MenuItemCard from '@/components/common/MenuItemCard';
import { useMerchantMenu, type MenuItem as APIMenuItem } from '@/hooks/useMerchantMenu';
import { useToast } from '@/hooks/use-toast';
import { HappyHourItemDiscountEditor } from '@/components/merchant/create-deal/HappyHourItemDiscountEditor';
import { AnimatePresence } from 'framer-motion';

// Using shared MenuItemCard component for consistent premium UI

export const AddMenuItemPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useHappyHour();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'Bites' | 'Drinks' | 'All'>('All');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  
  // Fetch menu items from API
  const { data: menuData, isLoading, error } = useMerchantMenu();

  // Filter to show only Happy Hour items and by category
  const filteredMenu = useMemo(() => {
    if (!menuData?.menuItems) return [];
    
    // Filter to only Happy Hour items
    const happyHourItems = menuData.menuItems.filter((item: APIMenuItem) => item.isHappyHour === true);
    
    // Map API format to HappyHourContext format
    const mappedItems: MenuItemType[] = happyHourItems.map((item: APIMenuItem) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category || 'Bites', // Default to 'Bites' if category is missing
      imageUrl: item.imageUrl || item.images?.[0]?.url || '',
      description: item.description || null,
      isHappyHour: item.isHappyHour,
      happyHourPrice: item.happyHourPrice,
    }));
    
    // Filter by active tab
    if (activeTab === 'All') return mappedItems;
    return mappedItems.filter((item) => {
      // Map API categories to 'Bites' or 'Drinks' for filtering
      const categoryLower = item.category.toLowerCase();
      if (activeTab === 'Bites') {
        return categoryLower.includes('appetizer') || categoryLower.includes('bite') || 
               categoryLower.includes('food') || categoryLower.includes('main') ||
               (!categoryLower.includes('drink') && !categoryLower.includes('beverage'));
      } else {
        return categoryLower.includes('drink') || categoryLower.includes('beverage') ||
               categoryLower.includes('cocktail') || categoryLower.includes('wine') ||
               categoryLower.includes('beer');
      }
    });
  }, [menuData, activeTab]);

  const toggleSelectItem = (item: MenuItemType) => {
    // Validate that item is a Happy Hour item
    if (!item.isHappyHour) {
      toast({
        title: 'Not a Happy Hour Item',
        description: 'This item is not marked as a Happy Hour item. Please mark it as Happy Hour in your menu first.',
        variant: 'destructive',
      });
      return;
    }

    // Check if item is already selected
    const exists = state.selectedMenuItems.some((s) => s.id === item.id);
    
    if (exists) {
      // If already selected, remove it
      const newSelected = state.selectedMenuItems.filter((s) => s.id !== item.id);
      dispatch({ type: 'SET_SELECTED_ITEMS', payload: newSelected });
    } else {
      // If not selected, add it and immediately show discount popup
      const newItem: SelectedMenuItem = { 
        ...item, 
        isHidden: false,
        useGlobalDiscount: true, // Default to using global discount
        customPrice: null,
        customDiscount: null,
        discountAmount: null,
      };
      const newSelected = [...state.selectedMenuItems, newItem];
      dispatch({ type: 'SET_SELECTED_ITEMS', payload: newSelected });
      // Show discount popup immediately
      setEditingItemId(item.id);
    }
  };

  const handleDone = () => navigate(-1);

  const TABS: Array<'All' | 'Bites' | 'Drinks'> = ['All', 'Bites', 'Drinks'];

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] flex-col">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 pb-24 sm:px-4">
        <div className="mb-5 flex items-start gap-3">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft />
          </Button>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Happy Hour
            </div>
            <h1 className="mt-1.5 text-[1.65rem] font-semibold tracking-tight text-neutral-900 sm:text-[1.85rem]">
              Add menu items
            </h1>
            <p className="mt-1.5 max-w-2xl text-[13px] leading-6 text-neutral-600 sm:text-sm">
              Pick the items to include in this happy hour deal.
            </p>
          </div>
        </div>

        <div className="rounded-[1.45rem] border border-neutral-200/80 bg-white/95 p-4 shadow-[0_8px_22px_rgba(15,23,42,0.045)] sm:p-5">
          {/* Tab strip */}
          <div className="mb-4 flex flex-wrap gap-1.5 rounded-2xl bg-neutral-100 p-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex flex-1 items-center justify-center rounded-xl px-3 py-2 text-[12.5px] font-semibold transition',
                    isActive
                      ? 'bg-white text-neutral-900 shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
                      : 'text-neutral-600 hover:text-neutral-900',
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-3 h-6 w-6 animate-spin text-neutral-400" />
              <p className="text-[13px] text-neutral-600">Loading menu items…</p>
            </div>
          ) : null}

          {/* Error */}
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <div>
                  <h4 className="text-[13px] font-semibold text-rose-900">Couldn't load your menu</h4>
                  <p className="mt-0.5 text-[12px] text-rose-700">
                    {error instanceof Error ? error.message : 'Please try again in a moment.'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Empty */}
          {!isLoading && !error && filteredMenu.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                <Info className="h-5 w-5 text-neutral-400" />
              </div>
              <h3 className="text-[14px] font-semibold text-neutral-900">No happy hour items yet</h3>
              <p className="mb-4 mt-1 text-[12px] text-neutral-500">
                Mark items as "Happy Hour" on your menu first.
              </p>
              <Button
                variant="ghost"
                onClick={() => navigate('/merchant/menu')}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-4 text-[13px] font-semibold text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50"
              >
                Go to Menu Management
              </Button>
            </div>
          ) : null}

          {/* Grid */}
          {!isLoading && !error && filteredMenu.length > 0 ? (
            <>
              <div className="mb-3 inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
                <Info className="h-3 w-3" />
                {filteredMenu.length} happy hour item{filteredMenu.length !== 1 ? 's' : ''} available
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {filteredMenu.map((item) => {
                  const isSelected = state.selectedMenuItems.some((s) => s.id === item.id);
                  return (
                    <div key={item.id}>
                      <MenuItemCard item={item} isSelected={isSelected} onToggle={() => toggleSelectItem(item)} />
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200/80 bg-white/95 backdrop-blur-xl shadow-[0_-6px_20px_rgba(15,23,42,0.06)] lg:left-[320px] lg:w-[calc(100%-320px)]">
        <div className="mx-auto flex min-h-[3.75rem] w-full max-w-screen-xl items-center justify-between gap-2 px-3 py-2.5 sm:px-5">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="h-9 rounded-xl border-neutral-300 bg-white px-4 text-[13px] text-neutral-700 shadow-none hover:border-neutral-400 hover:bg-neutral-50"
          >
            Back
          </Button>
          <Button
            variant="ghost"
            onClick={handleDone}
            disabled={state.selectedMenuItems.length === 0}
            className="flex h-9 min-w-[160px] items-center justify-center gap-1.5 rounded-xl bg-[hsl(var(--brand-primary))] px-4 text-[13px] font-semibold text-white shadow-[0_6px_18px_hsl(var(--brand-primary)/0.28)] hover:bg-[hsl(var(--brand-primary-hover))] hover:text-white disabled:opacity-100 disabled:bg-neutral-200 disabled:text-neutral-700 disabled:shadow-none disabled:hover:bg-neutral-200"
          >
            Confirm
            {state.selectedMenuItems.length > 0 ? ` ${state.selectedMenuItems.length} item${state.selectedMenuItems.length === 1 ? '' : 's'}` : ''}
          </Button>
        </div>
      </footer>

      {/* Discount Editor Modal */}
      <AnimatePresence>
        {editingItemId !== null && (() => {
          const item = state.selectedMenuItems.find(i => i.id === editingItemId);
          if (!item) return null;
          return (
            <HappyHourItemDiscountEditor
              item={item}
              globalDiscountPercentage={state.discountPercentage}
              globalDiscountAmount={state.discountAmount}
              onClose={() => setEditingItemId(null)}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default AddMenuItemPage;

