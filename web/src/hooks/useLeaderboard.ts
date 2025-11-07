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

// Legacy hook for backward compatibility
export const useLeaderboard = () => {
  return useQuery<LeaderboardResponse | null, Error>({
    queryKey: ['leaderboard', 'month'],
    queryFn: async () => {
      const response = await apiGet<LeaderboardResponse>(
        '/leaderboard?period=month&includeSelf=true&showMore=true',
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Re-export enhanced leaderboard hooks for easy access
export { 
  useGlobalLeaderboard,
  useCityLeaderboard,
  useCityComparisonLeaderboard,
  useCategoryLeaderboard,
  useLeaderboardAnalytics,
  useLeaderboardInsights
} from './useEnhancedLeaderboard';
