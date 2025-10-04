// src/components/merchant/create-deal/DealReviewStep.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDealCreation } from '@/context/DealCreationContext';
import { OnboardingStepLayout } from '../onboarding/OnboardingStepLayout';
import { apiPost } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { PATHS } from '@/routing/paths';
import { useCountdown } from '@/hooks/useCountdown';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { Sparkles } from 'lucide-react';

const ReviewItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <div className="flex justify-between border-b border-neutral-200 py-3">
    <p className="text-neutral-600">{label}</p>
    <p className="font-semibold text-neutral-800">{value || 'Not set'}</p>
  </div>
);

export const DealReviewStep = () => {
  const { state } = useDealCreation();
  const countdown = useCountdown(state.endTime || '');
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = countdown || {};
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Check merchant status before allowing deal creation
  const { data: merchantData, isLoading: isLoadingMerchant } = useMerchantStatus();

  const handlePublish = async () => {
    if (isPublishing) return; // Prevent double-clicks

    try {
      setIsPublishing(true);
      console.log('Starting deal publication...', state);

      // Check merchant status first
      if (isLoadingMerchant) {
        toast({
          title: 'Loading...',
          description: 'Please wait while we verify your merchant status.',
          variant: 'destructive',
        });
        return;
      }

      if (!merchantData?.data?.merchant) {
        toast({
          title: 'Merchant Profile Required',
          description: 'You need to complete the merchant onboarding process before creating deals.',
          variant: 'destructive',
        });
        navigate(PATHS.MERCHANT_ONBOARDING);
        return;
      }

      if (merchantData.data.merchant.status !== 'APPROVED') {
        toast({
          title: 'Merchant Not Approved',
          description: `Your merchant profile is ${merchantData.data.merchant.status.toLowerCase()}. Please wait for admin approval before creating deals.`,
          variant: 'destructive',
        });
        navigate(PATHS.MERCHANT_DASHBOARD);
        return;
      }

      // Comprehensive validation
      if (!state.title || state.title.trim().length === 0) {
        toast({
          title: 'Error',
          description: 'Deal title is required.',
          variant: 'destructive',
        });
        return;
      }

      if (state.title.trim().length > 100) {
        toast({
          title: 'Error',
          description: 'Deal title must be 100 characters or less.',
          variant: 'destructive',
        });
        return;
      }

      if (!state.startTime || !state.endTime) {
        toast({
          title: 'Error',
          description: 'Start time and end time are required.',
          variant: 'destructive',
        });
        return;
      }

      const startDate = new Date(state.startTime);
      const endDate = new Date(state.endTime);
      const now = new Date();

      if (startDate <= now) {
        toast({
          title: 'Error',
          description: 'Start date must be in the future.',
          variant: 'destructive',
        });
        return;
      }

      if (endDate <= startDate) {
        toast({
          title: 'Error',
          description: 'End date must be after start date.',
          variant: 'destructive',
        });
        return;
      }

      const oneYearFromNow = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
      if (endDate > oneYearFromNow) {
        toast({
          title: 'Error',
          description: 'End date cannot be more than one year in the future.',
          variant: 'destructive',
        });
        return;
      }

      if (!state.discountPercentage && !state.discountAmount) {
        toast({
          title: 'Error',
          description: 'Please specify either a discount percentage or discount amount.',
          variant: 'destructive',
        });
        return;
      }

      if (state.discountPercentage && (state.discountPercentage < 0 || state.discountPercentage > 100)) {
        toast({
          title: 'Error',
          description: 'Discount percentage must be between 0 and 100.',
          variant: 'destructive',
        });
        return;
      }

      if (state.discountAmount && state.discountAmount < 0) {
        toast({
          title: 'Error',
          description: 'Discount amount must be a positive number.',
          variant: 'destructive',
        });
        return;
      }

      // 1. Prepare comprehensive payload for the API
      const payload = {
        title: state.title,
        description: state.description,
        // Send whatever discount fields the merchant provided
        discountPercentage: state.discountPercentage ?? null,
        discountAmount: state.discountAmount ?? null,
        // New fields expected by the backend
        dealType: state.dealType ?? 'STANDARD',
        category: state.category ?? 'FOOD_AND_BEVERAGE',
        recurringDays: state.recurringDays?.length
          ? state.recurringDays
          : undefined,
        // Backend expects activeDateRange with startDate and endDate
        activeDateRange: {
          startDate: new Date(state.startTime).toISOString(),
          endDate: new Date(state.endTime).toISOString(),
        },
        redemptionInstructions: state.redemptionInstructions,
        // Enhanced fields
        imageUrls: state.imageUrls || [],
        primaryImageIndex: state.primaryImageIndex || 0,
        offerTerms: state.offerTerms || null,
        customOfferDisplay: state.customOfferDisplay || null,
        kickbackEnabled: state.kickbackEnabled || false,
        isFeatured: state.isFeatured || false,
        priority: state.priority || 5,
        maxRedemptions: state.maxRedemptions !== null ? state.maxRedemptions : 0,
        minOrderAmount: state.minOrderAmount || null,
        validDaysOfWeek: state.validDaysOfWeek || null,
        validHours: state.validHours || null,
        socialProofEnabled: state.socialProofEnabled !== false,
        allowSharing: state.allowSharing !== false,
        storeIds: state.storeIds || null,
        cityIds: state.cityIds || null,
        tags: state.tags || [],
        notes: state.notes || null,
        externalUrl: state.externalUrl || null,
        // Menu items if any
        menuItems: state.selectedMenuItems?.length > 0 ? state.selectedMenuItems : undefined,
      };

      console.log('API Payload:', payload);

      // 2. Make the API call
      const response = await apiPost('/deals', payload);

      console.log('API Response:', response);

      // 3. Handle the response
      if (response.success) {
        toast({
          title: 'Deal Published!',
          description: 'Your new deal is now live for customers to see.',
        });
        navigate(PATHS.MERCHANT_DASHBOARD);
      } else {
        // Handle specific error cases
        let errorMessage = response.error || 'Unknown error occurred';
        
        if (response.error?.includes('Title is required')) {
          errorMessage = 'Please provide a deal title.';
        } else if (response.error?.includes('activeDateRange')) {
          errorMessage = 'Please set valid start and end dates for your deal.';
        } else if (response.error?.includes('Invalid start date')) {
          errorMessage = 'Please set a valid start date in the future.';
        } else if (response.error?.includes('End date must be after start date')) {
          errorMessage = 'End date must be after start date.';
        } else if (response.error?.includes('discountPercentage') || response.error?.includes('discountAmount')) {
          errorMessage = 'Please specify a valid discount percentage or amount.';
        } else if (response.error?.includes('category')) {
          errorMessage = 'Please select a valid category for your deal.';
        } else if (response.error?.includes('dealType')) {
          errorMessage = 'Please select a valid deal type.';
        } else if (response.error?.includes('Failed to verify merchant status')) {
          errorMessage = 'Unable to verify your merchant status. Please try logging in again.';
        } else if (response.error?.includes('Merchant authentication required')) {
          errorMessage = 'Please log in as a merchant to create deals.';
        } else if (response.error?.includes('not approved')) {
          errorMessage = 'Your merchant account is not approved yet. Please wait for admin approval.';
        }
        
        toast({
          title: 'Error Publishing Deal',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in handlePublish:', error);
      
      let errorMessage = 'Failed to publish deal. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <OnboardingStepLayout
      title="Ready to publish?"
      onNext={handlePublish}
      onBack={() => navigate('/merchant/deals/create/advanced')}
      progress={100}
      nextButtonText="Publish Deal"
      isNextDisabled={isPublishing}
    >
      <div className="space-y-4">
        <p className="text-neutral-600">
          Review the details of your deal below. Once you publish, it will be
          visible to all Yohop users.
        </p>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Basic Information</h3>
            <ReviewItem label="Title" value={state.title} />
            <ReviewItem label="Description" value={state.description} />
            <ReviewItem label="Category" value={state.category} />
            <ReviewItem label="Deal Type" value={state.dealType} />
          </div>

          {/* Offer Details */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Offer Details</h3>
            <ReviewItem
              label="Discount"
              value={
                state.discountPercentage
                  ? `${state.discountPercentage}% off`
                  : state.discountAmount
                    ? `$${state.discountAmount} off`
                    : 'Not set'
              }
            />
            {state.offerTerms && (
              <ReviewItem label="Terms & Conditions" value={state.offerTerms} />
            )}
            {state.minOrderAmount && (
              <ReviewItem label="Minimum Order" value={`$${state.minOrderAmount}`} />
            )}
            {state.maxRedemptions !== null && (
              <ReviewItem 
                label="Max Redemptions" 
                value={state.maxRedemptions === 0 ? "Unlimited" : state.maxRedemptions.toString()} 
              />
            )}
          </div>

          {/* Schedule */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Schedule</h3>
            <ReviewItem
              label="Starts"
              value={new Date(state.startTime).toLocaleString()}
            />
            <ReviewItem
              label="Ends"
              value={new Date(state.endTime).toLocaleString()}
            />
            {state.dealType === 'RECURRING' && state.recurringDays.length > 0 && (
              <ReviewItem
                label="Recurring Days"
                value={state.recurringDays.join(', ')}
              />
            )}
          </div>

          {/* Images */}
          {state.imageUrls && state.imageUrls.length > 0 && (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-4 font-semibold text-neutral-900">Images</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {state.imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Deal image ${index + 1}`}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    {index === state.primaryImageIndex && (
                      <div className="absolute top-1 left-1 rounded bg-brand-primary-500 px-2 py-1 text-xs text-white">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Redemption Instructions</h3>
            <p className="text-neutral-700">{state.redemptionInstructions}</p>
          </div>

          {/* Additional Settings */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Additional Settings</h3>
            <ReviewItem label="Social Proof" value={state.socialProofEnabled ? 'Enabled' : 'Disabled'} />
            <ReviewItem label="Allow Sharing" value={state.allowSharing ? 'Yes' : 'No'} />
            <ReviewItem label="Kickback Enabled" value={state.kickbackEnabled ? 'Yes' : 'No'} />
            <ReviewItem label="Featured Deal" value={state.isFeatured ? 'Yes' : 'No'} />
            {state.tags && state.tags.length > 0 && (
              <ReviewItem label="Tags" value={state.tags.join(', ')} />
            )}
          </div>
          {/* Live countdown display */}
          {state.endTime && (
            <div className="mt-4 flex items-center gap-3 rounded-md bg-amber-50 p-3">
              <div className="rounded-md bg-amber-100 p-2 text-amber-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  Time left
                </p>
                <p className="text-sm text-neutral-700">
                  {days > 0 ? `${days}d ` : ''}
                  {hours.toString().padStart(2, '0')}h{' '}
                  {minutes.toString().padStart(2, '0')}m{' '}
                  {seconds.toString().padStart(2, '0')}s
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </OnboardingStepLayout>
  );
};
