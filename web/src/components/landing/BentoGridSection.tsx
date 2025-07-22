import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Gift, Map, Medal, Users, Zap } from 'lucide-react';
import { BentoCard } from './BentoCard';
import { Button } from '@/components/common/Button';

// Mockup for the live map cell
const LiveMapCard = () => (
  <div className="relative flex h-full w-full flex-col items-start justify-end gap-2 p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900" />
    <Map className="absolute right-4 top-4 h-8 w-8 text-white/30" />
    <div className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-accent-urgent animate-ping" />
    <div className="absolute left-1/3 top-2/3 h-1 w-1 rounded-full bg-accent-secondary animate-ping" />
    <div className="absolute right-1/4 bottom-1/4 h-1.5 w-1.5 rounded-full bg-accent-gamification animate-ping" />
    <h3 className="text-2xl font-semibold text-white">Your City, Live.</h3>
    <p className="max-w-xs text-sm text-white/80">
      See a real-time view of every deal, happy hour, and secret offer around you.
    </p>
  </div>
);

// Mockup for the leaderboard cell
const LeaderboardCard = () => (
  <div className="flex h-full flex-col p-6">
    <div className="flex items-center gap-2">
      <Medal className="h-6 w-6 text-accent-secondary" />
      <h3 className="font-semibold text-neutral-text-primary">City Leaderboard</h3>
    </div>
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-text-secondary">1. @janedoe</span>
        <span className="font-bold text-accent-secondary">12,450 pts</span>
      </div>
      <div className="flex items-center justify-between text-sm bg-brand-primary-light p-2 rounded-md">
        <span className="font-semibold text-brand-primary-main">2. You</span>
        <span className="font-bold text-brand-primary-main">9,800 pts</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-neutral-text-secondary">3. @citysaver</span>
        <span className="font-bold text-neutral-text-primary">8,100 pts</span>
      </div>
    </div>
  </div>
);

// Mockup for the Happy Hour countdown cell
const HappyHourCard = () => {
    const [timeLeft, setTimeLeft] = useState({ minutes: 24, seconds: 18 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
                return { minutes: 0, seconds: 0 };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-full flex-col justify-between p-6 bg-accent-urgent text-white">
            <div>
                <Flame className="h-6 w-6" />
                <h3 className="mt-2 text-lg font-semibold">Happy Hour Ending!</h3>
            </div>
            <div className="text-4xl font-bold tracking-tighter">
                {`${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
            </div>
        </div>
    );
};

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
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-text-primary sm:text-4xl">
                Everything You Need to Own Your City
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-text-secondary">
                From real-time maps to gamified rewards, CitySpark is more than just a deals app.
            </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 auto-rows-[220px] gap-4"
          variants={bentoVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <BentoCard variants={itemVariants} className="md:col-span-2 md:row-span-2">
            <LiveMapCard />
          </BentoCard>
          <BentoCard variants={itemVariants} className="md:col-span-2">
            <LeaderboardCard />
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <HappyHourCard />
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <div className="flex h-full flex-col justify-between p-6">
                <Gift className="h-6 w-6 text-neutral-text-primary"/>
                <h3 className="font-semibold text-neutral-text-primary">Unlock Secret Deals</h3>
            </div>
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <div className="flex h-full flex-col justify-between p-6">
                <Users className="h-6 w-6 text-neutral-text-primary"/>
                <h3 className="font-semibold text-neutral-text-primary">Bring-a-Friend Perks</h3>
            </div>
          </BentoCard>
          <BentoCard variants={itemVariants}>
            <div className="flex h-full flex-col justify-between p-6">
                <Zap className="h-6 w-6 text-neutral-text-primary"/>
                <h3 className="font-semibold text-neutral-text-primary">Instant Notifications</h3>
            </div>
          </BentoCard>
           <BentoCard variants={itemVariants} className="md:col-span-2 bg-neutral-subtle-background">
                <div className="flex h-full flex-col justify-center items-center p-6 text-center">
                    <h3 className="text-xl font-semibold text-neutral-text-primary">Ready to Explore?</h3>
                    <p className="text-sm text-neutral-text-secondary mt-2 mb-4">The best of your city is waiting.</p>
                    <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                        Get the App
                    </Button>
                </div>
            </BentoCard>
        </motion.div>
      </div>
    </section>
  );
};