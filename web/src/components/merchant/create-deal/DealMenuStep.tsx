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
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { PATHS } from '@/routing/paths';

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  isHidden: boolean;
  onToggle: (item: MenuItem) => void;
  onToggleVisibility: (item: MenuItem) => void;
}

const MenuItemCard = ({ item, isSelected, isHidden, onToggle, onToggleVisibility }: MenuItemCardProps) => {
  // Get images to display (prioritize new images array over legacy imageUrl)
  const displayImages = item.images && item.images.length > 0 
    ? item.images 
    : item.imageUrl 
      ? [{ id: 'legacy', url: item.imageUrl, publicId: 'legacy', name: 'Image' }]
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer',
        isSelected 
          ? 'border-brand-primary-500 bg-brand-primary-50 shadow-md' 
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
      )}
      onClick={() => onToggle(item)}
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
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  <DollarSign className="h-3 w-3" />
                  {typeof item.price === 'number' && !isNaN(item.price) ? item.price.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>

            {/* Visibility toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(item);
              }}
              className={cn(
                'ml-2 p-1 rounded-md transition-colors',
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
  
  const menuItems = menuData?.menuItems || [];
  const selectedMenuItems = state.selectedMenuItems || [];

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
        {/* Search and Filter */}
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

        {/* Selection Summary */}
        {selectedMenuItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-brand-primary-200 bg-brand-primary-50 p-4"
          >
            <div className="flex items-center justify-between">
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
                  onToggle={handleToggleMenuItem}
                  onToggleVisibility={handleToggleVisibility}
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
      </div>
    </OnboardingStepLayout>
  );
};
