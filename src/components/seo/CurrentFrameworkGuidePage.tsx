import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { NoticeOnlyBridge } from '@/components/marketing/CommercialBridge';
import { Container } from '@/components/ui/Container';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import {
  StructuredData,
  articleSchema,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
import { normalizeKeywordList, SEO_KEYWORDS_RECOMMENDED_MAX } from '@/lib/seo/metadata';
import { getCanonicalUrl } from '@/lib/seo';
import type { CurrentFrameworkPageConfig } from '@/lib/seo/england-current-framework-pages';
import { getCurrentEnglandFrameworkLinks } from '@/lib/seo/internal-links';

export function getCurrentFrameworkMetadata(config: CurrentFrameworkPageConfig): Metadata {
  const canonical = getCanonicalUrl(`/${config.slug}`);

  return {
    title: config.title,
    description: config.description,
    keywords: normalizeKeywordList([
      ...config.keywords,
      config.heroTitle,
      config.title.replace(/\s*\|.*$/, ''),
      `${config.heroTitle.replace(/[?:|].*$/, '').trim()} landlord guide`,
      'England landlord documents',
      'Renters Rights Act landlord guidance',
      'section 8 notice england',
      'possession claim england',
      ...config.relatedLinks.map((guide) => guide.title),
    ]).slice(0, SEO_KEYWORDS_RECOMMENDED_MAX),
    alternates: { canonical },
    openGraph: {
      title: config.title,
      description: config.description,
      url: canonical,
      type: 'article',
    },
  };
}

export function CurrentFrameworkGuidePage({ config }: { config: CurrentFrameworkPageConfig }) {
  const canonical = getCanonicalUrl(`/${config.slug}`);
  const frameworkLinks = getCurrentEnglandFrameworkLinks(`/${config.slug}`);
  const pagePath = `/${config.slug}`;
  const isForm3Section8 = config.slug === 'form-3-section-8';
  const inferProduct = (href: string) => {
    if (href.includes('notice-only') || href.includes('notice_only')) return 'notice_only';
    if (href.includes('complete-pack')) return 'complete_pack';
    return undefined;
  };
  const frameworkLinksBlock = (
    <article className="rounded-3xl border border-[#cab6ff] bg-[#f8f4ff] p-6 md:p-8">
      <h2 className="text-3xl font-bold text-[#2a2161]">
        Current England eviction framework
      </h2>
      <p className="mt-4 max-w-3xl leading-8 text-gray-700">
        Use this England authority bundle to move from the current rule summary into the
        exact notice, Form 3A, landlord action guide, and possession-process pages that
        fit the post-1 May 2026 route.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {frameworkLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-[#d8caff] bg-white p-5 transition hover:border-primary hover:bg-[#fcfaff]"
          >
            <p className="text-lg font-semibold text-[#2a2161]">{link.title}</p>
            <p className="mt-2 leading-7 text-gray-700">{link.description}</p>
          </Link>
        ))}
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath={pagePath}
        pageTitle={config.title}
        pageType={config.pageType}
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={articleSchema({
          headline: config.heroTitle,
          description: config.description,
          url: canonical,
          datePublished: '2026-04-05',
          dateModified: '2026-07-13',
        })}
      />
      <StructuredData data={faqPageSchema(config.faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Eviction guides', url: 'https://landlordheaven.co.uk/eviction-guides' },
          { name: config.heroTitle, url: canonical },
        ])}
      />

      <UniversalHero
        title={config.heroTitle}
        subtitle={config.heroSubtitle}
        showReviewPill
        showTrustPositioningBar
        hideMedia
        actionsSlot={
          <>
            <div className="w-full sm:w-auto">
              <TrackedLink
                href={config.primaryCta.href}
                pagePath={pagePath}
                pageType="entry_page"
                ctaLabel={config.primaryCta.label}
                ctaPosition="hero"
                eventName="entry_page_primary_cta_click"
                routeIntent={config.slug}
                product={inferProduct(config.primaryCta.href)}
                className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
              >
                {config.primaryCta.label}
              </TrackedLink>
            </div>
            <div className="w-full sm:w-auto">
              <TrackedLink
                href={config.secondaryCta.href}
                pagePath={pagePath}
                pageType="entry_page"
                ctaLabel={config.secondaryCta.label}
                ctaPosition="hero"
                eventName="entry_page_secondary_cta_click"
                routeIntent={config.slug}
                product={inferProduct(config.secondaryCta.href)}
                className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
              >
                {config.secondaryCta.label}
              </TrackedLink>
            </div>
          </>
        }
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {config.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </UniversalHero>

      <section className="border-b border-[#e6dbff] bg-white py-10">
        <Container>
          <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-3xl border border-[#cab6ff] bg-[#f8f4ff] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Current England position
            </p>
            <p className="mt-4 text-lg leading-8 text-slate-700">{config.currentFrameworkNote}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink
                href={config.primaryCta.href}
                pagePath={pagePath}
                pageType="entry_page"
                ctaLabel={config.primaryCta.label}
                ctaPosition="section"
                eventName="entry_page_primary_cta_click"
                routeIntent={config.slug}
                product={inferProduct(config.primaryCta.href)}
                className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
              >
                {config.primaryCta.label}
              </TrackedLink>
              <TrackedLink
                href={config.secondaryCta.href}
                pagePath={pagePath}
                pageType="entry_page"
                ctaLabel={config.secondaryCta.label}
                ctaPosition="section"
                eventName="entry_page_secondary_cta_click"
                routeIntent={config.slug}
                product={inferProduct(config.secondaryCta.href)}
                className="rounded-lg border border-[#e6dbff] bg-white px-5 py-3 font-semibold text-primary hover:bg-[#fcfaff]"
              >
                {config.secondaryCta.label}
              </TrackedLink>
            </div>
            {isForm3Section8 ? (
              <p className="mt-4 text-sm font-medium text-[#514785]">
                Fixed price £39.99. Generate and preview the Form 3A pack before paying.
              </p>
            ) : null}
          </div>
          {config.groundIntents?.length ? (
            <article className="rounded-3xl border border-[#cab6ff] bg-[#f8f4ff] p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Match the notice to your reason
              </p>
              <h2 className="mt-3 text-3xl font-bold text-[#2a2161]">
                Choose why you need possession
              </h2>
              <p className="mt-4 max-w-3xl leading-8 text-gray-700">
                Start with the facts you can prove. Each route below uses the same current
                Form 3A builder, but focuses the questions, evidence and checks on the
                grounds most likely to fit that situation.
              </p>
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {config.groundIntents.map((intent) => (
                  <section
                    id={intent.id}
                    key={intent.id}
                    className="scroll-mt-28 rounded-2xl border border-[#d8caff] bg-white p-5 shadow-[0_14px_34px_rgba(24,11,49,0.05)]"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
                      {intent.grounds}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-[#2a2161]">{intent.title}</h3>
                    <p className="mt-3 leading-7 text-gray-700">{intent.summary}</p>
                    <ul className="mt-4 space-y-2 text-sm leading-6 text-gray-700">
                      {intent.checks.map((check) => (
                        <li key={check} className="flex gap-2">
                          <span aria-hidden="true" className="font-bold text-primary">
                            ✓
                          </span>
                          <span>{check}</span>
                        </li>
                      ))}
                    </ul>
                    <TrackedLink
                      href={intent.ctaHref}
                      pagePath={pagePath}
                      pageType="entry_page"
                      ctaLabel={intent.ctaLabel}
                      ctaPosition="route_card"
                      eventName="entry_page_primary_cta_click"
                      routeIntent={`${config.slug}:${intent.id}`}
                      product="notice_only"
                      className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                    >
                      {intent.ctaLabel}
                    </TrackedLink>
                  </section>
                ))}
              </div>
            </article>
          ) : null}
          {isForm3Section8 ? (
            <NoticeOnlyBridge
              sourcePage={pagePath}
              ctaPosition="top"
              headline="Serve Form 3A with the right dates and service record"
            />
          ) : null}
          {isForm3Section8 ? (
            <AssistedPrepServicesShowcase
              pagePath={pagePath}
              pageType="entry_page"
              src="current_framework_assisted"
            />
          ) : null}
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            {config.decisionBlock ? (
              <article className="rounded-3xl border border-[#cab6ff] bg-[#f8f4ff] p-6 md:p-8">
                <h2 className="text-3xl font-bold text-[#2a2161]">{config.decisionBlock.title}</h2>
                <p className="mt-4 max-w-3xl leading-8 text-gray-700">
                  {config.decisionBlock.intro}
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {config.decisionBlock.cards.map((card, index) => (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-[#d8caff] bg-white p-5 shadow-[0_14px_34px_rgba(24,11,49,0.05)]"
                    >
                      <p className="text-lg font-semibold text-[#2a2161]">{card.title}</p>
                      <p className="mt-3 leading-7 text-gray-700">{card.body}</p>
                      <TrackedLink
                        href={card.href}
                        pagePath={pagePath}
                        pageType="entry_page"
                        ctaLabel={card.ctaLabel}
                        ctaPosition="section"
                        eventName={index === 0 ? 'entry_page_primary_cta_click' : 'entry_page_secondary_cta_click'}
                        routeIntent={config.slug}
                        product={inferProduct(card.href)}
                        className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
                      >
                        {card.ctaLabel}
                      </TrackedLink>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            <article className="rounded-3xl border border-[#e6dbff] bg-[#fcfaff] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">What you need to know first</h2>
              <div className="mt-5 space-y-5 text-gray-700">
                {config.introduction.map((paragraph) => (
                  <p key={paragraph} className="leading-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            {!config.deferFrameworkLinks ? frameworkLinksBlock : null}

            {config.sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 rounded-3xl border border-[#e6dbff] bg-white p-6 md:p-8"
              >
                <h2 className="text-3xl font-bold text-[#2a2161]">{section.title}</h2>
                <div className="mt-5 space-y-5 text-gray-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="leading-8">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets ? (
                    <ul className="list-disc space-y-3 pl-6 leading-8">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </article>
            ))}

            {config.deferFrameworkLinks ? frameworkLinksBlock : null}
          </div>
        </Container>
      </section>

      <section className="bg-[#f7f2ff] py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            {isForm3Section8 ? (
              <NoticeOnlyBridge
                sourcePage={pagePath}
                ctaPosition="faq"
                headline="Before the FAQs, choose the notice step that fits your case"
              />
            ) : null}
          </div>
          <div className="mx-auto mt-8 max-w-5xl rounded-3xl border border-[#e6dbff] bg-white p-6 md:p-8">
            <h2 className="text-3xl font-bold text-[#2a2161]">Choose the next step for your case</h2>
            <p className="mt-4 max-w-3xl leading-8 text-gray-700">
              Move from guidance into the current England paperwork that fits your case. If you already know the next step, start the notice. If the case is likely to continue into court, use the fuller possession support and claim-stage guidance instead of piecing it together later.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink
                href={config.primaryCta.href}
                pagePath={pagePath}
                pageType="entry_page"
                ctaLabel={config.primaryCta.label}
                ctaPosition="final"
                eventName="entry_page_primary_cta_click"
                routeIntent={config.slug}
                product={inferProduct(config.primaryCta.href)}
                className="rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:opacity-95"
              >
                {config.primaryCta.label}
              </TrackedLink>
              <TrackedLink
                href={config.secondaryCta.href}
                pagePath={pagePath}
                pageType="entry_page"
                ctaLabel={config.secondaryCta.label}
                ctaPosition="final"
                eventName="entry_page_secondary_cta_click"
                routeIntent={config.slug}
                product={inferProduct(config.secondaryCta.href)}
                className="rounded-lg border border-[#e6dbff] bg-white px-5 py-3 font-semibold text-primary hover:bg-[#fcfaff]"
              >
                {config.secondaryCta.label}
              </TrackedLink>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        faqs={config.faqs}
        title={config.faqTitle}
        showContactCTA={false}
        variant="white"
        includeSchema={false}
      />

      <section className="bg-[#f3eeff] py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <RelatedLinks title="Related England resources for landlords" links={config.relatedLinks} />
          </div>
        </Container>
      </section>
    </div>
  );
}
