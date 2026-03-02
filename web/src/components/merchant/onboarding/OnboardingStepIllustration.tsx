'use client';

import { motion } from 'framer-motion';
import {
  Store,
  Tag,
  DollarSign,
  Image,
  Camera,
  Sparkles,
  Phone,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingCardProps {
  icon: LucideIcon;
  label: string;
  index: number;
  accentClass?: string;
}

const FloatingCard = ({ icon: Icon, label, index, accentClass }: FloatingCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      duration: 0.5,
      delay: index * 0.12,
      ease: [0.34, 1.56, 0.64, 1],
    }}
    whileHover={{ y: -6, scale: 1.05, transition: { duration: 0.2 } }}
    className={cn(
      'relative flex flex-col items-center justify-center gap-2',
      'w-24 h-28 sm:w-28 sm:h-32',
      'rounded-2xl',
      'bg-white/70 dark:bg-neutral-900/70',
      'backdrop-blur-xl',
      'border border-white/80 dark:border-neutral-700/80',
      'shadow-lg shadow-neutral-200/50 dark:shadow-neutral-900/50',
      'hover:shadow-xl hover:shadow-neutral-300/40 dark:hover:shadow-neutral-800/40',
      'transition-shadow duration-300',
    )}
  >
    <div
      className={cn(
        'flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl',
        accentClass ?? 'bg-brand-primary-100 dark:bg-brand-primary-900/40 text-brand-primary-600 dark:text-brand-primary-400',
      )}
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
    </div>
    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 max-w-[90%] truncate">
      {label}
    </span>
  </motion.div>
);

export type ChapterVariant = 'business' | 'standout' | 'finish';

interface OnboardingStepIllustrationProps {
  variant: ChapterVariant;
  className?: string;
}

const CHAPTER_CONFIG: Record<
  ChapterVariant,
  { icon: LucideIcon; label: string; accentClass?: string }[]
> = {
  business: [
    { icon: Store, label: 'Your venue' },
    { icon: Tag, label: 'Category' },
    { icon: DollarSign, label: 'Price range' },
  ],
  standout: [
    { icon: Image, label: 'Logo' },
    { icon: Camera, label: 'Gallery' },
    { icon: Sparkles, label: 'Vibes' },
  ],
  finish: [
    { icon: Phone, label: 'Contact' },
    { icon: CheckCircle, label: 'Review' },
    { icon: MapPin, label: 'Locations' },
  ],
};

export function OnboardingStepIllustration({ variant, className }: OnboardingStepIllustrationProps) {
  const items = CHAPTER_CONFIG[variant];

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'min-h-[220px] sm:min-h-[260px]',
        'rounded-3xl',
        'bg-gradient-to-br from-neutral-50/90 to-brand-primary-50/30 dark:from-neutral-900/50 dark:to-brand-primary-950/20',
        'backdrop-blur-sm',
        'border border-neutral-200/80 dark:border-neutral-700/50',
        className,
      )}
    >
      {/* Subtle glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 60%, hsl(var(--brand-primary) / 0.08) 0%, transparent 60%)',
        }}
      />
      <div className="relative flex items-end justify-center gap-4 sm:gap-6 py-8 px-6">
        {items.map((item, i) => (
          <FloatingCard
            key={item.label}
            icon={item.icon}
            label={item.label}
            index={i}
            accentClass={item.accentClass}
          />
        ))}
      </div>
    </div>
  );
}
