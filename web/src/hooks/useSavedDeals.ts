import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/services/api';
import type { ApiResponse } from '@/services/api';
import { useAuth } from '@/context/useAuth';
import { useToast } from './use-toast';
import type { Deal } from '@/data/deals';

type SavedDealsResponse = {
	savedDeals: Deal[];
};

const getSavedDealIds = (data: SavedDealsResponse | undefined): Set<string> => {
	if (!data?.savedDeals) return new Set();
	return new Set(data.savedDeals.map((deal) => deal.id));
};

export const useSavedDeals = () => {
	const queryClient = useQueryClient();
	const { user } = useAuth();
	const { toast } = useToast();

		const { data: savedDealsData, isLoading, error } = useQuery<
			// query returns ApiResponse<SavedDealsResponse>
			ApiResponse<SavedDealsResponse>,
			Error,
			// select will map it to SavedDealsResponse
			SavedDealsResponse
		>({
			queryKey: ['savedDeals', user?.id],
			queryFn: () => apiGet<SavedDealsResponse>('/users/me/saved-deals'),
			enabled: !!user,
			select: (response) => response.data as SavedDealsResponse,
		});

	const savedDealIds = getSavedDealIds(savedDealsData);

	const saveDealMutation = useMutation({
		mutationFn: (dealId: string) => apiPost(`/deals/${dealId}/save`, {}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['savedDeals'] });
			toast({ title: 'Deal Saved!', description: 'You can find it in your profile.' });
		},
		onError: (err: any) => {
			toast({ title: 'Error Saving Deal', description: err?.message ?? 'Unknown error', variant: 'destructive' });
		},
	});

	const unsaveDealMutation = useMutation({
		mutationFn: (dealId: string) => apiDelete(`/deals/${dealId}/save`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['savedDeals'] });
			toast({ title: 'Deal Unsaved' });
		},
		onError: (err: any) => {
			toast({ title: 'Error Un-saving Deal', description: err?.message ?? 'Unknown error', variant: 'destructive' });
		},
	});

	return {
		savedDeals: savedDealsData?.savedDeals || [],
		savedDealIds,
		isLoading,
		error,
		saveDeal: saveDealMutation.mutate,
		unsaveDeal: unsaveDealMutation.mutate,
		isSaving: saveDealMutation.isPending,
		isUnsaving: unsaveDealMutation.isPending,
	};
};
