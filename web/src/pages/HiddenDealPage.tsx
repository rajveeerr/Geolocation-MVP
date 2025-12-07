// web/src/pages/HiddenDealPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/services/api';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Button } from '@/components/common/Button';
import { EyeOff } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface HiddenDealResponse {
  success: boolean;
  deal?: {
    id: number;
    [key: string]: any;
  };
  error?: string;
}

export const HiddenDealPage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery<HiddenDealResponse, Error>({
    queryKey: ['hidden-deal', code],
    queryFn: async () => {
      if (!code) {
        throw new Error('Access code is required');
      }
      try {
        const res = await apiGet<HiddenDealResponse>(`/deals/hidden/${code.toUpperCase()}`);
        
        // apiGet returns { success, data, error }
        // The backend response is in res.data
        if (!res.success) {
          throw new Error(res.error || 'Failed to fetch hidden deal');
        }
        
        // res.data contains the backend response: { success: true, deal: {...} }
        const backendResponse = res.data;
        
        if (!backendResponse || !backendResponse.success || !backendResponse.deal) {
          throw new Error(backendResponse?.error || 'Hidden deal not found');
        }
        
        return backendResponse;
      } catch (err: any) {
        // Handle network errors or API errors
        if (err?.message) {
          throw err;
        }
        throw new Error('Failed to load hidden deal. Please try again.');
      }
    },
    enabled: !!code,
    retry: false, // Don't retry 404s or 500s
  });

  if (isLoading) {
    return <LoadingOverlay message="Loading hidden deal..." />;
  }

  if (error || !response?.deal) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="max-w-xl rounded-2xl border bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <EyeOff className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Hidden Deal Not Found
          </h2>
          <p className="mt-3 text-neutral-600">
            {error?.message || 'This hidden deal could not be found. It may have expired, not started yet, or the access code is incorrect.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button 
              size="md" 
              variant="outline"
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
            <Button 
              size="md" 
              variant="primary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to the deal detail page with the deal ID
  return <Navigate to={`/deals/${response.deal.id}`} replace />;
};

