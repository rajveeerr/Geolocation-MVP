import { useQuery } from '@tanstack/react-query';
// import { apiGet } from '@/services/api'; // Will be used later

// --- Testing phase data - no sales yet ---
const MOCK_KICKBACK_DATA = {
  summary: {
    revenue: 0,
    totalKickbackHandout: 0,
  },
  details: [
    {
      user: { name: 'Anita', avatarUrl: 'https://github.com/shadcn.png' },
      earned: 0,
      invitedCount: 0,
      totalSpentByInvitees: 0,
      spendingDetail: [],
    },
    {
      user: { name: 'Benjamin', avatarUrl: 'https://github.com/vercel.png' },
      earned: 0,
      invitedCount: 0,
      totalSpentByInvitees: 0,
      spendingDetail: [],
    },
    {
      user: { name: 'Catherine', avatarUrl: 'https://github.com/react.png' },
      earned: 0,
      invitedCount: 0,
      totalSpentByInvitees: 0,
      spendingDetail: [],
    },
  ],
};

export const useKickbackEarnings = (period: string) => {
  return useQuery({
    // The query key includes the period so it refetches when the filter changes
    queryKey: ['kickbackEarnings', period],
    queryFn: async () => {
      // FOR NOW: Return mock data after a fake delay
      console.log(`Fetching kickback earnings for period: ${period}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_KICKBACK_DATA;

      // LATER, a real API call would look like this:
      // const response = await apiGet(`/merchants/me/kickback-earnings?period=${period}`);
      // if (!response.success) throw new Error(response.error || 'Failed to fetch earnings');
      // return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
