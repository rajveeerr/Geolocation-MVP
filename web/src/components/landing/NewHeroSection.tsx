import { CategoryFilterBar } from '@/components/landing/CategoryFilterBar';

export const NewHeroSection = () => {

  return (
    <section className="bg-white pt-24 md:pt-20 py-12 px-6 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Main Headline - Matching Figma Design */}
        <div className="mb-10">
          <h1 className="text-4xl text-gray-900 mb-2">
            Find a deal. <span className="text-gray-600">Bring your friends. Get paid cash.</span>
          </h1>
        </div>

        {/* Category Filter Bar */}
        <CategoryFilterBar />



        {/* Business CTA - Keep existing functionality */}
        {/* {!hasMerchantProfile && (
          <p className="text-neutral-text-secondary mt-6 px-4 text-sm sm:px-0 sm:text-base">
            Are you a business?{' '}
            <Link
              to={PATHS.MERCHANT_ONBOARDING}
              className="font-medium text-brand-primary-main hover:underline"
            >
              Get on the map in minutes
            </Link>
          </p>
        )} */}
      </div>
    </section>
  );
};
