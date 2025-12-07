import { useState } from 'react';
import { useDealCreation, type SelectedMenuItem } from '@/context/DealCreationContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { X, DollarSign, Percent, Tag, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MenuItemDiscountEditorProps {
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

export const MenuItemDiscountEditor = ({
  item,
  globalDiscountPercentage,
  globalDiscountAmount,
  onClose
}: MenuItemDiscountEditorProps) => {
  const { state, dispatch } = useDealCreation();
  
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
    let discountData: {
      customPrice?: number | null;
      customDiscount?: number | null;
      discountAmount?: number | null;
      useGlobalDiscount?: boolean;
    } = {};

    if (discountType === 'customPrice') {
      const price = parseFloat(customPrice);
      if (isNaN(price) || price < 0) {
        return; // Invalid input
      }
      discountData = {
        customPrice: price,
        customDiscount: null,
        discountAmount: null,
        useGlobalDiscount: false
      };
    } else if (discountType === 'percentage') {
      const percent = parseFloat(customDiscount);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        return; // Invalid input
      }
      discountData = {
        customPrice: null,
        customDiscount: percent,
        discountAmount: null,
        useGlobalDiscount: false
      };
    } else if (discountType === 'fixedAmount') {
      const amount = parseFloat(discountAmount);
      if (isNaN(amount) || amount < 0) {
        return; // Invalid input
      }
      discountData = {
        customPrice: null,
        customDiscount: null,
        discountAmount: amount,
        useGlobalDiscount: false
      };
    } else {
      // Global discount
      discountData = {
        customPrice: null,
        customDiscount: null,
        discountAmount: null,
        useGlobalDiscount: true
      };
    }

    dispatch({
      type: 'UPDATE_ITEM_DISCOUNT',
      payload: { itemId: item.id, discount: discountData }
    });
    onClose();
  };

  const handleReset = () => {
    dispatch({
      type: 'RESET_ITEM_DISCOUNT',
      payload: { itemId: item.id }
    });
    setDiscountType('global');
    setCustomPrice('');
    setCustomDiscount('');
    setDiscountAmount('');
  };

  const hasCustomPricing = discountType !== 'global';

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
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{item.name}</h3>
            <p className="text-sm text-neutral-600">Original Price: ${item.price.toFixed(2)}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Discount Type Selection */}
        <div className="mb-6 space-y-3">
          <Label className="text-sm font-medium text-neutral-700">Discount Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setDiscountType('global')}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-all',
                discountType === 'global'
                  ? 'border-brand-primary-500 bg-brand-primary-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              <div className="font-medium text-neutral-900">Global Discount</div>
              <div className="text-xs text-neutral-600">
                {globalDiscountPercentage !== null
                  ? `${globalDiscountPercentage}% off`
                  : globalDiscountAmount !== null
                  ? `$${globalDiscountAmount.toFixed(2)} off`
                  : 'No global discount'}
              </div>
            </button>

            <button
              onClick={() => setDiscountType('customPrice')}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-all',
                discountType === 'customPrice'
                  ? 'border-brand-primary-500 bg-brand-primary-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-neutral-600" />
                <div className="font-medium text-neutral-900">Fixed Price</div>
              </div>
              <div className="text-xs text-neutral-600">Set exact price</div>
            </button>

            <button
              onClick={() => setDiscountType('percentage')}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-all',
                discountType === 'percentage'
                  ? 'border-brand-primary-500 bg-brand-primary-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-neutral-600" />
                <div className="font-medium text-neutral-900">Percentage</div>
              </div>
              <div className="text-xs text-neutral-600">% off this item</div>
            </button>

            <button
              onClick={() => setDiscountType('fixedAmount')}
              className={cn(
                'rounded-lg border-2 p-3 text-left transition-all',
                discountType === 'fixedAmount'
                  ? 'border-brand-primary-500 bg-brand-primary-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              )}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-neutral-600" />
                <div className="font-medium text-neutral-900">Fixed Amount</div>
              </div>
              <div className="text-xs text-neutral-600">$ off this item</div>
            </button>
          </div>
        </div>

        {/* Discount Input Fields */}
        <AnimatePresence mode="wait">
          {discountType === 'customPrice' && (
            <motion.div
              key="customPrice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2"
            >
              <Label htmlFor="customPrice">Fixed Price ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="customPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </motion.div>
          )}

          {discountType === 'percentage' && (
            <motion.div
              key="percentage"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2"
            >
              <Label htmlFor="customDiscount">Discount Percentage (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="customDiscount"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </motion.div>
          )}

          {discountType === 'fixedAmount' && (
            <motion.div
              key="fixedAmount"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2"
            >
              <Label htmlFor="discountAmount">Discount Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="discountAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Price Preview */}
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="mb-2 text-sm font-medium text-neutral-700">Price Preview</div>
          <div className="flex items-baseline justify-between">
            <div>
              {priceCalculation.discountPercent > 0 && (
                <div className="text-sm text-neutral-400 line-through mb-1">
                  ${item.price.toFixed(2)}
                </div>
              )}
              <div className={cn(
                "text-2xl font-bold",
                priceCalculation.discountPercent > 0 ? "text-green-600" : "text-neutral-900"
              )}>
                ${priceCalculation.finalPrice.toFixed(2)}
              </div>
              {priceCalculation.discountPercent > 0 && (
                <div className="text-sm text-neutral-600 mt-1">
                  {priceCalculation.description}
                </div>
              )}
            </div>
            {priceCalculation.discountPercent > 0 && (
              <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                {priceCalculation.discountPercent.toFixed(1)}% OFF
              </div>
            )}
          </div>
          {discountType === 'global' && (
            <div className="mt-2 text-xs text-neutral-500">
              Using deal's global discount
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {hasCustomPricing && (
            <Button
              variant="secondary"
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Global
            </Button>
          )}
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={
              (discountType === 'customPrice' && (!customPrice || parseFloat(customPrice) < 0)) ||
              (discountType === 'percentage' && (!customDiscount || parseFloat(customDiscount) < 0 || parseFloat(customDiscount) > 100)) ||
              (discountType === 'fixedAmount' && (!discountAmount || parseFloat(discountAmount) < 0))
            }
          >
            Save Discount
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

