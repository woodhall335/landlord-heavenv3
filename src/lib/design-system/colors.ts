/**
 * Landlord Heaven - Color Palette
 * Based on /docs/STYLE_GUIDE.md
 *
 * Design Philosophy: Professional, approachable, confidence-inspiring
 * Inspired by: PandaDoc's clean, modern, spacious design
 * Updated: 2025 - PandaDoc-inspired teal color scheme
 */

export const colors = {
  // Primary - Professional Teal (PandaDoc-inspired)
  primary: {
    DEFAULT: "#248567", // PandaDoc teal - Professional, trustworthy
    dark: "#136a50", // Darker teal - Hover states
    light: "#2ea67a", // Lighter teal - Accents
    subtle: "#e6f4f0", // Very light teal - Backgrounds
    50: "#f0f9f6",
    100: "#e6f4f0",
    200: "#c7e8dc",
    500: "#248567",
    600: "#136a50",
  },

  // Charcoal - Headlines & Important Text (PandaDoc-style)
  charcoal: {
    DEFAULT: "#242424", // PandaDoc black - Strong contrast, readable
    light: "#4b5563", // Medium gray - Body text
  },

  // Secondary - Teal for consistency
  secondary: {
    DEFAULT: "#248567", // Match primary for consistency
    dark: "#136a50", // Hover
    light: "#2ea67a", // Subtle highlights
  },

  // Warning - Amber for Attention
  warning: {
    DEFAULT: "#f59e0b", // Amber 500 - Important notices
    light: "#fef3c7", // Amber 100 - Warning backgrounds
    bg: "#fef3c7",
  },

  // Status Colors
  success: {
    DEFAULT: "#248567", // Teal - Same as primary
    bg: "#e6f4f0", // Light teal
  },
  error: {
    DEFAULT: "#e84e4e", // PandaDoc red - Errors, destructive
    bg: "#fee2e2", // Red 100
  },
  info: {
    DEFAULT: "#3b82f6", // Blue 500 - Information
    bg: "#dbeafe", // Blue 100
  },

  // Grays for UI (PandaDoc-inspired)
  gray: {
    50: "#f9fafb", // Page backgrounds
    100: "#f3f5f6", // PandaDoc light grey - Card backgrounds
    200: "#e5e7eb", // Borders
    300: "#c8cfd3", // PandaDoc grey-50 - Disabled states
    400: "#9ca3af", // Placeholder text
    500: "#6b7280", // Secondary text
    600: "#4b5563", // Body text
    700: "#374151", // Dark body text
    800: "#242424", // PandaDoc black - Headlines
    900: "#111827", // Extra dark text
  },

  // Pure
  white: "#ffffff",
  black: "#242424", // Updated to PandaDoc's black for better consistency
};

export type ColorKey = keyof typeof colors;
export type Color = typeof colors;
