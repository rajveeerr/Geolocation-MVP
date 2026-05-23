import React from 'react';
import { X, ShoppingCart, Globe, AlertTriangle, Loader2, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';
import type { MarketAlert } from '@/hooks/useIngredients';

interface Props {
  alert: MarketAlert | null;
  onClose: () => void;
  onAcknowledge: (id: number) => void;
  acknowledging?: boolean;
  onOpenIngredientByName?: (name: string) => void;
}

const WEIGHT_TONE: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-brand/10 text-brand ring-brand/30',
  medium: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 ring-amber-200',
  low: 'bg-accent text-muted-foreground ring-neutral-200',
};

const WEIGHT_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: 'Strong signal',
  medium: 'Supporting',
  low: 'Context',
};

const TYPE_TO_ICON = {
  SUPPLIER_FORECAST: ShoppingCart,
  COMMODITY_WATCH: Globe,
  PRICE_SPIKE: AlertTriangle,
};

const TYPE_TO_LABEL = {
  SUPPLIER_FORECAST: 'Market Intelligence',
  COMMODITY_WATCH: 'Market Intelligence',
  PRICE_SPIKE: 'Cost Alert',
};

const MarketAlertModal: React.FC<Props> = ({ alert, onClose, onAcknowledge, acknowledging, onOpenIngredientByName }) => {
  if (!alert) return null;

  const Icon = TYPE_TO_ICON[alert.type];
  const confidenceTone =
    alert.confidenceScore == null
      ? 'text-muted-foreground'
      : alert.confidenceScore >= 75
        ? 'text-emerald-600'
        : alert.confidenceScore >= 50
          ? 'text-amber-600'
          : 'text-red-600';
  const confidenceLabel =
    alert.confidenceScore == null
      ? 'n/a'
      : alert.confidenceScore >= 75
        ? 'High'
        : alert.confidenceScore >= 50
          ? 'Medium'
          : 'Low';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {TYPE_TO_LABEL[alert.type]}
            </div>
            <h2 className="mt-0.5 font-heading text-2xl font-bold leading-tight text-foreground">
              {alert.title}
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-accent/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest alert</div>
          <p className="mt-1 text-sm italic text-foreground/80">"{alert.body}"</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recommended Action
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {alert.recommendedAction || '—'}
            </div>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Confidence Score
            </div>
            <div className={cn('mt-1 text-sm font-semibold', confidenceTone)}>
              {alert.confidenceScore != null ? `${alert.confidenceScore}% ${confidenceLabel}` : 'n/a'}
            </div>
          </div>
        </div>

        {alert.reasoning && alert.reasoning.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand">
              <Lightbulb className="h-3.5 w-3.5" />
              How we figured this out
            </div>
            <ul className="mt-3 space-y-2.5">
              {alert.reasoning.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
                      WEIGHT_TONE[r.weight],
                    )}
                  >
                    {WEIGHT_LABEL[r.weight]}
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-foreground/80">{r.factor}</div>
                    <div className="text-sm leading-snug text-muted-foreground">{r.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {alert.affectedIngredients.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-accent/50 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-brand">
              Affected Ingredients
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {onOpenIngredientByName ? 'Click any chip to open and adjust it.' : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {alert.affectedIngredients.map((name) =>
                onOpenIngredientByName ? (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onOpenIngredientByName(name)}
                    className="group inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground/80 shadow-sm transition hover:border-brand/40 hover:bg-brand/5 hover:text-brand"
                  >
                    {name}
                    <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                  </button>
                ) : (
                  <span
                    key={name}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground/80 shadow-sm"
                  >
                    {name}
                  </span>
                ),
              )}
            </div>
          </div>
        )}

        <div className="mt-5">
          {alert.acknowledgedAt ? (
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center text-sm text-emerald-700 dark:text-emerald-300">
              Acknowledged on {new Date(alert.acknowledgedAt).toLocaleDateString()}
            </div>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              onClick={() => onAcknowledge(alert.id)}
              disabled={acknowledging}
            >
              {acknowledging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Awareness
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketAlertModal;
