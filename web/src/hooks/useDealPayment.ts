import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dealPaymentService } from '../services/dealPaymentService';
import { toast } from 'sonner';

interface CreatePaymentIntentParams {
  dealId: number;
  amount: number;
  currency?: string;
  description?: string;
}

// Create payment intent mutation
export function useCreateDealPaymentIntent() {
  return useMutation({
    mutationFn: (params: CreatePaymentIntentParams) => {
      // Store dealId in localStorage for retrieval on payment success
      localStorage.setItem('pendingDealPayment', params.dealId.toString());
      return dealPaymentService.createPaymentIntent({
        dealId: params.dealId,
        amount: params.amount,
        currency: params.currency || 'USD',
        description: params.description || `Payment for deal ${params.dealId}`,
      });
    },
    onSuccess: (data) => {
      if (data.success && data.data?.approvalUrl) {
        // Redirect to PayPal
        window.location.href = data.data.approvalUrl;
      } else {
        // Clear stored dealId on failure
        localStorage.removeItem('pendingDealPayment');
        toast.error(data.message || 'Failed to create payment intent');
      }
    },
    onError: (error: any) => {
      // Clear stored dealId on error
      localStorage.removeItem('pendingDealPayment');
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Failed to create payment intent';
      toast.error(errorMessage);
    },
  });
}

// Capture payment mutation
export function useCaptureDealPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => dealPaymentService.capturePayment({ orderId }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Payment completed successfully!');
        // Invalidate deal-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['deal'] });
        queryClient.invalidateQueries({ queryKey: ['deals'] });
      } else {
        toast.error(data.message || 'Payment capture failed');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Payment capture failed';
      toast.error(errorMessage);
    },
  });
}

