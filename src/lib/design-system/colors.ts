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
    DEFAULT: "#16A085", // PandaDoc teal - Professional, trustworthy, vibrant
    dark: "#0E8A6D", // Darker teal - Hover states
    light: "#2ECC71", // Lighter teal - Accents
    subtle: "#E8F8F5", // Very light teal - Backgrounds
    50: "#E8F8F5",
    100: "#D1F2EB",
    200: "#A3E4D7",
    500: "#16A085",
    600: "#0E8A6D",
  },

  // Charcoal - Headlines & Important Text (PandaDoc-style)
  charcoal: {
    DEFAULT: "#1A1A1A", // Deep charcoal - Strong contrast, readable
    light: "#4A5568", // Medium gray - Body text
  },

  // Secondary - Purple/Lavender Accents (PandaDoc-style)
  secondary: {
    DEFAULT: "#8B7FD8", // Lavender - Accent color
    dark: "#6B5FC0", // Darker purple - Hover
    light: "#B8B1E8", // Light lavender - Backgrounds
    subtle: "#EBE9F7", // Very light lavender - Section backgrounds
    50: "#F5F4FB",
    100: "#EBE9F7",
    200: "#D7D3EF",
    500: "#8B7FD8",
    600: "#6B5FC0",
  },

  // Warning - Amber for Attention
  warning: {
    DEFAULT: "#f59e0b", // Amber 500 - Important notices
    light: "#fef3c7", // Amber 100 - Warning backgrounds
    bg: "#fef3c7",
  },

  // Status Colors
  success: {
    DEFAULT: "#16A085", // Teal - Same as primary
    bg: "#E8F8F5", // Light teal
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
