import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'New Tenancy Agreement England | Residential Tenancy Agreement',
  description:
    "Create a new tenancy agreement England landlords can use now through the Residential Tenancy Agreement route updated for the Renters' Rights Act 2025.",
  keywords: [
    'new tenancy agreement england',
    'renters rights compliant tenancy agreement',
    'renters rights act tenancy agreement',
    'new residential tenancy agreement',
    'england tenancy agreement 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'New Tenancy Agreement England | Residential Tenancy Agreement',
    description:
      'Create a new England Residential Tenancy Agreement for standard new lets through the updated England route.',
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
        pagePath="/tenancy-agreement"
        title="New Tenancy Agreement England"
        subtitle="Create a new tenancy agreement for England through the Residential Tenancy Agreement route updated for the Renters' Rights Act 2025. This is the main entry point for standard new lets."
        primaryCtaLabel="Create standard agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View premium agreement"
        secondaryCtaHref="/premium-tenancy-agreement"
        introTitle="New tenancy agreement for England"
        introBody={[
          'If you need a new tenancy agreement for a property in England, this is the main Landlord Heaven route for a standard new let.',
          'It uses the Residential Tenancy Agreement model rather than old AST-first sales wording, and it is designed for the current England tenancy system.',
        ]}
        highlights={[
          'Main entry point for standard new England lets',
          'Residential Tenancy Agreement wording for England',
          'Guided setup with preview before payment',
          'Saved in your account after purchase',
        ]}
        compliancePoints={[
          "Updated for the Renters' Rights Act 2025",
          'Designed for the new England tenancy system',
          'Not positioned as an assured shorthold tenancy for new agreements',
          'No live Section 21 positioning in the core England tenancy product path',
        ]}
        faqs={[
          {
            question: 'Is this page for a new tenancy agreement in England?',
            answer:
              'Yes. This is the main Landlord Heaven page for a standard new tenancy agreement in England.',
          },
          {
            question: 'Is this still an AST?',
            answer:
              "No. For new England agreements, the live product is positioned as a Residential Tenancy Agreement updated for the Renters' Rights Act 2025 rather than an AST-first product.",
          },
          {
            question: 'What if I need a more complex England agreement?',
            answer:
              'If the property is an HMO, a student let, or a more complex shared setup, the premium route is usually the better fit because it gives you broader wording from the start.',
          },
          {
            question: 'What if the property is not in England?',
            answer:
              'Landlord Heaven also has jurisdiction-specific routes for Wales, Scotland, and Northern Ireland. The agreement should always match where the property is located.',
          },
        ]}
      />
    </div>
  );
}


