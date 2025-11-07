// web/src/components/merchant/create-deal/HappyHourItemDiscountEditor.tsx
import { useState } from 'react';
import { useHappyHour, type SelectedMenuItem } from '@/context/HappyHourContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { X, DollarSign, Percent, Tag, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { state, dispatch } = useHappyHour();
  
  // Determine current discount type
  const getCurrentDiscountType = (): DiscountType => {
    if (item.customPrice !== null && item.customPrice !== undefined) return 'customPrice';
    if (item.customDiscount !== null && item.customDiscount !== undefined) return 'percentage';
    if (item.discountAmount !== null && item.discountAmount !== undefined) return 'fixedAmount';
    return 'global';
  };

  const [discountType, setDiscountType] = useState<DiscountType>(getCurrentDiscountType());
  const [customPrice, setCustomPrice] = useState<string>(
    item.customPrice !== null && item.customPrice !== undefined ? item.customPrice.toFixed(2) : ''
  );
  const [customDiscount, setCustomDiscount] = useState<string>(
    item.customDiscount !== null && item.customDiscount !== undefined ? item.customDiscount.toString() : ''
  );
  const [discountAmount, setDiscountAmount] = useState<string>(
    item.discountAmount !== null && item.discountAmount !== undefined ? item.discountAmount.toFixed(2) : ''
  );

  const priceCalculation = calculateFinalPrice(
    item.price,
    discountType,
    globalDiscountPercentage,
    globalDiscountAmount,
    discountType === 'customPrice' ? parseFloat(customPrice) : null,
    discountType === 'percentage' ? parseFloat(customDiscount) : null,
    discountType === 'fixedAmount' ? parseFloat(discountAmount) : null
  );

  const handleSave = () => {
    const discountData: any = {
      customPrice: null,
      customDiscount: null,
      discountAmount: null,
      useGlobalDiscount: discountType === 'global',
    };

    if (discountType === 'customPrice') {
      discountData.customPrice = customPrice ? parseFloat(customPrice) : null;
    } else if (discountType === 'percentage') {
      discountData.customDiscount = customDiscount ? parseFloat(customDiscount) : null;
    } else if (discountType === 'fixedAmount') {
      discountData.discountAmount = discountAmount ? parseFloat(discountAmount) : null;
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
    setCustomPrice('');
    setCustomDiscount('');
    setDiscountAmount('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Edit Discount: {item.name}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-neutral-100 transition-colors"
          >
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Discount Type Selection */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">Discount Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'global' as DiscountType, label: 'Use Global', icon: Tag },
                { type: 'customPrice' as DiscountType, label: 'Fixed Price', icon: DollarSign },
                { type: 'percentage' as DiscountType, label: 'Percentage', icon: Percent },
                { type: 'fixedAmount' as DiscountType, label: 'Amount Off', icon: DollarSign },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setDiscountType(type)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                    discountType === type
                      ? 'border-brand-primary-500 bg-brand-primary-50 text-brand-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-brand-primary-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Price Input */}
          {discountType === 'customPrice' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label htmlFor="custom-price">Fixed Price</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                <Input
                  id="custom-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </motion.div>
          )}

          {/* Custom Discount Percentage */}
          {discountType === 'percentage' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label htmlFor="custom-discount">Discount Percentage</Label>
              <div className="relative mt-1">
                <Input
                  id="custom-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  placeholder="0"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">%</span>
              </div>
            </motion.div>
          )}

          {/* Discount Amount */}
          {discountType === 'fixedAmount' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label htmlFor="discount-amount">Discount Amount</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">$</span>
                <Input
                  id="discount-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </motion.div>
          )}

          {/* Price Preview */}
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Original Price</p>
                <p className="text-lg font-semibold text-neutral-900">${item.price.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Final Price</p>
                <p className={cn(
                  "text-lg font-semibold",
                  priceCalculation.finalPrice < item.price ? "text-green-600" : "text-neutral-900"
                )}>
                  ${priceCalculation.finalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            {priceCalculation.discountPercent > 0 && (
              <div className="mt-2 pt-2 border-t border-neutral-200">
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

