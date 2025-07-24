import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import designSystem from './src/config/design-system.json';

const { typography, spacing, borders, shadows } = designSystem;

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
      colors: {
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

        brand: {
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
        'accent': {
          urgent: 'hsl(var(--accent-urgent-main))',
          secondary: 'hsl(var(--accent-secondary-main))',
          gamification: 'hsl(var(--accent-gamification-main))',
          spark: 'hsl(var(--accent-spark-main))',
          claude: {
            main: 'hsl(var(--accent-claude-main))',
            light: 'hsl(var(--accent-claude-light))',
          },
          orange: {
            100: 'hsl(var(--accent-orange-100))',
            200: 'hsl(var(--accent-orange-200))',
            400: 'hsl(var(--accent-orange-400))',
            600: 'hsl(var(--accent-orange-600))',
          },
          purple: {
            400: 'hsl(var(--accent-purple-400))',
          },
        },
        neutral: {
          background: 'hsl(var(--neutral-background))',
          surface: 'hsl(var(--neutral-surface))',
          'text-primary': 'hsl(var(--neutral-text-primary))',
          'text-secondary': 'hsl(var(--neutral-text-secondary))',
          'text-tertiary': 'hsl(var(--neutral-text-tertiary))',
          border: 'hsl(var(--neutral-border))',
          'border-light': 'hsl(var(--neutral-border-light))',
          'subtle-background': 'hsl(var(--neutral-subtle-background))',
        },
        semantic: {
          error: 'hsl(var(--semantic-error))',
          success: 'hsl(var(--semantic-success))',
          warning: 'hsl(var(--semantic-warning))',
          info: 'hsl(var(--semantic-info))',
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
        ...borders.radius,
      },
      fontFamily: {
        heading: typography.fontFamily.headings.split(', '),
        body: typography.fontFamily.body.split(', '),
      },
      fontSize: {
        ...Object.fromEntries(
          Object.entries(typography.scale).map(([key, value]) => [
            key,
            [value.fontSize, { lineHeight: value.lineHeight, fontWeight: value.fontWeight }],
          ]),
        ),
      },
      spacing: {
        ...spacing,
      },
      boxShadow: {
        'level-1': shadows.level1,
        'level-2': shadows.level2,
        'level-3': shadows.level3,
        'interactive': shadows.interactive,
      },
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