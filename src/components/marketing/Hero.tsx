/**
 * Marketing Hero Component
 *
 * Standardized hero section matching the homepage styling exactly.
 * Used across all marketing pages for consistent brand experience.
 *
 * Homepage gradient: bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { clsx } from "clsx";

export interface HeroAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface TrustIndicator {
  icon: React.ReactNode;
  text: string;
}

export interface HeroProps {
  /** Main headline - required */
  title: string | React.ReactNode;
  /** Subtitle/description - optional */
  subtitle?: string | React.ReactNode;
  /** Badge/eyebrow text - optional */
  badge?: string;
  /** Primary CTA button */
  primaryAction?: HeroAction;
  /** Secondary CTA button */
  secondaryAction?: HeroAction;
  /** Trust indicators shown below CTAs */
  trustIndicators?: TrustIndicator[];
  /** Optional content below the title (e.g., social proof counter) */
  children?: React.ReactNode;
  /** Background variant - default matches homepage purple gradient */
  variant?: "default" | "blog";
  /** Text alignment */
  align?: "center" | "left";
  /** Max width constraint for content */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

/**
 * Standardized Hero component matching homepage styling.
 *
 * @example
 * ```tsx
 * <Hero
 *   badge="Trusted by UK Landlords"
 *   title={<>Legal Documents <span className="text-primary">in Minutes</span></>}
 *   subtitle="Generate compliant eviction notices, court forms, and tenancy agreements"
 *   primaryAction={{ label: "Get Started →", href: "/wizard" }}
 *   secondaryAction={{ label: "View Pricing →", href: "/pricing" }}
 * />
 * ```
 */
export function Hero({
  title,
  subtitle,
  badge,
  primaryAction,
  secondaryAction,
  trustIndicators,
  children,
  variant = "default",
  align = "center",
  maxWidth = "3xl",
}: HeroProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  const alignmentClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <section className={clsx("relative pt-28 pb-16 md:pt-32 md:pb-36 overflow-hidden")}>
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/herobg.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <Container className="relative z-10">
        <div className={clsx(maxWidthClass, alignmentClass)}>
          {/* Badge */}
          {badge && (
            <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-primary">{badge}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}

          {/* CTA Buttons */}
          {(primaryAction || secondaryAction) && (
            <div
              className={clsx(
                "flex flex-col sm:flex-row gap-3 mb-6",
                align === "center" ? "items-center justify-center" : "items-start"
              )}
            >
              {primaryAction && (
                <Link href={primaryAction.href} className="hero-btn-primary">
                  {primaryAction.label}
                </Link>
              )}
              {secondaryAction && (
                <Link href={secondaryAction.href} className="hero-btn-secondary">
                  {secondaryAction.label}
                </Link>
              )}
            </div>
          )}

          {/* Custom children (e.g., social proof counter) */}
          {children}

          {/* Trust Indicators */}
          {trustIndicators && trustIndicators.length > 0 && (
            <div
              className={clsx(
                "flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500",
                align === "center" ? "items-center justify-center" : "items-start"
              )}
            >
              {trustIndicators.map((indicator, index) => (
                <span key={index} className="flex items-center gap-1.5">
                  {indicator.icon}
                  {indicator.text}
                </span>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export default Hero;
