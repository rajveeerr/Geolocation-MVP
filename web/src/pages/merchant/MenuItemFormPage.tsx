import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/common/ImageUpload';
import { CategoryDropdown } from '@/components/common/CategoryDropdown';
import { PATHS } from '@/routing/paths';
import { useCreateMenuItem, useUpdateMenuItem, useMerchantMenu, type CreateMenuItemData, type UpdateMenuItemData, type MenuItemImage, type MenuDealType } from '@/hooks/useMerchantMenu';
import { useDealTypes } from '@/hooks/useDealTypes';
import { 
  ArrowLeft, 
  Utensils, 
  Loader2,
  AlertCircle,
  DollarSign,
  Clock,
  Sparkles,
  Info
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
  dealType: z.string().optional(),
  isHappyHour: z.boolean().optional(),
  happyHourPrice: z.number().min(0).optional().nullable(),
  isSurprise: z.boolean().optional(),
  surpriseRevealTime: z.string().optional().nullable(),
  validStartTime: z.string().optional().nullable(),
  validEndTime: z.string().optional().nullable(),
  validDays: z.string().optional().nullable(),
  // Remove imageUrl from schema since we're using the ImageUpload component
});

type MenuItemFormData = z.infer<typeof menuItemFormSchema>;

export const MenuItemFormPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEditing = !!itemId;
  
  const { data: menuData } = useMerchantMenu();
  const { data: dealTypesData } = useDealTypes();
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();

  const menuItems = menuData?.menuItems || [];
  const existingItem = isEditing ? menuItems.find(item => item.id === Number(itemId)) : null;
  const dealTypes = dealTypesData?.dealTypes || [];
  
  // State for managing uploaded images
  const [uploadedImages, setUploadedImages] = useState<MenuItemImage[]>([]);
  const [selectedDealType, setSelectedDealType] = useState<MenuDealType | ''>(existingItem?.dealType || 'STANDARD');
  const [isHappyHour, setIsHappyHour] = useState(existingItem?.isHappyHour || false);
  const [happyHourPrice, setHappyHourPrice] = useState<string>(existingItem?.happyHourPrice?.toString() || '');
  const [isSurprise, setIsSurprise] = useState(existingItem?.isSurprise || false);
  const [surpriseRevealTime, setSurpriseRevealTime] = useState(existingItem?.surpriseRevealTime || '');
  const [validStartTime, setValidStartTime] = useState(existingItem?.validStartTime || '');
  const [validEndTime, setValidEndTime] = useState(existingItem?.validEndTime || '');
  const [validDays, setValidDays] = useState(existingItem?.validDays || '');

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
      dealType: existingItem?.dealType || 'STANDARD',
      isHappyHour: existingItem?.isHappyHour || false,
      happyHourPrice: existingItem?.happyHourPrice || null,
      isSurprise: existingItem?.isSurprise || false,
      surpriseRevealTime: existingItem?.surpriseRevealTime || null,
      validStartTime: existingItem?.validStartTime || null,
      validEndTime: existingItem?.validEndTime || null,
      validDays: existingItem?.validDays || null,
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
      setValue('dealType', existingItem.dealType || 'STANDARD');
      setValue('isHappyHour', existingItem.isHappyHour || false);
      setValue('happyHourPrice', existingItem.happyHourPrice || null);
      setValue('isSurprise', existingItem.isSurprise || false);
      setValue('surpriseRevealTime', existingItem.surpriseRevealTime || null);
      setValue('validStartTime', existingItem.validStartTime || null);
      setValue('validEndTime', existingItem.validEndTime || null);
      setValue('validDays', existingItem.validDays || null);
      
      setSelectedDealType(existingItem.dealType || 'STANDARD');
      setIsHappyHour(existingItem.isHappyHour || false);
      setHappyHourPrice(existingItem.happyHourPrice?.toString() || '');
      setIsSurprise(existingItem.isSurprise || false);
      setSurpriseRevealTime(existingItem.surpriseRevealTime || '');
      setValidStartTime(existingItem.validStartTime || '');
      setValidEndTime(existingItem.validEndTime || '');
      setValidDays(existingItem.validDays || '');
      
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
      const itemData: CreateMenuItemData | UpdateMenuItemData = {
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description || undefined,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        // Keep imageUrl for backward compatibility if no images uploaded
        imageUrl: uploadedImages.length === 0 && existingItem?.imageUrl ? existingItem.imageUrl : undefined,
        dealType: selectedDealType as MenuDealType,
        isHappyHour: isHappyHour,
        happyHourPrice: happyHourPrice ? parseFloat(happyHourPrice) : null,
        isSurprise: isSurprise,
        surpriseRevealTime: surpriseRevealTime || null,
        validStartTime: validStartTime || null,
        validEndTime: validEndTime || null,
        validDays: validDays || null,
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

        {/* Deal Type Configuration */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-brand-primary-100 p-2">
              <Sparkles className="h-5 w-5 text-brand-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-neutral-800">Deal Type & Timing</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Configure when and how this item appears in deals
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Deal Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="dealType">Deal Type *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {dealTypes.map((dt) => (
                  <button
                    key={dt.value}
                    type="button"
                    onClick={() => {
                      setSelectedDealType(dt.value as MenuDealType);
                      setValue('dealType', dt.value);
                      // Auto-set isHappyHour for happy hour types
                      if (dt.value.includes('HAPPY_HOUR')) {
                        setIsHappyHour(true);
                        setValue('isHappyHour', true);
                      }
                    }}
                    className={cn(
                      'rounded-lg border-2 p-3 text-left transition-all',
                      selectedDealType === dt.value
                        ? 'border-brand-primary-500 bg-brand-primary-50'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                    )}
                    title={dt.description || dt.label}
                  >
                    <div className="font-medium text-sm text-neutral-900">{dt.label}</div>
                    {dt.description && (
                      <div className="text-xs text-neutral-600 mt-1 line-clamp-2">{dt.description}</div>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 flex items-start gap-1 mt-2">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Select the deal type that best fits this item. This helps organize items when creating deals.</span>
              </p>
            </div>

            {/* Happy Hour Settings */}
            {(selectedDealType.includes('HAPPY_HOUR') || isHappyHour) && (
              <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isHappyHour"
                    checked={isHappyHour}
                    onChange={(e) => {
                      setIsHappyHour(e.target.checked);
                      setValue('isHappyHour', e.target.checked);
                    }}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                  />
                  <Label htmlFor="isHappyHour" className="font-semibold text-amber-900">
                    Happy Hour Item
                  </Label>
                </div>
                {isHappyHour && (
                  <div className="space-y-2">
                    <Label htmlFor="happyHourPrice">Happy Hour Price (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                      <Input
                        id="happyHourPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 6.00"
                        value={happyHourPrice}
                        onChange={(e) => {
                          setHappyHourPrice(e.target.value);
                          setValue('happyHourPrice', e.target.value ? parseFloat(e.target.value) : null);
                        }}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-amber-700">
                      Special price during happy hour. If not set, regular price will be used.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Surprise Deal Settings */}
            {(selectedDealType.includes('SURPRISE') || isSurprise) && (
              <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isSurprise"
                    checked={isSurprise}
                    onChange={(e) => {
                      setIsSurprise(e.target.checked);
                      setValue('isSurprise', e.target.checked);
                    }}
                    className="h-4 w-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                  />
                  <Label htmlFor="isSurprise" className="font-semibold text-purple-900">
                    Surprise Deal
                  </Label>
                </div>
                {isSurprise && (
                  <div className="space-y-2">
                    <Label htmlFor="surpriseRevealTime">Reveal Time (24-hour format)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                      <Input
                        id="surpriseRevealTime"
                        type="time"
                        value={surpriseRevealTime}
                        onChange={(e) => {
                          setSurpriseRevealTime(e.target.value);
                          setValue('surpriseRevealTime', e.target.value || null);
                        }}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-purple-700">
                      When customers can see this surprise deal (e.g., 17:00 for 5 PM)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Time Restrictions */}
            {(selectedDealType !== 'STANDARD' || validStartTime || validEndTime) && (
              <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Restrictions (Optional)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validStartTime">Start Time</Label>
                    <Input
                      id="validStartTime"
                      type="time"
                      value={validStartTime}
                      onChange={(e) => {
                        setValidStartTime(e.target.value);
                        setValue('validStartTime', e.target.value || null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validEndTime">End Time</Label>
                    <Input
                      id="validEndTime"
                      type="time"
                      value={validEndTime}
                      onChange={(e) => {
                        setValidEndTime(e.target.value);
                        setValue('validEndTime', e.target.value || null);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validDays">Valid Days (Optional)</Label>
                  <Input
                    id="validDays"
                    placeholder="e.g., Monday,Wednesday,Friday"
                    value={validDays}
                    onChange={(e) => {
                      setValidDays(e.target.value);
                      setValue('validDays', e.target.value || null);
                    }}
                  />
                  <p className="text-xs text-neutral-500">
                    Comma-separated days when this item is available (e.g., "Monday,Wednesday,Friday")
                  </p>
                </div>
              </div>
            )}
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
