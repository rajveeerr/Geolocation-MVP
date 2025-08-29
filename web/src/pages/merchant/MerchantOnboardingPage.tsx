// src/pages/merchant/MerchantOnboardingPage.tsx
import { OnboardingProvider } from '@/context/MerchantOnboardingContext';
import { Routes, Route } from 'react-router-dom';
import { BusinessInfoStep } from '@/components/merchant/onboarding/BusinessInfoStep';

export const MerchantOnboardingPage = () => {
  return (
    <OnboardingProvider>
      {/* Here we can have nested routes for each step of the form */}
      <Routes>
        <Route index element={<BusinessInfoStep />} />
        {/* Add routes for Step 2, Step 3 etc. here */}
      </Routes>
    </OnboardingProvider>
  );
};
