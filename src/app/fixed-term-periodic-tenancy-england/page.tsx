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
  title: 'Fixed Term vs Periodic Tenancy England | Legacy Search Guide 2026',
  description:
    'England guide for landlords comparing fixed-term and periodic tenancy search language.',
  keywords: [
    'fixed term tenancy agreement england',
    'periodic tenancy agreement england',
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
        subtitle="This page stays live for fixed-term and rolling-tenancy search demand, but from 1 May 2026 new England agreements generally move into the assured periodic framework rather than a new fixed-term AST model."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumWizardHref}
        legacyNotice="Landlords still search for fixed-term and rolling tenancy language, but Landlord Heaven no longer sells a new fixed-term AST as the core England product route."
        introTitle="Legacy structure search, current England wording"
        introBody={[
          'Landlords still search for fixed-term and periodic tenancy structures, so this page remains live as an explainer rather than a fixed-term AST sales page.',
          'The live England route now uses current England tenancy agreement wording designed for the assured periodic framework from 1 May 2026.',
        ]}
        highlights={[
          'Captures fixed-term and rolling-tenancy search intent for England',
          'Routes landlords into the current Standard or Premium England agreement flow',
          'Explains the terminology shift without keeping outdated AST sales copy',
          'Helps landlords compare old search language with the current framework',
        ]}
        compliancePoints={[
          'Makes clear that fixed-term AST language is now legacy search framing on Landlord Heaven England pages',
          'Keeps the live CTA path on the current England agreement flow',
          'Avoids presenting a new fixed-term AST as the default England route',
        ]}
        keywordTargets={[
          'fixed term tenancy agreement england',
          'periodic tenancy agreement england',
          'fixed term vs periodic tenancy',
          'rolling tenancy england',
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
