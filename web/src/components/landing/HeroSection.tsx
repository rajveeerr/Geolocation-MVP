import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowRight } from 'lucide-react';
import { DashboardPreview } from './DashboardPreview';
import { useState, useEffect } from 'react';
import { PATHS } from '@/routing/paths';

export const HeroSection = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const dynamicWords = ['Moments', 'Deals', 'Finds', 'Nights Out'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [dynamicWords.length]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-brand-primary-light via-blue-50 to-white pt-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 top-[4%] h-0.5 bg-blue-200/40 md:top-[5%]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-200/40"></div>
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-text-primary sm:text-5xl md:text-6xl">
            CitySpark gets you exclusive local
            {/* <br /> */}
            <span className="mt-2 inline-flex items-center justify-center gap-3 text-neutral-text-primary transition-all duration-500 ease-in-out">
              <svg
                className="h-12 w-12 text-cyan-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
              </svg>
              {dynamicWords[currentWordIndex]}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl px-4 text-lg leading-relaxed text-neutral-text-primary sm:mt-8 sm:px-0 sm:text-xl">
            Stop scrolling endless review sites. CitySpark shows you a live map
            of exclusive deals and happy hours from top-rated local spots, ready
            for you right now.
          </p>
        </div>

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

        <p className="mt-6 px-4 text-sm text-neutral-text-secondary sm:px-0 sm:text-base">
          Are you a business?{' '}
          <Link
            to={PATHS.FOR_BUSINESSES}
            className="font-medium text-brand-primary-main hover:underline"
          >
            Get on the map in minutes
          </Link>
        </p>
      </div>
      <DashboardPreview />
    </section>
  );
};
