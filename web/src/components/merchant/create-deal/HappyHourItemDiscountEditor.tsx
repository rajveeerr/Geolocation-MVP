// web/src/components/merchant/create-deal/HappyHourItemDiscountEditor.tsx
import { useState } from 'react';
import { useHappyHour, type SelectedMenuItem } from '@/context/HappyHourContext';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { AmountSlider } from '@/components/ui/AmountSlider';
import { X, Percent, Tag, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HappyHourItemDiscountEditorProps {
  item: SelectedMenuItem;
  globalDiscountPercentage: number | null;
  globalDiscountAmount: number | null;
  onClose: () => void;
}

type DiscountType = 'global' | 'customPrice' | 'percentage' | 'fixedAmount';

/**
 * Calculate final price based on discount type and values
 */
const calculateFinalPrice = (
  originalPrice: number,
  discountType: DiscountType,
  globalDiscountPercentage: number | null,
  globalDiscountAmount: number | null,
  customPrice?: number | null,
  customDiscount?: number | null,
  discountAmount?: number | null
): { finalPrice: number; discountPercent: number; description: string } => {
  let finalPrice = originalPrice;
  let discountPercent = 0;
  let description = '';

  if (discountType === 'customPrice' && customPrice !== null && customPrice !== undefined) {
    finalPrice = customPrice;
    discountPercent = ((originalPrice - finalPrice) / originalPrice) * 100;
    description = `Fixed price: $${finalPrice.toFixed(2)}`;
  } else if (discountType === 'percentage' && customDiscount !== null && customDiscount !== undefined) {
    finalPrice = originalPrice * (1 - customDiscount / 100);
    discountPercent = customDiscount;
    description = `${customDiscount}% off`;
  } else if (discountType === 'fixedAmount' && discountAmount !== null && discountAmount !== undefined) {
    finalPrice = Math.max(0, originalPrice - discountAmount);
    discountPercent = (discountAmount / originalPrice) * 100;
    description = `$${discountAmount.toFixed(2)} off`;
  } else if (discountType === 'global') {
    if (globalDiscountPercentage !== null && globalDiscountPercentage !== undefined) {
      finalPrice = originalPrice * (1 - globalDiscountPercentage / 100);
      discountPercent = globalDiscountPercentage;
      description = `${globalDiscountPercentage}% off (global)`;
    } else if (globalDiscountAmount !== null && globalDiscountAmount !== undefined) {
      finalPrice = Math.max(0, originalPrice - globalDiscountAmount);
      discountPercent = (globalDiscountAmount / originalPrice) * 100;
      description = `$${globalDiscountAmount.toFixed(2)} off (global)`;
    } else {
      description = 'No discount';
    }
  }

  return {
    finalPrice: Math.max(0, finalPrice),
    discountPercent: Math.min(100, Math.max(0, discountPercent)),
    description
  };
};

export const HappyHourItemDiscountEditor = ({
  item,
  globalDiscountPercentage,
  globalDiscountAmount,
  onClose
}: HappyHourItemDiscountEditorProps) => {
  const { dispatch } = useHappyHour();

  // Determine current discount type
  const getCurrentDiscountType = (): DiscountType => {
    if (item.customDiscount !== null && item.customDiscount !== undefined) return 'customPrice';
    if (item.customPrice !== null && item.customPrice !== undefined) return 'customPrice';
    if (item.discountAmount !== null && item.discountAmount !== undefined) return 'customPrice';
    return 'global';
  };

  const [discountType, setDiscountType] = useState<DiscountType>(getCurrentDiscountType());
  const [customDiscount, setCustomDiscount] = useState<number>(
    item.customDiscount !== null && item.customDiscount !== undefined
      ? item.customDiscount
      : globalDiscountPercentage ?? 20,
  );

  const priceCalculation = calculateFinalPrice(
    item.price,
    discountType === 'customPrice' ? 'percentage' : discountType,
    globalDiscountPercentage,
    globalDiscountAmount,
    null,
    discountType === 'customPrice' ? customDiscount : null,
    null,
  );

  const handleSave = () => {
    const discountData: {
      customPrice: number | null;
      customDiscount: number | null;
      discountAmount: number | null;
      useGlobalDiscount: boolean;
    } = {
      customPrice: null,
      customDiscount: null,
      discountAmount: null,
      useGlobalDiscount: discountType === 'global',
    };

    if (discountType === 'customPrice') {
      discountData.customDiscount = customDiscount;
    }

    dispatch({
      type: 'UPDATE_ITEM_DISCOUNT',
      payload: {
        itemId: item.id,
        discount: discountData,
      },
    });

    onClose();
  };

  const handleReset = () => {
    dispatch({
      type: 'RESET_ITEM_DISCOUNT',
      payload: { itemId: item.id },
    });
    setDiscountType('global');
    setCustomDiscount(globalDiscountPercentage ?? 20);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Edit Discount: {item.name}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Discount Type Selection */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Discount Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'global' as DiscountType, label: 'Use Global', icon: Tag },
                { type: 'customPrice' as DiscountType, label: 'Percentage Off', icon: Percent },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setDiscountType(type)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                    discountType === type
                      ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                      : 'border-border bg-card text-muted-foreground hover:border-brand-primary-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Percentage Off Slider */}
          {discountType === 'customPrice' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-baseline justify-between">
                <Label htmlFor="custom-discount">Percentage off</Label>
                <span className="text-[12px] font-semibold text-emerald-600">
                  {customDiscount}% off · save ${(item.price - priceCalculation.finalPrice).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 rounded-xl border border-border bg-card p-3">
                <AmountSlider
                  value={customDiscount}
                  onChange={setCustomDiscount}
                  min={5}
                  max={90}
                  step={5}
                  suffix="%"
                  showEditButton={false}
                />
              </div>
            </motion.div>
          )}

          {/* Price Preview */}
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Original Price</p>
                <p className="text-lg font-semibold text-foreground">${item.price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Final Price</p>
                <p className={cn(
                  "text-lg font-semibold",
                  priceCalculation.finalPrice < item.price ? "text-green-600" : "text-foreground"
                )}>
                  ${priceCalculation.finalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            {priceCalculation.discountPercent > 0 && (
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-sm text-green-600 font-medium">
                  {priceCalculation.description} • Save ${(item.price - priceCalculation.finalPrice).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

