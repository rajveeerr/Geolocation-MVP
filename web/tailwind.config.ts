import type { Config } from 'tailwindcss';

const config: Config = {
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
      },
      fontFamily: {
        heading: ['Poppins', 'Helvetica Neue', 'sans-serif'],
        body: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        h1: ['2rem', { lineHeight: '1.25', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        label: ['0.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
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
        sm: '8px',
        md: '12px',
        lg: '16px',
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
  plugins: [],
};

export default config;