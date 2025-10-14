import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/common/ImageUpload';
import { CategoryDropdown } from '@/components/common/CategoryDropdown';
import { PATHS } from '@/routing/paths';
import { useCreateMenuItem, useUpdateMenuItem, useMerchantMenu, type CreateMenuItemData, type UpdateMenuItemData, type MenuItemImage } from '@/hooks/useMerchantMenu';
import { 
  ArrowLeft, 
  Utensils, 
  Loader2,
  AlertCircle,
  DollarSign,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const menuItemFormSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Name is too long'),
  price: z.number().min(0.01, 'Price must be greater than 0').max(999.99, 'Price is too high'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().max(500, 'Description is too long').optional(),
  // Remove imageUrl from schema since we're using the ImageUpload component
});

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

export const MenuItemFormPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEditing = !!itemId;
  
  const { data: menuData } = useMerchantMenu();
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();

  const menuItems = menuData?.menuItems || [];
  const existingItem = isEditing ? menuItems.find(item => item.id === Number(itemId)) : null;
  
  // State for managing uploaded images
  const [uploadedImages, setUploadedImages] = useState<MenuItemImage[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemFormSchema),
    defaultValues: {
      name: existingItem?.name || '',
      price: existingItem?.price || 0,
      category: existingItem?.category || '',
      description: existingItem?.description || '',
    }
  });

  const watchedValues = watch();

  // Update form when existing item data loads
  useEffect(() => {
    if (isEditing && existingItem) {
      setValue('name', existingItem.name);
      setValue('price', existingItem.price);
      setValue('category', existingItem.category);
      setValue('description', existingItem.description || '');
      
      // Set existing images if available
      if (existingItem.images && existingItem.images.length > 0) {
        setUploadedImages(existingItem.images);
      } else if (existingItem.imageUrl) {
        // Convert single imageUrl to images array for backward compatibility
        setUploadedImages([{
          id: 'legacy-image',
          url: existingItem.imageUrl,
          publicId: 'legacy-image',
          name: 'Legacy Image'
        }]);
      }
    }
  }, [existingItem, isEditing, setValue]);

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      const itemData = {
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        // Keep imageUrl for backward compatibility if no images uploaded
        imageUrl: uploadedImages.length === 0 && existingItem?.imageUrl ? existingItem.imageUrl : undefined,
      };

      if (isEditing && itemId) {
        await updateMenuItemMutation.mutateAsync({
          itemId: Number(itemId),
          data: itemData as UpdateMenuItemData
        });
      } else {
        await createMenuItemMutation.mutateAsync(itemData as CreateMenuItemData);
      }
      
      navigate(PATHS.MERCHANT_MENU);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  if (isEditing && !existingItem) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-red-800">
            Menu Item Not Found
          </h3>
          <p className="text-red-600">
            The menu item you're trying to edit doesn't exist or you don't have permission to edit it.
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
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(PATHS.MERCHANT_MENU)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <h1 className="text-4xl font-bold text-neutral-900">
          {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h1>
        <p className="mt-2 text-neutral-600">
          {isEditing 
            ? 'Update your menu item information'
            : 'Add a new item to your menu'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-brand-primary-100 p-2">
              <Utensils className="h-5 w-5 text-brand-primary-600" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-800">Item Information</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Margherita Pizza"
                {...register('name')}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                    className={cn('pl-10', errors.price && 'border-red-500')}
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <CategoryDropdown
                  value={watchedValues.category}
                  onChange={(value) => setValue('category', value)}
                  placeholder="Select a category"
                  required
                  error={errors.category?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe your menu item..."
                rows={3}
                {...register('description')}
                className={cn(
                  'flex min-h-[80px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  errors.description && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {errors.description && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Images (Optional)</Label>
              <ImageUpload
                images={uploadedImages}
                onImagesChange={setUploadedImages}
                maxImages={5}
                maxSizeInMB={5}
                context="menu_item"
                className="mt-2"
              />
              <p className="text-xs text-neutral-500">
                Upload up to 5 images to showcase your menu item. Supported formats: JPG, PNG, WebP.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || createMenuItemMutation.isPending || updateMenuItemMutation.isPending}
            className="flex-1"
          >
            {(isSubmitting || createMenuItemMutation.isPending || updateMenuItemMutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditing ? 'Update Menu Item' : 'Create Menu Item'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(PATHS.MERCHANT_MENU)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemFormPage;
