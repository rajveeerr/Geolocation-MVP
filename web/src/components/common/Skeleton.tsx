import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Pre-built skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
    <div className="space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/4" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className 
}) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStatsCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-8 w-20" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="h-48 flex items-end justify-between gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="w-full" style={{ height: `${Math.random() * 100 + 20}%` }} />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className 
}) => (
  <div className={cn('bg-white rounded-lg border border-neutral-200 p-6', className)}>
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
