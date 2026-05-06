import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { RentIncreaseBridge } from '@/components/marketing/CommercialBridge';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { FAQSection } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { Container } from '@/components/ui/Container';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getCanonicalUrl } from '@/lib/seo';
import { articleSchema, breadcrumbSchema, faqPageSchema, StructuredData } from '@/lib/seo/structured-data';
import type { RentIncreaseGuidePage, RentIncreaseGuideSection } from './content';

export function getRentIncreaseGuideMetadata(config: RentIncreaseGuidePage): Metadata {
  const canonical = getCanonicalUrl(config.path);

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: [config.primaryKeyword, config.intentLabel, 'section 13', 'form 4a', 'rent increase england'],
    alternates: { canonical },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: canonical,
      type: 'article',
    },
  };
}

function CtaBand({
  title,
  sourcePage,
  ctaPosition,
}: {
  title: string;
  sourcePage: string;
  ctaPosition: 'top' | 'mid' | 'bottom';
}) {
  return (
    <RentIncreaseBridge sourcePage={sourcePage} ctaPosition={ctaPosition} headline={title} />
  );
}

function SectionCard({ section }: { section: RentIncreaseGuideSection }) {
  return (
    <article id={section.id} className="scroll-mt-24 rounded-2xl border border-[#E6DBFF] bg-white p-6 md:p-8">
      <h2 className="text-3xl font-bold text-[#2a2161]">{section.title}</h2>
      <div className="mt-5 space-y-5 text-gray-700">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph} className="leading-8">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}

export function RentIncreaseGuidePageView({ config }: { config: RentIncreaseGuidePage }) {
  const canonical = getCanonicalUrl(config.path);
  const guideHubUrl = getCanonicalUrl(config.slug === 'hub' ? config.path : '/rent-increase');
  const sampleProof = config.samplePackKey ? getGoldenPackProofData(config.samplePackKey) : null;
  const jumpLinks = [
    { href: '#quick-answer', label: 'Quick answer' },
    ...config.sections.map((section) => ({ href: `#${section.id}`, label: section.title })),
    { href: '#faqs', label: 'FAQs' },
    { href: '#final-cta', label: 'Next steps' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <SeoLandingWrapper
        pagePath={config.path}
        pageTitle={config.metaTitle}
        pageType="guide"
        jurisdiction="england"
      />
      <HeaderConfig mode="autoOnScroll" />

      <StructuredData
        data={articleSchema({
          headline: config.heroTitle,
          description: config.metaDescription,
          url: canonical,
          datePublished: '2026-04-09',
          dateModified: '2026-04-09',
        })}
      />
      <StructuredData data={faqPageSchema(config.faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Rent Increase Guide', url: guideHubUrl },
          { name: config.heroTitle, url: canonical },
        ])}
      />

      <UniversalHero
        title={config.heroTitle}
        subtitle={config.heroSubtitle}
        primaryCta={{ label: 'Check rent increase risk', href: '/tools/rent-increase-challenge-checker' }}
        secondaryCta={config.secondaryCta}
        mediaSrc={config.heroImage}
        mediaAlt={config.heroAlt}
        showReviewPill
        showTrustPositioningBar
      >
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {config.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </UniversalHero>

      <section className="border-b border-[#E6DBFF] bg-white py-8">
        <Container>
          <nav
            aria-labelledby="guide-links-heading"
            className="mx-auto max-w-5xl rounded-2xl border border-[#E6DBFF] bg-white p-6"
          >
            <h2 id="guide-links-heading" className="text-2xl font-semibold text-[#2a2161]">
              In This Guide
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {jumpLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-[#E6DBFF] px-4 py-3 text-primary hover:bg-[#F8F4FF]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </nav>
        </Container>
      </section>

      <section id="quick-answer" className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-5xl space-y-8">
            <article className="rounded-2xl border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-8">
              <h2 className="text-3xl font-bold text-[#2a2161]">Quick Answer</h2>
              <p className="mt-4 rounded-lg border border-[#D8C8FF] bg-white px-4 py-3 text-sm font-semibold text-[#4f2f89]">
                {config.introAngle}
              </p>
              {config.aboveFoldNote ? (
                <p className="mt-3 rounded-lg border border-[#CBB4FF] bg-[#F5EEFF] px-4 py-3 text-sm font-semibold text-[#422575]">
                  {config.aboveFoldNote}
                </p>
              ) : null}
              {config.jurisdictionNote ? (
                <p className="mt-3 rounded-lg border border-[#E6DBFF] bg-white px-4 py-3 text-sm text-[#5a3a94]">
                  {config.jurisdictionNote}
                </p>
              ) : null}
              <div className="mt-5 space-y-5 text-gray-700">
                {config.quickAnswer.map((paragraph) => (
                  <p key={paragraph} className="leading-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            <CtaBand
              title={
                config.slug === 'form-4a-guide'
                  ? 'Check if your Form 4A rent is likely to be challenged'
                  : config.slug === 'section-13-notice'
                    ? 'Check the rent first, then choose the Section 13 route'
                    : 'Before you serve a rent increase, check if it is supportable'
              }
              sourcePage={config.path}
              ctaPosition="top"
            />

            {sampleProof ? <GoldenPackProof data={sampleProof} /> : null}

            {config.sections.map((section, index) => (
              <div key={section.id} className="space-y-8">
                <SectionCard section={section} />
                {index === 2 ? (
                  <CtaBand
                    title={config.midCtaTitle}
                    sourcePage={config.path}
                    ctaPosition="mid"
                  />
                ) : null}
              </div>
            ))}

            <section id="final-cta">
              <CtaBand
                title={config.finalCtaTitle}
                sourcePage={config.path}
                ctaPosition="bottom"
              />
            </section>
          </div>
        </Container>
      </section>

      <section id="faqs" className="bg-[#f7f2ff] py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <FAQSection
              faqs={config.faqs}
              title="FAQs for landlords"
              showContactCTA={false}
              variant="white"
              includeSchema={false}
            />
          </div>
        </Container>
      </section>

      <section className="bg-[#f3eeff] py-12">
        <Container>
          <div className="mx-auto max-w-5xl">
            <RelatedLinks
              title="Related Rent Increase Pages"
              links={config.relatedLinks.map((link) => ({
                href: link.href,
                title: link.label,
                description: 'Read the next page in the Section 13 rent increase journey.',
                icon: 'legal',
                type: 'guide',
              }))}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}

