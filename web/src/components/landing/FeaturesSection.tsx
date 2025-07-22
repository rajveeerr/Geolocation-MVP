import { MapPin, Tag, Rocket } from 'lucide-react';

const features = [
  {
    icon: <MapPin className="h-8 w-8 text-brand-primary-main" />,
    title: 'Deals So Close, You Can Taste Them.',
    description:
      "Our live map shows you a world of opportunity right outside your door. See what's hot, where to go, and how much you'll save, all in real-time.",
  },
  {
    icon: <Tag className="h-8 w-8 text-accent-secondary" />,
    title: 'From Happy Hours to "Pile On" Power.',
    description:
      'Grab a friend for a BOGO deal, unlock secret offers by checking in, or join a "Pile On" deal to get an unbeatable price. Your next adventure is a tap away.',
  },
  {
    icon: <Rocket className="h-8 w-8 text-accent-urgent" />,
    title: 'Gamified Rewards & Perks',
    description:
      'Earn points for every deal you redeem, climb the city leaderboard, and unlock exclusive rewards. Saving money has never been this fun.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="w-full bg-neutral-surface py-20 md:py-28">
      <div className="container mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-background">
              {feature.icon}
            </div>
            <h3 className="text-h3">{feature.title}</h3>
            <p className="mt-2 text-neutral-text-secondary">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};