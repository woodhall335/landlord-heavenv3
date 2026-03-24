'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { Container } from '@/components/ui/Container';
import { StructuredData } from '@/lib/seo/structured-data';

type FunnelSection = {
  title: string;
  paragraphs: string[];
};

type RelatedLink = {
  href: string;
  title: string;
  description?: string;
  icon?: 'document' | 'calculator' | 'legal' | 'home';
  type?: 'product' | 'tool' | 'guide' | 'page';
};

type TenancyFunnelLandingPageProps = {
  breadcrumbData: object;
  faqSchemaData: object;
  articleSchemaData: object;
  heroTitle: string;
  heroSubtitle: ReactNode;
  heroMediaSrc: string;
  heroMediaAlt: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  pagePath: string;
  intentHookTitle: string;
  intentHookParagraphs: string[];
  currentPositionTitle: string;
  currentPositionParagraphs: string[];
  sections: FunnelSection[];
  ctaBlockTitle: string;
  ctaBlockDescription: string;
  faqTitle: string;
  faqIntro: string;
  faqs: FAQItem[];
  finalCtaTitle: string;
  finalCtaDescription: string;
  finalCtaLabel: string;
  relatedLinks: RelatedLink[];
};

export function TenancyFunnelLandingPage({
  breadcrumbData,
  faqSchemaData,
  articleSchemaData,
  heroTitle,
  heroSubtitle,
  heroMediaSrc,
  heroMediaAlt,
  primaryCtaLabel,
  primaryCtaHref,
  pagePath,
  intentHookTitle,
  intentHookParagraphs,
  currentPositionTitle,
  currentPositionParagraphs,
  sections,
  ctaBlockTitle,
  ctaBlockDescription,
  faqTitle,
  faqIntro,
  faqs,
  finalCtaTitle,
  finalCtaDescription,
  finalCtaLabel,
  relatedLinks,
}: TenancyFunnelLandingPageProps) {
  return (
    <main className="min-h-screen bg-[#FCFBF8]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={breadcrumbData} />
      <StructuredData data={articleSchemaData} />
      <StructuredData data={faqSchemaData} />

      <UniversalHero
        title={heroTitle}
        subtitle={heroSubtitle}
        primaryCta={{ label: primaryCtaLabel, href: primaryCtaHref }}
        mediaSrc={heroMediaSrc}
        mediaAlt={heroMediaAlt}
        trustText="England-first tenancy agreement guidance updated for 1 May 2026"
        showTrustPositioningBar
      />

      <Container className="py-12 md:py-16">
        <section className="max-w-4xl rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
            Intent hook
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
            {intentHookTitle}
          </h2>
          <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
            {intentHookParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-[#D9D7F7] bg-gradient-to-br from-[#F5F1FF] via-white to-[#F7F8FF] p-6 shadow-[0_14px_32px_rgba(91,86,232,0.08)] md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
            Current England position
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
            {currentPositionTitle}
          </h2>
          <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
            {currentPositionParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-[2rem] border border-[#E8E1D7] bg-white p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)] md:p-8"
            >
              <h2 className="text-3xl font-bold tracking-tight text-[#141B2D] md:text-4xl">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-8 text-[#546075]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <SeoCtaBlock
          pageType="tenancy"
          variant="section"
          pagePath={pagePath}
          primaryText={primaryCtaLabel}
          title={ctaBlockTitle}
          description={ctaBlockDescription}
          className="mt-10"
        />

        <FAQSection
          title={faqTitle}
          intro={faqIntro}
          faqs={faqs}
          showContactCTA={false}
          variant="gray"
        />

        <section className="mt-12 rounded-[2.5rem] bg-gradient-to-br from-[#201739] via-[#31205B] to-[#5641A4] p-8 text-center text-white shadow-[0_28px_72px_rgba(46,29,86,0.28)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C8BCFF]">
            Ready to move forward
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{finalCtaTitle}</h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#E3DCF8]">
            {finalCtaDescription}
          </p>
          <div className="mt-8 flex justify-center">
            <Link href={primaryCtaHref} className="hero-btn-secondary">
              {finalCtaLabel}
            </Link>
          </div>
        </section>

        <RelatedLinks
          title="Related tenancy agreement pages"
          links={relatedLinks}
          variant="list"
          className="mt-12"
        />

        <SeoDisclaimer />
      </Container>
    </main>
  );
}
