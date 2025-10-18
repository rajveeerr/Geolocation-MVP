import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useMerchantMenu, useDeleteMenuItem, type MenuItem } from '@/hooks/useMerchantMenu';
import { useModal } from '@/context/ModalContext';
import { 
  Plus, 
  Utensils, 
  Edit, 
  Trash2, 
  Loader2,
  AlertCircle,
  DollarSign,
  Hash,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
// Removed shadcn tabs import - using custom styling

const MenuItemCard = ({ item, onEdit, onDelete, onView }: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onView: (item: MenuItem) => void;
}) => {
  const formatCurrency = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(price);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Recently';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Recently';
    }
  };

  // Debug logging to see what data we're receiving
  console.log('MenuItem data:', item);

  // Get images to display (prioritize new images array over legacy imageUrl)
  const displayImages = item.images && item.images.length > 0 
    ? item.images 
    : item.imageUrl 
      ? [{ id: 'legacy', url: item.imageUrl, publicId: 'legacy', name: 'Image' }]
      : [];

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-brand-primary-100 p-2">
            <Utensils className="h-5 w-5 text-brand-primary-600" />
          </div>
          <div className="flex-1">
            <h3 
              className="text-lg font-semibold text-neutral-800 cursor-pointer hover:text-brand-primary-600 transition-colors"
              onClick={() => onView(item)}
            >
              {item.name}
            </h3>
            <p className="text-sm text-neutral-600">{item.description}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                <DollarSign className="h-3 w-3" />
                {typeof item.price === 'number' && !isNaN(item.price) ? item.price.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview */}
      {displayImages.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="h-4 w-4 text-neutral-500" />
            <span className="text-xs text-neutral-500">
              {displayImages.length} image{displayImages.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {displayImages.slice(0, 3).map((image, index) => (
              <div key={image.id} className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                  <img
                    src={image.url}
                    alt={`${item.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
            {displayImages.length > 3 && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center">
                <span className="text-xs text-neutral-500">+{displayImages.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="text-xs text-neutral-500">
          Added {formatDate(item.createdAt)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(item)}
          className="flex-1"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(item)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const MenuItemSkeleton = () => (
  <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
    <div className="animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-neutral-200" />
          <div>
            <div className="mb-2 h-5 w-32 rounded bg-neutral-200" />
            <div className="mb-2 h-4 w-48 rounded bg-neutral-200" />
            <div className="flex gap-2">
              <div className="h-5 w-16 rounded-full bg-neutral-200" />
              <div className="h-5 w-12 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <div className="h-3 w-24 rounded bg-neutral-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 flex-1 rounded bg-neutral-200" />
        <div className="h-8 w-8 rounded bg-neutral-200" />
      </div>
    </div>
  </div>
);

export const MenuManagementPage = () => {
  const navigate = useNavigate();
  const { data: menuData, isLoading, error } = useMerchantMenu();
  const deleteMenuItemMutation = useDeleteMenuItem();
  const { openModal } = useModal();
  const [activeTab, setActiveTab] = useState('all');

  const menuItems = menuData?.menuItems || [];

  // Group menu items by category
  const menuItemsByCategory = useMemo(() => {
    if (!menuItems) return {};
    
    const grouped = menuItems.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    return grouped;
  }, [menuItems]);

  const categories = useMemo(() => {
    return Object.keys(menuItemsByCategory).sort();
  }, [menuItemsByCategory]);

  const filteredMenuItems = useMemo(() => {
    if (activeTab === 'all') return menuItems;
    return menuItemsByCategory[activeTab] || [];
  }, [activeTab, menuItems, menuItemsByCategory]);

  const handleEdit = (item: MenuItem) => {
    navigate(`/merchant/menu/${item.id}/edit`);
  };

  const handleView = (item: MenuItem) => {
    navigate(`/merchant/menu/${item.id}`);
  };

  const handleDelete = (item: MenuItem) => {
    openModal({
      title: 'Delete Menu Item',
      content: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => deleteMenuItemMutation.mutate(item.id),
      variant: 'destructive'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <div className="mb-4 h-8 w-64 animate-pulse rounded bg-neutral-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <MenuItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Error Loading Menu
          </h3>
          <p className="text-red-600">
            {error.message || 'Failed to load your menu items. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900">Menu Management</h1>
          <p className="mt-2 text-neutral-600">
            Manage your menu items and pricing
          </p>
        </div>
        <Link to={PATHS.MERCHANT_MENU_CREATE}>
          <Button size="lg" className="rounded-lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Menu Item
          </Button>
        </Link>
      </div>

      {menuItems.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-neutral-200 bg-white py-16 text-center">
          <Utensils className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-xl font-semibold text-neutral-800">
            No menu items yet
          </h3>
          <p className="mb-6 text-neutral-600">
            Add your first menu item to start building your menu.
          </p>
          <Link to={PATHS.MERCHANT_MENU_CREATE}>
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Your First Item
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm text-neutral-500">Total Items</h4>
                  <p className="mt-2 text-2xl font-extrabold text-neutral-900">
                    {menuItems.length}
                  </p>
                </div>
                <Utensils className="h-8 w-8 text-brand-primary-600" />
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm text-neutral-500">Categories</h4>
                  <p className="mt-2 text-2xl font-extrabold text-neutral-900">
                    {categories.length}
                  </p>
                </div>
                <Hash className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm text-neutral-500">Average Price</h4>
                  <p className="mt-2 text-2xl font-extrabold text-neutral-900">
                    ${(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Custom Tabs for Categories - matching kickback page style */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 rounded-full bg-neutral-100 p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200',
                  activeTab === 'all'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-200/50',
                )}
              >
                All Items ({menuItems.length})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={cn(
                    'rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200',
                    activeTab === category
                      ? 'bg-black text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-200/50',
                  )}
                >
                  {category} ({menuItemsByCategory[category]?.length || 0})
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'all' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </div>
            )}

            {categories.map((category) => (
              activeTab === category && (
                <div key={category} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {menuItemsByCategory[category]?.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  ))}
                </div>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MenuManagementPage;
