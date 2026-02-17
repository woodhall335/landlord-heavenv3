/**
 * StandardHero - Unified Hero Component
 *
 * Gold standard hero component matching homepage styling.
 * Use this for all marketing/informational pages to ensure visual consistency.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { clsx } from "clsx";

export interface StandardHeroCTA {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface StandardHeroProps {
  /** Badge/eyebrow text above title */
  badge?: string;
  /** Badge icon (React node, placed before badge text) */
  badgeIcon?: React.ReactNode;
  /** Main title - can be string or ReactNode for custom formatting */
  title: React.ReactNode;
  /** Render title as h1 or h2 (default h1) */
  titleAs?: "h1" | "h2";
  /** Subtitle/description below title */
  subtitle?: React.ReactNode;
  /** Primary CTA button */
  primaryCTA?: StandardHeroCTA;
  /** Secondary CTA button */
  secondaryCTA?: StandardHeroCTA;
  /** Content alignment */
  align?: "left" | "center";
  /** Background variant */
  variant?: "pastel" | "white";
  /** Additional content below subtitle (trust badges, social proof, etc.) */
  children?: React.ReactNode;
  /** Custom className for the section */
  className?: string;
}

/**
 * Renders a CTA button/link with proper styling
 */
function CTAButton({
  cta,
  variant,
}: {
  cta: StandardHeroCTA;
  variant: "primary" | "secondary";
}) {
  const className = clsx(
    "inline-flex items-center justify-center gap-2",
    variant === "primary" ? "hero-btn-primary" : "hero-btn-secondary"
  );

  if (cta.href) {
    return (
      <Link href={cta.href} className={className}>
        {cta.label}
      </Link>
    );
  }

  return (
    <button onClick={cta.onClick} className={className}>
      {cta.label}
    </button>
  );
}

/**
 * StandardHero component - use for all marketing pages
 *
 * @example
 * ```tsx
 * <StandardHero
 *   badge="Transparent Pricing"
 *   title="Simple, Transparent Pricing"
 *   subtitle="No hidden fees. No surprises."
 *   primaryCTA={{ label: "Get Started", href: "/wizard" }}
 *   secondaryCTA={{ label: "View Products", href: "/products" }}
 *   variant="pastel"
 * >
 *   <TrustBadges />
 * </StandardHero>
 * ```
 */
export function StandardHero({
  badge,
  badgeIcon,
  title,
  titleAs = "h1",
  subtitle,
  primaryCTA,
  secondaryCTA,
  align = "center",
  variant = "pastel",
  children,
  className,
}: StandardHeroProps) {
  const TitleTag = titleAs;

  const alignmentClass = align === "center" ? "text-center mx-auto" : "text-left";
  const subtitleAlignClass = align === "center" ? "mx-auto" : "";

  return (
    <section
      className={clsx(
        "relative pt-28 pb-16 md:pt-32 md:pb-36 overflow-hidden",
        variant === "white" ? "bg-white" : "",
        className
      )}
    >
      {/* Background Image */}
      {variant === "pastel" && (
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/bg5.webp"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      )}

      <Container className="relative z-10">
        <div className={clsx("max-w-3xl", alignmentClass)}>
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              {badgeIcon}
              <span className="text-sm font-semibold text-primary">{badge}</span>
            </div>
          )}

          {/* Title */}
          <TitleTag className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            {title}
          </TitleTag>

          {/* Subtitle */}
          {subtitle && (
            <p className={clsx("text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl", subtitleAlignClass)}>
              {subtitle}
            </p>
          )}

          {/* CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <div
              className={clsx(
                "flex flex-col sm:flex-row gap-3 mb-6",
                align === "center" ? "items-center justify-center" : "items-start"
              )}
            >
              {primaryCTA && <CTAButton cta={primaryCTA} variant="primary" />}
              {secondaryCTA && <CTAButton cta={secondaryCTA} variant="secondary" />}
            </div>
          )}

          {/* Additional content (trust badges, social proof, etc.) */}
          {children}
        </div>
      </Container>
    </section>
  );
}

export default StandardHero;
