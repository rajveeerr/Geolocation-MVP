import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

/* ================================================================
   Tailwind Configuration — Deal Hunt Design System
   ================================================================
   All custom values map to CSS custom properties defined in
   src/styles/global.css.  Never add raw hex colours here.
   ================================================================ */

const tailwindConfig: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      /* ===========================================================
         COLOURS
         =========================================================== */
      colors: {
        // --- Shadcn / Radix primitives ---
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // --- Brand scale ---
        brand: {
          DEFAULT: 'hsl(var(--brand-primary))',
          hover: 'hsl(var(--brand-primary-hover))',
          active: 'hsl(var(--brand-primary-active))',
          subtle: 'hsl(var(--brand-primary-subtle))',
          muted: 'hsl(var(--brand-primary-muted))',
          50: 'hsl(var(--brand-50))',
          100: 'hsl(var(--brand-100))',
          200: 'hsl(var(--brand-200))',
          300: 'hsl(var(--brand-300))',
          400: 'hsl(var(--brand-400))',
          500: 'hsl(var(--brand-500))',
          600: 'hsl(var(--brand-600))',
          700: 'hsl(var(--brand-700))',
          800: 'hsl(var(--brand-800))',
          900: 'hsl(var(--brand-900))',
          950: 'hsl(var(--brand-950))',
          // Legacy aliases — prefer the above going forward
          primary: {
            main: 'hsl(var(--brand-primary-main))',
            dark: 'hsl(var(--brand-primary-dark))',
            light: 'hsl(var(--brand-primary-light))',
            50: 'hsl(var(--brand-primary-50))',
            100: 'hsl(var(--brand-primary-100))',
            200: 'hsl(var(--brand-primary-200))',
            300: 'hsl(var(--brand-primary-300))',
            400: 'hsl(var(--brand-primary-400))',
            500: 'hsl(var(--brand-primary-500))',
            600: 'hsl(var(--brand-primary-600))',
            700: 'hsl(var(--brand-primary-700))',
            800: 'hsl(var(--brand-primary-800))',
            900: 'hsl(var(--brand-primary-900))',
          },
        },

        // --- Dark surfaces (deal cards, modals) ---
        'surface-dark': {
          DEFAULT: 'hsl(var(--surface-dark))',
          alt: 'hsl(var(--surface-dark-alt))',
          muted: 'hsl(var(--surface-dark-muted))',
          fg: 'hsl(var(--surface-dark-fg))',
        },

        // --- Surface variants ---
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          secondary: 'hsl(var(--surface-secondary))',
          tertiary: 'hsl(var(--surface-tertiary))',
        },

        // --- Neutral scale ---
        neutral: {
          50: 'hsl(var(--neutral-50))',
          100: 'hsl(var(--neutral-100))',
          200: 'hsl(var(--neutral-200))',
          300: 'hsl(var(--neutral-300))',
          400: 'hsl(var(--neutral-400))',
          500: 'hsl(var(--neutral-500))',
          600: 'hsl(var(--neutral-600))',
          700: 'hsl(var(--neutral-700))',
          800: 'hsl(var(--neutral-800))',
          900: 'hsl(var(--neutral-900))',
          950: 'hsl(var(--neutral-950))',
          text: {
            primary: 'hsl(var(--foreground))',
            secondary: 'hsl(var(--neutral-500))',
          },
        },

        // --- Semantic ---
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-fg))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-fg))',
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--error-fg))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-fg))',
        },
      },

      /* ===========================================================
         BORDER RADIUS
         =========================================================== */
      borderRadius: {
        // shadcn defaults (relative to --radius)
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        // Design-system scale (absolute)
        'dh-xs': 'var(--radius-xs)',
        'dh-sm': 'var(--radius-sm)',
        'dh-md': 'var(--radius-md)',
        'dh-lg': 'var(--radius-lg)',
        'dh-xl': 'var(--radius-xl)',
        'dh-2xl': 'var(--radius-2xl)',
        'dh-3xl': 'var(--radius-3xl)',
        'dh-full': 'var(--radius-full)',
      },

      /* ===========================================================
         BOX SHADOW
         =========================================================== */
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      },

      /* ===========================================================
         TYPOGRAPHY
         =========================================================== */
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },

      /* ===========================================================
         TRANSITIONS
         =========================================================== */
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '350ms',
        spring: '500ms',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      /* ===========================================================
         Z-INDEX
         =========================================================== */
      zIndex: {
        dropdown: '10',
        sticky: '20',
        overlay: '30',
        modal: '40',
        toast: '50',
      },

      /* ===========================================================
         ANIMATIONS  (shadcn / Radix)
         =========================================================== */
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default tailwindConfig;
