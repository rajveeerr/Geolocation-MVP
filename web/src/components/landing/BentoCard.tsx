import { motion, type MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type BentoCardProps = {
  className?: string;
  children: React.ReactNode;
} & MotionProps;

export const BentoCard = ({
  className,
  children,
  ...props
}: BentoCardProps) => {
  return (
    <motion.div
      {...props}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl',
        'bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]',
        'dark:bg-black/40 dark:[box-shadow:0_0_0_1px_rgba(255,255,255,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]',
        'transform-gpu transition-all duration-300 ease-in-out',
        'hover:shadow-2xl',
        className,
      )}
    >
      {children}
    </motion.div>
  );
};
