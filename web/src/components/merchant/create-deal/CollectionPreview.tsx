import { useMenuCollection } from '@/hooks/useMenuCollections';
import { useDealCreation } from '@/context/DealCreationContext';
import { 
  Package, 
  Loader2, 
  DollarSign,
  Eye,
  EyeOff,
  Tag,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CollectionPreviewProps {
  collectionId: number;
  globalDiscountPercentage: number | null;
  globalDiscountAmount: number | null;
}

export const CollectionPreview = ({
  collectionId,
  globalDiscountPercentage,
  globalDiscountAmount
}: CollectionPreviewProps) => {
  const { data: collectionData, isLoading, error } = useMenuCollection(collectionId);
  const { state } = useDealCreation();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary-600" />
          <span className="text-sm text-neutral-600">Loading collection items...</span>
        </div>
      </div>
    );
  }

  if (error || !collectionData?.collection) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 mb-1">Error Loading Collection</h4>
            <p className="text-sm text-red-700">
              {error?.message || 'Failed to load collection items. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const collection = collectionData.collection;
  const items = collection.items || [];

  // Calculate final price for each item
  const calculateItemPrice = (item: typeof items[0]) => {
    const basePrice = item.menuItem.price;
    
    // Priority: customPrice > customDiscount > discountAmount > global discount
    if (item.customPrice !== null && item.customPrice !== undefined) {
      return {
        finalPrice: item.customPrice,
        discountInfo: `Fixed: $${item.customPrice.toFixed(2)}`,
        hasCustomPricing: true
      };
    }
    
    if (item.customDiscount !== null && item.customDiscount !== undefined) {
      const finalPrice = basePrice * (1 - item.customDiscount / 100);
      return {
        finalPrice,
        discountInfo: `${item.customDiscount}% off`,
        hasCustomPricing: true
      };
    }
    
    if (globalDiscountPercentage !== null) {
      const finalPrice = basePrice * (1 - globalDiscountPercentage / 100);
      return {
        finalPrice,
        discountInfo: `${globalDiscountPercentage}% off (global)`,
        hasCustomPricing: false
      };
    }
    
    if (globalDiscountAmount !== null) {
      const finalPrice = Math.max(0, basePrice - globalDiscountAmount);
      return {
        finalPrice,
        discountInfo: `$${globalDiscountAmount.toFixed(2)} off (global)`,
        hasCustomPricing: false
      };
    }
    
    return {
      finalPrice: basePrice,
      discountInfo: null,
      hasCustomPricing: false
    };
  };

  const activeItems = items.filter(item => item.isActive);
  const totalItems = activeItems.length;
  const totalOriginalValue = activeItems.reduce((sum, item) => sum + item.menuItem.price, 0);
  const totalFinalValue = activeItems.reduce((sum, item) => {
    const { finalPrice } = calculateItemPrice(item);
    return sum + finalPrice;
  }, 0);
  const totalSavings = totalOriginalValue - totalFinalValue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-neutral-200 bg-white"
    >
      {/* Header */}
      <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-primary-100 p-2">
              <Package className="h-5 w-5 text-brand-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-neutral-900">{collection.name}</h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                {totalItems} item{totalItems !== 1 ? 's' : ''} will be added to this deal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-96 overflow-y-auto">
        {activeItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-neutral-400 mb-3" />
            <p className="text-sm text-neutral-600">No active items in this collection</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {activeItems.map((item, index) => {
              const { finalPrice, discountInfo, hasCustomPricing } = calculateItemPrice(item);
              const hasDiscount = finalPrice < item.menuItem.price;

              return (
                <motion.div
                  key={item.menuItemId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                          {item.menuItem.imageUrl ? (
                            <img
                              src={item.menuItem.imageUrl}
                              alt={item.menuItem.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <DollarSign className="h-5 w-5 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-neutral-900 truncate">
                              {item.menuItem.name}
                            </h5>
                            {hasCustomPricing && (
                              <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                <Tag className="h-3 w-3 inline mr-1" />
                                Custom
                              </span>
                            )}
                          </div>
                          {item.menuItem.description && (
                            <p className="text-xs text-neutral-600 mt-1 line-clamp-2">
                              {item.menuItem.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                              {item.menuItem.category}
                            </span>
                            {item.notes && (
                              <span className="text-xs text-neutral-500 italic">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {hasDiscount && (
                          <span className="text-xs text-neutral-400 line-through">
                            ${item.menuItem.price.toFixed(2)}
                          </span>
                        )}
                        <div>
                          <div className={cn(
                            "font-semibold",
                            hasDiscount ? "text-green-600" : "text-neutral-900"
                          )}>
                            ${finalPrice.toFixed(2)}
                          </div>
                          {discountInfo && (
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {discountInfo}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {activeItems.length > 0 && (
        <div className="border-t border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-neutral-600 text-xs mb-1">Total Items</div>
              <div className="font-semibold text-neutral-900">{totalItems}</div>
            </div>
            <div>
              <div className="text-neutral-600 text-xs mb-1">Total Value</div>
              <div className="font-semibold text-green-600">
                ${totalFinalValue.toFixed(2)}
              </div>
            </div>
            {totalSavings > 0 && (
              <div>
                <div className="text-neutral-600 text-xs mb-1">Total Savings</div>
                <div className="font-semibold text-green-600">
                  ${totalSavings.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

