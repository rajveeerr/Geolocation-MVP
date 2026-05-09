import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { MerchantReferralProgram, ReferralProgramPayload } from '@/types/referral';

export interface ReferralLeaderboardEntry {
  userId: number;
  name: string | null;
  avatarUrl: string | null;
  attributions: number;
}

export interface ReferralAttributionRow {
  id: number;
  programId: number;
  merchantId: number;
  referrerUserId: number;
  referredUserId: number;
  triggerType: string;
  triggerId: number | null;
  dealId: number | null;
  createdAt: string;
  referrer: { id: number; name: string | null; avatarUrl: string | null };
  referred: { id: number; name: string | null };
  program: { id: number; name: string };
}

export interface ReferralLeaderboardResponse {
  total: number;
  topReferrers: ReferralLeaderboardEntry[];
  recent: ReferralAttributionRow[];
}

const KEYS = {
  list: (includeInactive: boolean) => ['merchant', 'referral-programs', { includeInactive }] as const,
  detail: (id: number) => ['merchant', 'referral-programs', 'detail', id] as const,
};

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['merchant', 'referral-programs'] });
};

export const useReferralPrograms = (opts: { includeInactive?: boolean } = {}) => {
  const includeInactive = opts.includeInactive ?? true;
  return useQuery({
    queryKey: KEYS.list(includeInactive),
    queryFn: async () => {
      const qs = includeInactive ? '?includeInactive=true' : '';
      const res = await apiGet<{ programs: MerchantReferralProgram[]; total: number }>(
        `/merchants/me/referral-programs${qs}`,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load referral programs');
      return res.data;
    },
    staleTime: 30_000,
  });
};

export const useReferralProgram = (id: number | null) => {
  return useQuery({
    queryKey: KEYS.detail(id ?? 0),
    queryFn: async () => {
      const res = await apiGet<{ program: MerchantReferralProgram }>(`/merchants/me/referral-programs/${id}`);
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load program');
      return res.data.program;
    },
    enabled: id !== null,
    staleTime: 30_000,
  });
};

export const useCreateReferralProgram = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: ReferralProgramPayload) => {
      const res = await apiPost<{ program: MerchantReferralProgram }, ReferralProgramPayload>(
        '/merchants/me/referral-programs',
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to create program');
      return res.data.program;
    },
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: 'Referral program created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not create program', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateReferralProgram = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<ReferralProgramPayload> }) => {
      const res = await apiPut<{ program: MerchantReferralProgram }, Partial<ReferralProgramPayload>>(
        `/merchants/me/referral-programs/${id}`,
        payload,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to update program');
      return res.data.program;
    },
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: 'Referral program updated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not update', description: error.message, variant: 'destructive' });
    },
  });
};

export const useReferralLeaderboard = (programId: number | null = null) => {
  return useQuery({
    queryKey: ['merchant', 'referral-programs', 'leaderboard', programId] as const,
    queryFn: async () => {
      const qs = programId !== null ? `?programId=${programId}` : '';
      const res = await apiGet<ReferralLeaderboardResponse>(
        `/merchants/me/referral-programs/leaderboard${qs}`,
      );
      if (!res.success || !res.data) throw new Error(res.error ?? 'Failed to load leaderboard');
      return res.data;
    },
    staleTime: 30_000,
  });
};

export const useDeleteReferralProgram = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, hard = false }: { id: number; hard?: boolean }) => {
      const qs = hard ? '?hard=true' : '';
      const res = await apiDelete<{ message: string }>(`/merchants/me/referral-programs/${id}${qs}`);
      if (!res.success) throw new Error(res.error ?? 'Failed to delete');
      return res.data;
    },
    onSuccess: () => {
      invalidateAll(qc);
      toast({ title: 'Referral program archived' });
    },
    onError: (error: Error) => {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
    },
  });
};
