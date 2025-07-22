import { Link } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ArrowLeft, Home, Search } from 'lucide-react';
import { PATHS } from '@/routing/paths';
import { motion } from 'framer-motion';
import { Logo } from '@/components/common/Logo';

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
          className="absolute top-20 left-10 w-16 h-16 bg-blue-100 rounded-full opacity-60"
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
          className="absolute top-40 right-16 w-12 h-12 bg-orange-100 rounded-lg opacity-50"
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
          className="absolute bottom-32 left-20 w-8 h-8 bg-blue-200 rounded-full opacity-40"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Logo-based 404 Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative mx-auto w-80 h-80 mb-8 flex items-center justify-center">
            {/* Large 404 Background */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-[200px] font-bold text-neutral-text-secondary select-none">
                404
              </span>
            </motion.div>
            
            {/* Animated Logo in Center */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ 
                duration: 1, 
                delay: 0.5,
                type: "spring",
                stiffness: 100 
              }}
              className="relative z-10 transform scale-150"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Logo />
              </motion.div>
            </motion.div>

            {/* Floating Sparkles around Logo */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-8 left-8 w-3 h-3 bg-blue-400 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.8, 0.3],
                rotate: [360, 180, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute top-16 right-12 w-2 h-2 bg-orange-400 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.9, 0.4],
                rotate: [0, 90, 180]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-12 left-16 w-2.5 h-2.5 bg-purple-400 rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6],
                rotate: [180, 360, 540]
              }}
              transition={{ 
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
              className="absolute bottom-8 right-8 w-2 h-2 bg-green-400 rounded-full"
            />

            {/* Orbiting Elements */}
            <motion.div
              animate={{ 
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full opacity-60"></div>
              </div>
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [360, 0]
              }}
              transition={{ 
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-4"
            >
              <div className="relative w-full h-full">
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-orange-500 rounded-full opacity-50"></div>
              </div>
            </motion.div>
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
          
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-text-primary mb-6">
            Oops! Page not found
          </h1>
          
          <p className="text-lg text-neutral-text-secondary mb-8 max-w-md mx-auto">
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
              className="min-w-[200px]"
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
              className="min-w-[200px]"
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
