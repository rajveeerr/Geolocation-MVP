import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { PATHS } from '@/routing/paths';
import { useCreateStore, useUpdateStore, type CreateStoreData, type UpdateStoreData } from '@/hooks/useMerchantStores';
import { useWhitelistedCities } from '@/hooks/useWhitelistedCities';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Map,
  Navigation,
  Building2,
  Clock,
  Eye,
  Loader2,
  Utensils,
  Phone,
  Wifi,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  StoreRegistrationStepContent,
  type StoreRegistrationCity,
} from '@/components/merchant/store-registration/StoreRegistrationStepContent';
import {
  defaultBusinessHours,
  businessHoursToOperatingHours,
  type StoreWizardData,
  STORE_REGISTRATION_STEP_IDS,
} from '@/components/merchant/store-registration/storeRegistrationTypes';

const WIZARD_STEPS = [
  { id: 'location-search', title: 'Location', description: 'Search area', icon: MapPin },
  { id: 'location-confirm', title: 'Address', description: 'Confirm details', icon: Map },
  { id: 'location-pin', title: 'Pin', description: 'Exact spot', icon: Navigation },
  { id: 'store-name', title: 'Name', description: 'Location name', icon: Building2 },
  { id: 'store-type', title: 'Type', description: 'Store type', icon: Utensils },
  { id: 'store-contact', title: 'Contact', description: 'Phone & email', icon: Phone },
  { id: 'hours-weekday', title: 'Weekday Hours', description: 'Mon-Fri', icon: Clock },
  { id: 'hours-weekend', title: 'Weekend Hours', description: 'Sat-Sun', icon: Clock },
  { id: 'features', title: 'Features', description: 'Amenities', icon: Wifi },
  { id: 'extras', title: 'Extras', description: 'Food truck, description', icon: Building2 },
  { id: 'photos', title: 'Photos', description: 'Add photos/videos', icon: Image },
  { id: 'review', title: 'Review', description: 'Confirm & create', icon: Eye },
] as const;

type WizardStep = (typeof WIZARD_STEPS)[number]['id'];

interface StoreCreationWizardProps {
  isEditing?: boolean;
  storeId?: string;
  existingStoreData?: Partial<StoreWizardData>;
}

export const StoreCreationWizard = ({
  isEditing = false,
  storeId,
  existingStoreData,
}: StoreCreationWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('location-search');
  const [wizardData, setWizardData] = useState<StoreWizardData>({
    businessName: '',
    address: '',
    phoneNumber: '',
    email: '',
    storeType: 'restaurant',
    cityId: 0,
    latitude: undefined,
    longitude: undefined,
    verifiedAddress: '',
    businessHours: defaultBusinessHours,
    description: '',
    features: [],
    storeImages: [],
    galleryUrls: [],
    isFoodTruck: false,
    active: true,
    ...existingStoreData,
  });

  const { data: citiesData, isLoading: citiesLoading } = useWhitelistedCities();
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();

  const cities: StoreRegistrationCity[] = citiesData?.cities || [];
  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const updateWizardData = (data: Partial<StoreWizardData>) => {
    setWizardData(prev => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    if (!isLastStep) {
      const nextStep = WIZARD_STEPS[currentStepIndex + 1];
      setCurrentStep(nextStep.id);
    }
  };

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      const prevStep = WIZARD_STEPS[currentStepIndex - 1];
      setCurrentStep(prevStep.id);
    }
  };

  const goToStep = (stepId: WizardStep) => {
    setCurrentStep(stepId);
  };

  const handleSubmit = async () => {
    try {
      const storeData: CreateStoreData | UpdateStoreData = {
        address: wizardData.address,
        cityId: wizardData.cityId,
        latitude: wizardData.latitude ?? null,
        longitude: wizardData.longitude ?? null,
        active: wizardData.active,
        description: wizardData.description || null,
        operatingHours: businessHoursToOperatingHours(wizardData.businessHours),
        galleryUrls: wizardData.galleryUrls.length > 0 ? wizardData.galleryUrls : undefined,
        isFoodTruck: wizardData.isFoodTruck,
      };

      if (isEditing && storeId) {
        await updateStoreMutation.mutateAsync({
          storeId: Number(storeId),
          data: storeData as UpdateStoreData
        });
      } else {
        await createStoreMutation.mutateAsync(storeData as CreateStoreData);
      }
      
      navigate(PATHS.MERCHANT_STORES);
    } catch (error) {
      console.error('Error saving store:', error);
    }
  };

  const isStepValid = (stepId: WizardStep): boolean => {
    switch (stepId) {
      case 'location-search':
      case 'location-confirm':
        return !!(wizardData.address && wizardData.cityId && wizardData.latitude && wizardData.longitude);
      case 'location-pin':
        return !!(wizardData.latitude && wizardData.longitude);
      case 'store-name':
        return !!wizardData.businessName;
      case 'store-type':
        return !!wizardData.storeType;
      case 'store-contact':
        return !!wizardData.phoneNumber;
      case 'hours-weekday':
      case 'hours-weekend':
      case 'features':
      case 'extras':
      case 'photos':
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const canProceedToNext = isStepValid(currentStep);

  if (citiesLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-64 rounded bg-neutral-200" />
          <div className="h-96 rounded-xl bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(PATHS.MERCHANT_STORES)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
          Back to Stores
        </Button>
        <h1 className="text-4xl font-bold text-neutral-900">
          {isEditing ? 'Edit Store' : 'Add New Store'}
        </h1>
        <p className="mt-2 text-neutral-600">
          {isEditing 
            ? 'Update your store information and settings'
            : 'Create a new store location with our guided setup'
          }
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2 mb-2 md:hidden">
          <span className="text-sm font-medium text-neutral-500">
            Step {currentStepIndex + 1} of {WIZARD_STEPS.length}
          </span>
          <span className="text-sm font-bold text-brand-primary-600">
            {WIZARD_STEPS[currentStepIndex].title}
          </span>
        </div>
        
        <div className="flex items-center gap-1 overflow-x-auto pb-4 scrollbar-hide">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = currentStepIndex > index;
            const isValid = isStepValid(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center shrink-0">
                <div className="flex flex-col items-center min-w-[80px]">
                  <button
                    onClick={() => goToStep(step.id)}
                    disabled={!isValid && !isCompleted}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
                      isActive
                        ? 'border-brand-primary-500 bg-brand-primary-500 text-white'
                        : isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : isValid
                            ? 'border-brand-primary-300 bg-brand-primary-50 text-brand-primary-600 hover:border-brand-primary-400'
                            : 'border-neutral-300 bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </button>
                  <div className="mt-2 text-center md:block hidden">
                    <p className={cn(
                      'text-xs font-medium whitespace-nowrap',
                      isActive ? 'text-brand-primary-600' : 'text-neutral-600'
                    )}>
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={cn(
                    'mx-2 h-0.5 w-8 shrink-0',
                    currentStepIndex > index ? 'bg-green-500' : 'bg-neutral-300'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="p-8">
          <StoreRegistrationStepContent
            stepIndex={STORE_REGISTRATION_STEP_IDS.indexOf(currentStep) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11}
            data={wizardData}
            onUpdate={updateWizardData}
            cities={cities}
          />
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-8 py-6">
          <Button
            variant="secondary"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
            Previous
          </Button>

          <div className="flex items-center gap-3">
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
                className="min-w-[140px]"
              >
                {(createStoreMutation.isPending || updateStoreMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {isEditing ? 'Update Store' : 'Create Store'}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={goToNextStep}
                disabled={!canProceedToNext}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCreationWizard;
