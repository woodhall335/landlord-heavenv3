import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle?: string;
  description: string;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  badge?: string;
  variant?: 'primary' | 'secondary' | 'gradient';
}

/**
 * Hero Component
 *
 * A reusable hero section component with PandaDoc-inspired design.
 * Supports primary (gradient purple), secondary (light lavender), and gradient variants.
 *
 * @example
 * ```tsx
 * <Hero
 *   badge="Powered by Ask Heaven AI"
 *   title="Legal Documents for UK Landlords"
 *   description="Generate court-ready notices in minutes"
 *   ctaText="Get Started"
 *   ctaHref="/products/notice-only"
 *   secondaryCtaText="View Pricing"
 *   secondaryCtaHref="/pricing"
 * />
 * ```
 */
export function Hero({
  title,
  subtitle,
  description,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  badge,
  variant = 'primary',
}: HeroProps) {
  // Background styling based on variant
  const bgClass =
    variant === 'gradient'
      ? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700'
      : variant === 'secondary'
      ? ''
      : 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700';

  const textClass = variant === 'secondary' ? 'text-gray-900' : 'text-white';
  const subtitleClass =
    variant === 'secondary' ? 'text-primary-600' : 'text-primary-200';
  const descriptionClass =
    variant === 'secondary' ? 'text-gray-600' : 'text-primary-100';

  return (
    <section className={`relative overflow-hidden ${bgClass}`}>
      {/* Background Image for secondary variant */}
      {variant === 'secondary' && (
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/herobg.png"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      )}

      {/* Grid pattern overlay for depth (only on dark variants) */}
      {variant !== 'secondary' && (
        <div
          className="absolute inset-0 bg-[size:32px_32px]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          }}
        />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-16 md:pt-32 md:pb-36 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
          {/* Badge */}
          {badge && (
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              {badge}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className={`mb-4 text-lg font-medium ${subtitleClass}`}>
              {subtitle}
            </p>
          )}

          {/* Title */}
          <h1
            className={`mb-6 text-5xl font-extrabold tracking-tight ${textClass} sm:text-6xl lg:text-hero`}
          >
            {title}
          </h1>

          {/* Description */}
          <p className={`mb-10 text-xl leading-8 ${descriptionClass}`}>
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {ctaText && ctaHref && (
              <Link
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-primary-600 shadow-xl transition-all duration-250 hover:scale-105 hover:bg-gray-50 hover:shadow-2xl"
              >
                {ctaText}
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            )}

            {secondaryCtaText && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all duration-250 hover:bg-white/20"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
