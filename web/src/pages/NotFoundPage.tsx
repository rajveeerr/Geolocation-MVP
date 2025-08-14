import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { motion } from 'framer-motion';

export const NotFoundPage = () => {
  return (
    <div className="from-brand-primary-light flex min-h-screen items-center justify-center bg-gradient-to-b via-blue-50 to-white px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 top-[10%] h-0.5 bg-blue-200/40"></div>

        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="bg-brand-primary-200 absolute left-4 top-20 h-12 w-12 rounded-full opacity-60 sm:left-10 sm:h-16 sm:w-16"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="bg-accent-orange-100 absolute right-8 top-40 h-10 w-10 rounded-lg opacity-50 sm:right-16 sm:h-12 sm:w-12"
        />
        <motion.div
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="bg-brand-primary-200 absolute bottom-32 left-8 h-6 w-6 rounded-full opacity-40 sm:left-20 sm:h-8 sm:w-8"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-8"
        >
          <div className="relative mx-auto mb-8 h-48 w-48 sm:h-64 sm:w-64">
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-brand-primary-500 scale-[2.5] transform sm:scale-[3] md:scale-[4]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-12 w-12 sm:h-16 sm:w-16"
                  fill="currentColor"
                >
                  <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
                </svg>

                <div className="bg-brand-primary-400 absolute -bottom-6 left-1/2 h-12 w-24 -translate-x-1/2 transform rounded-full opacity-30 blur-xl sm:-bottom-8 sm:h-16 sm:w-32"></div>
                <div className="w-18 bg-brand-primary-300 absolute -bottom-3 left-1/2 h-6 -translate-x-1/2 transform rounded-full opacity-50 blur-lg sm:-bottom-4 sm:h-8 sm:w-24"></div>
              </div>
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="bg-brand-primary-400 absolute left-2 top-2 h-1.5 w-1.5 rounded-full sm:left-4 sm:top-4 sm:h-2 sm:w-2"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              className="bg-accent-orange-400 absolute right-4 top-8 h-1 w-1 rounded-full sm:right-8 sm:top-12 sm:h-1.5 sm:w-1.5"
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="bg-accent-purple-400 absolute bottom-4 left-6 h-1.5 w-1.5 rounded-full sm:bottom-8 sm:left-12 sm:h-2 sm:w-2"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-neutral-text-secondary mb-4 text-sm font-medium">
            You look a little lost...
          </p>

          <h1 className="text-neutral-text-primary mb-6 text-3xl font-bold leading-tight sm:text-4xl md:text-6xl">
            Oops! Page not found
          </h1>

          <p className="text-neutral-text-secondary mx-auto mb-8 max-w-md px-4 text-base sm:px-0 sm:text-lg">
            The page you're looking for doesn't exist. Let's get you back on
            track to discover amazing deals near you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link to={PATHS.HOME}>
            <Button
              variant="primary"
              size="lg"
              icon={<Home className="h-5 w-5" />}
              iconPosition="left"
              className="w-full sm:min-w-[200px]"
            >
              Back to Home
            </Button>
          </Link>

          <Link to={PATHS.ALL_DEALS}>
            <Button
              variant="secondary"
              size="lg"
              icon={<Search className="h-5 w-5" />}
              iconPosition="left"
              className="w-full sm:min-w-[200px]"
            >
              Browse Hot Deals
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-12 grid max-w-lg grid-cols-1 gap-6 md:grid-cols-2"
        >
          <Link
            to={PATHS.HOME}
            className="border-neutral-border/20 group rounded-xl border bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-brand-primary-100 group-hover:bg-brand-primary-200 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                <Home className="text-brand-primary-600 h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-neutral-text-primary font-semibold">
                  Home Page
                </h3>
                <p className="text-neutral-text-secondary text-sm">
                  There's no place like home...
                </p>
              </div>
            </div>
            <ArrowLeft className="text-neutral-text-secondary group-hover:text-neutral-text-primary ml-auto h-4 w-4 transition-colors" />
          </Link>

          <Link
            to={PATHS.ALL_DEALS}
            className="border-neutral-border/20 group rounded-xl border bg-white/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-accent-orange-100 group-hover:bg-accent-orange-200 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                <Search className="text-accent-orange-600 h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-neutral-text-primary font-semibold">
                  Hot Deals
                </h3>
                <p className="text-neutral-text-secondary text-sm">
                  Where we talk the talk
                </p>
              </div>
            </div>
            <ArrowLeft className="text-neutral-text-secondary group-hover:text-neutral-text-primary ml-auto h-4 w-4 transition-colors" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
