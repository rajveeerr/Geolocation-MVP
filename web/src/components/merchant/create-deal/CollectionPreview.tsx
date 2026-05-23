import { useMenuCollection } from '@/hooks/useMenuCollections';
import { 
  Package, 
  Loader2, 
  DollarSign,
  Tag,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatServesLabel, getCollectionCoverImage } from '@/lib/menuCollectionPackages';

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

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-brand-primary-600" />
          <span className="text-sm text-muted-foreground">Loading collection items...</span>
        </div>
      </div>
    );
  }

  if (error || !collectionData?.collection) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">Error Loading Collection</h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {error?.message || 'Failed to load collection items. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const collection = collectionData.collection;
  const items = collection.items || [];
  const servesLabel = formatServesLabel(collection.servesCount);
  const coverImage = getCollectionCoverImage(collection);

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
      className="rounded-lg border border-border bg-card"
    >
      {/* Header */}
      <div className="border-b border-border bg-muted px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-lg bg-brand-primary-100">
              {coverImage ? (
                <img src={coverImage} alt={collection.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-5 w-5 text-brand-primary-600" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{collection.name}</h4>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{totalItems} item{totalItems !== 1 ? 's' : ''} will be added to this deal</span>
                {servesLabel ? <span>&bull; {servesLabel}</span> : null}
                {collection.packagePrice != null ? (
                  <span className="rounded-full bg-brand-primary-100 px-2 py-0.5 font-semibold text-brand-primary-700">
                    Package ${Number(collection.packagePrice).toFixed(2)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="max-h-96 overflow-y-auto">
        {activeItems.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No active items in this collection</p>
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
                  className="p-4 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {item.menuItem.imageUrl ? (
                            <img
                              src={item.menuItem.imageUrl}
                              alt={item.menuItem.name}
                              className="w-full h-full rounded-lg object-cover"
                            />
                          ) : (
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-foreground truncate">
                              {item.menuItem.name}
                            </h5>
                            {hasCustomPricing && (
                              <span className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                                <Tag className="h-3 w-3 inline mr-1" />
                                Custom
                              </span>
                            )}
                          </div>
                          {item.menuItem.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.menuItem.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                              {item.menuItem.category}
                            </span>
                            {item.notes && (
                              <span className="text-xs text-muted-foreground italic">
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
                          <span className="text-xs text-muted-foreground line-through">
                            ${item.menuItem.price.toFixed(2)}
                          </span>
                        )}
                        <div>
                          <div className={cn(
                            "font-semibold",
                            hasDiscount ? "text-green-600" : "text-foreground"
                          )}>
                            ${finalPrice.toFixed(2)}
                          </div>
                          {discountInfo && (
                            <div className="text-xs text-muted-foreground mt-0.5">
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
        <div className="border-t border-border bg-muted px-4 py-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs mb-1">Total Items</div>
              <div className="font-semibold text-foreground">{totalItems}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">Total Value</div>
              <div className="font-semibold text-green-600">
                ${totalFinalValue.toFixed(2)}
              </div>
            </div>
            {totalSavings > 0 && (
              <div>
                <div className="text-muted-foreground text-xs mb-1">Total Savings</div>
                <div className="font-semibold text-green-600">
                  ${totalSavings.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          {collection.packagePrice != null ? (
            <div className="mt-3 rounded-lg border border-brand-primary-200 bg-card px-3 py-2 text-sm">
              <span className="text-muted-foreground">Package price: </span>
              <span className="font-semibold text-brand-primary-700">
                ${Number(collection.packagePrice).toFixed(2)}
              </span>
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  );
};
