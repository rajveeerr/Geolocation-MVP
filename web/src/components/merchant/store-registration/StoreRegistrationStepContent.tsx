/**
 * Renders a single step of the store registration flow.
 * Airbnb-style: story-driven, one focused question per step.
 */
import { StoreLocationSearchStep } from '../StoreWizardSteps/StoreLocationSearchStep';
import { StoreConfirmAddressStep } from '../StoreWizardSteps/StoreConfirmAddressStep';
import { StorePinLocationStep } from '../StoreWizardSteps/StorePinLocationStep';
import { StoreNameStep } from '../StoreWizardSteps/StoreNameStep';
import { StoreTypeStep } from '../StoreWizardSteps/StoreTypeStep';
import { StoreContactStep } from '../StoreWizardSteps/StoreContactStep';
import { StoreHoursStep } from '../StoreWizardSteps/StoreHoursStep';
import { StoreFeaturesStep } from '../StoreWizardSteps/StoreFeaturesStep';
import { StoreExtrasStep } from '../StoreWizardSteps/StoreExtrasStep';
import { StorePhotosStep } from '../StoreWizardSteps/StorePhotosStep';
import { StoreReviewStep } from '../StoreWizardSteps/StoreReviewStep';
import type { StoreWizardData } from './storeRegistrationTypes';

export interface StoreRegistrationCity {
  id: number;
  name: string;
  state: string;
  active?: boolean;
}

interface StoreRegistrationStepContentProps {
  stepIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  data: StoreWizardData;
  onUpdate: (data: Partial<StoreWizardData>) => void;
  cities: StoreRegistrationCity[];
  merchantPhone?: string;
  merchantEmail?: string;
}

export function StoreRegistrationStepContent({
  stepIndex,
  data,
  onUpdate,
  cities,
  merchantPhone,
  merchantEmail,
}: StoreRegistrationStepContentProps) {
  switch (stepIndex) {
    case 0:
      return <StoreLocationSearchStep data={data} onUpdate={onUpdate} cities={cities} />;
    case 1:
      return <StoreConfirmAddressStep data={data} onUpdate={onUpdate} cities={cities} />;
    case 2:
      return <StorePinLocationStep data={data} onUpdate={onUpdate} />;
    case 3:
      return <StoreNameStep data={data} onUpdate={onUpdate} />;
    case 4:
      return <StoreTypeStep data={data} onUpdate={onUpdate} />;
    case 5:
      return <StoreContactStep data={data} onUpdate={onUpdate} merchantPhone={merchantPhone} merchantEmail={merchantEmail} />;
    case 6:
      return <StoreHoursStep data={data} onUpdate={onUpdate} mode="weekday" />;
    case 7:
      return <StoreHoursStep data={data} onUpdate={onUpdate} mode="weekend" />;
    case 8:
      return <StoreFeaturesStep data={data} onUpdate={onUpdate} />;
    case 9:
      return <StoreExtrasStep data={data} onUpdate={onUpdate} />;
    case 10:
      return <StorePhotosStep data={data} onUpdate={onUpdate} />;
    case 11:
      return <StoreReviewStep data={data} cities={cities} />;
    default:
      return null;
  }
}
