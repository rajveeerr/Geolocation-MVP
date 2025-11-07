import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { useAuth } from '@/context/useAuth';

export interface ReferredUser {
  id: number;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  points: number;
  joinedAt: string;
}

interface ReferralData {
  referralCode: string;
  referralCount: number;
  referredUsers?: ReferredUser[];
}

export const useReferrals = () => {
  const { user } = useAuth();

  return useQuery<ReferralData, Error>({
    queryKey: ['referrals', user?.id],
    // This new endpoint is provided by the backend
    queryFn: async () => {
      const res = await apiGet<ReferralData>('/users/referrals');
      if (!res.success || !res.data) {
        throw new Error(res.error || 'Failed to fetch referral data');
      }
      return res.data;
    },
    enabled: !!user, // Only run if the user is logged in
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  });
};
