import type { Config } from "tailwindcss";
import { colors } from "./src/lib/design-system/colors";
import { typography } from "./src/lib/design-system/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: colors,
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      fontSize: {
        "6xl": typography.fontSize["6xl"],
        "5xl": typography.fontSize["5xl"],
        "4xl": typography.fontSize["4xl"],
        "3xl": typography.fontSize["3xl"],
        "2xl": typography.fontSize["2xl"],
        xl: typography.fontSize.xl,
        lg: typography.fontSize.lg,
        base: typography.fontSize.base,
        sm: typography.fontSize.sm,
        xs: typography.fontSize.xs,
      },
      fontWeight: {
        light: typography.fontWeight.light,
        normal: typography.fontWeight.normal,
        medium: typography.fontWeight.medium,
        semibold: typography.fontWeight.semibold,
        bold: typography.fontWeight.bold,
        extrabold: typography.fontWeight.extrabold,
        black: typography.fontWeight.black,
      },
      lineHeight: {
        tight: typography.lineHeight.tight,
        snug: typography.lineHeight.snug,
        normal: typography.lineHeight.normal,
        relaxed: typography.lineHeight.relaxed,
        loose: typography.lineHeight.loose,
      },
      letterSpacing: {
        tighter: typography.letterSpacing.tighter,
        tight: typography.letterSpacing.tight,
        normal: typography.letterSpacing.normal,
        wide: typography.letterSpacing.wide,
        wider: typography.letterSpacing.wider,
      },
      // Minimum touch target size (44px)
      minHeight: {
        touch: "44px",
        button: "40px", // PandaDoc standard button
        "button-lg": "50px", // PandaDoc large button
      },
      minWidth: {
        touch: "44px",
      },
      // Border radius (PandaDoc-inspired)
      borderRadius: {
        sm: "4px", // PandaDoc standard
        DEFAULT: "4px",
        md: "8px", // PandaDoc medium
        lg: "8px",
        xl: "16px", // PandaDoc pill-shaped
        "2xl": "16px",
      },
      // Transition duration (PandaDoc-inspired)
      transitionDuration: {
        DEFAULT: "250ms", // PandaDoc standard
      },
      // Spacing for generous whitespace
      spacing: {
        18: "4.5rem", // 72px
        22: "5.5rem", // 88px
        26: "6.5rem", // 104px
      },
    },
  },
  plugins: [],
};

export default config;
