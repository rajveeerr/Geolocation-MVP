import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';

export const MerchantCtaSection = () => {
  return (
    <section className="w-full py-20 md:py-28">
      <div className="container mx-auto max-w-5xl rounded-lg bg-neutral-surface p-10 text-center shadow-level-2 md:p-16">
        <h2 className="text-h2">Are You a Business Owner?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-text-secondary">
          Turn passing foot traffic into loyal customers. CitySpark puts your
          business on the map, connecting you with a community of eager locals
          ready to discover you.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link to="/for-business">Put Your Business on the Map</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};