import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface CtaLink {
  label: string;
  href: string;
}

interface RelatedLink {
  href: string;
  title: string;
  description?: string;
}

interface NextLegalStepsProps {
  heading?: string;
  jurisdictionLabel: string;
  scenarioLabel: string;
  primaryCTA: CtaLink;
  secondaryCTA?: CtaLink;
  relatedLinks?: RelatedLink[];
}

export function NextLegalSteps({
  heading = 'Next legal steps',
  jurisdictionLabel,
  scenarioLabel,
  primaryCTA,
  secondaryCTA,
  relatedLinks = [],
}: NextLegalStepsProps) {
  return (
    <section className="rounded-3xl border border-gray-200 bg-white px-6 py-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {jurisdictionLabel}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">{heading}</h2>
          <p className="mt-2 text-gray-600">
            Recommended next step for <strong>{scenarioLabel}</strong>.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={primaryCTA.href} className="hero-btn-primary text-center">
            {primaryCTA.label}
          </Link>
          {secondaryCTA && (
            <Link href={secondaryCTA.href} className="hero-btn-secondary text-center">
              {secondaryCTA.label}
            </Link>
          )}
        </div>
      </div>

      {relatedLinks.length > 0 && (
        <div className="mt-8 border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Related landlord resources</h3>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {relatedLinks.map((link) => (
              <li key={link.href} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <Link href={link.href} className="group inline-flex items-center gap-2">
                  <span className="font-semibold text-gray-900 group-hover:text-primary">
                    {link.title}
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary" />
                </Link>
                {link.description && (
                  <p className="mt-2 text-sm text-gray-600">{link.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
