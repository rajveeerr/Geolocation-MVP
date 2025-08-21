import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowRight } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';

export const HeroCallToAction = () => {
  const { data: merchantData } = useMerchantStatus();
  
  // Check if user has a merchant profile (any status)
  const hasMerchantProfile = !!merchantData?.data?.merchant;

  return (
    <>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 px-4 sm:mt-10 sm:flex-row sm:gap-6 sm:px-0">
        <Link to={PATHS.LOGIN}>
          <Button variant="google" size="lg" className="w-full sm:w-auto">
            Join in now
          </Button>
        </Link>
        <Link to={PATHS.SIGNUP}>
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
            className="w-full sm:w-auto"
          >
            See the Live Map
          </Button>
        </Link>
      </div>

      {!hasMerchantProfile && (
        <p className="text-neutral-text-secondary mt-6 px-4 text-sm sm:px-0 sm:text-base">
          Are you a business?{' '}
          <Link
            to={PATHS.MERCHANT_ONBOARDING}
            className="font-medium text-brand-primary-main hover:underline"
          >
            Get on the map in minutes
          </Link>
        </p>
      )}
    </>
  );
};
