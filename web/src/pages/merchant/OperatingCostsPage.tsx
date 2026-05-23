import React, { useMemo, useState } from 'react';
import {
  CircleDollarSign,
  Plus,
  Pencil,
  Trash2,
  Users,
  Sparkles,
  Wand2,
  Loader2,
  X,
  RefreshCcw,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { useAiStatus } from '@/hooks/useAi';
import {
  useOperatingCosts,
  useOperatingCostsSummary,
  useStaffRoster,
  useCreateOperatingCost,
  useUpdateOperatingCost,
  useDeleteOperatingCost,
  useCreateStaffMember,
  useUpdateStaffMember,
  useDeleteStaffMember,
  useAiOperatingCostsAnalysis,
  type OperatingCost,
  type OperatingCostCategory,
  type OperatingCostFrequency,
  type StaffMember,
  type OperatingCostsAnalysis,
} from '@/hooks/useOperatingCosts';

// ─────────────────────────────────────────────
// Design tokens (match merchant dashboard vibe)
// ─────────────────────────────────────────────

const panelClass =
  'rounded-[1.4rem] border border-border/80 bg-card/92 dark:bg-card p-5 shadow-[0_8px_22px_rgba(15,23,42,0.045)] backdrop-blur';
const subPanelClass =
  'rounded-[1.2rem] border border-border/80 bg-card/90 dark:bg-card p-4 shadow-sm';
const labelClass =
  'text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground';

const CATEGORY_LABELS: Record<OperatingCostCategory, string> = {
  RENT: 'Rent',
  LABOR: 'Labor',
  UTILITIES: 'Utilities',
  INSURANCE: 'Insurance',
  MARKETING: 'Marketing',
  SUPPLIES: 'Supplies',
  EQUIPMENT: 'Equipment',
  SOFTWARE: 'Software',
  TAXES: 'Taxes',
  MAINTENANCE: 'Maintenance',
  MISC: 'Misc',
};

const FREQUENCY_LABELS: Record<OperatingCostFrequency, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
  ONE_TIME: 'One-time',
};

// Muted neutral-toned color dots (used for category indicators)
const CATEGORY_DOT: Record<OperatingCostCategory, string> = {
  RENT: 'bg-muted-foreground/40',
  LABOR: 'bg-emerald-400',
  UTILITIES: 'bg-amber-400',
  INSURANCE: 'bg-rose-400',
  MARKETING: 'bg-violet-400',
  SUPPLIES: 'bg-sky-400',
  EQUIPMENT: 'bg-indigo-400',
  SOFTWARE: 'bg-cyan-400',
  TAXES: 'bg-orange-400',
  MAINTENANCE: 'bg-fuchsia-400',
  MISC: 'bg-muted',
};

const formatCurrency = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });

type CostFormState = {
  name: string;
  category: OperatingCostCategory;
  frequency: OperatingCostFrequency;
  amount: string;
  notes: string;
};

const DEFAULT_COST_FORM: CostFormState = {
  name: '',
  category: 'MISC',
  frequency: 'MONTHLY',
  amount: '',
  notes: '',
};

type StaffFormState = {
  name: string;
  role: string;
  hourlyRate: string;
  hoursPerWeek: string;
  notes: string;
};

const DEFAULT_STAFF_FORM: StaffFormState = {
  name: '',
  role: '',
  hourlyRate: '',
  hoursPerWeek: '',
  notes: '',
};

const OperatingCostsPage: React.FC = () => {
  const costsQuery = useOperatingCosts();
  const summaryQuery = useOperatingCostsSummary();
  const staffQuery = useStaffRoster();
  const createCost = useCreateOperatingCost();
  const updateCost = useUpdateOperatingCost();
  const deleteCost = useDeleteOperatingCost();
  const createStaff = useCreateStaffMember();
  const updateStaff = useUpdateStaffMember();
  const deleteStaff = useDeleteStaffMember();
  const { data: aiStatus } = useAiStatus();
  const aiAnalysis = useAiOperatingCostsAnalysis();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | OperatingCostCategory>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<'all' | OperatingCostFrequency>('all');

  const [costFormOpen, setCostFormOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<OperatingCost | null>(null);
  const [costForm, setCostForm] = useState<CostFormState>(DEFAULT_COST_FORM);

  const [staffOpen, setStaffOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [staffForm, setStaffForm] = useState<StaffFormState>(DEFAULT_STAFF_FORM);
  const [showStaffForm, setShowStaffForm] = useState(false);

  const [breakEvenOpen, setBreakEvenOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<OperatingCostsAnalysis | null>(null);

  const aiEnabled = aiStatus?.aiEnabled ?? false;
  const costs = costsQuery.data ?? [];
  const summary = summaryQuery.data;
  const staff = staffQuery.data ?? [];

  const filteredCosts = useMemo(() => {
    return costs.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
      if (frequencyFilter !== 'all' && c.frequency !== frequencyFilter) return false;
      return true;
    });
  }, [costs, search, categoryFilter, frequencyFilter]);

  const distributionSegments = useMemo(() => {
    if (!summary) return [];
    return summary.categoryBreakdown.map((c) => ({
      category: c.category as OperatingCostCategory,
      pct: c.percentOfTotal,
      total: c.monthlyTotal,
    }));
  }, [summary]);

  const openCreateCost = () => {
    setEditingCost(null);
    setCostForm(DEFAULT_COST_FORM);
    setCostFormOpen(true);
  };
  const openEditCost = (c: OperatingCost) => {
    setEditingCost(c);
    setCostForm({
      name: c.name,
      category: c.category,
      frequency: c.frequency,
      amount: String(c.amount),
      notes: c.notes ?? '',
    });
    setCostFormOpen(true);
  };

  const handleSaveCost = async () => {
    const amount = Number(costForm.amount);
    if (!costForm.name.trim() || !Number.isFinite(amount) || amount < 0) return;
    const payload = {
      name: costForm.name.trim(),
      category: costForm.category,
      frequency: costForm.frequency,
      amount,
      notes: costForm.notes.trim() || null,
    };
    if (editingCost) {
      await updateCost.mutateAsync({ id: editingCost.id, data: payload });
    } else {
      await createCost.mutateAsync(payload);
    }
    setCostFormOpen(false);
    setEditingCost(null);
    setCostForm(DEFAULT_COST_FORM);
  };

  const handleDeleteCost = async (id: number) => {
    if (!confirm('Delete this expense?')) return;
    await deleteCost.mutateAsync(id);
  };

  const openCreateStaff = () => {
    setEditingStaffId(null);
    setStaffForm(DEFAULT_STAFF_FORM);
    setShowStaffForm(true);
  };
  const openEditStaff = (s: StaffMember) => {
    setEditingStaffId(s.id);
    setStaffForm({
      name: s.name,
      role: s.role,
      hourlyRate: String(s.hourlyRate),
      hoursPerWeek: String(s.hoursPerWeek),
      notes: s.notes ?? '',
    });
    setShowStaffForm(true);
  };

  const handleSaveStaff = async () => {
    const hourlyRate = Number(staffForm.hourlyRate);
    const hoursPerWeek = Number(staffForm.hoursPerWeek);
    if (!staffForm.name.trim() || !staffForm.role.trim()) return;
    if (!Number.isFinite(hourlyRate) || hourlyRate < 0) return;
    if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 0) return;
    const payload = {
      name: staffForm.name.trim(),
      role: staffForm.role.trim(),
      hourlyRate,
      hoursPerWeek,
      notes: staffForm.notes.trim() || null,
    };
    if (editingStaffId) {
      await updateStaff.mutateAsync({ id: editingStaffId, data: payload });
    } else {
      await createStaff.mutateAsync(payload);
    }
    setShowStaffForm(false);
    setEditingStaffId(null);
    setStaffForm(DEFAULT_STAFF_FORM);
  };

  const handleDeleteStaff = async (id: number) => {
    if (!confirm('Remove this staff member?')) return;
    await deleteStaff.mutateAsync(id);
  };

  const totalMonthlyOverhead = summary?.totalMonthlyOverhead ?? 0;
  const dailyBreakEven = summary?.dailyBreakEven ?? 0;
  const yearlyOverhead = summary?.yearlyOverhead ?? 0;
  const staffMonthlyTotal = summary?.staffMonthlyTotal ?? 0;
  const staffCount = summary?.staffCount ?? 0;

  return (
    <div className="space-y-5">
      {/* ──────── Hero overview (soft white gradient — matches dashboard) ──────── */}


        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">


              <CircleDollarSign className="h-3 w-3" />
              Operating Costs
            </div>
            <h2 className="mt-3 text-[1.8rem] font-semibold tracking-tight text-foreground sm:text-[2rem]">
              True profitability, calculated from your real overhead.
            </h2>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground sm:text-sm">
              Track fixed monthly overhead and labor in one calm view. Every expense flows into a
              daily break-even number so margin decisions feel grounded.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={subPanelClass}>
              <div className={labelClass}>Total monthly overhead</div>
              <div className="mt-2 text-[1.4rem] font-semibold tracking-tight text-foreground">
                {summaryQuery.isLoading ? '…' : formatCurrency(totalMonthlyOverhead)}
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                {summary ? `${summary.costCount} expense${summary.costCount === 1 ? '' : 's'} · ${staffCount} staff` : '—'}
              </div>
            </div>
            <div className={subPanelClass}>
              <div className={labelClass}>Daily break-even</div>
              <div className="mt-2 text-[1.4rem] font-semibold tracking-tight text-foreground">
                {summaryQuery.isLoading ? '…' : formatCurrency(dailyBreakEven)}
              </div>
              <div className="mt-1 text-[13px] text-muted-foreground">
                Gross profit needed per day to clear "the nut".
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" className="rounded-xl text-sm" onClick={openCreateCost}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="rounded-xl border-border text-sm"
            onClick={() => setBreakEvenOpen(true)}
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            How break-even works
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="rounded-xl border-border text-sm"
            onClick={() => {
              costsQuery.refetch();
              summaryQuery.refetch();
              staffQuery.refetch();
            }}
            disabled={costsQuery.isFetching || summaryQuery.isFetching}
          >
            <RefreshCcw
              className={cn(
                'mr-2 h-4 w-4',
                (costsQuery.isFetching || summaryQuery.isFetching) && 'animate-spin',
              )}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* ──────── Distribution + Labor row ──────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Distribution */}
        <div className={cn(panelClass, 'lg:col-span-2')}>
          <div className="flex items-start justify-between">
            <div>
              <div className={labelClass}>Expense distribution</div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Monthly mix across categories (labor + fixed overhead).
              </p>
            </div>
            <div className="text-right">
              <div className={labelClass}>Yearly</div>
              <div className="mt-1 font-mono text-sm text-foreground">
                {formatCurrency(yearlyOverhead)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            {distributionSegments.length === 0 ? (
              <div className="h-full w-full bg-muted" />
            ) : (
              distributionSegments.map((seg) => (
                <div
                  key={seg.category}
                  title={`${CATEGORY_LABELS[seg.category]} — ${formatCurrency(seg.total)} (${seg.pct.toFixed(1)}%)`}
                  className={cn('h-full', CATEGORY_DOT[seg.category])}
                  style={{ width: `${Math.max(seg.pct, 1)}%` }}
                />
              ))
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {distributionSegments.length === 0 ? (
              <p className="col-span-full text-[13px] text-muted-foreground">
                No expenses yet — add your first to see the breakdown.
              </p>
            ) : (
              distributionSegments.map((seg) => (
                <div key={seg.category} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className={cn('h-1.5 w-1.5 rounded-full', CATEGORY_DOT[seg.category])} />
                    <span className="font-medium">{CATEGORY_LABELS[seg.category]}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">{seg.pct.toFixed(1)}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Labor / Staff */}
        <div className={panelClass}>
          <div className="flex items-start gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
              <Users className="h-3.5 w-3.5" />
            </span>
            <div>
              <div className={labelClass}>Labor control</div>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {staffCount > 0
                  ? `${staffCount} active staff · ${formatCurrency(staffMonthlyTotal)} / mo`
                  : 'No staff yet — add roles to factor payroll into overhead.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStaffOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground hover:bg-muted"
          >
            Manage staff roster
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ──────── AI Analyzer ──────── */}
      {aiEnabled && (
        <>
          {!analysisResult ? (
            <div className={cn(panelClass, 'bg-gradient-to-br from-card via-card to-muted dark:to-card dark:bg-none')}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <div className={labelClass}>AI cost analyzer</div>
                    <p className="mt-1 text-[14px] font-semibold text-foreground">
                      Get a health score and savings opportunities from your current overhead.
                    </p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      Specific, plain-English suggestions based on your real cost mix.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="shrink-0 rounded-xl border-border text-sm"
                  onClick={() => {
                    aiAnalysis.mutate(undefined, {
                      onSuccess: (data) => setAnalysisResult(data),
                    });
                  }}
                  disabled={aiAnalysis.isPending}
                >
                  {aiAnalysis.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Analyze Costs
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <AnalysisCard analysis={analysisResult} onDismiss={() => setAnalysisResult(null)} />
          )}
        </>
      )}

      {/* ──────── Expenses panel: filters + table ──────── */}
      <div className={panelClass}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className={labelClass}>Expense items</div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Manually entered fixed overheads. Edit any row to adjust amount or frequency.
            </p>
          </div>
          <Button size="sm" className="rounded-xl text-sm" onClick={openCreateCost}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search expenses by name…"
              className="w-full rounded-xl border border-border bg-card/80 dark:bg-card py-2 pl-9 pr-3 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="rounded-xl border border-border bg-card/80 dark:bg-card px-3 py-2 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="all">All categories</option>
              {(Object.keys(CATEGORY_LABELS) as OperatingCostCategory[]).map((k) => (
                <option key={k} value={k}>
                  {CATEGORY_LABELS[k]}
                </option>
              ))}
            </select>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value as any)}
              className="rounded-xl border border-border bg-card/80 dark:bg-card px-3 py-2 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="all">All frequencies</option>
              {(Object.keys(FREQUENCY_LABELS) as OperatingCostFrequency[]).map((k) => (
                <option key={k} value={k}>
                  {FREQUENCY_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.1rem] border border-border/80 bg-card/80 dark:bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/80 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Expense</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Frequency</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Monthly</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {costsQuery.isLoading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      Loading expenses…
                    </td>
                  </tr>
                )}
                {!costsQuery.isLoading && filteredCosts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      {costs.length === 0
                        ? 'No expenses yet — add your first to start tracking overhead.'
                        : 'No expenses match these filters.'}
                    </td>
                  </tr>
                )}
                {filteredCosts.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/70">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{c.name}</div>
                      {c.notes && (
                        <div className="mt-0.5 text-[12px] text-muted-foreground line-clamp-1">
                          {c.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                        <span className={cn('h-1.5 w-1.5 rounded-full', CATEGORY_DOT[c.category])} />
                        {CATEGORY_LABELS[c.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
                      {FREQUENCY_LABELS[c.frequency]}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                      {formatCurrency(c.monthlyAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEditCost(c)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => handleDeleteCost(c.id)}
                          disabled={deleteCost.isPending}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:bg-rose-950/30 hover:text-rose-600 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ──────── Add / Edit Expense modal ──────── */}
      {costFormOpen && (
        <Modal
          title={editingCost ? 'Edit expense' : 'Add new expense'}
          subtitle="Manually entered overhead — counted into your monthly total."
          onClose={() => setCostFormOpen(false)}
        >
          <div className="space-y-4 p-5">
            <div>
              <label className={labelClass}>Expense name</label>
              <input
                type="text"
                value={costForm.name}
                onChange={(e) => setCostForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Monthly Rent"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={costForm.category}
                  onChange={(e) =>
                    setCostForm((p) => ({ ...p, category: e.target.value as OperatingCostCategory }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  {(Object.keys(CATEGORY_LABELS) as OperatingCostCategory[]).map((k) => (
                    <option key={k} value={k}>
                      {CATEGORY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Frequency</label>
                <select
                  value={costForm.frequency}
                  onChange={(e) =>
                    setCostForm((p) => ({
                      ...p,
                      frequency: e.target.value as OperatingCostFrequency,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
                >
                  {(Object.keys(FREQUENCY_LABELS) as OperatingCostFrequency[]).map((k) => (
                    <option key={k} value={k}>
                      {FREQUENCY_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Amount</label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costForm.amount}
                  onChange={(e) => setCostForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0"
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-7 pr-3 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Notes (optional)</label>
              <textarea
                value={costForm.notes}
                onChange={(e) => setCostForm((p) => ({ ...p, notes: e.target.value }))}
                rows={2}
                placeholder="Anything you want to remember…"
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
              />
            </div>
            <Button
              size="md"
              className="w-full rounded-xl text-sm"
              onClick={handleSaveCost}
              disabled={
                createCost.isPending ||
                updateCost.isPending ||
                !costForm.name.trim() ||
                !costForm.amount
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {editingCost ? 'Update expense' : 'Save expense'}
            </Button>
          </div>
        </Modal>
      )}

      {/* ──────── Staff Roster modal ──────── */}
      {staffOpen && (
        <Modal
          title="Staff roster"
          subtitle="Manage employees to calculate real labor overhead."
          onClose={() => {
            setStaffOpen(false);
            setShowStaffForm(false);
          }}
        >
          <div className="space-y-3 p-5">
            {staffQuery.isLoading && (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading staff…</p>
            )}
            {!staffQuery.isLoading && staff.length === 0 && !showStaffForm && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No staff yet — add your first team member.
              </p>
            )}
            {!showStaffForm &&
              staff.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-[1.1rem] border border-border/80 bg-card/90 dark:bg-card px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      {s.role} · ${s.hourlyRate}/hr · {s.hoursPerWeek}h/wk
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => openEditStaff(s)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => handleDeleteStaff(s.id)}
                      disabled={deleteStaff.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:bg-rose-950/30 hover:text-rose-600 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

            {!showStaffForm && (
              <button
                type="button"
                onClick={openCreateStaff}
                className="flex w-full items-center justify-center gap-2 rounded-[1.1rem] border border-dashed border-border bg-card/50 dark:bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-border hover:bg-card"
              >
                <Users className="h-4 w-4" />
                Hire new staff member
              </button>
            )}

            {showStaffForm && (
              <div className="space-y-3 rounded-[1.1rem] border border-border/80 bg-card/90 dark:bg-card p-4 shadow-sm">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input
                    type="text"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm((p) => ({ ...p, role: e.target.value }))}
                    placeholder="e.g. Server, Bar Manager"
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>$ / hour</label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      value={staffForm.hourlyRate}
                      onChange={(e) => setStaffForm((p) => ({ ...p, hourlyRate: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Hours / week</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={staffForm.hoursPerWeek}
                      onChange={(e) =>
                        setStaffForm((p) => ({ ...p, hoursPerWeek: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm focus:border-border focus:outline-none focus:ring-2 focus:ring-neutral-200"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 rounded-xl border-border text-sm"
                    onClick={() => {
                      setShowStaffForm(false);
                      setEditingStaffId(null);
                      setStaffForm(DEFAULT_STAFF_FORM);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl text-sm"
                    onClick={handleSaveStaff}
                    disabled={createStaff.isPending || updateStaff.isPending}
                  >
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                    {editingStaffId ? 'Update' : 'Save'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ──────── Break-even modal ──────── */}
      {breakEvenOpen && (
        <Modal title="The daily nut" subtitle="Where the break-even number comes from." onClose={() => setBreakEvenOpen(false)}>
          <div className="space-y-4 p-5 text-sm text-foreground">
            <p>
              This is the base{' '}
              <span className="font-semibold text-foreground">
                gross profit you need to clear every day
              </span>{' '}
              just to cover non-product overhead.
            </p>
            <div className="rounded-[1.1rem] border border-border/80 bg-card/90 dark:bg-card p-4 shadow-sm">
              <div className={labelClass}>Monthly overhead ÷ 30</div>
              <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground">
                {formatCurrency(dailyBreakEven)}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">per day to break even</p>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Once daily gross profit clears that number, every additional dollar of margin is real
              profit.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

const Modal: React.FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">


        <div className="flex items-start justify-between border-b border-border px-5 pb-3 pt-5">
          <div>
            <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const AnalysisCard: React.FC<{
  analysis: OperatingCostsAnalysis;
  onDismiss: () => void;
}> = ({ analysis, onDismiss }) => {
  return (
    <div className={panelClass}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <div className={labelClass}>AI analysis</div>
            <p className="text-[14px] font-semibold text-foreground">Cost structure review</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Health score */}
      <div className="mb-5 flex items-start gap-4">
        <div
          className={cn(
            'flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.2rem] text-2xl font-semibold',
            analysis.healthScore >= 70
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
              : analysis.healthScore >= 40
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                : 'bg-red-50 dark:bg-red-950/30 text-red-600',
          )}
        >
          {analysis.healthScore}
        </div>
        <div>
          <p
            className={cn(
              'text-sm font-semibold',
              analysis.healthScore >= 70
                ? 'text-emerald-700 dark:text-emerald-300'
                : analysis.healthScore >= 40
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-red-700 dark:text-red-300',
            )}
          >
            {analysis.healthLabel}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{analysis.summary}</p>
        </div>
      </div>

      {/* Category insights */}
      {analysis.categoryInsights.length > 0 && (
        <div className="mb-5">
          <p className={cn(labelClass, 'mb-2')}>Category insights</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.categoryInsights.map((ci) => (
              <div
                key={ci.category}
                className="rounded-[1.1rem] border border-border/80 bg-card/80 dark:bg-card p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      ci.status === 'healthy'
                        ? 'bg-emerald-500'
                        : ci.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-red-500',
                    )}
                  />
                  <span className="text-[13px] font-semibold text-foreground">{ci.category}</span>
                </div>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{ci.insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings opportunities */}
      {analysis.savingsOpportunities.length > 0 && (
        <div className="mb-5">
          <p className={cn(labelClass, 'mb-2')}>Savings opportunities</p>
          <div className="space-y-2">
            {analysis.savingsOpportunities.map((s, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 rounded-[1.1rem] border border-border/80 bg-card/80 dark:bg-card px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]',
                      s.effort === 'low'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                        : s.effort === 'medium'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                          : 'bg-muted text-foreground',
                    )}
                  >
                    {s.effort}
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">{s.title}</p>
                    <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{s.description}</p>
                  </div>
                </div>
                {s.estimatedMonthlySavings > 0 && (


                    ~{formatCurrency(s.estimatedMonthlySavings)}/mo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action items */}
      {analysis.actionItems.length > 0 && (
        <div className="mb-4">
          <p className={cn(labelClass, 'mb-2')}>Action items</p>
          <ul className="space-y-1.5">
            {analysis.actionItems.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tips */}
      {analysis.tips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {analysis.tips.map((tip, i) => (
            <span
              key={i}
              className="rounded-full border border-border/80 bg-card/80 dark:bg-card px-3 py-1 text-[12px] font-medium text-muted-foreground"
            >
              {tip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default OperatingCostsPage;
