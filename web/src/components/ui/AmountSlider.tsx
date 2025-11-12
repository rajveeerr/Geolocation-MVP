// web/src/components/ui/AmountSlider.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit2, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AmountSliderProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  showEditButton?: boolean;
  className?: string;
  disabled?: boolean;
}

export const AmountSlider: React.FC<AmountSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 1,
  label,
  prefix = '$',
  suffix = '',
  showEditButton = true,
  className,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const currentValue = value ?? min;

  // Calculate percentage for slider position
  const percentage = ((currentValue - min) / (max - min)) * 100;

  // Handle slider click/drag
  const handleSliderInteraction = (clientX: number) => {
    if (disabled || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (x / width) * 100));
    const newValue = min + (percentage / 100) * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    onChange(clampedValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleSliderInteraction(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;
    handleSliderInteraction(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleSliderInteraction(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || disabled) return;
    handleSliderInteraction(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  // Handle direct input edit
  const handleEditClick = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(currentValue.toFixed(step < 1 ? 2 : 0));
  };

  const handleEditSubmit = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      const steppedValue = Math.round(numValue / step) * step;
      onChange(Math.max(min, Math.min(max, steppedValue)));
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-600">{label}</span>
        </div>
      )}

      {/* Value Display */}
      <div className="flex items-center justify-center gap-2">
        {isEditing ? (
          <div className="flex items-center gap-1">
            {prefix && (
              <span className="text-3xl font-bold text-neutral-700">{prefix}</span>
            )}
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={handleEditKeyDown}
              min={min}
              max={max}
              step={step}
              className="w-32 text-center text-4xl font-bold text-brand-primary-600 bg-transparent border-b-2 border-brand-primary-500 focus:outline-none focus:border-brand-primary-600"
              autoFocus
            />
            {suffix && (
              <span className="text-2xl font-semibold text-neutral-500">{suffix}</span>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              {prefix && (
                <span className="text-3xl font-bold text-neutral-700">{prefix}</span>
              )}
              <motion.div
                key={currentValue}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold bg-gradient-to-br from-brand-primary-500 to-brand-primary-600 bg-clip-text text-transparent"
              >
                {currentValue.toFixed(step < 1 ? 2 : 0)}
              </motion.div>
              {suffix && (
                <span className="text-2xl font-semibold text-neutral-500">{suffix}</span>
              )}
            </div>
            {showEditButton && !disabled && (
              <motion.button
                onClick={handleEditClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Edit amount"
              >
                <Edit2 className="h-4 w-4 text-neutral-400" />
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className="relative h-3 bg-neutral-200 rounded-full cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ touchAction: 'none' }}
      >
        {/* Filled Track */}
        <motion.div
          className="absolute h-full bg-gradient-to-r from-brand-primary-400 to-brand-primary-600 rounded-full"
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: isDragging ? 0 : 0.2 }}
        />

        {/* Slider Handle */}
        <motion.div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-brand-primary-500 cursor-grab active:cursor-grabbing flex items-center justify-center',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ left: `calc(${percentage}% - 12px)` }}
          initial={false}
          animate={{ left: `calc(${percentage}% - 12px)` }}
          transition={{ duration: isDragging ? 0 : 0.2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-3 h-3 bg-brand-primary-500 rounded-full" />
        </motion.div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>
          {prefix}
          {min.toFixed(step < 1 ? 2 : 0)}
          {suffix}
        </span>
        <span>
          {prefix}
          {max.toFixed(step < 1 ? 2 : 0)}
          {suffix}
        </span>
      </div>
    </div>
  );
};

