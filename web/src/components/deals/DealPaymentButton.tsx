import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { useCreateDealPaymentIntent } from '@/hooks/useDealPayment';
import { Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/useAuth';
import { useModal } from '@/context/ModalContext';

interface DealPaymentButtonProps {
  dealId: number;
  amount: number;
  currency?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const DealPaymentButton: React.FC<DealPaymentButtonProps> = ({
  dealId,
  amount,
  currency = 'USD',
  description,
  disabled = false,
  className,
}) => {
  const { user } = useAuth();
  const { openModal } = useModal();
  const createPaymentIntent = useCreateDealPaymentIntent();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user) {
      openModal();
      return;
    }

    try {
      setIsProcessing(true);
      await createPaymentIntent.mutateAsync({
        dealId,
        amount,
        currency,
        description: description || `Payment for deal ${dealId}`,
      });
    } catch (error) {
      console.error('Payment initiation failed:', error);
      // Error is already handled by the hook's onError
    } finally {
      setIsProcessing(false);
    }
  };

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handlePayment}
      disabled={disabled || isProcessing || createPaymentIntent.isPending}
      className={className}
    >
      {isProcessing || createPaymentIntent.isPending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-5 w-5" />
          Pay {formattedAmount}
        </>
      )}
    </Button>
  );
};


