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
    }, 2000); // Change word every 2 seconds

    return () => clearInterval(interval);
  }, [dynamicWords.length]);

  return (
    <section className="bg-gradient-to-b from-brand-primary-light via-blue-50 to-white w-full min-h-screen relative overflow-hidden pt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[4%] top-0 bottom-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute right-[4%] top-0 bottom-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 top-[4%] md:top-[5%] h-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-200/40"></div>
      </div>
      
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20 text-center relative z-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-text-primary leading-tight">
            The Live Map to Your City's Best{' '}
            <span className="text-brand-primary-main transition-all duration-500 ease-in-out">
              {dynamicWords[currentWordIndex]}
            </span>
          </h1>
          <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-lg sm:text-xl text-neutral-text-secondary leading-relaxed px-4 sm:px-0">
            Stop scrolling endless review sites. CitySpark shows you a live map of exclusive deals and happy hours from top-rated local spots, ready for you right now.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 px-4 sm:px-0">
          <Link to={PATHS.SIGNUP}>
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" className="w-full sm:w-auto">
              See the Live Map
            </Button>
          </Link>
          <Link to={PATHS.LOGIN}>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Join in now
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm sm:text-base text-neutral-text-secondary px-4 sm:px-0">
          Are you a business?{' '}
          <Link
            to={PATHS.FOR_BUSINESSES}
            className="text-brand-primary-main hover:underline font-medium"
          >
            Get on the map in minutes
          </Link>
        </p>
      </div>
      <DashboardPreview />
    </section>
  );
};