import type { ReactNode } from 'react';
import Link from 'next/link';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { Container } from '@/components/ui/Container';
import type {
  ProductSalesBreakdownItem,
  ProductSalesCard,
  ProductSalesStep,
} from '@/lib/marketing/product-sales-content';

interface EnglandTenancyFaq {
  question: string;
  answer: string;
}

interface EnglandTenancyPackHighlight {
  title: string;
  description: string;
  supportingLabel?: string;
}

interface EnglandTenancyRouteCard {
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
}

interface EnglandTenancySalesContent {
  packIntro: ReactNode;
  defaultPackItems: ProductSalesBreakdownItem[];
  conditionalPackItems?: ProductSalesBreakdownItem[];
  conditionalTitle?: string;
  conditionalIntro?: ReactNode;
  sampleProof?: ReactNode;
  whyYouNeedThis: {
    title: string;
    intro: ReactNode;
    cards: ProductSalesCard[];
  };
  howThisHelps: {
    title: string;
    intro: ReactNode;
    cards: ProductSalesCard[];
  };
  howItWorks: {
    title: string;
    intro: ReactNode;
    steps: ProductSalesStep[];
  };
  ctaTitle: string;
  ctaBody: ReactNode;
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
  idealFor?: string[];
  notFor?: string[];
  packHighlights?: EnglandTenancyPackHighlight[];
  routeComparison?: EnglandTenancyRouteCard[];
  faqs?: EnglandTenancyFaq[];
  finalCtaBody?: ReactNode;
  salesContent?: EnglandTenancySalesContent;
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
  keywordTargets = [],
  idealFor = [],
  notFor = [],
  packHighlights = [],
  routeComparison = [],
  faqs = [],
  finalCtaBody,
  salesContent,
}: EnglandTenancyPageProps) {
  const isSalesMode = Boolean(salesContent);

  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <UniversalHero
        badge="England tenancy agreements"
        trustText="Built for England landlords choosing the right letting agreement."
        title={title}
        subtitle={subtitle}
        primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
        secondaryCta={
          secondaryCtaLabel && secondaryCtaHref
            ? { label: secondaryCtaLabel, href: secondaryCtaHref }
            : undefined
        }
        feature="Choose the agreement that matches how the property is actually being let."
        mediaSrc="/images/tenancy_agreements.webp"
        mediaAlt="Tenancy agreement documents and landlord paperwork"
        showTrustPositioningBar
      />

      {isSalesMode && salesContent?.sampleProof ? (
        <section className="bg-white py-10 md:py-12">
          <Container>
            <div className="mx-auto max-w-6xl">{salesContent.sampleProof}</div>
          </Container>
        </section>
      ) : null}

      <Container className="py-12 md:py-16">
        {legacyNotice ? (
          <div className="mb-10 rounded-[1.8rem] border border-[#E8DCC0] bg-[#FFF8EA] p-6 text-[#5A4720] shadow-[0_12px_28px_rgba(43,33,12,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.12em]">If you searched using older wording</p>
            <p className="mt-2 text-base leading-7">{legacyNotice}</p>
          </div>
        ) : null}
        {pagePath && !isSalesMode ? <SeoPageContextPanel pathname={pagePath} className="mb-10" /> : null}

        {isSalesMode && salesContent ? (
          <>
            <section className="mb-12">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                  {salesContent.whyYouNeedThis.title}
                </h2>
                <div className="mt-4 text-base leading-8 text-[#546075] md:text-lg">
                  {salesContent.whyYouNeedThis.intro}
                </div>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {salesContent.whyYouNeedThis.cards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-[1.8rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
                  >
                    <h3 className="text-xl font-semibold tracking-tight text-[#141B2D]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#546075] md:text-base">{card.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                  {salesContent.howThisHelps.title}
                </h2>
                <div className="mt-4 text-base leading-8 text-[#546075] md:text-lg">
                  {salesContent.howThisHelps.intro}
                </div>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {salesContent.howThisHelps.cards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-[1.8rem] border border-[#E8E1D7] bg-[#FCFAFF] p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
                  >
                    <h3 className="text-xl font-semibold tracking-tight text-[#141B2D]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#546075] md:text-base">{card.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mb-12 rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F5F1FF] via-white to-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                  {salesContent.howItWorks.title}
                </h2>
                <div className="mt-4 text-base leading-8 text-[#546075] md:text-lg">
                  {salesContent.howItWorks.intro}
                </div>
              </div>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {salesContent.howItWorks.steps.map((step) => (
                  <article key={step.step} className="rounded-[1.8rem] border border-[#E8E1D7] bg-white p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7C3AED]">
                      {step.step}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#141B2D]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#546075] md:text-base">{step.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
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

            {keywordTargets.length ? (
              <section className="mb-12 rounded-[2rem] border border-[#E6E0D5] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                    Common landlord searches this route covers
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[#546075]">
                    These are the phrases landlords usually use when they are trying to find the right
                    agreement for this setup. The important part is making sure the product and the let
                    match each other cleanly.
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {keywordTargets.map((target) => (
                    <span
                      key={target}
                      className="rounded-full border border-[#D7DDF4] bg-[#F7F9FF] px-4 py-2 text-sm font-medium text-[#30446B]"
                    >
                      {target}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mb-12 grid gap-8 lg:grid-cols-2">
              <div className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]">
                  <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                    What this agreement route covers
                  </h2>
                <ul className="mt-5 space-y-3 text-[#465066]">
                  {highlights.map((item) => (
                    <li key={item} className="flex items-start gap-3 leading-7">
                      <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#7C3AED]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F5F1FF] via-white to-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)]">
                  <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                    How this lines up with the current England rules
                  </h2>
                <ul className="mt-5 space-y-3 text-[#465066]">
                  {compliancePoints.map((item) => (
                    <li key={item} className="flex items-start gap-3 leading-7">
                      <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#7C3AED]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {idealFor.length || notFor.length ? (
              <section className="mb-12 grid gap-8 lg:grid-cols-2">
                <div className="rounded-[2rem] border border-[#D9EAD7] bg-[#F5FBF2] p-6 shadow-[0_14px_32px_rgba(29,92,54,0.06)]">
                  <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                    This route is usually right if
                  </h2>
                  <ul className="mt-5 space-y-3 text-[#465066]">
                    {idealFor.map((item) => (
                      <li key={item} className="flex items-start gap-3 leading-7">
                        <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#2F855A]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[2rem] border border-[#F0DCC7] bg-[#FFF8F1] p-6 shadow-[0_14px_32px_rgba(124,72,18,0.06)]">
                  <h2 className="text-2xl font-bold tracking-tight text-[#141B2D]">
                    Pick a different route if
                  </h2>
                  <ul className="mt-5 space-y-3 text-[#465066]">
                    {notFor.map((item) => (
                      <li key={item} className="flex items-start gap-3 leading-7">
                        <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#C26A1B]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ) : null}

            {packHighlights.length ? (
              <section className="mb-12">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold tracking-tight text-[#141B2D]">
                    What you get
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[#546075]">
                    The agreement is the main document, but we also include the practical paperwork a
                    landlord usually needs around it so the tenancy starts on a cleaner footing.
                  </p>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {packHighlights.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.8rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-semibold tracking-tight text-[#141B2D]">
                          {item.title}
                        </h3>
                        {item.supportingLabel ? (
                          <span className="rounded-full bg-[#F2F4FA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#4E5A70]">
                            {item.supportingLabel}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-base leading-7 text-[#546075]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {routeComparison.length ? (
              <section className="mb-12">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold tracking-tight text-[#141B2D]">
                    Compare England agreement routes
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[#546075]">
                    Pick the route that matches the way the property is actually being let. That matters
                    more than old AST wording or a vague idea of what sounds more "premium".
                  </p>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {routeComparison.map((route) => (
                    <div
                      key={route.title}
                      className="flex h-full flex-col rounded-[1.8rem] border border-[#E5E8F0] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
                    >
                      <h3 className="text-xl font-semibold tracking-tight text-[#141B2D]">
                        {route.title}
                      </h3>
                      <p className="mt-3 flex-1 text-base leading-7 text-[#546075]">
                        {route.description}
                      </p>
                      <Link
                        href={route.href}
                        className="mt-5 inline-flex items-center text-sm font-semibold text-[#4A46C8] transition hover:text-[#2F2BA6]"
                      >
                        {route.ctaLabel || 'See agreement'}
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        {faqs.length ? (
          <FAQSection
            title="England tenancy agreement FAQs"
            intro="Straight answers on which England agreement to use, what it includes, and how it fits the current rules."
            faqs={faqs}
            showContactCTA={false}
            variant="gray"
          />
        ) : null}

        <section className="mt-12 rounded-[2.2rem] bg-gradient-to-br from-[#201739] via-[#31205B] to-[#5641A4] p-8 text-center text-white shadow-[0_28px_72px_rgba(46,29,86,0.28)] md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {salesContent?.ctaTitle || 'Choose the England agreement that fits the let'}
          </h2>
          <div className="mx-auto mt-3 max-w-2xl text-base leading-8 text-[#E1DBF8] md:text-lg">
            {salesContent?.ctaBody ||
              finalCtaBody || (
                <>
                  Start with the route that matches the property and the occupiers now, not the label
                  you may have used years ago. England now has separate routes for Standard, Premium,
                  Student, HMO / Shared House, and Lodger agreements.
                </>
              )}
          </div>
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
          {isSalesMode && routeComparison.length ? (
            <div className="mt-8 border-t border-white/15 pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D5CCF6]">
                Compare other England agreement routes
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                {routeComparison.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/15"
                  >
                    {route.ctaLabel || route.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </Container>
    </main>
  );
}
