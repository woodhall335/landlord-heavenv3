import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/fixed-term-periodic-tenancy-england');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Fixed Term vs Periodic Tenancy England | Legacy Structure Guide',
  description:
    "England guide for landlords searching fixed-term or periodic tenancy structures. The live Landlord Heaven route now uses a Residential Tenancy Agreement flow instead of fixed-term AST-first product positioning.",
  keywords: [
    'fixed term tenancy agreement england',
    'periodic tenancy agreement england',
    'fixed term vs periodic tenancy',
    'rolling tenancy england',
    'new tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Fixed Term vs Periodic Tenancy England | Legacy Structure Guide',
    description:
      'Compare fixed-term and rolling search intent while moving into the updated England Residential Tenancy Agreement flow.',
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
        subtitle="This England guide stays live for fixed-term and rolling-tenancy search demand, but the live Landlord Heaven product is now the updated Residential Tenancy Agreement flow."
        primaryCtaLabel="Start England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View the main England agreement page"
        secondaryCtaHref="/tenancy-agreement"
        legacyNotice="Fixed-term and rolling-tenancy search demand still matters in England, but Landlord Heaven no longer positions a fixed-term AST as the core self-serve product route."
        introTitle="Legacy tenancy-structure query, updated England product"
        introBody={[
          'Landlords still search for fixed-term and periodic tenancy structures, so this page remains live as an explainer rather than a fixed-term AST sales page.',
          "The live England route now uses Residential Tenancy Agreement wording and Renters' Rights compliant product positioning instead of promoting fixed-term AST structures as the default path.",
        ]}
        highlights={[
          'Captures fixed-term and rolling-tenancy search intent for England',
          'Routes landlords into the updated Residential Tenancy Agreement wizard',
          'Explains the terminology shift without keeping live AST-first sales copy',
          'Supports the updated England tenancy product position across SEO pages',
        ]}
        compliancePoints={[
          "Makes clear that fixed-term AST language is now legacy search framing on Landlord Heaven's England pages",
          "Keeps the live CTA path on the updated England Residential Tenancy Agreement flow",
          "Avoids live Section 21-led tenancy framing on the page itself",
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
              'No. This page now exists to handle search intent and explain the topic, while the live product route is the updated Residential Tenancy Agreement flow.',
          },
          {
            question: 'Why keep this page live if the product has changed?',
            answer:
              'Because landlords still search for fixed-term and periodic tenancy terms. Keeping the page live preserves rankings while steering users into the updated England path.',
          },
          {
            question: 'Where do I start the current England agreement flow?',
            answer:
              'Use the CTA on this page to open the live England tenancy wizard, which now uses Residential Tenancy Agreement wording throughout the public flow.',
          },
        ]}
      />
    </div>
  );
}


