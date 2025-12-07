// Simple Tooltip component using native HTML title attribute
// Can be enhanced later with Radix UI if needed

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content?: ReactNode;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  return (
    <div className={cn('relative group', className)}>
      {children}
      {content && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="bg-neutral-900 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-neutral-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TooltipTrigger({ asChild, children, ...props }: { asChild?: boolean; children: ReactNode; [key: string]: any }) {
  if (asChild) {
    return children;
  }
  return <div {...props}>{children}</div>;
}

export function TooltipContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

