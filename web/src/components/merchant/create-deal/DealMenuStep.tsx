import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { Button } from '@/components/common/Button';
import { 
  Utensils, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Eye, 
  EyeOff,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  Tag,
  Percent,
  Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';
import { MenuItemDiscountEditor } from './MenuItemDiscountEditor';
import { MenuCollectionSelector } from './MenuCollectionSelector';
import { CollectionPreview } from './CollectionPreview';
import { useDealTypes } from '@/hooks/useDealTypes';
import { useMenuByDealType } from '@/hooks/useMenuCollections';

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  isHidden: boolean;
  selectedItem?: any; // SelectedMenuItem with discount info
  onToggle: (item: MenuItem) => void;
  onToggleVisibility: (item: MenuItem) => void;
  onEditDiscount: (item: MenuItem) => void;
}

const MenuItemCard = ({ item, isSelected, isHidden, selectedItem, onToggle, onToggleVisibility, onEditDiscount }: MenuItemCardProps) => {
  // Get images to display (prioritize new images array over legacy imageUrl)
  const displayImages = item.images && item.images.length > 0 
    ? item.images 
    : item.imageUrl 
      ? [{ id: 'legacy', url: item.imageUrl, publicId: 'legacy', name: 'Image' }]
      : [];

  // Check if item has custom pricing
  const hasCustomPricing = selectedItem && (
    (selectedItem.customPrice !== null && selectedItem.customPrice !== undefined) ||
    (selectedItem.customDiscount !== null && selectedItem.customDiscount !== undefined) ||
    (selectedItem.discountAmount !== null && selectedItem.discountAmount !== undefined)
  );

  // Calculate final price for display
  const getDisplayPrice = () => {
    if (!selectedItem) return item.price;
    
    if (selectedItem.customPrice !== null && selectedItem.customPrice !== undefined) {
      return selectedItem.customPrice;
    }
    
    if (selectedItem.customDiscount !== null && selectedItem.customDiscount !== undefined) {
      return item.price * (1 - selectedItem.customDiscount / 100);
    }
    
    if (selectedItem.discountAmount !== null && selectedItem.discountAmount !== undefined) {
      return Math.max(0, item.price - selectedItem.discountAmount);
    }
    
    return item.price;
  };

  const displayPrice = getDisplayPrice();
  const hasDiscount = displayPrice < item.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-lg border-2 p-4 transition-all duration-200',
        isSelected 
          ? 'border-brand-primary-500 bg-brand-primary-50 shadow-md' 
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-500 text-white"
        >
          <CheckCircle className="h-4 w-4" />
        </motion.div>
      )}

      {/* Custom pricing badge */}
      {hasCustomPricing && (
        <div className="absolute -top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">
          Custom Price
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Image or Icon */}
        <div className="flex-shrink-0">
          {displayImages.length > 0 ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100">
              <img
                src={displayImages[0].url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-brand-primary-100 flex items-center justify-center">
              <Utensils className="h-6 w-6 text-brand-primary-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 truncate">{item.name}</h3>
              <p className="text-sm text-neutral-600 line-clamp-2">{item.description}</p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                  {item.category}
                </span>
                {item.dealType && item.dealType !== 'STANDARD' && (
                  <span className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    item.dealType.includes('HAPPY_HOUR') 
                      ? "bg-amber-100 text-amber-700"
                      : item.dealType.includes('SURPRISE')
                      ? "bg-purple-100 text-purple-700"
                      : item.dealType.includes('BOUNTY')
                      ? "bg-blue-100 text-blue-700"
                      : item.dealType === 'RECURRING'
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-700"
                  )}>
                    {item.dealType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                )}
                {item.isHappyHour && item.happyHourPrice && (
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                    HH: ${item.happyHourPrice.toFixed(2)}
                  </span>
                )}
                {item.isSurprise && (
                  <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Surprise
                  </span>
                )}
                <div className="flex items-center gap-1">
                  {hasDiscount && (
                    <span className="text-xs text-neutral-400 line-through">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                  <span className={cn(
                    "flex items-center gap-1 text-sm font-semibold",
                    hasDiscount ? "text-green-600" : "text-green-600"
                  )}>
                  <DollarSign className="h-3 w-3" />
                    {displayPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      {((1 - displayPrice / item.price) * 100).toFixed(0)}% OFF
                </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="ml-2 flex flex-col gap-1">
              {isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDiscount(item);
                  }}
                  className={cn(
                    'p-1 rounded-md transition-colors',
                    hasCustomPricing
                      ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                      : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
                  )}
                  title="Edit discount"
                >
                  <Tag className="h-4 w-4" />
                </button>
              )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(item);
              }}
              className={cn(
                  'p-1 rounded-md transition-colors',
                isHidden 
                  ? 'text-neutral-400 hover:text-neutral-600' 
                  : 'text-green-600 hover:text-green-700'
              )}
              title={isHidden ? 'Show in deal' : 'Hide from deal'}
            >
              {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Clickable overlay for selection */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => onToggle(item)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (isSelected) {
            onEditDiscount(item);
          }
        }}
      />
    </motion.div>
  );
};

const MenuItemSkeleton = () => (
  <div className="rounded-lg border border-neutral-200 bg-white p-4">
    <div className="animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-neutral-200" />
        <div className="flex-1">
          <div className="mb-2 h-4 w-32 rounded bg-neutral-200" />
          <div className="mb-2 h-3 w-48 rounded bg-neutral-200" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-neutral-200" />
            <div className="h-5 w-12 rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const DealMenuStep = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useDealCreation();
  const { data: menuData, isLoading, error } = useMerchantMenu();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDealType, setSelectedDealType] = useState<string>('ALL');
  const [editingDiscountItem, setEditingDiscountItem] = useState<MenuItem | null>(null);
  
  const { data: dealTypesData } = useDealTypes();
  const dealTypes = dealTypesData?.dealTypes || [];
  const dealTypeFilter = selectedDealType !== 'ALL' ? selectedDealType : null;
  const { data: byDealTypeData } = useMenuByDealType(dealTypeFilter as any, undefined);

  const menuItems = (dealTypeFilter ? byDealTypeData?.menuItems : menuData?.menuItems) || [];
  const selectedMenuItems = state.selectedMenuItems || [];
  const useCollection = state.useMenuCollection;
  const selectedCollectionId = state.menuCollectionId;

  // Filter menu items based on search and category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const handleToggleMenuItem = (item: MenuItem) => {
    const isSelected = selectedMenuItems.some(selected => selected.id === item.id);
    
    if (isSelected) {
      // Remove from selection
      const updated = selectedMenuItems.filter(selected => selected.id !== item.id);
      dispatch({ type: 'SET_FIELD', field: 'selectedMenuItems', value: updated });
    } else {
      // Add to selection
      const newItem = {
        ...item,
        isHidden: false
      };
      dispatch({ 
        type: 'SET_FIELD', 
        field: 'selectedMenuItems', 
        value: [...selectedMenuItems, newItem] 
      });
    }
  };

  const handleToggleVisibility = (item: MenuItem) => {
    const updated = selectedMenuItems.map(selected => 
      selected.id === item.id 
        ? { ...selected, isHidden: !selected.isHidden }
        : selected
    );
    dispatch({ type: 'SET_FIELD', field: 'selectedMenuItems', value: updated });
  };

  const isMenuItemSelected = (item: MenuItem) => {
    return selectedMenuItems.some(selected => selected.id === item.id);
  };

  const isMenuItemHidden = (item: MenuItem) => {
    const selected = selectedMenuItems.find(selected => selected.id === item.id);
    return selected?.isHidden || false;
  };

  const getSelectedItem = (item: MenuItem) => {
    return selectedMenuItems.find(selected => selected.id === item.id);
  };

  const handleEditDiscount = (item: MenuItem) => {
    setEditingDiscountItem(item);
  };

  const handleNext = () => {
    navigate('/merchant/deals/create/offer');
  };

  const handleBack = () => {
    navigate('/merchant/deals/create/basics');
  };

  if (isLoading) {
    return (
      <OnboardingStepLayout
        title="Select Menu Items"
        subtitle="Choose which items to include in your deal"
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={false}
        progress={35}
      >
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MenuItemSkeleton key={i} />
          ))}
        </div>
      </OnboardingStepLayout>
    );
  }

  if (error) {
    return (
      <OnboardingStepLayout
        title="Select Menu Items"
        subtitle="Choose which items to include in your deal"
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={false}
        progress={35}
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <Utensils className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Error Loading Menu
          </h3>
          <p className="mb-4 text-red-600">
            {error.message || 'Failed to load your menu items. Please try again later.'}
          </p>
          <Link to={PATHS.MERCHANT_MENU_CREATE}>
            <Button variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Items First
            </Button>
          </Link>
        </div>
      </OnboardingStepLayout>
    );
  }

  return (
    <OnboardingStepLayout
      title="Select Menu Items"
      subtitle="Choose which items to include in your deal"
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={false}
      progress={40}
    >
      <div className="space-y-6">
        {/* Selection Mode Toggle */}
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="mb-4">
            <label className="text-sm font-semibold text-neutral-900">Menu Source</label>
            <p className="text-xs text-neutral-600 mt-1">
              Choose how you want to add items to this deal
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                dispatch({ type: 'TOGGLE_USE_COLLECTION', useCollection: false });
                dispatch({ type: 'SET_MENU_COLLECTION', collectionId: null });
              }}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-all',
                !useCollection
                  ? 'border-brand-primary-500 bg-brand-primary-50 shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'rounded-lg p-2',
                  !useCollection ? 'bg-brand-primary-100' : 'bg-neutral-100'
                )}>
                  <Utensils className={cn(
                    "h-5 w-5",
                    !useCollection ? "text-brand-primary-600" : "text-neutral-400"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold",
                  !useCollection ? "text-brand-primary-900" : "text-neutral-700"
                )}>
                  Select Items
                </span>
              </div>
              <p className="text-xs text-neutral-600">
                Manually choose individual items from your menu
              </p>
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'TOGGLE_USE_COLLECTION', useCollection: true });
              }}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-all',
                useCollection
                  ? 'border-brand-primary-500 bg-brand-primary-50 shadow-sm'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'rounded-lg p-2',
                  useCollection ? 'bg-brand-primary-100' : 'bg-neutral-100'
                )}>
                  <Package className={cn(
                    "h-5 w-5",
                    useCollection ? "text-brand-primary-600" : "text-neutral-400"
                  )} />
                </div>
                <span className={cn(
                  "font-semibold",
                  useCollection ? "text-brand-primary-900" : "text-neutral-700"
                )}>
                  Use Collection
                </span>
              </div>
              <p className="text-xs text-neutral-600">
                Select from saved menu collections
              </p>
            </button>
          </div>
        </div>

        {/* Collection Selection Mode */}
        {useCollection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <MenuCollectionSelector
              onCollectionSelect={(collectionId, items) => {
                if (collectionId && items) {
                  // Load collection items into selectedMenuItems
                  dispatch({ 
                    type: 'SET_FIELD', 
                    field: 'selectedMenuItems', 
                    value: items 
                  });
                } else {
                  // Clear selection
                  dispatch({ 
                    type: 'SET_FIELD', 
                    field: 'selectedMenuItems', 
                    value: [] 
                  });
                }
              }}
            />
            {selectedCollectionId && (
              <CollectionPreview
                collectionId={selectedCollectionId}
                globalDiscountPercentage={state.discountPercentage}
                globalDiscountAmount={state.discountAmount}
              />
            )}
            {!selectedCollectionId && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Select a Collection
                    </h4>
                    <p className="text-sm text-amber-700">
                      Choose a menu collection above to add all its items to this deal. You can create new collections from the menu management page.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Manual Selection Mode */}
        {!useCollection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
        {/* Deal Type Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-sm text-neutral-600">Deal Type:</span>
            <button
              onClick={() => setSelectedDealType('ALL')}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
                selectedDealType === 'ALL' ? 'bg-brand-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              )}
            >
              All
            </button>
            {dealTypes.map((dt) => (
              <button
                key={dt.value}
                onClick={() => setSelectedDealType(dt.value)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  selectedDealType === dt.value ? 'bg-brand-primary-500 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
                title={dt.description || dt.label}
              >
                {dt.label}
              </button>
            ))}
          </div>

          {/* Search and Category Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-neutral-500 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  selectedCategory === category
                    ? 'bg-brand-primary-500 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
              >
                {category === 'all' ? 'All Items' : category}
              </button>
            ))}
          </div>
          </div>
        </div>

        {/* Selection Summary & Quick Actions */}
        {selectedMenuItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-brand-primary-200 bg-brand-primary-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-brand-primary-800">
                  {selectedMenuItems.length} item{selectedMenuItems.length !== 1 ? 's' : ''} selected
                </h4>
                <p className="text-sm text-brand-primary-600">
                  {selectedMenuItems.filter(item => !item.isHidden).length} visible, {selectedMenuItems.filter(item => item.isHidden).length} hidden
                </p>
              </div>
              <div className="text-sm text-brand-primary-600">
                Total: ${selectedMenuItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </div>
            </div>
            
            {/* Selected Items List with Quick Discount Edit */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedMenuItems.map((selectedItem) => {
                const hasCustomPricing = selectedItem.customPrice !== null || selectedItem.customDiscount !== null || selectedItem.discountAmount !== null;
                let displayPrice = selectedItem.price;
                if (selectedItem.customPrice !== null && selectedItem.customPrice !== undefined) {
                  displayPrice = selectedItem.customPrice;
                } else if (selectedItem.customDiscount !== null && selectedItem.customDiscount !== undefined) {
                  displayPrice = selectedItem.price * (1 - selectedItem.customDiscount / 100);
                } else if (selectedItem.discountAmount !== null && selectedItem.discountAmount !== undefined) {
                  displayPrice = Math.max(0, selectedItem.price - selectedItem.discountAmount);
                } else if (state.discountPercentage !== null) {
                  displayPrice = selectedItem.price * (1 - state.discountPercentage / 100);
                } else if (state.discountAmount !== null) {
                  displayPrice = Math.max(0, selectedItem.price - state.discountAmount);
                }
                const hasDiscount = displayPrice < selectedItem.price;

                return (
                  <div
                    key={selectedItem.id}
                    className="flex items-center justify-between rounded-lg border border-brand-primary-200 bg-white p-2 hover:bg-brand-primary-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {selectedItem.imageUrl ? (
                          <img
                            src={selectedItem.imageUrl}
                            alt={selectedItem.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                            <Utensils className="h-5 w-5 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-neutral-900 truncate">{selectedItem.name}</div>
                        <div className="flex items-center gap-2 text-sm">
                          {hasDiscount && (
                            <span className="text-neutral-400 line-through">${selectedItem.price.toFixed(2)}</span>
                          )}
                          <span className={cn(
                            "font-semibold",
                            hasDiscount ? "text-green-600" : "text-neutral-700"
                          )}>
                            ${displayPrice.toFixed(2)}
                          </span>
                          {hasCustomPricing && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditDiscount(selectedItem)}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          hasCustomPricing
                            ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
                        )}
                        title="Edit discount (or double-click item card)"
                      >
                        <Tag className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          const item = menuItems.find(m => m.id === selectedItem.id);
                          if (item) handleToggleVisibility(item);
                        }}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          selectedItem.isHidden
                            ? 'text-neutral-400 hover:text-neutral-600'
                            : 'text-green-600 hover:text-green-700'
                        )}
                        title={selectedItem.isHidden ? 'Show in deal' : 'Hide from deal'}
                      >
                        {selectedItem.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-brand-primary-600">
              💡 Tip: Click the tag icon or double-click any item card to edit discounts
            </p>
          </motion.div>
        )}

        {/* Menu Items */}
        {menuItems.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-white py-16 text-center">
            <Utensils className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-xl font-semibold text-neutral-800">
              No menu items yet
            </h3>
            <p className="mb-6 text-neutral-600">
              Add menu items first to create deals with them.
            </p>
            <Link to={PATHS.MERCHANT_MENU_CREATE}>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Add Menu Items
              </Button>
            </Link>
          </div>
        ) : filteredMenuItems.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
            <h3 className="mb-2 text-lg font-semibold text-neutral-800">
              No items found
            </h3>
            <p className="text-neutral-600">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredMenuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  isSelected={isMenuItemSelected(item)}
                  isHidden={isMenuItemHidden(item)}
                  selectedItem={getSelectedItem(item)}
                  onToggle={handleToggleMenuItem}
                  onToggleVisibility={handleToggleVisibility}
                  onEditDiscount={handleEditDiscount}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Optional: Skip menu selection */}
        <div className="text-center">
          <button
            onClick={handleNext}
            className="text-sm text-neutral-500 hover:text-neutral-700 underline"
          >
            Skip menu selection (create deal without specific items)
          </button>
        </div>
          </motion.div>
        )}
      </div>

      {/* Discount Editor Modal */}
      <AnimatePresence>
        {editingDiscountItem && (
          <MenuItemDiscountEditor
            item={getSelectedItem(editingDiscountItem) || {
              ...editingDiscountItem,
              isHidden: false,
              useGlobalDiscount: true
            }}
            globalDiscountPercentage={state.discountPercentage}
            globalDiscountAmount={state.discountAmount}
            onClose={() => setEditingDiscountItem(null)}
          />
        )}
      </AnimatePresence>
    </OnboardingStepLayout>
  );
};
