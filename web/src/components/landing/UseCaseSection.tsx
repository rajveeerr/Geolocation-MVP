import { UseCaseContent } from './UseCaseContent';
import { PhoneMockup } from './PhoneMockup';

export const UseCaseSection = () => {
  return (
    <section className="bg-neutral-subtle-background w-full py-20 md:py-28">
      <div className="container mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        <UseCaseContent />
        <PhoneMockup />
      </div>
    </section>
  );
};
