import React from 'react';
import { Edit2, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MenuCollection } from '@/hooks/useMenuCollections';

interface MenuListCardProps {
  collection: MenuCollection;
  onEdit: (collection: MenuCollection) => void;
  onDelete: (collection: MenuCollection) => void;
  className?: string;
}

/** Convert "HH:MM" → "H PM/AM" for display */
function formatTime(time: string): string {
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return m > 0 ? `${h}:${mStr} ${suffix}` : `${h} ${suffix}`;
}

export const MenuListCard: React.FC<MenuListCardProps> = ({
  collection,
  onEdit,
  onDelete,
  className,
}) => {
  const itemCount = collection._count?.items ?? collection.items?.length ?? 0;

  return (
    <div
      className={cn(
        'group relative rounded-2xl px-5 py-4',
        'bg-white border border-neutral-200',
        'hover:border-neutral-300 hover:shadow-sm transition-all duration-150',
        className
      )}
    >
      {/* Row 1: Icon + Title + Status + Actions */}
      <div className="flex items-center gap-3">
        {/* Colour icon */}
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            collection.menuType === 'HAPPY_HOUR' ? 'bg-amber-100' : 'bg-brand/10'
          )}
        >
          {collection.icon ? (
            <span className="text-base">{collection.icon}</span>
          ) : collection.menuType === 'HAPPY_HOUR' ? (
            <Clock className="h-5 w-5 text-amber-600" />
          ) : (
            <span className="text-sm font-bold text-brand">
              {collection.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-neutral-900 truncate">{collection.name}</p>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shrink-0 shadow-sm transition-all',
                collection.isActive
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-100 text-neutral-500'
              )}
            >
              {collection.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Edit / Delete buttons — always visible */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(collection)}
            className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(collection)}
            className="p-2 rounded-lg text-brand hover:text-brand-hover hover:bg-brand-subtle transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Row 2: Description + Time (if applicable) */}
      {(collection.description || (collection.menuType === 'HAPPY_HOUR' && collection.startTime && collection.endTime)) && (
        <div className="mt-1.5 ml-[52px]">
          {collection.description && (
            <p className="text-sm text-neutral-500 line-clamp-1">{collection.description}</p>
          )}
          {collection.menuType === 'HAPPY_HOUR' && collection.startTime && collection.endTime && (
            <p className="text-sm text-neutral-400 mt-0.5">
              {formatTime(collection.startTime)} - {formatTime(collection.endTime)}
            </p>
          )}
        </div>
      )}

      {/* Row 3: Item count + chips */}
      {itemCount > 0 && (
        <div className="mt-4 ml-[52px] pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Menu Items ({itemCount})
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(collection.items ?? []).slice(0, 5).map((item, idx) => (
              <span
                key={item.menuItemId || idx}
                className={cn(
                  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
                  "bg-neutral-50 border border-neutral-100 text-neutral-600 shadow-xs"
                )}
              >
                {item.menuItem?.name || 'Unnamed'}
              </span>
            ))}
            {itemCount > 5 && (
              <span className="text-xs font-bold text-brand ml-1">
                +{itemCount - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
