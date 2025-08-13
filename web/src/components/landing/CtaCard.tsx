import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const CtaCard = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <h3 className="text-neutral-text-primary text-xl font-semibold">
        Ready to Explore?
      </h3>
      <p className="text-neutral-text-secondary mb-4 mt-2 text-sm">
        The best of your city is waiting.
      </p>
      <Button
        variant="primary"
        size="lg"
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="right"
      >
        Get the App
      </Button>
    </div>
  );
};
