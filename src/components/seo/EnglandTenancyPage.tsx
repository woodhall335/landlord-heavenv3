import type { ReactNode } from 'react';
import Link from 'next/link';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { Container } from '@/components/ui/Container';

interface EnglandTenancyFaq {
  question: string;
  answer: string;
}

interface EnglandTenancyPageProps {
  pagePath?: string;
  title: string;
  subtitle: ReactNode;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  legacyNotice?: string;
  introTitle: string;
  introBody: ReactNode[];
  highlights: string[];
  compliancePoints: string[];
  keywordTargets?: string[];
  faqs?: EnglandTenancyFaq[];
}

export function EnglandTenancyPage({
  pagePath,
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
  keywordTargets: _keywordTargets,
  faqs = [],
}: EnglandTenancyPageProps) {
  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <UniversalHero
        badge="England tenancy agreements"
        trustText="Updated England tenancy agreement wording - Assured periodic framework from 1 May 2026 - Older wording may be harder to rely on if issues arise"
        title={title}
        subtitle={subtitle}
        primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
        secondaryCta={
          secondaryCtaLabel && secondaryCtaHref
            ? { label: secondaryCtaLabel, href: secondaryCtaHref }
            : undefined
        }
        feature="Older agreements may not be legally enforceable in the way landlords expect if they rely on outdated wording or structure."
        showTrustPositioningBar
        hideMedia
      />

      <Container className="py-12 md:py-16">
        {legacyNotice ? (
          <div className="mb-10 rounded-[1.8rem] border border-[#E8DCC0] bg-[#FFF8EA] p-6 text-[#5A4720] shadow-[0_12px_28px_rgba(43,33,12,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.12em]">Search intent note</p>
            <p className="mt-2 text-base leading-7">{legacyNotice}</p>
          </div>
        ) : null}
        {pagePath ? <SeoPageContextPanel pathname={pagePath} className="mb-10" /> : null}

        <section className="mb-12 max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
            {introTitle}
          </h2>
          <div className="mt-4 space-y-4 text-lg leading-8 text-[#546075]">
            {introBody.map((paragraph, index) => (
              <p key={`intro-body-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mb-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]">
            <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
              What this page helps you do
            </h2>
            <ul className="mt-5 space-y-3 text-[#465066]">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 leading-7">
                  <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#5B56E8]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F5F1FF] via-white to-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)]">
            <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
              Why landlords update older England agreements
            </h2>
            <ul className="mt-5 space-y-3 text-[#465066]">
              {compliancePoints.map((item) => (
                <li key={item} className="flex items-start gap-3 leading-7">
                  <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#5B56E8]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {faqs.length ? (
          <FAQSection
            title="England tenancy agreement FAQs"
            intro="Clear answers on the England route, the updated terminology, and why older wording may be harder to rely on."
            faqs={faqs}
            showContactCTA={false}
            variant="gray"
          />
        ) : null}

        <section className="mt-12 rounded-[2.2rem] bg-gradient-to-br from-[#201739] via-[#31205B] to-[#5641A4] p-8 text-center text-white shadow-[0_28px_72px_rgba(46,29,86,0.28)] md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Choose the right England agreement route
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-[#E1DBF8] md:text-lg">
            Start with the route that fits the let now, not the template language you may have
            used years ago. Older agreements may be harder to rely on if wording or structure is
            outdated. Use Standard for straightforward England lets and Premium where the
            household or risk profile is more complex.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={primaryCtaHref}
              className="hero-btn-primary inline-flex items-center rounded-xl px-6 py-3 font-semibold"
            >
              {primaryCtaLabel}
            </Link>
            {secondaryCtaHref && secondaryCtaLabel ? (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:border-white/40 hover:bg-white/15"
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
