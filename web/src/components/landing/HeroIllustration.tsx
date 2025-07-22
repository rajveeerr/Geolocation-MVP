import { Utensils, Coffee, ShoppingBag, Ticket } from 'lucide-react';

export const HeroIllustration = () => {
  return (
    <div className="relative mx-auto mt-12 w-full max-w-5xl">
      <div
        className="aspect-[16/9] w-full rounded-lg bg-gray-900/5 p-2"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, #3b82f61a, transparent 70%)',
        }}
      >
        <div className="h-full w-full rounded-md border border-neutral-border/20 bg-white/50 p-4 shadow-inner">
          <svg
            viewBox="0 0 800 450"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            <defs>
              <radialGradient
                id="glow"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
              </radialGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="2" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Cityscape Silhouette */}
            <path
              d="M0 450 L0 380 L50 350 L80 380 L120 340 L150 390 L200 350 L250 400 L300 360 L320 380 L350 330 L400 380 L450 320 L500 390 L550 350 L600 410 L650 360 L700 390 L750 340 L800 380 L800 450 Z"
              fill="#E0E6E8"
              opacity="0.6"
            />
            <path
              d="M0 450 L0 400 L40 380 L90 410 L130 380 L180 420 L220 390 L280 430 L310 400 L360 420 L420 380 L480 410 L530 370 L580 400 L640 360 L690 400 L740 370 L800 390 L800 450 Z"
              fill="#F4F7F9"
              opacity="0.8"
            />

            {/* Connection Lines */}
            <path
              d="M 200 150 Q 300 250 400 200"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5 5"
              opacity="0.5"
            />
            <path
              d="M 400 200 Q 480 120 600 180"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5 5"
              opacity="0.5"
            />
             <path
              d="M 200 150 Q 350 80 500 100"
              stroke="#3b82f6"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5 5"
              opacity="0.3"
            />

            {/* Deal Pins (Sparks) */}
            <g transform="translate(200 150)" filter="url(#shadow)">
              <circle cx="0" cy="0" r="30" fill="white" />
              <circle cx="0" cy="0" r="25" fill="#FF3B5C" />
              <Utensils x="-12" y="-12" width="24" height="24" color="white" />
            </g>

            <g transform="translate(400 200)" filter="url(#shadow)">
              <circle cx="0" cy="0" r="30" fill="white" />
              <circle cx="0" cy="0" r="25" fill="#F5A623" />
              <Coffee x="-12" y="-12" width="24" height="24" color="white" />
            </g>

            <g transform="translate(600 180)" filter="url(#shadow)">
              <circle cx="0" cy="0" r="20" fill="white" />
              <circle cx="0" cy="0" r="16" fill="#7ED321" />
              <ShoppingBag
                x="-9"
                y="-9"
                width="18"
                height="18"
                color="white"
              />
            </g>

            <g transform="translate(500 100)" filter="url(#shadow)">
              <circle cx="0" cy="0" r="20" fill="white" />
              <circle cx="0" cy="0" r="16" fill="#4A90E2" />
              <Ticket x="-9" y="-9" width="18" height="18" color="white" />
            </g>

             <g transform="translate(320 280)">
                <circle cx="0" cy="0" r="40" fill="url(#glow)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};