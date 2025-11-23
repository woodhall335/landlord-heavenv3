/**
 * Landlord Heaven - Color Palette
 * Based on /docs/STYLE_GUIDE.md
 *
 * Design Philosophy: Professional, approachable, confidence-inspiring
 * Inspired by: PandaDoc's clean, modern, spacious design
 * Updated: 2025 - PandaDoc-inspired teal color scheme
 */

export const colors = {
  // Primary - Purple (PandaDoc style)
  primary: {
    DEFAULT: "#7C3AED", // PandaDoc purple - Modern, professional
    dark: "#6D28D9", // Darker purple - Hover states
    light: "#A78BFA", // Lighter purple - Accents
    subtle: "#F5F3FF", // Very light purple - Backgrounds
    50: "#F5F3FF",
    100: "#EDE9FE",
    200: "#DDD6FE",
    500: "#7C3AED",
    600: "#6D28D9",
  },

  // Charcoal - Headlines & Important Text (PandaDoc-style)
  charcoal: {
    DEFAULT: "#1A1A1A", // Deep charcoal - Strong contrast, readable
    light: "#4A5568", // Medium gray - Body text
  },

  // Secondary - Emerald Green (PandaDoc exact match)
  secondary: {
    DEFAULT: "#00A36C", // PandaDoc emerald green - Exact match
    dark: "#008C5C", // Darker green - Hover
    light: "#6EE7B7", // Light green - Backgrounds
    subtle: "#D1FAE5", // Very light green - Section backgrounds
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    500: "#00A36C",
    600: "#008C5C",
  },

  // Warning - Amber for Attention
  warning: {
    DEFAULT: "#f59e0b", // Amber 500 - Important notices
    light: "#fef3c7", // Amber 100 - Warning backgrounds
    bg: "#fef3c7",
  },

  // Status Colors
  success: {
    DEFAULT: "#00A36C", // PandaDoc emerald green
    bg: "#D1FAE5", // Light green
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
  black: "#1A1A1A", // Deep charcoal for better consistency

  // Dark sections (PandaDoc-style)
  dark: {
    DEFAULT: "#2B2D42", // Dark navy/charcoal for hero sections
    light: "#3A3D52", // Lighter dark for variety
    bg: "#1F2033", // Extra dark for contrast sections
  },
};

export type ColorKey = keyof typeof colors;
export type Color = typeof colors;
