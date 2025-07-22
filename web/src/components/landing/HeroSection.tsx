import { Button } from '@/components/common/Button';

const AppPreview = () => (
  <div className="relative mx-auto mt-12 aspect-[3/2] w-full max-w-5xl rounded-lg bg-white p-2 shadow-level-3">
    <div className="h-full w-full rounded-md border border-neutral-border bg-neutral-background">
      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
        </div>
        <p className="mt-4 text-center font-heading text-lg font-bold text-brand-primary-main">
          App Screenshot Mockup
        </p>
      </div>
    </div>
  </div>
);


export const HeroSection = () => {
  return (
    <section className="w-full py-20 text-center md:py-32">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
          Unlock Your City. Not Your Wallet.
        </h1>
        <p className="mx-auto mt-6 max-w-[700px] text-neutral-text-secondary md:text-xl">
          Discover exclusive, real-time deals from the best local spots around
          you. From last-minute eats to happy hour treats, CitySpark is your
          guide to experiencing more for less.
        </p>
        <div className="mt-8">
          <Button size="lg">Find Deals Near Me</Button>
        </div>
      </div>
      <AppPreview />
    </section>
  );
};