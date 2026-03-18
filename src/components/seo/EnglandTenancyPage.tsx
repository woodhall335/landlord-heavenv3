import type { ReactNode } from 'react';
import Link from 'next/link';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';

interface EnglandTenancyFaq {
  question: string;
  answer: string;
}

interface EnglandTenancyPageProps {
  title: string;
  subtitle: ReactNode;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  legacyNotice?: string;
  introTitle: string;
  introBody: string[];
  highlights: string[];
  compliancePoints: string[];
  keywordTargets?: string[];
  faqs?: EnglandTenancyFaq[];
}

export function EnglandTenancyPage({
  title,
  subtitle,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  legacyNotice,
  introTitle,
  introBody,
  highlights,
  compliancePoints,
  keywordTargets,
  faqs = [],
}: EnglandTenancyPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <UniversalHero
        title={title}
        subtitle={subtitle}
        primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
        secondaryCta={
          secondaryCtaLabel && secondaryCtaHref
            ? { label: secondaryCtaLabel, href: secondaryCtaHref }
            : undefined
        }
        showTrustPositioningBar
        hideMedia
      />

      <Container className="py-12">
        {legacyNotice ? (
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
            <p className="text-sm font-semibold uppercase tracking-wide">Legacy Search Term</p>
            <p className="mt-2 text-base">{legacyNotice}</p>
          </div>
        ) : null}

        <section className="mb-12 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900">{introTitle}</h2>
          <div className="mt-4 space-y-4 text-lg text-gray-700">
            {introBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mb-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-2xl font-bold text-gray-900">What You Get</h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              {highlights.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-2xl font-bold text-gray-900">England Compliance Position</h2>
            <ul className="mt-4 space-y-3 text-gray-700">
              {compliancePoints.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {keywordTargets?.length ? (
          <section className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-2xl font-bold text-gray-900">Search Coverage</h2>
            <p className="mt-3 text-gray-700">
              This page is written to target these England tenancy queries:
            </p>
            <p className="mt-3 text-gray-900">{keywordTargets.join(', ')}</p>
          </section>
        ) : null}

        {faqs.length ? (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.question} className="rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="mt-2 text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Start The Updated England Flow</h2>
          <p className="mt-3 text-gray-700">
            Landlord Heaven now positions new England tenancy paperwork as a Renters' Rights compliant Residential Tenancy Agreement flow.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={primaryCtaHref}
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {primaryCtaLabel}
            </Link>
            {secondaryCtaHref && secondaryCtaLabel ? (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center rounded-lg border border-blue-300 px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                {secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </section>
      </Container>
    </main>
  );
}
