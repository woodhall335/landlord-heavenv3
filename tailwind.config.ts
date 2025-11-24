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
      // Border radius (PandaDoc-inspired - more rounded)
      borderRadius: {
        sm: "6px", // PandaDoc standard
        DEFAULT: "8px",
        md: "10px", // PandaDoc medium
        lg: "12px",
        xl: "20px", // PandaDoc pill-shaped
        "2xl": "24px",
        "3xl": "32px",
      },
      // Box shadows (PandaDoc-inspired)
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.12)",
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
        28: "7rem", // 112px
        30: "7.5rem", // 120px
        88: "22rem", // 352px
        96: "24rem", // 384px
        112: "28rem", // 448px
        128: "32rem", // 512px
      },
      // Max width utilities for content sections
      maxWidth: {
        "8xl": "90rem", // 1440px
        "9xl": "96rem", // 1536px
      },
      // Background gradients (PandaDoc-style)
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-purple": "linear-gradient(135deg, #F3F1FF 0%, #E9E5FF 50%, #F3F1FF 100%)",
        "hero-lavender": "linear-gradient(to bottom right, #F3F1FF, #E9E5FF, #F3F1FF)",
        "cta-dark": "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
