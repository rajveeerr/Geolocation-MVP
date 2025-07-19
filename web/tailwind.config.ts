import designSystem from './src/config/design-system.json';

const { palette, typography, spacing, borders, shadows } = designSystem;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      brand: {
        primary: palette.brand.primary.main,
        'primary-dark': palette.brand.primary.dark,
      },
      accent: {
        urgent: palette.accent.urgent.main,
        secondary: palette.accent.secondary.main,
        gamification: palette.accent.gamification.main,
      },
      neutral: {
        background: palette.neutral.background,
        surface: palette.neutral.surface,
        'text-primary': palette.neutral.text_primary,
        'text-secondary': palette.neutral.text_secondary,
        border: palette.neutral.border,
      },
      semantic: {
        error: palette.semantic.error,
        success: palette.semantic.success,
        warning: palette.semantic.warning,
      },
    },
    fontFamily: {
      heading: typography.fontFamily.headings.split(', '),
      body: typography.fontFamily.body.split(', '),
    },
    extend: {
      fontSize: {
        display: [
          typography.scale.display.fontSize,
          {
            lineHeight: typography.scale.display.lineHeight,
            fontWeight: typography.scale.display.fontWeight,
          },
        ],
        h1: [
          typography.scale.h1.fontSize,
          {
            lineHeight: typography.scale.h1.lineHeight,
            fontWeight: typography.scale.h1.fontWeight,
          },
        ],
        h2: [
          typography.scale.h2.fontSize,
          {
            lineHeight: typography.scale.h2.lineHeight,
            fontWeight: typography.scale.h2.fontWeight,
          },
        ],
        h3: [
          typography.scale.h3.fontSize,
          {
            lineHeight: typography.scale.h3.lineHeight,
            fontWeight: typography.scale.h3.fontWeight,
          },
        ],
        body: [
          typography.scale.body_default.fontSize,
          {
            lineHeight: typography.scale.body_default.lineHeight,
            fontWeight: typography.scale.body_default.fontWeight,
          },
        ],
        'body-sm': [
          typography.scale.body_small.fontSize,
          {
            lineHeight: typography.scale.body_small.lineHeight,
            fontWeight: typography.scale.body_small.fontWeight,
          },
        ],
        label: [
          typography.scale.label.fontSize,
          {
            lineHeight: typography.scale.label.lineHeight,
            fontWeight: typography.scale.label.fontWeight,
          },
        ],
        caption: [
          typography.scale.caption.fontSize,
          {
            lineHeight: typography.scale.caption.lineHeight,
            fontWeight: typography.scale.caption.fontWeight,
          },
        ],
        overline: [
          typography.scale.overline.fontSize,
          {
            lineHeight: typography.scale.overline.lineHeight,
            fontWeight: typography.scale.overline.fontWeight,
            textTransform: typography.scale.overline.textTransform,
          },
        ],
      },
      spacing: {
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        xxl: spacing.xxl,
      },
      borderRadius: {
        sm: borders.radius.sm,
        md: borders.radius.md,
        lg: borders.radius.lg,
        pill: borders.radius.pill,
        circle: borders.radius.circle,
      },
      boxShadow: {
        'level-1': shadows.level1,
        'level-2': shadows.level2,
        'level-3': shadows.level3,
        interactive: shadows.interactive,
      },
      transitionDuration: {
        DEFAULT: designSystem.transitions.duration,
      },
      transitionTimingFunction: {
        DEFAULT: designSystem.transitions.timingFunction,
      },
    },
  },
  plugins: [],
};
