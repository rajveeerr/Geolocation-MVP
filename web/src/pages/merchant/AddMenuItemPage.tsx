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

// Using shared MenuItemCard component for consistent premium UI

export const AddMenuItemPage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useHappyHour();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'Bites' | 'Drinks' | 'All'>('All');
  
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

    const exists = state.selectedMenuItems.some((s) => s.id === item.id);
    const newSelected: SelectedMenuItem[] = exists
      ? state.selectedMenuItems.filter((s) => s.id !== item.id)
      : [...state.selectedMenuItems, { 
          ...item, 
          isHidden: false,
          useGlobalDiscount: true, // Default to using global discount
          customPrice: null,
          customDiscount: null,
          discountAmount: null,
        }];

    dispatch({ type: 'SET_SELECTED_ITEMS', payload: newSelected });
  };

  const handleDone = () => navigate(-1);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b z-10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate(-1)} variant="ghost" size="sm" className="rounded-full h-10 w-10">
            <ArrowLeft />
          </Button>
          <h2 className="font-bold text-lg">Add Menu Items</h2>
        </div>
      </header>

      <div className="sticky top-[73px] bg-white z-10 border-b">
        <div className="max-w-4xl mx-auto flex items-center">
          <button onClick={() => setActiveTab('All')} className={cn('flex-1 py-3 text-center font-semibold border-b-2', activeTab === 'All' ? 'border-brand-primary-600 text-brand-primary-600' : 'border-transparent text-neutral-500')}>
            All
          </button>
          <button onClick={() => setActiveTab('Bites')} className={cn('flex-1 py-3 text-center font-semibold border-b-2', activeTab === 'Bites' ? 'border-brand-primary-600 text-brand-primary-600' : 'border-transparent text-neutral-500')}>
            Bites
          </button>
          <button onClick={() => setActiveTab('Drinks')} className={cn('flex-1 py-3 text-center font-semibold border-b-2', activeTab === 'Drinks' ? 'border-brand-primary-600 text-brand-primary-600' : 'border-transparent text-neutral-500')}>
            Drinks
          </button>
        </div>
      </div>

      <main className="p-4 max-w-4xl mx-auto pb-24">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary-600 mb-4" />
            <p className="text-neutral-600">Loading menu items...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Error Loading Menu</h4>
                <p className="text-sm text-red-700 mt-1">
                  {error instanceof Error ? error.message : 'Failed to load menu items. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State - No Happy Hour Items */}
        {!isLoading && !error && filteredMenu.length === 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
            <Info className="h-12 w-12 mx-auto text-amber-600 mb-3" />
            <h3 className="font-semibold text-amber-900 mb-2">No Happy Hour Items Found</h3>
            <p className="text-sm text-amber-700 mb-4">
              You need to mark menu items as "Happy Hour" before adding them to a Happy Hour deal.
            </p>
            <Button
              onClick={() => navigate('/merchant/menu')}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              Go to Menu Management
            </Button>
          </div>
        )}

        {/* Menu Items Grid */}
        {!isLoading && !error && filteredMenu.length > 0 && (
          <>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Only items marked as "Happy Hour" in your menu are shown here. 
                  {filteredMenu.length} Happy Hour item{filteredMenu.length !== 1 ? 's' : ''} available.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t p-4 bg-white/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleDone} size="lg" className="w-full rounded-lg">
            Confirm {state.selectedMenuItems.length} Selection(s)
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AddMenuItemPage;

