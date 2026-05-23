import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/services/api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type OperatingCostCategory =
  | 'RENT'
  | 'LABOR'
  | 'UTILITIES'
  | 'INSURANCE'
  | 'MARKETING'
  | 'SUPPLIES'
  | 'EQUIPMENT'
  | 'SOFTWARE'
  | 'TAXES'
  | 'MAINTENANCE'
  | 'MISC';

export type OperatingCostFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'YEARLY'
  | 'ONE_TIME';

export interface OperatingCost {
  id: number;
  name: string;
  category: OperatingCostCategory;
  frequency: OperatingCostFrequency;
  amount: number;
  notes: string | null;
  isActive: boolean;
  startDate: string;
  endDate: string | null;
  monthlyAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  hourlyRate: number;
  hoursPerWeek: number;
  isActive: boolean;
  notes: string | null;
  monthlyCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface OperatingCostsSummary {
  totalMonthlyOverhead: number;
  dailyBreakEven: number;
  yearlyOverhead: number;
  staffMonthlyTotal: number;
  staffCount: number;
  nonStaffMonthlyTotal: number;
  costCount: number;
  categoryBreakdown: {
    category: OperatingCostCategory;
    monthlyTotal: number;
    percentOfTotal: number;
    itemCount: number;
  }[];
}

export interface OperatingCostsAnalysis {
  healthScore: number;
  healthLabel: string;
  summary: string;
  categoryInsights: { category: string; status: string; insight: string }[];
  savingsOpportunities: {
    title: string;
    estimatedMonthlySavings: number;
    effort: string;
    description: string;
  }[];
  actionItems: string[];
  tips: string[];
}

export interface CreateCostPayload {
  name: string;
  category: OperatingCostCategory;
  frequency: OperatingCostFrequency;
  amount: number;
  notes?: string | null;
}

export interface UpdateCostPayload {
  name?: string;
  category?: OperatingCostCategory;
  frequency?: OperatingCostFrequency;
  amount?: number;
  notes?: string | null;
  isActive?: boolean;
}

export interface CreateStaffPayload {
  name: string;
  role: string;
  hourlyRate: number;
  hoursPerWeek: number;
  notes?: string | null;
}

export interface UpdateStaffPayload {
  name?: string;
  role?: string;
  hourlyRate?: number;
  hoursPerWeek?: number;
  notes?: string | null;
  isActive?: boolean;
}

// ─────────────────────────────────────────────
// Hooks — Operating Costs
// ─────────────────────────────────────────────

const COSTS_KEY = ['operating-costs'] as const;
const STAFF_KEY = ['operating-costs', 'staff'] as const;
const SUMMARY_KEY = ['operating-costs', 'summary'] as const;

export const useOperatingCosts = () => {
  return useQuery({
    queryKey: COSTS_KEY,
    queryFn: async () => {
      const res = await apiGet<{ costs: OperatingCost[] }>('/merchant/operating-costs');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load operating costs');
      }
      return res.data.costs;
    },
    staleTime: 30_000,
  });
};

export const useOperatingCostsSummary = () => {
  return useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: async () => {
      const res = await apiGet<{ summary: OperatingCostsSummary }>(
        '/merchant/operating-costs/summary',
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load summary');
      }
      return res.data.summary;
    },
    staleTime: 30_000,
  });
};

export const useCreateOperatingCost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCostPayload) => {
      const res = await apiPost<{ cost: OperatingCost }, CreateCostPayload>(
        '/merchant/operating-costs',
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to create operating cost');
      }
      return res.data.cost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COSTS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useUpdateOperatingCost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateCostPayload }) => {
      const res = await apiPatch<{ cost: OperatingCost }, UpdateCostPayload>(
        `/merchant/operating-costs/${id}`,
        data,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update operating cost');
      }
      return res.data.cost;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COSTS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useDeleteOperatingCost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiDelete<{ ok: boolean }>(`/merchant/operating-costs/${id}`);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete operating cost');
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COSTS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// ─────────────────────────────────────────────
// Hooks — Staff Roster
// ─────────────────────────────────────────────

export const useStaffRoster = () => {
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: async () => {
      const res = await apiGet<{ staff: StaffMember[] }>('/merchant/operating-costs/staff');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to load staff roster');
      }
      return res.data.staff;
    },
    staleTime: 30_000,
  });
};

export const useCreateStaffMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStaffPayload) => {
      const res = await apiPost<{ staff: StaffMember }, CreateStaffPayload>(
        '/merchant/operating-costs/staff',
        payload,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to add staff member');
      }
      return res.data.staff;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STAFF_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useUpdateStaffMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateStaffPayload }) => {
      const res = await apiPatch<{ staff: StaffMember }, UpdateStaffPayload>(
        `/merchant/operating-costs/staff/${id}`,
        data,
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to update staff member');
      }
      return res.data.staff;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STAFF_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useDeleteStaffMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiDelete<{ ok: boolean }>(`/merchant/operating-costs/staff/${id}`);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete staff member');
      }
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: STAFF_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// ─────────────────────────────────────────────
// AI Cost Analysis
// ─────────────────────────────────────────────

export const useAiOperatingCostsAnalysis = () => {
  return useMutation({
    mutationKey: ['ai-operating-costs-analyze'],
    mutationFn: async () => {
      const res = await apiGet<{ analysis: OperatingCostsAnalysis }>(
        '/ai/operating-costs/analyze',
      );
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to analyze operating costs');
      }
      return res.data.analysis;
    },
  });
};
