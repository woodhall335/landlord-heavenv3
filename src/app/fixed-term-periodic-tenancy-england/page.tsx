import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/fixed-term-periodic-tenancy-england');
const standardAgreementHref = '/standard-tenancy-agreement';
const premiumAgreementHref = '/premium-tenancy-agreement';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Fixed Term vs Periodic Tenancy | England Comparison Guide',
  description:
    'England guide for landlords comparing fixed-term and periodic tenancy wording, with a clear route to the periodic tenancy explainer and the current agreement pages.',
  keywords: [
    'fixed term tenancy agreement england',
    'fixed term vs periodic tenancy',
    'rolling tenancy england',
    'assured periodic tenancy england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Fixed Term vs Periodic Tenancy England | Legacy Search Guide 2026',
    description:
      'Compare fixed-term and rolling tenancy wording, then move into the current England agreement route designed for the assured periodic framework.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function FixedTermPeriodicTenancyEnglandPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Fixed Term vs Periodic Tenancy England', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/fixed-term-periodic-tenancy-england"
        title="Fixed Term vs Periodic Tenancy England"
        subtitle="Compare fixed-term and periodic tenancy wording in England, understand what changed in 2026 and choose a current agreement for a new let."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardAgreementHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumAgreementHref}
        legacyNotice="Fixed-term and rolling tenancy language remains familiar, but a new England tenancy now needs an agreement written for the assured periodic framework."
        introTitle="Compare the older wording without getting stuck in it"
        introBody={[
          'Landlords still compare fixed-term and periodic tenancy wording because those labels shaped the older market for years.',
          'First understand the difference between the terms. Then choose the current England agreement that matches the property and occupiers.',
        ]}
        highlights={[
          'Helps landlords compare fixed-term and periodic wording in one place',
          'Explains the practical difference between the two terms',
          'Links landlords to current Standard and Premium England agreements',
          'Explains the terminology shift without turning the page into an old AST sales page',
        ]}
        compliancePoints={[
          'Makes clear that fixed-term AST language describes the older England position',
          'Directs new lets to current England agreements',
          'Does not present a fixed-term AST as the default for a new England tenancy',
        ]}
        keywordTargets={[
          'fixed term tenancy agreement england',
          'fixed term vs periodic tenancy',
          'rolling tenancy england',
        ]}
        routeComparison={[
          {
            title: 'What is a periodic tenancy?',
            description:
              'Read the plain-English guide if you want the definition of periodic and rolling tenancy before choosing an agreement.',
            href: '/periodic-tenancy-agreement',
            ctaLabel: 'Read the periodic tenancy guide',
          },
          {
            title: 'Rolling tenancy guide',
            description:
              'Use the rolling-tenancy page if your search started with the everyday phrase landlords often use for a periodic tenancy.',
            href: '/rolling-tenancy-agreement',
            ctaLabel: 'Read the rolling tenancy guide',
          },
        ]}
        faqs={[
          {
            question: 'Does Landlord Heaven still sell fixed-term ASTs as the main England product?',
            answer:
              'No. This guide explains the older fixed-term and rolling terminology. Current Standard and Premium agreements use the assured periodic framework.',
          },
          {
            question: 'Why do landlords still use fixed-term wording?',
            answer:
              'Because fixed-term ASTs were widely used before the 2026 changes and the terminology remains common in older agreements and landlord guidance.',
          },
          {
            question: 'Where do I start the current England agreement flow?',
            answer:
              'Choose Standard or Premium using the buttons on this page. The right option depends on the letting arrangement and how much management detail you need.',
          },
        ]}
      />
    </div>
  );
}
