import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { motion } from 'framer-motion';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary-light via-blue-50 to-white flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute bottom-0 right-[4%] top-0 w-0.5 bg-blue-200/40"></div>
        <div className="absolute left-0 right-0 top-[10%] h-0.5 bg-blue-200/40"></div>
        
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-4 sm:left-10 w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full opacity-60"
        />
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -8, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-40 right-8 sm:right-16 w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg opacity-50"
        />
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-32 left-8 sm:left-20 w-6 h-6 sm:w-8 sm:h-8 bg-blue-200 rounded-full opacity-40"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Large Floating Logo SVG */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative mx-auto w-48 h-48 sm:w-64 sm:h-64 mb-8">
            {/* Central Floating Logo */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="transform scale-[2.5] sm:scale-[3] md:scale-[4] text-blue-500">
                <svg
                  viewBox="0 0 24 24"
                  className="w-12 h-12 sm:w-16 sm:h-16"
                  fill="currentColor"
                >
                  <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" />
                </svg>
                
                {/* Glow effect */}
                <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-12 sm:h-16 bg-blue-400 rounded-full opacity-30 blur-xl"></div>
                <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2 w-18 sm:w-24 h-6 sm:h-8 bg-blue-300 rounded-full opacity-50 blur-lg"></div>
              </div>
            </motion.div>

            {/* Floating Sparkles */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-2 sm:top-4 left-2 sm:left-4 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute top-8 sm:top-12 right-4 sm:right-8 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-400 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-4 sm:bottom-8 left-6 sm:left-12 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-sm font-medium text-neutral-text-secondary mb-4">
            You look a little lost...
          </p>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-neutral-text-primary mb-6 leading-tight">
            Oops! Page not found
          </h1>
          
          <p className="text-base sm:text-lg text-neutral-text-secondary mb-8 max-w-md mx-auto px-4 sm:px-0">
            The page you're looking for doesn't exist. Let's get you back on track to discover amazing deals near you.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to={PATHS.HOME}>
            <Button
              variant="primary"
              size="lg"
              icon={<Home className="w-5 h-5" />}
              iconPosition="left"
              className="w-full sm:min-w-[200px]"
            >
              Back to Home
            </Button>
          </Link>
          
          <Link to={PATHS.HOT_DEALS}>
            <Button
              variant="secondary"
              size="lg"
              icon={<Search className="w-5 h-5" />}
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
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto"
        >
          <Link
            to={PATHS.HOME}
            className="group p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-border/20 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-neutral-text-primary">Home Page</h3>
                <p className="text-sm text-neutral-text-secondary">There's no place like home...</p>
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-neutral-text-secondary group-hover:text-neutral-text-primary transition-colors ml-auto" />
          </Link>

          <Link
            to={PATHS.HOT_DEALS}
            className="group p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-neutral-border/20 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Search className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-neutral-text-primary">Hot Deals</h3>
                <p className="text-sm text-neutral-text-secondary">Where we talk the talk</p>
              </div>
            </div>
            <ArrowLeft className="w-4 h-4 text-neutral-text-secondary group-hover:text-neutral-text-primary transition-colors ml-auto" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
