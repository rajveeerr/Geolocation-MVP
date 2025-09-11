import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/services/api';
import type { ApiResponse } from '@/services/api';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';
import { useToast } from './use-toast';
import { adaptApiDealToFrontend } from '@/data/deals-placeholder';

type SavedDealsResponse = {
	savedDeals: [] | any[]; // after select this will be adapted frontend deals
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
			queryFn: () => apiGet<SavedDealsResponse>('/users/saved-deals'),
			// Only run this query when a user is available to avoid 401s for anonymous requests
			enabled: !!user?.id,
			select: (response) => {
				const relations = (response.data as SavedDealsResponse | undefined)?.savedDeals || [];
				// Map nested ApiDeal to frontend Deal shape
				const adapted = relations.map(r => adaptApiDealToFrontend(r.deal));
				return { savedDeals: adapted } as unknown as SavedDealsResponse;
			},
		});

		// savedDealsData.savedDeals now contains adapted frontend deals when available
		const savedDealIds = new Set(savedDealsData?.savedDeals.map((d: any) => d.id) || []);

		const { openModal } = useModal();

		const saveDealMutation = useMutation({
			mutationFn: (dealId: number) => apiPost('/users/save-deal', { dealId }),
			onSuccess: (response: ApiResponse<any>) => {
				if (!response || response.success === false) {
					throw new Error(response?.error || 'Failed to save deal');
				}
				queryClient.invalidateQueries({ queryKey: ['savedDeals'] });
				toast({ title: 'Deal Saved!', description: 'You can find it in your profile.' });
			},
			onError: (err: any) => {
				toast({ title: 'Error Saving Deal', description: err?.message ?? 'Unknown error', variant: 'destructive' });
			},
		});

	const unsaveDealMutation = useMutation({
		mutationFn: (dealId: number) => apiDelete(`/users/save-deal/${dealId}`),
		onSuccess: (response: ApiResponse<any>) => {
			if (!response || response.success === false) {
				throw new Error(response?.error || 'Failed to unsave deal');
			}
			queryClient.invalidateQueries({ queryKey: ['savedDeals'] });
			toast({ title: 'Deal Unsaved' });
		},
		onError: (err: any) => {
			toast({ title: 'Error Un-saving Deal', description: err?.message ?? 'Unknown error', variant: 'destructive' });
		},
	});

	const handleSaveAction = (dealId: string) => {
		if (!user) {
			openModal(); // Trigger the login modal
			return;
		}
		saveDealMutation.mutate(parseInt(dealId, 10));
	};

	const handleUnsaveAction = (dealId: string) => {
		if (!user) {
			openModal();
			return;
		}
		unsaveDealMutation.mutate(parseInt(dealId, 10));
	};

	return {
		savedDeals: savedDealsData?.savedDeals || [],
		savedDealIds,
		isLoading,
		error,
	saveDeal: handleSaveAction,
	unsaveDeal: handleUnsaveAction,
		isSaving: saveDealMutation.isPending,
		isUnsaving: unsaveDealMutation.isPending,
	};
};
