import React, { useEffect, useRef, useState } from 'react';
import {
  ExternalLink,
  Pencil,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Globe,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ingredient } from '@/hooks/useIngredients';

interface Props {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onAdjustStock: (ingredient: Ingredient, delta: number) => void;
  onUpdateCost: (ingredient: Ingredient, nextCost: number) => void;
  updatingId?: number | null;
}

function formatTrend(pct: number | null): { label: string; tone: string; Icon: typeof TrendingUp } {
  if (pct == null) return { label: 'n/a', tone: 'text-muted-foreground', Icon: Minus };
  const abs = Math.abs(pct);
  if (abs < 1.5) return { label: 'STABLE', tone: 'text-muted-foreground', Icon: Minus };
  if (pct > 0) {
    return {
      label: `↑ ${abs.toFixed(0)}%`,
      tone: pct >= 15 ? 'text-red-600' : pct >= 5 ? 'text-amber-600' : 'text-foreground',
      Icon: TrendingUp,
    };
  }
  return {
    label: `↓ ${abs.toFixed(0)}%`,
    tone: 'text-emerald-600',
    Icon: TrendingDown,
  };
}

function stockBarTone(daysLeft: number | null): string {
  if (daysLeft == null) return 'bg-muted-foreground/40';
  if (daysLeft <= 14) return 'bg-red-500';
  if (daysLeft <= 30) return 'bg-amber-500';
  return 'bg-emerald-500';
}

// ────────────────────────────────────────────────────
// CostCell — click to edit inline, blur or Enter to save
// ────────────────────────────────────────────────────

const CostCell: React.FC<{
  ingredient: Ingredient;
  onUpdateCost: (i: Ingredient, n: number) => void;
  saving: boolean;
}> = ({ ingredient, onUpdateCost, saving }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(ingredient.currentCost));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(String(ingredient.currentCost));
  }, [ingredient.currentCost, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    const next = Number(draft);
    setEditing(false);
    if (Number.isFinite(next) && next >= 0) {
      onUpdateCost(ingredient, next);
    } else {
      setDraft(String(ingredient.currentCost));
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground">$</span>
        <input
          ref={inputRef}
          type="number"
          step="0.01"
          min="0"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setDraft(String(ingredient.currentCost));
              setEditing(false);
            }
          }}
          className="w-20 rounded-md border border-brand bg-card px-2 py-1 text-sm font-bold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <span className="text-muted-foreground">/ {ingredient.unitType}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      disabled={saving}
      className="group inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-left transition hover:bg-brand/5"
      title="Click to edit cost"
    >
      <span
        className={cn(
          'font-bold',
          ingredient.trendPct != null && ingredient.trendPct >= 15 ? 'text-red-600' : 'text-foreground',
        )}
      >
        ${ingredient.currentCost.toFixed(2)}
      </span>
      <span className="text-muted-foreground">/ {ingredient.unitType}</span>
      {saving && <Loader2 className="ml-1 h-3 w-3 animate-spin text-muted-foreground" />}
      <Pencil className="ml-1 h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
    </button>
  );
};

// ────────────────────────────────────────────────────
// Main table
// ────────────────────────────────────────────────────

const IngredientTable: React.FC<Props> = ({
  ingredients,
  onEdit,
  onAdjustStock,
  onUpdateCost,
  updatingId,
}) => {
  if (ingredients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No ingredients match the current filters. Clear filters or click{' '}
          <span className="font-semibold">+ Add Item</span> to track a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_4px_14px_rgba(15,23,42,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">Ingredient</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Cost per unit</th>
              <th className="px-5 py-3">Trend</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {ingredients.map((ing) => {
              const trend = formatTrend(ing.trendPct);
              const saving = updatingId === ing.id;
              return (
                <tr key={ing.id} className="group hover:bg-muted/60">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-foreground">{ing.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      ID: <code className="font-mono">{ing.slug}</code>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      {ing.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <CostCell ingredient={ing} onUpdateCost={onUpdateCost} saving={saving} />
                  </td>
                  <td className="px-5 py-4">
                    <div className={cn('inline-flex items-center gap-1 text-sm font-semibold', trend.tone)}>
                      {trend.label}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">
                          LVL:{' '}
                          <span className="font-semibold text-foreground">
                            {Math.round(ing.stockLevel)}
                            {ing.unitType}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn('h-full transition-all', stockBarTone(ing.daysLeft))}
                            style={{
                              width: `${Math.max(5, Math.min(100, ing.daysLeft != null ? (ing.daysLeft / 60) * 100 : 50))}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
                        <span
                          className={cn('inline-block h-2 w-2 rounded-full', stockBarTone(ing.daysLeft))}
                        />
                        <span className="font-semibold text-foreground">
                          {ing.daysLeft != null ? `~${ing.daysLeft} days` : '—'}
                        </span>
                        <span className="text-muted-foreground">left</span>
                        {ing.usageSource === 'orders' && (
                          <span
                            className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200"
                            title="Computed from real order sales over the last 30 days"
                          >
                            auto
                          </span>
                        )}
                      </div>

                      {/* Inline stock adjust — visible on hover */}
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(ing, -1)}
                          disabled={saving || ing.stockLevel <= 0}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-red-50 dark:bg-red-950/30 hover:text-red-600 disabled:opacity-40"
                          title="Decrement stock by 1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdjustStock(ing, 1)}
                          disabled={saving}
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition hover:bg-emerald-50 dark:bg-emerald-950/30 hover:text-emerald-600 disabled:opacity-40"
                          title="Increment stock by 1"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAdjustStock(ing, 10)}
                          disabled={saving}
                          className="flex h-6 items-center justify-center rounded-md border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 transition hover:bg-emerald-100 dark:bg-emerald-950/40 disabled:opacity-40"
                          title="Increment stock by 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {ing.supplierUrl ? (
                        <a
                          href={ing.supplierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-brand/10 hover:text-brand"
                          title={ing.supplierName ? `Visit ${ing.supplierName}` : 'Visit supplier'}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="h-8 w-8" />
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(ing)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-brand/10 hover:text-brand"
                        title="Edit ingredient"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {ing.supplierUrl && (
                        <a
                          href={ing.supplierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-brand/10 hover:text-brand"
                          title="Open in new tab"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IngredientTable;
