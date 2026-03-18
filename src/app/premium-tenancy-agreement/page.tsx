import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const wizardHref = '/wizard?product=ast_premium&jurisdiction=england&src=seo_premium_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'HMO Residential Tenancy Agreement England 2026 | Premium',
  description:
    'Create a premium England Residential Tenancy Agreement for HMOs, student lets, and shared houses. Updated for the Renters’ Rights Act 2025.',
  keywords: [
    'hmo residential tenancy agreement england',
    'student tenancy agreement england 2026',
    'premium tenancy agreement england',
    'renters rights compliant tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'HMO Residential Tenancy Agreement England 2026 | Premium',
    description:
      'Premium England Residential Tenancy Agreement with HMO, student-ready, and guarantor-support wording.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function PremiumTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Premium Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        title="Premium Residential Tenancy Agreement"
        subtitle="Generate a premium England Residential Tenancy Agreement for HMOs, student-ready lets, guarantors, and stronger operational terms, updated for the Renters’ Rights Act 2025."
        primaryCtaLabel="Create premium agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View standard agreement"
        secondaryCtaHref="/tenancy-agreement"
        introTitle="Premium England tenancy paperwork"
        introBody={[
          'This premium page targets landlords looking for an HMO residential tenancy agreement England can use now, with upgraded wording for shared living, student-ready use, and stronger landlord controls.',
          'The premium flow stays on the new England Residential Tenancy Agreement model while adding enhanced wording for guarantors, property standards, and premium operational clauses.',
        ]}
        highlights={[
          'Premium England Residential Tenancy Agreement positioning instead of Premium AST branding',
          'HMO, student-ready, guarantor, and shared-living clause support',
          'Updated supporting checklist, acknowledgements, and terms to match the England tenancy upgrade',
          'Wizard-led pack with inventory/checklist support for higher-control lets',
        ]}
        compliancePoints={[
          'Updated for the Renters’ Rights Act 2025 England product position',
          'Publicly framed as a Renters’ Rights compliant premium England tenancy flow',
          'No live Section 21 or fixed-term AST positioning in the premium England path',
          'Designed for shared houses, student accommodation setups, and advanced landlord use cases within the supported flow',
        ]}
        keywordTargets={[
          'hmo residential tenancy agreement england',
          'student tenancy agreement england 2026',
          'premium tenancy agreement england',
          'renters rights compliant tenancy agreement',
        ]}
        faqs={[
          {
            question: 'Who should use the premium England tenancy agreement?',
            answer:
              'Landlords with HMOs, shared houses, student-ready properties, guarantor-backed lets, or anyone who wants stronger clause coverage than the standard England agreement.',
          },
          {
            question: 'Is the premium page also updated for Renters’ Rights?',
            answer:
              'Yes. The premium England tenancy flow is positioned as part of the same updated Residential Tenancy Agreement model and public compliance wording.',
          },
        ]}
      />
    </div>
  );
}
