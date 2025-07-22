import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            main: '#2563EB',
            dark: '#1D4ED8',
            light: '#DBEAFE',
          },
        },
        accent: {
          urgent: '#FF3B5C',
          secondary: '#F5A623',
          gamification: '#7ED321',
          spark: '#F97316',
          claude: '#F97316',
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        neutral: {
          'subtle-background': '#F9FAFB',
          background: '#F4F7F9',
          surface: '#FFFFFF',
          'text-primary': '#111827',
          'text-secondary': '#6B7280',
          'text-tertiary': '#9CA3AF',
          border: '#E5E7EB',
          'border-light': '#F3F4F6',
        },
        semantic: {
          error: '#DC2626',
          success: '#059669',
          warning: '#D97706',
          info: '#2563EB',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Helvetica Neue', 'sans-serif'],
        body: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: [
          '3.5rem',
          {
            lineHeight: '1.1',
            fontWeight: '700',
          },
        ],
        h1: [
          '2rem',
          {
            lineHeight: '1.25',
            fontWeight: '700',
          },
        ],
        h2: [
          '1.5rem',
          {
            lineHeight: '1.3',
            fontWeight: '600',
          },
        ],
        h3: [
          '1.25rem',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
        body: [
          '1rem',
          {
            lineHeight: '1.5',
            fontWeight: '400',
          },
        ],
        'body-lg': [
          '1.125rem',
          {
            lineHeight: '1.6',
            fontWeight: '400',
          },
        ],
        'body-sm': [
          '0.875rem',
          {
            lineHeight: '1.5',
            fontWeight: '400',
          },
        ],
        label: [
          '0.875rem',
          {
            lineHeight: '1.4',
            fontWeight: '600',
          },
        ],
        caption: [
          '0.75rem',
          {
            lineHeight: '1.4',
            fontWeight: '400',
          },
        ],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'calc(var(--radius) - 2px)',
        lg: 'var(--radius)',
        pill: '9999px',
      },
      boxShadow: {
        'level-1': '0px 2px 4px rgba(0, 0, 0, 0.06)',
        'level-2': '0px 4px 8px rgba(0, 0, 0, 0.08)',
        'level-3': '0px 10px 20px rgba(0, 0, 0, 0.1)',
        interactive: '0 0 0 3px rgba(59, 130, 246, 0.3)',
      },
      transitionTimingFunction: {
        'ease-in-out': 'ease-in-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
