// import { DashboardPreview } from './DashboardPreview';
// import { HeroBackground } from './HeroBackground';
// import { DynamicHeadline } from './DynamicHeadline';
// import { HeroCallToAction } from './HeroCallToAction';
// import { motion } from 'framer-motion';

// export const HeroSection = () => {
//   return (
//     <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-brand-primary-light via-brand-primary-50 to-white pt-20">
//       <HeroBackground />

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
//         className="container relative z-10 mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20"
//       >
//         <div className="mx-auto max-w-4xl">
//           <DynamicHeadline />
//           <p className="mx-auto mt-6 max-w-2xl px-4 text-lg leading-relaxed text-neutral-text-primary sm:mt-8 sm:px-0 sm:text-xl">
//             Stop scrolling endless review sites. CitySpark shows you a live map
//             of exclusive deals and happy hours from top-rated local spots, ready
//             for you right now.
//           </p>
//         </div>

//         <HeroCallToAction />
//       </motion.div>
//       <DashboardPreview />
//     </section>
//   );
// };

// web/src/components/landing/HeroSection.tsx

import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative flex h-screen min-h-[700px] w-full items-center justify-center overflow-hidden text-center">
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=2070&auto=format&fit=crop"
          alt="Cozy restaurant interior"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
        className="container relative z-10 mx-auto px-4"
      >
        <h1 className="text-4xl font-extrabold text-white shadow-lg sm:text-5xl md:text-6xl">
          Find your next favorite spot
        </h1>

        {/* <DealFinder /> */}
      </motion.div>
    </section>
  );
};
