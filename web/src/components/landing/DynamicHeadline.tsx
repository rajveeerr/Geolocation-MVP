import { useState, useEffect } from 'react';

export const DynamicHeadline = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const dynamicWords = ['Moments', 'Deals', 'Finds', 'Nights Out'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [dynamicWords.length]);

  return (
    <h1 className="text-4xl font-semibold leading-tight tracking-tight text-neutral-text-primary sm:text-5xl md:text-6xl">
      CitySpark gets you exclusive local{' '}
      <span className="mt-2 inline-flex flex-wrap items-center justify-center gap-2 text-neutral-text-primary transition-all duration-500 ease-in-out sm:gap-3">
        <span className="flex items-center justify-center gap-2 sm:gap-3">
          <svg
            className="h-8 w-8 text-brand-primary-400 sm:h-12 sm:w-12"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
          </svg>
          {dynamicWords[currentWordIndex]}
        </span>
      </span>
    </h1>
  );
};