import { useQuery } from '@tanstack/react-query';
// import { apiGet } from '@/services/api'; // Will be used later

// --- Mock data that matches the API contract ---
const MOCK_KICKBACK_DATA = {
  summary: {
    revenue: 1392.0,
    totalKickbackHandout: 135.5,
  },
  details: [
    {
      user: { name: 'Anita', avatarUrl: 'https://github.com/shadcn.png' },
      earned: 3.5,
      invitedCount: 2,
      totalSpentByInvitees: 13.5,
      spendingDetail: [
        { itemName: 'Chicken Ginger', price: 14.0, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80' },
        { itemName: 'Coca Cola Zero', price: 2.5, imageUrl: 'https://images.unsplash.com/photo-1554629947-334ff61d85dc?w=500&q=80' },
      ],
    },
    {
      user: { name: 'Benjamin', avatarUrl: 'https://github.com/vercel.png' },
      earned: 2.1,
      invitedCount: 1,
      totalSpentByInvitees: 13.5,
      spendingDetail: [],
    },
    {
      user: { name: 'Catherine', avatarUrl: 'https://github.com/react.png' },
      earned: 6.8,
      invitedCount: 4,
      totalSpentByInvitees: 13.5,
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
