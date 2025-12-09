import React from 'react';
import Link from 'next/link';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

/**
 * FeatureCard Component
 *
 * A reusable card component for displaying features, tools, or services.
 * Can be used as a static card or as a clickable link.
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={<ScaleIcon className="h-6 w-6" />}
 *   title="Free Section 21 Generator"
 *   description="Generate a basic Section 21 notice template"
 *   href="/tools/free-section-21-notice-generator"
 * />
 * ```
 */
export function FeatureCard({
  icon,
  title,
  description,
  href,
}: FeatureCardProps) {
  const cardContent = (
    <>
      {/* Icon */}
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-all duration-250 group-hover:bg-primary-600 group-hover:text-white group-hover:scale-110">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-3 text-xl font-semibold text-gray-900 transition-colors duration-250 group-hover:text-primary-600">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">{description}</p>

      {/* Arrow indicator for links */}
      {href && (
        <div className="mt-4 flex items-center text-sm font-medium text-primary-600 opacity-0 transition-all duration-250 group-hover:opacity-100 group-hover:translate-x-1">
          Learn more
          <svg
            className="ml-1 h-4 w-4"
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
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group relative block rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-250 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1"
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      {cardContent}
    </div>
  );
}
