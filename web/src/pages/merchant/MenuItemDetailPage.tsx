import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useMerchantMenu, type MenuItem } from '@/hooks/useMerchantMenu';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Utensils, 
  DollarSign,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useModal } from '@/context/ModalContext';
import { useDeleteMenuItem } from '@/hooks/useMerchantMenu';

const ImageGallery = ({ images }: { images: MenuItem['images'] }) => {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-video rounded-lg bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
          <p className="text-neutral-500">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-video rounded-lg overflow-hidden bg-neutral-100">
        <img
          src={images[0].url}
          alt={images[0].name}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(1).map((image, index) => (
            <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MenuItemDetailCard = ({ item, onEdit, onDelete }: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
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
        return 'Recently';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-brand-primary-100 p-3">
              <Utensils className="h-6 w-6 text-brand-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {item.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Added {formatDate(item.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {formatCurrency(item.price)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(item)}
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
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Category and Price */}
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
            {item.category}
          </span>
          <div className="flex items-center gap-1 text-2xl font-bold text-green-600">
            <DollarSign className="h-5 w-5" />
            {item.price.toFixed(2)}
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Description</h3>
            <p className="text-neutral-700 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Images */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Images</h3>
          <ImageGallery images={item.images} />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Item ID</h4>
              <p className="text-sm text-neutral-600">#{item.id}</p>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Category</h4>
              <p className="text-sm text-neutral-600">{item.category}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Created</h4>
              <p className="text-sm text-neutral-600">{formatDate(item.createdAt)}</p>
            </div>
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Last Updated</h4>
              <p className="text-sm text-neutral-600">{formatDate(item.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MenuItemDetailPage = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { data: menuData, isLoading, error } = useMerchantMenu();
  const deleteMenuItemMutation = useDeleteMenuItem();
  const { openModal } = useModal();

  const menuItems = menuData?.menuItems || [];
  const item = itemId ? menuItems.find(item => item.id === Number(itemId)) : null;

  const handleEdit = (item: MenuItem) => {
    navigate(`/merchant/menu/${item.id}/edit`);
  };

  const handleDelete = (item: MenuItem) => {
    openModal({
      title: 'Delete Menu Item',
      content: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        deleteMenuItemMutation.mutate(item.id, {
          onSuccess: () => {
            navigate(PATHS.MERCHANT_MENU);
          }
        });
      },
      variant: 'destructive'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-32 rounded bg-neutral-200" />
          <div className="h-96 rounded-xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Error Loading Menu Item
          </h3>
          <p className="text-red-600">
            {error.message || 'Failed to load menu item details. Please try again later.'}
          </p>
          <Button 
            className="mt-4" 
            onClick={() => navigate(PATHS.MERCHANT_MENU)}
          >
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
          <h3 className="mb-2 text-lg font-semibold text-neutral-800">
            Menu Item Not Found
          </h3>
          <p className="text-neutral-600">
            The menu item you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button 
            className="mt-4" 
            onClick={() => navigate(PATHS.MERCHANT_MENU)}
          >
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(PATHS.MERCHANT_MENU)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
      </div>

      {/* Menu Item Detail */}
      <MenuItemDetailCard
        item={item}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MenuItemDetailPage;
