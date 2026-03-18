import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement-template');
const wizardHref =
  '/wizard?product=ast_standard&jurisdiction=england&src=seo_tenancy_agreement_template&topic=tenancy';

export const metadata: Metadata = {
  title: 'Tenancy Agreement Template 2026 | England Residential Tenancy Agreement',
  description:
    "Start with our tenancy agreement template 2026 route for England and generate a Residential Tenancy Agreement updated for the Renters' Rights Act 2025.",
  keywords: [
    '2026 tenancy agreement',
    'tenancy agreement template 2026',
    'new tenancy agreement template england',
    'residential tenancy agreement england',
    'renters rights bill tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement Template 2026 | England Residential Tenancy Agreement',
    description:
      'Create an updated England Residential Tenancy Agreement from our tenancy agreement template 2026 route.',
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
        subtitle="Start with our 2026 tenancy agreement template route for England and generate a Residential Tenancy Agreement updated for the Renters' Rights Act 2025. This page is for landlords who want an updated template, not an old AST download."
        primaryCtaLabel="Use 2026 template flow"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View the main product"
        secondaryCtaHref="/tenancy-agreement"
        legacyNotice="If you searched for a 2026 tenancy agreement template, this page routes you into the live England product rather than a static download."
        introTitle="Looking for a tenancy agreement template?"
        introBody={[
          'If you searched for a 2026 tenancy agreement template, this is the right starting point for a new England agreement.',
          'Instead of downloading a static file and editing it yourself, you answer guided questions and generate the England Residential Tenancy Agreement that fits the let.',
        ]}
        highlights={[
          'Template-led route for landlords searching 2026 terms',
          'England Residential Tenancy Agreement wording, not old AST-first sales copy',
          'Guided setup with preview before payment',
          'Saved in your account after purchase',
        ]}
        compliancePoints={[
          "Updated for the Renters' Rights Act 2025",
          'Designed for the new England tenancy system',
          'Routes template search intent into the live England product',
          'Uses current England terminology instead of old AST framing',
        ]}
        faqs={[
          {
            question: 'Is this a downloadable blank template?',
            answer:
              'No. This page takes template-style search intent and routes it into the live England agreement builder. You answer guided questions and generate the document from there.',
          },
          {
            question: 'Why does this page say Residential Tenancy Agreement instead of AST?',
            answer:
              "Because the live England route is now framed as a Residential Tenancy Agreement updated for the Renters' Rights Act 2025, rather than an AST-first product.",
          },
          {
            question: "I searched for a Renters' Rights Bill tenancy agreement template. Is this the right page?",
            answer:
              "Yes. People still search using the Bill wording, but the law is now the Renters' Rights Act 2025. This page routes that search intent into the current England agreement flow.",
          },
          {
            question: 'Can I use this page if the property is outside England?',
            answer:
              'Use the route that matches the property location. Landlord Heaven also has separate tenancy agreement routes for Wales, Scotland, and Northern Ireland.',
          },
        ]}
      />
    </div>
  );
}
