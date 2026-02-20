'use client';

import Link from 'next/link';
import { trackUpsellClicked } from '@/lib/analytics';

export type ToolType = 'validator' | 'generator' | 'calculator' | 'checker';

export interface ToolUpsellCardProps {
  toolName: string;
  toolType: ToolType;
  productName: string;
  ctaLabel: string;
  ctaHref: string;
  jurisdiction?: string;
  jurisdictionLabel?: string;
  freeIncludes: string[];
  paidIncludes: string[];
  description?: string;
  className?: string;
}

export function ToolUpsellCard({
  toolName,
  toolType,
  productName,
  ctaLabel,
  ctaHref,
  jurisdiction,
  jurisdictionLabel,
  freeIncludes,
  paidIncludes,
  description,
  className,
}: ToolUpsellCardProps): React.ReactElement {
  const handleUpsellClick = () => {
    trackUpsellClicked({
      tool_name: toolName,
      tool_type: toolType,
      product: productName,
      destination: ctaHref,
      jurisdiction,
    });
  };

  return (
    <section
      data-testid="tool-upsell"
      className={`rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-white p-6 shadow-sm ${className ?? ''}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {jurisdictionLabel && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {jurisdictionLabel}
            </span>
          )}
          <h3 className="mt-3 text-2xl font-semibold text-gray-900">
            Upgrade to court-ready pack
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            {description ??
              'Turn your free tool output into a court-ready bundle with the right forms, checks, and serving steps.'}
          </p>
        </div>
        <Link
          href={ctaHref}
          onClick={handleUpsellClick}
          data-testid="tool-upsell-cta"
          className="hero-btn-primary text-center"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Free tool includes</p>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {freeIncludes.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
            Court-ready pack includes
          </p>
          <ul className="mt-3 space-y-2 text-sm text-purple-900">
            {paidIncludes.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
