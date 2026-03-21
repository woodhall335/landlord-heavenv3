import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/rolling-tenancy-agreement');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Rolling Tenancy Agreement England 2026 | Periodic Guide',
  description:
    'Guide to rolling tenancy agreement and periodic tenancy wording in England. Updated to point landlords into the current Residential Tenancy Agreement flow.',
  keywords: [
    'rolling tenancy agreement',
    'periodic tenancy agreement',
    'residential tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function RollingTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Rolling Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/rolling-tenancy-agreement"
        title="Rolling Tenancy Agreement"
        subtitle="Periodic tenancies remain a strong search term. This page now supports that demand while aligning users with the updated England Residential Tenancy Agreement flow."
        primaryCtaLabel="Start England periodic agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Main England tenancy page"
        secondaryCtaHref="/tenancy-agreement"
        introTitle="Periodic tenancy demand now aligns with the live England product"
        introBody={[
          'Of the older England tenancy search terms, rolling tenancy agreement is the closest to the updated assured periodic model now used in the live self-serve flow.',
          'This page therefore acts as both an explainer and a forward path into the current Residential Tenancy Agreement product.',
        ]}
        highlights={[
          'Strong alignment between periodic search demand and the updated England product',
          'Clear Renters’ Rights compliant positioning in the CTA path',
          'Modern England language instead of Section 21-led tenancy framing',
        ]}
        compliancePoints={[
          'Updated public positioning for the current England tenancy route',
          'Periodic/rolling concepts used as education, not as legacy AST sales language',
        ]}
      />
    </div>
  );
}


