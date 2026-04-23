import type { Metadata } from 'next';
import Link from 'next/link';
import { TrackedLink } from '@/components/analytics/TrackedLink';
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
import { getCanonicalUrl } from '@/lib/seo';
import type { CurrentFrameworkPageConfig } from '@/lib/seo/england-current-framework-pages';
import { getCurrentEnglandFrameworkLinks } from '@/lib/seo/internal-links';

export function getCurrentFrameworkMetadata(config: CurrentFrameworkPageConfig): Metadata {
  const canonical = getCanonicalUrl(`/${config.slug}`);

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
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
  const inferProduct = (href: string) => {
    if (href.includes('notice-only')) return 'notice_only';
    if (href.includes('complete-pack')) return 'complete_pack';
    return undefined;
  };

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
          dateModified: '2026-04-05',
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
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#cab6ff] bg-[#f8f4ff] p-6 md:p-8">
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
          </div>
        </Container>
      </section>

      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
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
          </div>
        </Container>
      </section>

      <section className="bg-[#f7f2ff] py-12">
        <Container>
          <div className="mx-auto max-w-5xl rounded-3xl border border-[#e6dbff] bg-white p-6 md:p-8">
            <h2 className="text-3xl font-bold text-[#2a2161]">Choose the next step for your case</h2>
            <p className="mt-4 max-w-3xl leading-8 text-gray-700">
              Move from guidance into the current England workflow that fits your case. If you already know the route, start the notice. If the case is likely to continue into court, use the fuller possession support and claim-stage guidance instead of piecing it together later.
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
