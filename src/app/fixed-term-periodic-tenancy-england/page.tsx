import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/fixed-term-periodic-tenancy-england');
const wizardHref = '/wizard?product=ast_standard&src=fixed_term_periodic_tenancy_england&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=fixed_term_periodic_tenancy_england&topic=tenancy';

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
      'Compare fixed-term and rolling search intent while moving into the current England agreement route designed for the assured periodic framework.',
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
        subtitle="Use this page if you are comparing fixed-term and periodic tenancy wording in England. If you need the plain-English definition first, start with the periodic tenancy guide, then come back when you are ready to compare routes."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumWizardHref}
        legacyNotice="Landlords still search for fixed-term and rolling tenancy language, but Landlord Heaven no longer sells a new fixed-term AST as the core England product route."
        introTitle="Compare the older wording without getting stuck in it"
        introBody={[
          'Landlords still compare fixed-term and periodic tenancy wording because those labels shaped the older market for years.',
          'The useful next step now is to separate the definition question from the drafting question: understand the difference first, then move into the current England agreement route that matches the property.',
        ]}
        highlights={[
          'Helps landlords compare fixed-term and periodic wording in one place',
          'Keeps the page focused on the comparison query rather than the basic definition',
          'Routes landlords into the current Standard or Premium England agreement flow',
          'Explains the terminology shift without turning the page into an old AST sales page',
        ]}
        compliancePoints={[
          'Makes clear that fixed-term AST language is now legacy search framing on Landlord Heaven England pages',
          'Keeps the live CTA path on the current England agreement flow',
          'Avoids presenting a new fixed-term AST as the default England route',
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
              'Read the plain-English guide if you want the definition of periodic and rolling tenancy before comparing routes.',
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
              'No. This page now exists to handle search intent and explain the topic, while the live product route is the current England agreement flow designed for the assured periodic framework.',
          },
          {
            question: 'Why keep this page live if the product position changed?',
            answer:
              'Because landlords still search for fixed-term and periodic tenancy terms. Keeping the page live preserves rankings while steering users into the current England path.',
          },
          {
            question: 'Where do I start the current England agreement flow?',
            answer:
              'Use the CTA on this page to open the live England tenancy wizard and then choose the Standard or Premium route that matches the let.',
          },
        ]}
      />
    </div>
  );
}
