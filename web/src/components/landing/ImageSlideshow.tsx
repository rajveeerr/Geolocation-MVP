import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageSlideshowProps {
  images: string[];
  alt: string;
  className?: string;
  /** Auto-advance interval in ms. 0 = disabled. Default 5000 */
  autoPlay?: number;
  /** Max images to show indicator bars for (capped). Default 3 */
  maxImages?: number;
  /** Scale images on hover (parent must have `group` class). Default false */
  hoverScale?: boolean;
}

export const ImageSlideshow = ({
  images,
  alt,
  className,
  autoPlay = 5000,
  maxImages = 3,
  hoverScale = false,
}: ImageSlideshowProps) => {
  // Filter out any falsy/empty image URLs, then cap to maxImages
  const validImages = images.filter((src) => !!src && src.trim() !== '');
  const displayImages = validImages.length > 0 ? validImages.slice(0, maxImages) : [];
  const hasMultiple = displayImages.length > 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const pauseRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Preload images
  useEffect(() => {
    displayImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [displayImages]);

  // Reset active index if images change and current index is out of bounds
  useEffect(() => {
    if (activeIndex >= displayImages.length && displayImages.length > 0) {
      setActiveIndex(0);
    }
  }, [displayImages.length, activeIndex]);

  const goTo = useCallback(
    (index: number, dir: number) => {
      if (index < 0 || index >= displayImages.length) return;
      setDirection(dir);
      setActiveIndex(index);
    },
    [displayImages.length],
  );

  const goNext = useCallback(() => {
    if (!hasMultiple) return;
    const next = (activeIndex + 1) % displayImages.length;
    goTo(next, 1);
  }, [activeIndex, displayImages.length, goTo, hasMultiple]);

  // Auto-advance
  useEffect(() => {
    if (!hasMultiple || autoPlay <= 0) return;
    intervalRef.current = setInterval(() => {
      if (!pauseRef.current) goNext();
    }, autoPlay);
    return () => clearInterval(intervalRef.current);
  }, [hasMultiple, autoPlay, goNext]);

  // Swipe handler
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 40;
    if (info.offset.x < -threshold && activeIndex < displayImages.length - 1) {
      goTo(activeIndex + 1, 1);
    } else if (info.offset.x > threshold && activeIndex > 0) {
      goTo(activeIndex - 1, -1);
    }
  };

  // Pause auto-play on interaction
  const handlePointerDown = () => {
    pauseRef.current = true;
  };
  const handlePointerUp = () => {
    setTimeout(() => {
      pauseRef.current = false;
    }, 2000);
  };

  // Scale class applied only to images, never indicators
  const imgScaleClass = hoverScale
    ? 'transition-transform duration-700 ease-out group-hover:scale-[1.05]'
    : '';

  // If no images at all, show a placeholder gradient
  if (displayImages.length === 0) {
    return (
      <div
        className={cn(
          'relative w-full h-full bg-gradient-to-br from-gray-200 to-gray-300',
          className,
        )}
      />
    );
  }

  // Single image — no slideshow, no indicator bars
  if (!hasMultiple) {
    return (
      <div className={cn('relative w-full h-full overflow-hidden', className)}>
        <img
          src={displayImages[0]}
          alt={alt}
          className={cn('w-full h-full object-cover', imgScaleClass)}
          loading="lazy"
        />
      </div>
    );
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '30%' : '-30%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-30%' : '30%', opacity: 0 }),
  };

  return (
    <div
      className={cn('relative w-full h-full overflow-hidden', className)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Image layer — only this scales on hover */}
      <div className={cn('absolute inset-0', imgScaleClass)}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={activeIndex}
            src={displayImages[activeIndex]}
            alt={`${alt} ${activeIndex + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            drag={hasMultiple ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            loading="lazy"
          />
        </AnimatePresence>
      </div>

      {/* Indicator bars — OUTSIDE the scaling wrapper so they stay fixed */}
      <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5 pointer-events-auto">
        {displayImages.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              goTo(i, i > activeIndex ? 1 : -1);
            }}
            className={cn(
              'h-[3px] flex-1 rounded-full transition-all duration-300',
              i === activeIndex
                ? 'bg-white'
                : 'bg-white/40',
            )}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
