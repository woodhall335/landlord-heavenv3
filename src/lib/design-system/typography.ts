/**
 * Landlord Heaven - Typography System
 * Based on /docs/STYLE_GUIDE.md
 *
 * Primary Font: Inter - Clean, modern, professional
 * Monospace: JetBrains Mono - For code, data, legal refs
 */

export const typography = {
  fontFamily: {
    primary: "var(--font-inter)",
    mono: "var(--font-jetbrains)",
  },

  fontSize: {
    // Display - Hero Headlines (PandaDoc-style bold)
    "6xl": "4rem", // 64px - Hero (larger, bolder)
    "5xl": "3.5rem", // 56px - Page hero
    "4xl": "2.5rem", // 40px - Section headers

    // Headlines (increased for impact)
    "3xl": "2rem", // 32px - H1
    "2xl": "1.625rem", // 26px - H2
    xl: "1.375rem", // 22px - H3
    lg: "1.125rem", // 18px - H4, Large body

    // Body
    base: "1rem", // 16px - Body text
    sm: "0.875rem", // 14px - Secondary text
    xs: "0.75rem", // 12px - Captions, legal
  },

  fontWeight: {
    light: 300, // Rare use, large text only
    normal: 400, // Body text
    medium: 500, // Emphasis, buttons
    semibold: 600, // Subheadings, navigation
    bold: 700, // Headlines, strong emphasis
    extrabold: 800, // Hero text, major CTAs (PandaDoc-style impact)
    black: 900, // Extra bold for maximum impact
  },

  lineHeight: {
    tight: 1.2, // Headlines
    snug: 1.375, // Subheadings
    normal: 1.5, // Body text
    relaxed: 1.625, // Long-form content
    loose: 1.75, // Legal text, disclaimers
  },

  letterSpacing: {
    tighter: "-0.05em", // Display text
    tight: "-0.025em", // Headlines
    normal: "0em", // Body text
    wide: "0.025em", // Uppercase labels
    wider: "0.05em", // All-caps buttons
  },
};

export type Typography = typeof typography;

// Mobile adjustments (applied via Tailwind responsive classes)
export const mobileTypography = {
  "6xl": "2.5rem", // 40px
  "5xl": "2rem", // 32px
  "4xl": "1.75rem", // 28px
};

// Helper classes for common text styles
export const textStyles = {
  // Hero text (PandaDoc-style impact)
  hero: {
    fontSize: typography.fontSize["6xl"],
    fontWeight: typography.fontWeight.black,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tighter,
  },

  // Page headings (stronger emphasis)
  h1: {
    fontSize: typography.fontSize["3xl"],
    fontWeight: typography.fontWeight.extrabold,
    lineHeight: typography.lineHeight.tight,
  },

  h2: {
    fontSize: typography.fontSize["2xl"],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.snug,
  },

  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.snug,
  },

  // Body text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // Small text
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  // Legal / fine print
  legal: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.loose,
  },

  // Buttons (PandaDoc-style bold)
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.normal,
  },
};

export type TextStyles = typeof textStyles;
