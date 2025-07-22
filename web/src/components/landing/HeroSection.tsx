import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowRight } from 'lucide-react';
import { DashboardPreview } from './DashboardPreview';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-brand-primary-light via-blue-50 to-white w-full min-h-screen relative overflow-hidden pt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[4%] top-0 bottom-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute right-[4%] top-0 bottom-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 top-[5%] h-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-blue-200/40"></div>
      </div>
      
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20 text-center relative z-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-text-primary leading-tight">
            Promptwatch gets your company mentioned by
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-accent-claude rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-600 rounded-full relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <span className="text-neutral-text-primary">Claude</span>
            </div>
          </h1>
          <p className="mx-auto mt-6 sm:mt-8 max-w-2xl text-lg sm:text-xl text-neutral-text-secondary leading-relaxed px-4 sm:px-0">
            Boost visibility in ChatGPT, Claude, Perplexity, and other AI search engines, monitor
            mentions, and keep your business top of mind.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 px-4 sm:px-0">
          <Button variant="google" size="lg" className="w-full sm:w-auto">
            Join with Google
          </Button>
          <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" className="w-full sm:w-auto">
            Start 7-day trial
          </Button>
        </div>

        <p className="mt-6 text-sm sm:text-base text-neutral-text-secondary px-4 sm:px-0">
          Talk to us first?{' '}
          <Link
            to="/book-demo"
            className="text-brand-primary-main hover:underline font-medium"
          >
            Book a demo
          </Link>
        </p>
      </div>
      <DashboardPreview />
    </section>
  );
};