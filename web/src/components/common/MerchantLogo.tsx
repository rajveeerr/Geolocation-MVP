import React, { useState, useCallback } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl, isCloudinaryUrl } from '@/lib/cloudinary';

interface MerchantLogoProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
};

export const MerchantLogo: React.FC<MerchantLogoProps> = ({
  src,
  name,
  size = 'md',
  className,
  showFallback = true,
}) => {
  const [errored, setErrored] = useState(false);
  const onError = useCallback(() => setErrored(true), []);

  const sizeClass = sizeClasses[size];
  const fallbackText = name?.charAt(0)?.toUpperCase() || 'M';

  // Get optimized image URL for logos
  const optimizedSrc = src && isCloudinaryUrl(src) 
    ? getOptimizedImageUrl(src, 'logo')
    : src || undefined;

  if (!src || errored) {
    if (!showFallback) return null;
    
    return (
      <Avatar className={cn(
        "rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200",
        sizeClass,
        className
      )}>
        <AvatarFallback className="text-neutral-600 font-semibold">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={cn(
      "rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200",
      sizeClass,
      className
    )}>
      <AvatarImage 
        src={optimizedSrc} 
        alt={name ? `${name} logo` : 'Merchant logo'} 
        onError={onError}
        className="object-cover"
      />
      <AvatarFallback className="text-neutral-600 font-semibold">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
};

// Alternative component for when you want to show a building icon instead of text
export const MerchantLogoWithIcon: React.FC<MerchantLogoProps> = ({
  src,
  name,
  size = 'md',
  className,
  showFallback = true,
}) => {
  const [errored, setErrored] = useState(false);
  const onError = useCallback(() => setErrored(true), []);

  const sizeClass = sizeClasses[size];
  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  }[size];

  // Get optimized image URL for logos
  const optimizedSrc = src && isCloudinaryUrl(src) 
    ? getOptimizedImageUrl(src, 'logo')
    : src || undefined;

  if (!src || errored) {
    if (!showFallback) return null;
    
    return (
      <Avatar className={cn(
        "rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200",
        sizeClass,
        className
      )}>
        <AvatarFallback className="text-neutral-600">
          <Building className={iconSize} />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={cn(
      "rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200",
      sizeClass,
      className
    )}>
      <AvatarImage 
        src={optimizedSrc} 
        alt={name ? `${name} logo` : 'Merchant logo'} 
        onError={onError}
        className="object-cover"
      />
      <AvatarFallback className="text-neutral-600">
        <Building className={iconSize} />
      </AvatarFallback>
    </Avatar>
  );
};
