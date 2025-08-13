import { motion } from 'framer-motion';
import { BentoCard } from './BentoCard';
import { LiveMapCard } from './LiveMapCard';
import { LeaderboardCard } from './LeaderboardCard';
import { HappyHourCard } from './HappyHourCard';
import { FeatureCard } from './FeatureCard';
import { CtaCard } from './CtaCard';

export const BentoGridSection = () => {
  const bentoVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="w-full bg-white py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-neutral-text-primary text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Own Your City
          </h2>
          <p className="text-neutral-text-secondary mx-auto mt-4 max-w-2xl text-lg">
            From real-time maps to gamified rewards, CitySpark is more than just
            a deals app.
          </p>
        </div>

        <motion.div
          className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-4"
          variants={bentoVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <BentoCard
            variants={itemVariants}
            className="md:col-span-2 md:row-span-2"
          >
            <LiveMapCard />
          </BentoCard>
          <BentoCard variants={itemVariants} className="md:col-span-2">
            <LeaderboardCard />
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <HappyHourCard />
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <FeatureCard icon="gift" title="Unlock Secret Deals" />
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <FeatureCard icon="users" title="Bring-a-Friend Perks" />
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <FeatureCard icon="zap" title="Instant Notifications" />
          </BentoCard>
          <BentoCard
            variants={itemVariants}
            className="bg-neutral-subtle-background md:col-span-2"
          >
            <CtaCard />
          </BentoCard>
        </motion.div>
      </div>
    </section>
  );
};
