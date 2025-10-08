import { useState, useEffect } from 'react';
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
  Building2, 
  Clock,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Local types to avoid import issues
interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

interface StoreWizardData {
  // Basic Info
  businessName: string;
  address: string;
  phoneNumber: string;
  email?: string;
  storeType: string;
  
  // Location
  cityId: number;
  latitude?: number;
  longitude?: number;
  verifiedAddress?: string;
  
  // Business Details
  businessHours: BusinessHours;
  description?: string;
  features: string[];
  storeImages: File[];
  
  // Settings
  active: boolean;
}

const defaultBusinessHours: BusinessHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '10:00', close: '16:00', closed: true },
};

// Step 1: Basic Information
import { StoreBasicInfoStep } from './StoreWizardSteps/StoreBasicInfoStep';
// Step 2: Location Selection
import { StoreLocationStep } from './StoreWizardSteps/StoreLocationStep';
// Step 3: Business Details
import { StoreBusinessDetailsStep } from './StoreWizardSteps/StoreBusinessDetailsStep';
// Step 4: Review & Preview
import { StoreReviewStep } from './StoreWizardSteps/StoreReviewStep';

// Wizard steps configuration
const WIZARD_STEPS = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Store details and contact information',
    icon: Building2,
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Address and map selection',
    icon: MapPin,
  },
  {
    id: 'business-details',
    title: 'Business Details',
    description: 'Hours, features, and additional info',
    icon: Clock,
  },
  {
    id: 'review',
    title: 'Review & Preview',
    description: 'Confirm and preview your store',
    icon: Eye,
  },
] as const;

type WizardStep = typeof WIZARD_STEPS[number]['id'];


interface StoreCreationWizardProps {
  isEditing?: boolean;
  storeId?: string;
  existingStoreData?: Partial<StoreWizardData>;
}

export const StoreCreationWizard = ({ 
  isEditing = false, 
  storeId, 
  existingStoreData 
}: StoreCreationWizardProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic-info');
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
    active: true,
    ...existingStoreData,
  });

  const { data: citiesData, isLoading: citiesLoading } = useWhitelistedCities();
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore();

  const cities = citiesData?.cities || [];
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
      // Convert wizard data to API format
      const storeData: CreateStoreData | UpdateStoreData = {
        address: wizardData.address,
        cityId: wizardData.cityId,
        latitude: wizardData.latitude,
        longitude: wizardData.longitude,
        active: wizardData.active,
        // Add additional fields as needed
        businessName: wizardData.businessName,
        phoneNumber: wizardData.phoneNumber,
        email: wizardData.email,
        storeType: wizardData.storeType,
        businessHours: wizardData.businessHours,
        description: wizardData.description,
        features: wizardData.features,
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
      case 'basic-info':
        return !!(wizardData.businessName && wizardData.address && wizardData.phoneNumber);
      case 'location':
        return !!(wizardData.cityId && wizardData.latitude && wizardData.longitude);
      case 'business-details':
        return true; // Business details are optional
      case 'review':
        return true; // Review step is always valid
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
          <ArrowLeft className="mr-2 h-4 w-4" />
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
        <div className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = currentStepIndex > index;
            const isValid = isStepValid(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    disabled={!isValid && !isCompleted}
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200',
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
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-brand-primary-600' : 'text-neutral-600'
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < WIZARD_STEPS.length - 1 && (
                  <div className={cn(
                    'mx-4 h-0.5 w-16',
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
          {currentStep === 'basic-info' && (
            <StoreBasicInfoStep
              data={wizardData}
              onUpdate={updateWizardData}
              cities={cities}
            />
          )}
          
          {currentStep === 'location' && (
            <StoreLocationStep
              data={wizardData}
              onUpdate={updateWizardData}
              cities={cities}
            />
          )}
          
          {currentStep === 'business-details' && (
            <StoreBusinessDetailsStep
              data={wizardData}
              onUpdate={updateWizardData}
            />
          )}
          
          {currentStep === 'review' && (
            <StoreReviewStep
              data={wizardData}
              cities={cities}
            />
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-8 py-6">
          <Button
            variant="secondary"
            onClick={goToPreviousStep}
            disabled={isFirstStep}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
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
