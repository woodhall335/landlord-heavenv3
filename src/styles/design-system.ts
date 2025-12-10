/**
 * Design System - Landlord Heaven V1
 * Inspired by modern legal tech aesthetic (PandaDoc style)
 *
 * This design system provides consistent colors, typography, spacing,
 * and visual elements across the entire platform.
 */

export const colors = {
  // Primary - Lilac/Purple (Ask Heaven branding) - PandaDoc-style
  primary: {
    DEFAULT: '#7C3AED',  // Main brand color
    dark: '#6D28D9',     // Darker purple - Hover states
    light: '#A78BFA',    // Lighter purple - Accents
    subtle: '#faf5ff',   // Very light lilac - Backgrounds
    50: '#faf5ff',       // Lightest lilac
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#7C3AED',      // Main brand color
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Secondary - Emerald Green (PandaDoc match for success/completion)
  secondary: {
    DEFAULT: '#00A36C',  // PandaDoc emerald green
    dark: '#008C5C',     // Darker green - Hover
    light: '#6EE7B7',    // Light green - Backgrounds
    subtle: '#D1FAE5',   // Very light green - Section backgrounds
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    500: '#00A36C',
    600: '#008C5C',
  },

  // Charcoal - Headlines & Important Text (PandaDoc-style)
  charcoal: {
    DEFAULT: '#1A1A1A',  // Deep charcoal - Strong contrast
    light: '#4A5568',    // Medium gray - Body text
  },

  // Accent colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutrals
  gray: {
    50: '#f9fafb',      // Page backgrounds
    100: '#f3f5f6',     // PandaDoc light grey - Card backgrounds
    200: '#e5e7eb',     // Borders
    300: '#c8cfd3',     // PandaDoc grey-50 - Disabled states
    400: '#9ca3af',     // Placeholder text
    500: '#6b7280',     // Secondary text
    600: '#4b5563',     // Body text
    700: '#374151',     // Dark body text
    800: '#242424',     // PandaDoc black - Headlines
    900: '#111827',     // Extra dark text
  },

  // Background colors (PandaDoc section colors)
  lavender: {
    DEFAULT: '#F3F1FF',  // Light purple hero backgrounds
    50: '#FDFCFF',
    100: '#F3F1FF',
    200: '#E9E5FF',
  },

  cream: {
    DEFAULT: '#F9F7F4',  // Beige/cream alternating sections
    50: '#FDFCFA',
    100: '#F9F7F4',
  },

  // Pure
  white: '#ffffff',
  black: '#1A1A1A',  // Deep charcoal for better consistency

  // Dark sections (PandaDoc-style)
  dark: {
    DEFAULT: '#2B2D42',  // Dark navy/charcoal for hero sections
    light: '#3A3D52',    // Lighter dark for variety
    bg: '#1F2033',       // Extra dark for contrast sections
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
  },

  fontSize: {
    // Display - Hero Headlines (PandaDoc-style bold)
    '6xl': '4rem',       // 64px - Hero (larger, bolder)
    '5xl': '3.5rem',     // 56px - Page hero
    '4xl': '2.5rem',     // 40px - Section headers

    // Headlines (increased for impact)
    '3xl': '2rem',       // 32px - H1
    '2xl': '1.625rem',   // 26px - H2
    xl: '1.375rem',      // 22px - H3
    lg: '1.125rem',      // 18px - H4, Large body

    // Body
    base: '1rem',        // 16px - Body text
    sm: '0.875rem',      // 14px - Secondary text
    xs: '0.75rem',       // 12px - Captions, legal

    // Aliases for convenience
    hero: '3.5rem',      // 56px - Main hero headings
    h1: '2.5rem',        // 40px
    h2: '2rem',          // 32px
    h3: '1.5rem',        // 24px
    h4: '1.25rem',       // 20px
    body: '1rem',        // 16px
    small: '0.875rem',   // 14px
  },

  fontWeight: {
    light: 300,          // Rare use, large text only
    normal: 400,         // Body text
    medium: 500,         // Emphasis, buttons
    semibold: 600,       // Subheadings, navigation
    bold: 700,           // Headlines, strong emphasis
    extrabold: 800,      // Hero text, major CTAs (PandaDoc-style impact)
    black: 900,          // Extra bold for maximum impact
  },

  lineHeight: {
    tight: 1.2,          // Headlines
    snug: 1.375,         // Subheadings
    normal: 1.5,         // Body text
    relaxed: 1.625,      // Long-form content
    loose: 1.75,         // Legal text, disclaimers
  },

  letterSpacing: {
    tighter: '-0.05em',  // Display text
    tight: '-0.025em',   // Headlines
    normal: '0em',       // Body text
    wide: '0.025em',     // Uppercase labels
    wider: '0.05em',     // All-caps buttons
  },
};

export const spacing = {
  hero: '5rem',      // Generous hero padding
  section: '4rem',   // Between major sections
  card: '1.5rem',    // Inside cards
  element: '1rem',   // Between elements
};

export const borderRadius = {
  sm: '0.375rem',   // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Component Variants
 * Pre-defined styling patterns for common components
 */
export const variants = {
  button: {
    primary: {
      base: 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
      color: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-4 focus:ring-primary-200',
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
    },
    secondary: {
      base: 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
      color: 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 focus:ring-4 focus:ring-primary-200',
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
    },
    ghost: {
      base: 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200',
      color: 'text-primary-600 hover:bg-primary-50 focus:ring-4 focus:ring-primary-200',
      size: {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
      },
    },
  },

  input: {
    base: 'block w-full rounded-lg border transition-all duration-200',
    default: 'border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-200',
    error: 'border-error-500 focus:border-error-500 focus:ring-4 focus:ring-error-200',
    size: {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    },
  },

  card: {
    base: 'rounded-2xl border bg-white transition-all duration-200',
    default: 'border-gray-200 shadow-sm hover:shadow-md',
    highlighted: 'border-primary-200 shadow-md',
    interactive: 'border-gray-200 shadow-sm hover:border-primary-300 hover:shadow-lg cursor-pointer',
  },
};

/**
 * Animation Utilities
 */
export const animations = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  scaleIn: 'animate-scaleIn',
};

/**
 * Grid System
 */
export const grid = {
  container: 'mx-auto max-w-7xl px-6 lg:px-8',
  cols: {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 md:grid-cols-2',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  },
  gap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  },
};

/**
 * Z-Index Scale
 * Ensures consistent layering across the application
 */
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  tooltip: 50,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  variants,
  animations,
  grid,
  zIndex,
};
