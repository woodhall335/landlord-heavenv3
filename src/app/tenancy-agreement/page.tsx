import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement');
const wizardHref = '/wizard?product=ast_standard&jurisdiction=england&src=seo_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'New Tenancy Agreement England 2026 | Renters’ Rights Compliant',
  description:
    'Create a new tenancy agreement England landlords can use now: a Renters’ Rights compliant Residential Tenancy Agreement updated for the Renters’ Rights Act 2025.',
  keywords: [
    'new tenancy agreement england',
    'renters rights compliant tenancy agreement',
    'renters rights act tenancy agreement',
    'new residential tenancy agreement',
    'england tenancy agreement 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'New Tenancy Agreement England 2026 | Renters’ Rights Compliant',
    description:
      'Generate a Renters’ Rights compliant England Residential Tenancy Agreement for new lets.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        title="New Tenancy Agreement England"
        subtitle="Create a Renters’ Rights compliant England Residential Tenancy Agreement updated for the Renters’ Rights Act 2025 and built for the upgraded assured periodic model."
        primaryCtaLabel="Create standard agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View premium agreement"
        secondaryCtaHref="/premium-tenancy-agreement"
        introTitle="England Residential Tenancy Agreement"
        introBody={[
          'Landlord Heaven now positions the England tenancy product as a Residential Tenancy Agreement rather than an AST-first workflow.',
          'This page targets landlords searching for a new tenancy agreement England can use now, with wording, wizard prompts, and support documents updated for the Renters’ Rights Act 2025 transition.',
        ]}
        highlights={[
          'England Residential Tenancy Agreement wording instead of live AST sales copy',
          'Updated tenant notice wording and landlord possession wording for the supported England flow',
          'Wizard-led document generation with supporting checklist, acknowledgements, and terms',
          'Jurisdiction-aware handling for Wales, Scotland, and Northern Ireland on the same product family',
        ]}
        compliancePoints={[
          'Positioned as Renters’ Rights compliant for the supported new England agreement flow',
          'Updated for the Renters’ Rights Act 2025 public language and England terminology',
          'No live Section 21 positioning in the core England tenancy product path',
          'Designed around the upgraded assured periodic England self-serve model',
        ]}
        keywordTargets={[
          'new tenancy agreement england',
          'renters rights compliant tenancy agreement',
          'renters rights act tenancy agreement',
          'new residential tenancy agreement',
          'england tenancy agreement 2026',
        ]}
        faqs={[
          {
            question: 'Is this page for a new tenancy agreement in England?',
            answer:
              'Yes. This page is the main entry point for new England tenancy agreements created through the updated Residential Tenancy Agreement flow.',
          },
          {
            question: 'Does Landlord Heaven still position this as an AST for England?',
            answer:
              'No. The live England product is positioned as a Residential Tenancy Agreement updated for the Renters’ Rights Act 2025 flow, while AST pages are retained as legacy explainers for search demand.',
          },
          {
            question: 'Can existing written tenancies use this page?',
            answer:
              'Existing written tenancies usually need transition information rather than a full replacement agreement. The updated wizard now signals that distinction earlier in the England flow.',
          },
        ]}
      />
    </div>
  );
}
