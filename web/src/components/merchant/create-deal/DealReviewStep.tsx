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
import { Sparkles, Trophy, EyeOff, MapPin, Building2, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mapDealTypeToBackend } from '@/utils/dealTypeUtils';
import { BountyQRCodeDisplay } from './BountyQRCodeDisplay';
import { motion } from 'framer-motion';

const ReviewItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined | { name?: string; label?: string; value?: string };
}) => {
  // Handle category object - extract name/label/value
  let displayValue: string | number | null | undefined = value;
  if (typeof value === 'object' && value !== null) {
    displayValue = value.name || value.label || value.value || 'Not set';
  }
  
  return (
    <div className="flex justify-between border-b border-neutral-200 py-3">
      <p className="text-neutral-600">{label}</p>
      <p className="font-semibold text-neutral-800">{displayValue || 'Not set'}</p>
    </div>
  );
};

export const DealReviewStep = () => {
  const { state } = useDealCreation();
  const countdown = useCountdown(state.endTime || '');
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = countdown || {};
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [bountyQRCode, setBountyQRCode] = useState<string | null>(null);
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

      if (!state.discountPercentage && !state.discountAmount && !state.customOfferDisplay) {
        toast({
          title: 'Error',
          description: 'Please specify either a discount percentage, discount amount, or custom offer display.',
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
        // Map deal type to backend format
        dealType: mapDealTypeToBackend(state.dealType),
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
        // Bounty Deal fields
        bountyRewardAmount: state.dealType === 'BOUNTY' ? (state.bountyRewardAmount ?? undefined) : undefined,
        minReferralsRequired: state.dealType === 'BOUNTY' ? (state.minReferralsRequired ?? undefined) : undefined,
        // Hidden Deal fields
        accessCode: state.dealType === 'HIDDEN' ? (state.accessCode || undefined) : undefined,
        // Advanced scheduling
        validDaysOfWeek: state.validDaysOfWeek || null,
        validHours: state.validHours || null,
        // Menu items if any - format for API
        menuItems: state.selectedMenuItems?.length > 0 
          ? state.selectedMenuItems.map(item => ({
              id: item.id,
              isHidden: item.isHidden || false,
              customPrice: item.customPrice !== null && item.customPrice !== undefined ? item.customPrice : undefined,
              customDiscount: item.customDiscount !== null && item.customDiscount !== undefined ? item.customDiscount : undefined,
              discountAmount: item.discountAmount !== null && item.discountAmount !== undefined ? item.discountAmount : undefined,
            }))
          : undefined,
        // Menu collection if using collection
        menuCollectionId: state.useMenuCollection && state.menuCollectionId ? state.menuCollectionId : undefined,
      };

      console.log('API Payload:', payload);

      // 2. Make the API call
      const response = await apiPost('/deals', payload);

      console.log('API Response:', response);

      // 3. Handle the response
      if (response.success) {
        // Check if response includes bounty QR code
        const responseData = response.data as any;
        const qrCode = responseData?.deal?.bountyQRCode || responseData?.bounty?.qrCode;
        
        if (state.dealType === 'BOUNTY' && qrCode) {
          setBountyQRCode(qrCode);
          setShowQRModal(true);
          toast({
            title: 'Deal Published!',
            description: 'Your bounty deal is live! QR code has been generated for verification.',
          });
        } else if (state.dealType === 'HIDDEN' && responseData?.bounty?.qrCode) {
          // Hidden deal with optional bounty
          setBountyQRCode(responseData.bounty.qrCode);
          setShowQRModal(true);
          toast({
            title: 'Deal Published!',
            description: 'Your hidden deal is live! QR code has been generated for bounty verification.',
          });
        } else {
          toast({
            title: 'Deal Published!',
            description: 'Your new deal is now live for customers to see.',
          });
          // Small delay to show toast before navigating
          setTimeout(() => {
            navigate(PATHS.MERCHANT_DASHBOARD);
          }, 1500);
        }
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
        } else if (response.error?.includes('discountPercentage') || response.error?.includes('discountAmount') || response.error?.includes('customOfferDisplay')) {
          errorMessage = 'Please specify a valid discount percentage, amount, or custom offer display.';
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
      onBack={() => navigate('/merchant/deals/create/instructions')}
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

          {/* Menu Items */}
          {state.selectedMenuItems && state.selectedMenuItems.length > 0 && (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-4 font-semibold text-neutral-900">Selected Menu Items</h3>
              <div className="space-y-3">
                {state.selectedMenuItems.map((item) => {
                  // Calculate final price
                  let finalPrice = item.price;
                  let discountInfo = '';
                  
                  if (item.customPrice !== null && item.customPrice !== undefined) {
                    finalPrice = item.customPrice;
                    discountInfo = `Fixed: $${finalPrice.toFixed(2)}`;
                  } else if (item.customDiscount !== null && item.customDiscount !== undefined) {
                    finalPrice = item.price * (1 - item.customDiscount / 100);
                    discountInfo = `${item.customDiscount}% off`;
                  } else if (item.discountAmount !== null && item.discountAmount !== undefined) {
                    finalPrice = Math.max(0, item.price - item.discountAmount);
                    discountInfo = `$${item.discountAmount.toFixed(2)} off`;
                  } else if (state.discountPercentage !== null) {
                    finalPrice = item.price * (1 - state.discountPercentage / 100);
                    discountInfo = `${state.discountPercentage}% off (global)`;
                  } else if (state.discountAmount !== null) {
                    finalPrice = Math.max(0, item.price - state.discountAmount);
                    discountInfo = `$${state.discountAmount.toFixed(2)} off (global)`;
                  }
                  
                  const hasDiscount = finalPrice < item.price;
                  
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-neutral-900">{item.name}</span>
                          {item.isHidden && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                              Hidden
                            </span>
                          )}
                          {(item.customPrice !== null || item.customDiscount !== null || item.discountAmount !== null) && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                              Custom Price
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          {hasDiscount && (
                            <span className="text-neutral-400 line-through">${item.price.toFixed(2)}</span>
                          )}
                          <span className={cn(
                            "font-semibold",
                            hasDiscount ? "text-green-600" : "text-neutral-700"
                          )}>
                            ${finalPrice.toFixed(2)}
                          </span>
                          {discountInfo && (
                            <span className="text-xs text-neutral-500">({discountInfo})</span>
                          )}
                        </div>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                        {item.category}
                      </span>
                    </div>
                  );
                })}
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-700">Total Items:</span>
                    <span className="font-semibold text-neutral-900">{state.selectedMenuItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-700">Visible Items:</span>
                    <span className="font-semibold text-green-600">
                      {state.selectedMenuItems.filter(item => !item.isHidden).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Menu Collection Info */}
          {state.useMenuCollection && state.menuCollectionId && (
            <div className="rounded-lg border bg-white p-4">
              <h3 className="mb-2 font-semibold text-neutral-900">Menu Collection</h3>
              <p className="text-sm text-neutral-600">
                Using menu collection (ID: {state.menuCollectionId})
              </p>
            </div>
          )}

          {/* Offer Details */}
          <div className="rounded-lg border bg-white p-4">
            <h3 className="mb-4 font-semibold text-neutral-900">Offer Details</h3>
            <ReviewItem
              label="Offer"
              value={
                state.discountPercentage
                  ? `${state.discountPercentage}% off`
                  : state.discountAmount
                    ? `$${state.discountAmount} off`
                    : state.customOfferDisplay
                      ? state.customOfferDisplay
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
                label="Daily Deal Days"
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

          {/* Bounty Deal Info */}
          {state.dealType === 'BOUNTY' && (state.bountyRewardAmount || state.minReferralsRequired) && (
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-neutral-900">Bounty Rewards</h3>
              </div>
              <ReviewItem 
                label="Reward Per Friend" 
                value={state.bountyRewardAmount ? `$${state.bountyRewardAmount.toFixed(2)}` : 'Not set'} 
              />
              <ReviewItem 
                label="Minimum Friends Required" 
                value={state.minReferralsRequired ? `${state.minReferralsRequired} friend${state.minReferralsRequired > 1 ? 's' : ''}` : 'Not set'} 
              />
              {state.bountyRewardAmount && state.minReferralsRequired && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    Customers will earn <span className="font-semibold text-brand-primary-600">
                      ${(state.bountyRewardAmount * state.minReferralsRequired).toFixed(2)}
                    </span> minimum by bringing {state.minReferralsRequired} friend{state.minReferralsRequired > 1 ? 's' : ''}.
                  </p>
                </div>
              )}
              {/* QR Code Preview - Will be generated by backend after deal creation */}
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <p className="text-sm font-medium text-neutral-700 mb-2">Verification QR Code</p>
                <p className="text-xs text-neutral-500 mb-3">
                  A QR code will be generated after publishing. Customers scan this to verify they brought friends.
                </p>
                <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center">
                  <BountyQRCodeDisplay 
                  dealId={undefined}
                  merchantName="Your Business"
                  showInfo={false}
                  size="sm"
                />
                </div>
              </div>
            </div>
          )}

          {/* Hidden Deal Info */}
          {state.dealType === 'HIDDEN' && state.accessCode && (
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <EyeOff className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-neutral-900">Hidden Deal Access</h3>
              </div>
              <ReviewItem 
                label="Access Code" 
                value={state.accessCode || 'Auto-generated'} 
              />
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <p className="text-sm text-neutral-600 mb-2">Shareable Link:</p>
                <div className="rounded-lg bg-neutral-50 p-3 font-mono text-xs break-all">
                  {window.location.origin}/deals/hidden/{state.accessCode}
                </div>
              </div>
            </div>
          )}

          {/* Location Targeting */}
          {(state.storeIds && state.storeIds.length > 0) || (state.cityIds && state.cityIds.length > 0) ? (
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-neutral-900">Location Targeting</h3>
              </div>
              {state.storeIds && state.storeIds.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-neutral-700 mb-2">Selected Stores: {state.storeIds.length}</p>
                </div>
              )}
              {state.cityIds && state.cityIds.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-700 mb-2">Selected Cities: {state.cityIds.length}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Advanced Scheduling */}
          {(state.validDaysOfWeek && state.validDaysOfWeek.length > 0) || state.validHours ? (
            <div className="rounded-lg border bg-white p-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-neutral-900">Advanced Scheduling</h3>
              </div>
              {state.validDaysOfWeek && state.validDaysOfWeek.length > 0 && (
                <ReviewItem 
                  label="Valid Days" 
                  value={state.validDaysOfWeek.join(', ')} 
                />
              )}
              {state.validHours && (
                <ReviewItem 
                  label="Valid Hours" 
                  value={state.validHours} 
                />
              )}
            </div>
          ) : null}

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

      {/* QR Code Modal for Bounty Deals */}
      {showQRModal && bountyQRCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-2xl w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
          >
            <button
              onClick={() => {
                setShowQRModal(false);
                navigate(PATHS.MERCHANT_DASHBOARD);
              }}
              className="absolute top-4 right-4 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="h-6 w-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-neutral-900">Bounty Deal Published!</h2>
              </div>
              
              <p className="text-neutral-600 mb-6">
                Your bounty deal is now live! Download and print the QR code below for verification at your location.
              </p>

              <div className="mb-6">
                <BountyQRCodeDisplay
                  qrCodeData={bountyQRCode}
                  merchantName="Your Business"
                  showInfo={true}
                  size="lg"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => {
                    setShowQRModal(false);
                    navigate(PATHS.MERCHANT_DASHBOARD);
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowQRModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </OnboardingStepLayout>
  );
};
