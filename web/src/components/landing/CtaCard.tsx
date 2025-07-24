import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const CtaCard = () => {
  return (
    <div className="flex h-full flex-col justify-center items-center p-6 text-center">
      <h3 className="text-xl font-semibold text-neutral-text-primary">Ready to Explore?</h3>
      <p className="text-sm text-neutral-text-secondary mt-2 mb-4">The best of your city is waiting.</p>
      <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
        Get the App
      </Button>
    </div>
  );
};