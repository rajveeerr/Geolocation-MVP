import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCapturePayment, useGamificationProfile, useRefreshGamificationData } from '@/hooks/useGamification';
import { useCaptureDealPayment } from '@/hooks/useDealPayment';
import { PATHS } from '@/routing/paths';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface APIError extends Error {
  data?: {
    errorCode?: string;
    message?: string;
  };
}

export const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const capture = useCapturePayment();
  const captureDealPayment = useCaptureDealPayment();
  const { data: profile, refetch: refetchProfile } = useGamificationProfile();
  const { refreshProfile } = useRefreshGamificationData();
  const captureAttempted = useRef(false);
  const [coinsUpdated, setCoinsUpdated] = useState(false);
  const initialCoins = useRef<number | null>(null);
  
  // Check if this is a deal payment or coin purchase
  const params = new URLSearchParams(location.search);
  const dealIdFromUrl = params.get('dealId');
  const dealIdFromStorage = localStorage.getItem('pendingDealPayment');
  const dealId = dealIdFromUrl || dealIdFromStorage;
  const isDealPayment = dealId !== null;
  
  // Clear stored dealId once we've retrieved it
  useEffect(() => {
    if (dealIdFromStorage) {
      localStorage.removeItem('pendingDealPayment');
    }
  }, [dealIdFromStorage]);

  // Track initial coins to detect when they change
  useEffect(() => {
    if (profile && initialCoins.current === null) {
      initialCoins.current = profile.coins;
    }
  }, [profile]);

  // Detect when coins have been updated by comparing with initial value
  useEffect(() => {
    if (profile && initialCoins.current !== null && profile.coins > initialCoins.current) {
      setCoinsUpdated(true);
    }
  }, [profile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const payerId = params.get('PayerID');
    
    // If we have both token and PayerID, the payment was approved by PayPal
    if (token && payerId && !captureAttempted.current) {
      captureAttempted.current = true;
      
      // Handle deal payment or coin purchase
      if (isDealPayment) {
        captureDealPayment.mutate(token);
      } else {
        capture.mutate(token);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, isDealPayment]);

  // Refetch profile when capture is successful to ensure fresh coin data
  useEffect(() => {
    if (capture.isSuccess && !isDealPayment) {
      // Use both methods to ensure coins are updated everywhere
      refetchProfile();
      refreshProfile();
      
      // Mark coins as updated
      setCoinsUpdated(true);
      
      // Also trigger a delayed refresh to catch any async updates
      setTimeout(() => {
        refreshProfile();
      }, 1000);
    }
  }, [capture.isSuccess, isDealPayment, refetchProfile, refreshProfile]);

  // Handle deal payment success - redirect to deal page
  useEffect(() => {
    if (captureDealPayment.isSuccess && dealId) {
      // Redirect to deal detail page with success parameter
      setTimeout(() => {
        navigate(`/deals/${dealId}?payment=success`);
      }, 1500);
    }
  }, [captureDealPayment.isSuccess, dealId, navigate]);

  const handleGoToDashboard = () => navigate(PATHS.GAMIFICATION);
  const handleGoHome = () => navigate(PATHS.HOME);
  const handleGoToDeal = () => {
    if (dealId) {
      navigate(`/deals/${dealId}?payment=success`);
    } else {
      navigate(PATHS.HOME);
    }
  };

  // If we have PayerID in URL, PayPal payment was approved - show success while capturing
  const token = params.get('token');

  // If no token, redirect to home
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-red-600">Invalid Payment Link</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">This payment link is invalid or has expired.</p>
              <Button onClick={handleGoHome} className="w-full">Go to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-xl">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <span>Payment Success</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {/* Show success immediately if we have PayerID (successful PayPal return) */}
            {params.get('PayerID') && !capture.isError && !captureDealPayment.isError ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-700 font-medium">Your payment has been processed successfully!</p>
                  <p className="text-green-600 text-sm mt-1">
                    {isDealPayment 
                      ? (captureDealPayment.isPending 
                          ? 'Completing payment...' 
                          : 'Payment completed! Redirecting to deal...')
                      : (capture.isPending && !coinsUpdated)
                        ? 'Adding coins to your account...' 
                        : 'Coins have been added to your account.'
                    }
                  </p>
                </div>
                {!isDealPayment && profile && coinsUpdated && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700">Current balance:</p>
                    <p className="text-2xl font-bold text-blue-600">{profile.coins} coins</p>
                  </div>
                )}
                {((capture.isPending && !coinsUpdated && !isDealPayment) || (captureDealPayment.isPending && isDealPayment)) && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                )}
                <div className="flex flex-col gap-3 pt-2">
                  {isDealPayment ? (
                    <>
                      <Button onClick={handleGoToDeal} className="w-full">Go to Deal</Button>
                      <Button variant="secondary" onClick={handleGoHome} className="w-full">Back to Home</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleGoToDashboard} className="w-full">Go to Coins Dashboard</Button>
                      <Button variant="secondary" onClick={handleGoHome} className="w-full">Back to Home</Button>
                    </>
                  )}
                </div>
              </div>
            ) : (capture.isError || captureDealPayment.isError) ? (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-700 font-medium">Payment Processing Error</p>
                  <p className="text-red-600 text-sm mt-1">
                    {isDealPayment 
                      ? ((captureDealPayment.error as APIError)?.data?.errorCode === 'ORDER_EXPIRED' 
                          ? 'Your payment session has expired. Please try making a new purchase.'
                          : (captureDealPayment.error as APIError)?.data?.errorCode === 'ALREADY_CAPTURED'
                          ? 'This payment has already been processed.'
                          : 'We could not finalize your payment. Please contact support or try again.')
                      : ((capture.error as APIError)?.data?.errorCode === 'ORDER_EXPIRED' 
                          ? 'Your payment session has expired. Please try making a new purchase.'
                          : (capture.error as APIError)?.data?.errorCode === 'ALREADY_CAPTURED'
                          ? 'This payment has already been processed. Please check your coins balance.'
                          : 'We could not finalize your payment. Please contact support or try again.')
                    }
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  {isDealPayment ? (
                    <>
                      {dealId && (
                        <Button onClick={handleGoToDeal} className="w-full">
                          Go to Deal
                        </Button>
                      )}
                      <Button variant="secondary" onClick={handleGoHome} className="w-full">
                        Back to Home
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleGoToDashboard} className="w-full">
                        Check Coins Balance
                      </Button>
                      <Button variant="secondary" onClick={handleGoHome} className="w-full">
                        Back to Home
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-700 font-medium">Processing Payment</p>
                  <p className="text-yellow-600 text-sm mt-1">Please wait while we process your payment...</p>
                </div>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
