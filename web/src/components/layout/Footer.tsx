// import { Link } from 'react-router-dom';
// import { Linkedin } from 'lucide-react';
// import { PATHS } from '@/routing/paths';
// import { Logo } from '../common/Logo';

// export const Footer = () => {
//   return (
//     <footer className="w-full border-t border-neutral-border bg-white py-8">
//       <div className="container mx-auto max-w-7xl px-6 md:px-8">
//         <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
//           <div className="col-span-2 md:col-span-2">
//             <Logo />
//             <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-text-secondary">
//               Discover live deals and exclusive experiences from top-rated local
//               businesses. Your real-time map to the city's best moments.
//             </p>
//             <div className="mt-6">
//               <div className="inline-flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-800">
//                 <div className="h-2 w-2 rounded-full bg-green-500"></div>
//                 Launching v1 soon
//               </div>
//             </div>
//           </div>

//           <div>
//             <h3 className="mb-4 font-medium text-neutral-text-primary">
//               Product
//             </h3>
//             <ul className="space-y-3">
//               <li>
//                 <Link
//                   to={PATHS.MAP}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   Live Map
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   to={PATHS.HOT_DEALS}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   Hot Deals
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   to={PATHS.PRICING}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   Pricing
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="mb-4 font-medium text-neutral-text-primary">
//               Business
//             </h3>
//             <ul className="space-y-3">
//               <li>
//                 <Link
//                   to={PATHS.FOR_BUSINESSES}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   For Businesses
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   to={PATHS.BUSINESS_SIGNUP}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   Claim Your Business
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   to={PATHS.BUSINESS_DASHBOARD}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   Business Login
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="mb-4 font-medium text-neutral-text-primary">
//               Company
//             </h3>
//             <ul className="space-y-3">
//               <li>
//                 <Link
//                   to={PATHS.ABOUT}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   About Us
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   to={PATHS.CONTACT}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   Contact
//                 </Link>
//               </li>
//               <li>
//                 <Link
//                   to={PATHS.SUPPORT}
//                   className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//                 >
//                   Support
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="flex flex-col items-center justify-between border-t border-neutral-border pt-8 sm:flex-row">
//           <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-0">
//             <span className="text-center text-sm text-neutral-text-secondary sm:text-left">
//               © {new Date().getFullYear()} CitySpark All rights reserved
//             </span>
//             <span className="hidden text-neutral-border sm:inline">·</span>
//             <Link
//               to={PATHS.PRIVACY}
//               className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//             >
//               Privacy Policy
//             </Link>
//             <span className="hidden text-neutral-border sm:inline">·</span>
//             <Link
//               to={PATHS.TERMS}
//               className="text-sm text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//             >
//               Terms of Service
//             </Link>
//           </div>

//           <div className="flex items-center gap-3">
//             <a
//               href="https://twitter.com"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//             >
//               <svg
//                 width="20"
//                 height="20"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   d="M18 6L6 18M6 6L18 18"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//               </svg>
//             </a>
//             <a
//               href="https://linkedin.com"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-neutral-text-secondary transition-colors hover:text-neutral-text-primary"
//             >
//               <Linkedin className="h-5 w-5" />
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// web/src/components/layout/Footer.tsx

import { Logo } from '../common/Logo';
import { Twitter, Instagram, Facebook } from 'lucide-react';

const socialLinks = [
    { href: "#", icon: <Twitter className="w-5 h-5" /> },
    { href: "#", icon: <Instagram className="w-5 h-5" /> },
    { href: "#", icon: <Facebook className="w-5 h-5" /> },
];

const galleryImages = [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&q=80",
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80",
];

export const Footer = () => {
  return (
    <footer className="bg-[#222222] text-neutral-400 font-sans">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-4">Latest News</h3>
            <p>For all the latest deals and app updates, follow us on Twitter: <a href="#" className="text-white hover:text-red-400 transition-colors">@CitySparkApp</a></p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="mb-4">
              {/* Note: The original logo component is complex. For a dark background, a simpler one might be needed. */}
              {/* For now, we use the existing one. */}
              <Logo />
            </div>
            <p className="max-w-xs text-center mb-4">
                Your real-time guide to the best deals and hidden gems in your city.
            </p>
            <div className="text-center">
                <p>+1 (234) 567-890</p>
                <p>hello@cityspark.app</p>
                <p>123 Spark Avenue, New York</p>
            </div>
            <div className="flex justify-center gap-5 mt-6">
                {socialLinks.map((link, index) => (
                    <a key={index} href={link.href} className="text-neutral-400 hover:text-white transition-colors">
                        {link.icon}
                    </a>
                ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-sm font-bold tracking-widest text-white uppercase mb-4">Discover Your City</h3>
            <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
                {galleryImages.map((src, index) => (
                    <div key={index} className="aspect-square bg-neutral-700 overflow-hidden">
                        <img src={src} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
          </div>

        </div>
      </div>

      <div className="border-t border-neutral-700">
          <div className="container mx-auto px-6 py-4">
            <p className="text-center text-sm text-neutral-500">
                © {new Date().getFullYear()} CitySpark. All Rights Reserved.
            </p>
          </div>
      </div>
    </footer>
  );
};