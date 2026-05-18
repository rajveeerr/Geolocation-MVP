import React from 'react';
import { ShoppingCart, Globe, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketAlert, MarketAlertType } from '@/hooks/useIngredients';

interface Props {
  type: Exclude<MarketAlertType, 'PRICE_SPIKE'>;
  alert: MarketAlert | null;
  onClick: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

const TYPE_META: Record<Exclude<MarketAlertType, 'PRICE_SPIKE'>, {
  Icon: typeof ShoppingCart;
  label: string;
  /** outer card */
  cardClass: string;
  /** icon tile bg / fg */
  iconWrapClass: string;
  /** muted body text */
  mutedTextClass: string;
  /** decorative tag */
  tagClass: string;
}> = {
  SUPPLIER_FORECAST: {
    Icon: ShoppingCart,
    label: 'Supplier Watch',
    cardClass:
      'border border-[#f0ddd0] bg-[linear-gradient(135deg,#fff8f2_0%,#fff1e5_100%)] shadow-[0_8px_24px_rgba(82,58,40,0.06)]',
    iconWrapClass: 'bg-white/80 text-[#bf6545]',
    mutedTextClass: 'text-[#607084]',
    tagClass: 'text-[#bf6545]',
  },
  COMMODITY_WATCH: {
    Icon: Globe,
    label: 'Global Market Data',
    cardClass:
      'border border-[#d6e4f2] bg-[linear-gradient(135deg,#f5f9ff_0%,#eaf2fb_100%)] shadow-[0_8px_24px_rgba(40,58,82,0.06)]',
    iconWrapClass: 'bg-white/80 text-[#2f6cb5]',
    mutedTextClass: 'text-[#52708a]',
    tagClass: 'text-[#2f6cb5]',
  },
};

const MarketAlertBanner: React.FC<Props> = ({
  type,
  alert,
  onClick,
  onRefresh,
  refreshing,
  emptyTitle,
  emptyDescription,
}) => {
  const meta = TYPE_META[type];
  const Icon = meta.Icon;

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(82,58,40,0.10)]',
        meta.cardClass,
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-full', meta.iconWrapClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn('text-[11px] font-semibold uppercase tracking-widest', meta.tagClass)}>
            {meta.label}
          </div>
          {alert ? (
            <>
              <div className="mt-0.5 font-heading text-base font-bold leading-tight text-[#203247]">
                {alert.title}
              </div>
              <div className={cn('mt-1 line-clamp-2 text-sm leading-snug', meta.mutedTextClass)}>
                {alert.body}
              </div>
            </>
          ) : (
            <>
              <div className="mt-0.5 font-heading text-base font-bold leading-tight text-[#203247]">
                {emptyTitle}
              </div>
              <div className={cn('mt-1 text-sm leading-snug', meta.mutedTextClass)}>
                {emptyDescription}
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          disabled={refreshing}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/60 text-[#607084] transition hover:bg-white hover:text-[#203247]',
            refreshing && 'opacity-50',
          )}
          title="Refresh from AI"
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
        </button>
      </div>
      {alert && !alert.acknowledgedAt && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
          <AlertTriangle className={cn('h-3.5 w-3.5', meta.tagClass)} />
          <span className={meta.tagClass}>Unacknowledged — tap to review</span>
        </div>
      )}
    </div>
  );
};

export default MarketAlertBanner;
