import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';

export interface UserActivity {
  id: number;
  type: string;
  points: number;
  description: string;
  createdAt: string;
  dealId: number | null;
  merchantName: string | null;
}

export interface UserActivityResponse {
  activities: UserActivity[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const useUserActivity = (userId?: number, limit: number = 20, offset: number = 0) => {
  return useQuery<UserActivityResponse, Error>({
    queryKey: ['userActivity', userId, limit, offset],
    queryFn: () =>
      apiGet<UserActivityResponse>(
        `/users/activity?limit=${limit}&offset=${offset}`,
      ).then((res) => res.data),
    enabled: !!userId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
};

