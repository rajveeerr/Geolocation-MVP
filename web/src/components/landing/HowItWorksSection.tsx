import { UserPlus, LockKeyhole, MapPin, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  step: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: UserPlus,
    step: 1,
    title: 'Bring friends, get paid',
    description:
      'Each restaurant sets their own cash reward. Bring the max number of friends and maximize your payout.',
  },
  {
    icon: LockKeyhole,
    step: 2,
    title: 'Unlock secret deals',
    description:
      'Some spots have hidden deals that only reveal when you arrive. Click "Check In" to claim your rewards.',
  },
  {
    icon: MapPin,
    step: 3,
    title: 'Check in & earn points',
    description:
      'Visit deals on the map, check in when you arrive, and earn points toward exclusive rewards and leaderboard status.',
  },
  {
    icon: Trophy,
    step: 4,
    title: 'Climb the leaderboard',
    description:
      'Compete with friends and foodies in your city. Top check-in streaks unlock bonus rewards and VIP perks.',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="bg-white py-20 md:py-28 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        {/* Section Label */}
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-brand-primary-700 mb-3">
          The Game
        </p>

        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-16 md:mb-20">
          How the game works
        </h2>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Horizontal connecting line – visible only on lg (4-col layout) */}
          <div
            className="hidden lg:block absolute top-[36px] left-[calc(12.5%+36px)] right-[calc(12.5%+36px)] h-[2px] bg-[#E5E2DE]"
            aria-hidden="true"
          />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center">
                {/* Mobile / Tablet vertical connector (between rows) */}
                {i > 0 && (
                  <div className="block sm:hidden w-[2px] h-8 bg-[#E5E2DE] -mt-2 mb-2" aria-hidden="true" />
                )}

                {/* Icon circle with step badge */}
                <div className="relative mb-6 z-10">
                  {/* Outer ring */}
                  <div className="w-[72px] h-[72px] rounded-full border-2 border-brand-primary-700/30 flex items-center justify-center bg-white">
                    {/* Inner icon */}
                    <s.icon className="h-7 w-7 text-brand-primary-700" strokeWidth={1.8} />
                  </div>
                  {/* Step number badge */}
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-brand-primary-700 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[46px] h-[20px] flex items-center justify-center shadow-sm whitespace-nowrap">
                    Step {s.step}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-2">
                  {s.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] leading-relaxed text-gray-400 max-w-[220px]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
