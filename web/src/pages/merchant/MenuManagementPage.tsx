import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useMerchantMenu, useDeleteMenuItem, type MenuItem } from '@/hooks/useMerchantMenu';
import { BulkMenuUpload } from '@/components/merchant/BulkMenuUpload';
import { 
  Plus, 
  Utensils, 
  Edit, 
  Trash2, 
  AlertCircle,
  DollarSign,
  Hash,
  Image as ImageIcon,
  Grid3X3,
  List,
  Eye,
  Table,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
// Removed shadcn tabs import - using custom styling

// List View Component
const MenuItemListRow = ({ item, onEdit, onDelete, onView }: { 
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

  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-neutral-300">
      {/* Image */}
      <div className="flex-shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-16 w-16 rounded-lg object-cover border border-neutral-200"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200">
            <ImageIcon className="h-6 w-6 text-neutral-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 truncate">
              {item.name}
            </h3>
            <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
              {item.description}
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
              <span className="font-medium text-green-600">
                {formatCurrency(item.price)}
              </span>
              <span>•</span>
              <span className="px-2 py-1 bg-neutral-100 rounded-full text-xs font-medium">
                {item.category}
              </span>
              <span>•</span>
              <span>Updated {formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(item)}
          className="flex items-center gap-1 hover:bg-neutral-100"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(item)}
          className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDelete(item)}
          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
};

// Table View Component
const MenuItemTableRow = ({ item, onEdit, onDelete, onView }: { 
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

  return (
    <tr className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
      {/* Image */}
      <td className="px-4 py-3">
        <div className="flex items-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-12 w-12 rounded-lg object-cover border border-neutral-200"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200">
              <ImageIcon className="h-4 w-4 text-neutral-400" />
            </div>
          )}
        </div>
      </td>

      {/* Name & Description */}
      <td className="px-4 py-3">
        <div>
          <h3 className="font-semibold text-neutral-900">{item.name}</h3>
          <p className="text-sm text-neutral-600 line-clamp-1">{item.description}</p>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="px-2 py-1 bg-neutral-100 rounded-full text-xs font-medium">
          {item.category}
        </span>
      </td>

      {/* Price */}
      <td className="px-4 py-3">
        <span className="font-medium text-green-600">
          {formatCurrency(item.price)}
        </span>
      </td>

      {/* Updated Date */}
      <td className="px-4 py-3 text-sm text-neutral-500">
        {formatDate(item.updatedAt)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(item)}
            className="flex items-center gap-1 hover:bg-neutral-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(item)}
            className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDelete(item)}
            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const MenuItemCard = ({ item, onEdit, onDelete, onView }: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onView: (item: MenuItem) => void;
}) => {

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
          variant="secondary"
          size="sm"
          onClick={() => onDelete(item)}
          className="text-red-600 hover:text-red-700 hover:border-red-300"
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
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

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


  const handleEdit = (item: MenuItem) => {
    navigate(`/merchant/menu/${item.id}/edit`);
  };

  const handleView = (item: MenuItem) => {
    navigate(`/merchant/menu/${item.id}`);
  };

  const handleDelete = (item: MenuItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      deleteMenuItemMutation.mutate(item.id);
    }
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
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'grid'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                viewMode === 'list'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
          
        <div className="flex gap-3">
          <Link to={PATHS.MERCHANT_MENU_COLLECTIONS}>
            <Button size="lg" variant="secondary" className="rounded-lg">
              <Table className="mr-2 h-5 w-5" />
              Collections
            </Button>
          </Link>
          <Link to={PATHS.MERCHANT_MENU_CREATE}>
            <Button size="lg" className="rounded-lg">
              <Plus className="mr-2 h-5 w-5" />
              Add Menu Item
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-lg"
            onClick={() => setIsBulkUploadOpen(true)}
          >
            <Upload className="mr-2 h-5 w-5" />
            Bulk Upload
          </Button>
        </div>
        </div>
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
              <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                {menuItems.map((item) => 
                  viewMode === 'grid' ? (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  ) : (
                    <MenuItemListRow
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  )
                )}
              </div>
            )}

            {categories.map((category) => (
              activeTab === category && (
                <div key={category} className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                  {menuItemsByCategory[category]?.map((item) => 
                    viewMode === 'grid' ? (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
                    ) : (
                      <MenuItemListRow
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                      />
                    )
                  )}
                </div>
              )
            ))}
          </div>
        </>
      )}

      {/* Bulk Upload Dialog */}
      <BulkMenuUpload 
        isOpen={isBulkUploadOpen} 
        onClose={() => setIsBulkUploadOpen(false)} 
      />
    </div>
  );
};

export default MenuManagementPage;
