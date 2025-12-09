import type { Config } from "tailwindcss";
import designSystem from "./src/styles/design-system";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: designSystem.colors,
      fontFamily: {
        sans: ["var(--font-inter)", ...designSystem.typography.fontFamily.sans],
        mono: ["var(--font-jetbrains)", ...designSystem.typography.fontFamily.mono],
        display: designSystem.typography.fontFamily.display,
      },
      fontSize: designSystem.typography.fontSize,
      fontWeight: designSystem.typography.fontWeight,
      lineHeight: designSystem.typography.lineHeight,
      letterSpacing: designSystem.typography.letterSpacing,
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
        ...designSystem.borderRadius,
        "3xl": "32px",
        DEFAULT: "8px",
      },
      // Box shadows (PandaDoc-inspired)
      boxShadow: {
        ...designSystem.shadows,
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
        hero: designSystem.spacing.hero,
        section: designSystem.spacing.section,
        card: designSystem.spacing.card,
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
