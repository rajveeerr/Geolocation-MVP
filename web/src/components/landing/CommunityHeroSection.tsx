import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowRight, Users, MapPin, Sparkles } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { useMerchantStatus } from '@/hooks/useMerchantStatus';
import { motion } from 'framer-motion';

export const CommunityHeroSection = () => {
  const { data: merchantData } = useMerchantStatus();
  const hasMerchantProfile = !!merchantData?.data?.merchant;

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-brand-primary-light via-brand-primary-50 to-white pt-20">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
        <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-brand-primary-200/40"></div>
        <div className="absolute left-0 right-0 top-[4%] h-0.5 bg-brand-primary-200/40 md:top-[5%]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary-200/40"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        className="container relative z-10 mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">
          {/* Main 3-line heading with icons */}
          <div className="space-y-4 sm:space-y-6">
            {/* Line 1: Your Local Community */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center gap-3 sm:gap-4"
            >
              <Users className="h-8 w-8 text-blue-500 sm:h-10 sm:w-10" />
              <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl md:text-5xl lg:text-6xl">
                Your Local Community
              </h1>
            </motion.div>

            {/* Line 2: Exclusive Moments & Deals */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center justify-center gap-3 sm:gap-4"
            >
              <Sparkles className="h-8 w-8 text-purple-500 sm:h-10 sm:w-10" />
              <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl md:text-5xl lg:text-6xl">
                Exclusive Moments & Deals
              </h2>
            </motion.div>

            {/* Line 3: Discovered Together */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center justify-center gap-3 sm:gap-4"
            >
              <MapPin className="h-8 w-8 text-brand-primary-500 sm:h-10 sm:w-10" />
              <h3 className="text-3xl font-bold text-neutral-900 sm:text-4xl md:text-5xl lg:text-6xl">
                Discovered Together
              </h3>
            </motion.div>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mx-auto mt-8 max-w-3xl px-4 text-lg leading-relaxed text-neutral-600 sm:mt-10 sm:px-0 sm:text-xl"
          >
            Join thousands of locals discovering the best spots in your city. From hidden happy hours to exclusive events, find your next favorite place with the community that knows it best.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 px-4 sm:mt-12 sm:flex-row sm:gap-6 sm:px-0"
          >
            <Link to={PATHS.LOGIN}>
              <Button variant="google" size="lg" className="w-full sm:w-auto">
                Join the Community
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
                Explore Live Map
              </Button>
            </Link>
          </motion.div>

          {/* Business CTA */}
          {!hasMerchantProfile && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-neutral-500 mt-8 px-4 text-sm sm:px-0 sm:text-base"
            >
              Are you a business?{' '}
              <Link
                to={PATHS.MERCHANT_ONBOARDING}
                className="font-medium text-brand-primary-main hover:underline"
              >
                Connect with your community
              </Link>
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Hero Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="relative mx-auto mt-12 w-full max-w-5xl px-4"
      >
        <div
          className="aspect-[16/9] w-full rounded-lg bg-gray-900/5 p-2"
          style={{
            background:
              'radial-gradient(circle at 50% 30%, var(--brand-primary-100), transparent 70%)',
          }}
        >
          <div className="border-neutral-border/20 h-full w-full rounded-md border bg-white/50 p-4 shadow-inner">
            <svg
              viewBox="0 0 800 450"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
            >
              <defs>
                <radialGradient
                  id="glow-community"
                  cx="50%"
                  cy="50%"
                  r="50%"
                  fx="50%"
                  fy="50%"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--accent-secondary-main)"
                    stopOpacity="0.6"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--accent-secondary-main)"
                    stopOpacity="0"
                  />
                </radialGradient>
                <filter id="shadow-community" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                  <feOffset dx="0" dy="2" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.5" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* City skyline silhouette */}
              <path
                d="M0 450 L0 380 L50 350 L80 380 L120 340 L150 390 L200 350 L250 400 L300 360 L320 380 L350 330 L400 380 L450 320 L500 390 L550 350 L600 410 L650 360 L700 390 L750 340 L800 380 L800 450 Z"
                fill="url(#glow-community)"
                filter="url(#shadow-community)"
              />

              {/* Community connection lines */}
              <path
                d="M150 200 Q300 150 450 200 Q600 180 650 200"
                stroke="#3B82F6"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
                strokeDasharray="5,5"
              >
                <animate attributeName="stroke-dashoffset" values="0;10" dur="2s" repeatCount="indefinite" />
              </path>

              {/* Community nodes */}
              <circle cx="150" cy="200" r="10" fill="#3B82F6" opacity="0.8">
                <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="300" cy="150" r="8" fill="#8B5CF6" opacity="0.7">
                <animate attributeName="r" values="8;10;8" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx="450" cy="200" r="9" fill="#10B981" opacity="0.8">
                <animate attributeName="r" values="9;11;9" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="600" cy="180" r="7" fill="#F59E0B" opacity="0.6">
                <animate attributeName="r" values="7;9;7" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="650" cy="200" r="8" fill="#EF4444" opacity="0.7">
                <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Users icon for community */}
              <g transform="translate(200, 120)">
                <circle cx="0" cy="0" r="8" fill="#3B82F6" opacity="0.8" />
                <circle cx="-6" cy="12" r="6" fill="#3B82F6" opacity="0.6" />
                <circle cx="6" cy="12" r="6" fill="#3B82F6" opacity="0.6" />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1;1.1;1"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </g>

              {/* Sparkles for exclusive moments */}
              <g transform="translate(400, 130)">
                <path
                  d="M0 0 L2 6 L8 4 L2 8 L0 14 L-2 8 L-8 4 L-2 6 Z"
                  fill="#8B5CF6"
                  opacity="0.8"
                />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values="0;360"
                  dur="4s"
                  repeatCount="indefinite"
                />
              </g>

              {/* Map pin for discovery */}
              <g transform="translate(600, 140)">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="#10B981"
                  opacity="0.8"
                />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values="1;1.2;1"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </g>
            </svg>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
