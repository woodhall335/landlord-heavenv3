import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement-template');
const wizardHref = '/wizard?product=ast_standard&jurisdiction=england&src=seo_tenancy_agreement_template&topic=tenancy';

export const metadata: Metadata = {
  title: '2026 Tenancy Agreement Template | England Residential Tenancy Agreement',
  description:
    'Use our 2026 tenancy agreement template page to create an England Residential Tenancy Agreement updated for the Renters’ Rights Act 2025.',
  keywords: [
    '2026 tenancy agreement',
    'tenancy agreement template 2026',
    'new tenancy agreement template england',
    'residential tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: '2026 Tenancy Agreement Template | England Residential Tenancy Agreement',
    description:
      'Create an updated England Residential Tenancy Agreement from our 2026 tenancy agreement template flow.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        title="2026 Tenancy Agreement Template"
        subtitle="Start from our updated template-led England flow and generate a Residential Tenancy Agreement positioned for the Renters’ Rights Act 2025 era."
        primaryCtaLabel="Use 2026 template flow"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View the main product"
        secondaryCtaHref="/tenancy-agreement"
        introTitle="Template search intent, updated England product"
        introBody={[
          'This page targets landlords searching for a 2026 tenancy agreement or tenancy agreement template 2026, while directing them into the updated England Residential Tenancy Agreement flow.',
          'The body copy uses Act terminology for legal clarity, but the page is optimised around the newer search demand for updated England tenancy agreement templates.',
        ]}
        highlights={[
          '2026 tenancy agreement template positioning for England search demand',
          'Residential Tenancy Agreement wording instead of live AST-first England copy',
          'Updated wizard, supporting terms, and tenancy pack language',
          'Built to feed landlords directly into the current England self-serve flow',
        ]}
        compliancePoints={[
          'Updated for the Renters’ Rights Act 2025 England product position',
          'Public page now frames England as a Residential Tenancy Agreement route',
          'Designed to rank for 2026 and updated-template search intent',
        ]}
        keywordTargets={[
          '2026 tenancy agreement',
          'tenancy agreement template 2026',
          'new tenancy agreement template england',
          'residential tenancy agreement england',
        ]}
      />
    </div>
  );
}
