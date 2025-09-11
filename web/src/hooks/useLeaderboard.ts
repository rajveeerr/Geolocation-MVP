import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

interface LeaderboardRowData {
  rank: number;
  userId: number;
  name: string | null;
  periodPoints: number;
}

interface LeaderboardResponse {
  top: LeaderboardRowData[];
  me?: LeaderboardRowData & { inTop: boolean };
}

export const useLeaderboard = () => {
  return useQuery<LeaderboardResponse | null, Error>({
    queryKey: ['leaderboard'],
    queryFn: () => apiGet<LeaderboardResponse>('/leaderboard?period=month&includeSelf=true').then(res => res.data),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
