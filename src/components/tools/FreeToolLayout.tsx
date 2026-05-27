import React from 'react';
import Link from 'next/link';
import { Hero } from '@/components/ui/Hero';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';

interface PaidVersionInfo {
  price: string;
  features: string[];
  href: string;
}

interface FreeToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  paidVersion: PaidVersionInfo;
}

/**
 * FreeToolLayout Component
 *
 * Provides a consistent layout for all free tools with:
 * - Hero section with "Free Tool" badge
 * - Legal disclaimer banner
 * - Main tool interface (2/3 width)
 * - Upgrade sidebar (1/3 width) with pricing and features
 *
 * @example
 * ```tsx
 * <FreeToolLayout
 *   title="Free Section 21 Notice Generator"
 *   description="Generate a basic Section 21 notice template"
 *   paidVersion={{
 *     price: PRODUCTS.ast_standard.displayPrice,
 *     features: ['Court-ready formatting', 'AI validation', ...],
 *     href: '/products/notice-only?product=section21'
 *   }}
 * >
 *   <YourToolForm />
 * </FreeToolLayout>
 * ```
 */
export function FreeToolLayout({
  title,
  description,
  children,
  paidVersion,
}: FreeToolLayoutProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#faf7ff_42%,#f8f4ff_100%)]">
      {/* Hero - Lighter variant for tools */}
      <Hero
        variant="secondary"
        badge="Free Tool"
        title={title}
        description={description}
      />

      {/* Legal Disclaimer Banner */}
      <div className="border-b border-warning-200 bg-warning-50 py-4">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-start gap-3">
            <svg
              className="mt-1 h-6 w-6 flex-shrink-0 text-warning-700"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-warning-900">
                Legal Disclaimer
              </p>
              <p className="text-sm text-warning-800">
                This free version is for general information only and is not
                legal advice. Use the paid pack when you need checked documents
                for serving, filing, or sending.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Tool + Sidebar */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Tool Interface */}
          <div className="lg:col-span-2">
            <Reveal className="rounded-[1.75rem] border border-[#e8ddfb] bg-white p-8 shadow-[0_22px_60px_rgba(91,33,182,0.10)]">
              {children}
            </Reveal>
          </div>

          {/* Upgrade Sidebar */}
          <div className="lg:col-span-1">
            <Reveal className="sticky top-8 rounded-[1.75rem] border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-white p-6 shadow-[0_22px_60px_rgba(105,46,212,0.14)]">
              <div className="mb-4 flex items-center gap-2">
                <svg
                  className="h-6 w-6 text-primary-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Prepare the Paid Pack
                </h3>
              </div>

              <p className="mb-4 text-3xl font-bold text-primary-600">
                {paidVersion.price}
              </p>

              <StaggerReveal className="mb-6 space-y-3">
                {paidVersion.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-success-500"
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
                    {feature}
                  </li>
                ))}
              </StaggerReveal>

              <Link
                href={paidVersion.href}
                className="block w-full rounded-xl bg-primary-600 px-6 py-3 text-center font-semibold text-white transition-all duration-250 hover:bg-primary-700 hover:scale-105 hover:shadow-xl"
              >
                Prepare the paid pack
              </Link>

              <p className="mt-4 text-center text-xs text-gray-600">
                Instant download - checked document format
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

