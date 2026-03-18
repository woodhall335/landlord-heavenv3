import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreements/england');
const wizardHref = '/wizard?product=ast_standard&jurisdiction=england&src=seo_tenancy_agreements_england&topic=tenancy';

export const metadata: Metadata = {
  title: 'Tenancy Agreements England 2026 | Residential Tenancy Agreement',
  description:
    'England tenancy agreements page updated to promote the Residential Tenancy Agreement flow and Renters’ Rights compliant positioning.',
  keywords: [
    'tenancy agreements england',
    'residential tenancy agreement england',
    'renters rights compliant tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function EnglandTenancyAgreementsPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreements England', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        title="Tenancy Agreements England"
        subtitle="Explore the updated England tenancy agreement position: Residential Tenancy Agreement wording, Renters’ Rights compliant positioning, and a live wizard route built for the upgraded England flow."
        primaryCtaLabel="Start England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Premium England agreement"
        secondaryCtaHref="/premium-tenancy-agreement"
        introTitle="England landing page, upgraded"
        introBody={[
          'This page now acts as an England tenancy agreements landing page built around the Residential Tenancy Agreement wording rather than Standard AST / Premium AST sales copy.',
          'It is one of the main England SEO entry points for the updated product family.',
        ]}
        highlights={[
          'England-first Residential Tenancy Agreement positioning',
          'Updated wizard and page language aligned to the Renters’ Rights Act 2025 public stance',
          'Strong internal linking into standard and premium England tenancy routes',
        ]}
        compliancePoints={[
          'Renters’ Rights compliant wording on the live England tenancy page',
          'No live AST sales positioning on this England landing page',
        ]}
      />
    </div>
  );
}
