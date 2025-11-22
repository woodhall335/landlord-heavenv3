/**
 * Landlord Heaven - Color Palette
 * Based on /docs/STYLE_GUIDE.md
 *
 * Design Philosophy: Professional, approachable, confidence-inspiring
 * Inspired by: PandaDoc's clean, modern, spacious design
 */

export const colors = {
  // Primary - Landlord Heaven Green
  primary: {
    DEFAULT: "#10b981", // Emerald 500 - Trust, growth, success
    dark: "#059669", // Emerald 600 - Hover states
    light: "#34d399", // Emerald 400 - Accents
    subtle: "#d1fae5", // Emerald 100 - Backgrounds
  },

  // Charcoal - Headlines & Important Text
  charcoal: {
    DEFAULT: "#1f2937", // Gray 800 - Strong contrast
    light: "#374151", // Gray 700 - Body text
  },

  // Secondary - Indigo for Interactive Elements
  secondary: {
    DEFAULT: "#6366f1", // Indigo 500 - Links, actions
    dark: "#4f46e5", // Indigo 600 - Hover
    light: "#a5b4fc", // Indigo 300 - Subtle highlights
  },

  // Warning - Amber for Attention
  warning: {
    DEFAULT: "#f59e0b", // Amber 500 - Important notices
    light: "#fef3c7", // Amber 100 - Warning backgrounds
    bg: "#fef3c7",
  },

  // Status Colors
  success: {
    DEFAULT: "#10b981", // Emerald 500 - Same as primary
    bg: "#d1fae5", // Emerald 100
  },
  error: {
    DEFAULT: "#ef4444", // Red 500 - Errors, destructive
    bg: "#fee2e2", // Red 100
  },
  info: {
    DEFAULT: "#3b82f6", // Blue 500 - Information
    bg: "#dbeafe", // Blue 100
  },

  // Grays for UI
  gray: {
    50: "#f9fafb", // Page backgrounds
    100: "#f3f4f6", // Card backgrounds
    200: "#e5e7eb", // Borders
    300: "#d1d5db", // Disabled states
    400: "#9ca3af", // Placeholder text
    500: "#6b7280", // Secondary text
    600: "#4b5563", // Body text
    700: "#374151", // Dark body text
    800: "#1f2937", // Headlines
    900: "#111827", // Extra dark text
  },

  // Pure
  white: "#ffffff",
  black: "#000000",
};

export type ColorKey = keyof typeof colors;
export type Color = typeof colors;
