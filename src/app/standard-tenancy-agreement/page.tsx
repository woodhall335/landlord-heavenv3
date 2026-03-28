import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/standard-tenancy-agreement');
const standardWizardHref = '/wizard?product=ast_standard&src=standard_tenancy_page&topic=tenancy';
const chooserWizardHref =
  '/wizard?product=tenancy_agreement&jurisdiction=england&src=standard_tenancy_page&topic=tenancy';

const standardPackDocuments = getResidentialDocumentList('england_standard_tenancy_agreement', {
  englandTenancyPurpose: 'new_agreement',
  depositTaken: true,
});

function getPackDocument(documentId: string) {
  return standardPackDocuments.find((document) => document.id === documentId);
}

const standardPackHighlights = [
  getPackDocument('england_standard_tenancy_agreement'),
  getPackDocument('pre_tenancy_checklist_england'),
  getPackDocument('england_keys_handover_record'),
  getPackDocument('england_utilities_handover_sheet'),
  getPackDocument('england_pet_request_addendum'),
]
  .filter((document): document is NonNullable<(typeof standardPackDocuments)[number]> => Boolean(document))
  .map((document) => ({
    title: document.title,
    description: document.description,
    supportingLabel: document.pages,
  }));

export const metadata: Metadata = {
  title: 'Standard Tenancy Agreement England | Baseline Residential Route',
  description:
    'Create the Standard England Tenancy Agreement for a straightforward whole-property residential let under the current assured periodic framework.',
  keywords: [
    'standard tenancy agreement england',
    'england tenancy agreement standard',
    'basic tenancy agreement england',
    'periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Standard Tenancy Agreement England | Baseline Residential Route',
    description:
      'Create the Standard England Tenancy Agreement for a straightforward whole-property residential let under the current assured periodic framework.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function StandardTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Standard Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: PRODUCTS.england_standard_tenancy_agreement.label,
          description: PRODUCTS.england_standard_tenancy_agreement.description,
          price: PRODUCTS.england_standard_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/standard-tenancy-agreement"
        title="Standard Tenancy Agreement England"
        subtitle="Choose the Standard England tenancy agreement for a straightforward whole-property residential let where you want the current England route without the broader operational drafting carried in Premium."
        primaryCtaLabel="Start Standard tenancy agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={chooserWizardHref}
        introTitle="Baseline England residential agreement for straightforward lets"
        introBody={[
          'This is the ordinary England residential route for a straightforward whole-property tenancy where the setup does not really need the fuller Premium pack or one of the specialist Student, HMO / Shared House, or Lodger products.',
          'Standard is designed to stay current with the England assured periodic framework from 1 May 2026 while keeping the pack proportionate for landlords who want the core agreement, supporting checklist, and practical handover paperwork without extra management layers.',
        ]}
        highlights={[
          'Baseline ordinary-residential England agreement',
          'Built for straightforward whole-property lets',
          'Separate from Premium, Student, HMO / Shared House, and Lodger products',
          'Guided setup with preview before payment',
        ]}
        compliancePoints={[
          "Designed to reflect the Renters' Rights Act changes from 1 May 2026",
          'Built on the current England assured periodic agreement route',
          'England written-information drafting and practical support documents sit around the main agreement',
          'Use specialist Student, HMO / Shared House, or Lodger routes where the occupation setup needs them',
        ]}
        keywordTargets={[
          'standard tenancy agreement england',
          'england tenancy agreement standard',
          'basic tenancy agreement england',
          'periodic tenancy agreement england',
          'ordinary residential tenancy agreement england',
        ]}
        idealFor={[
          'the tenancy is a straightforward whole-property England let without specialist student, sharer, or resident-landlord features',
          'you want the current England route with the core support pack but do not need the fuller Premium management schedule',
          'you want a cleaner baseline agreement before adding more specialist complexity only where the facts genuinely require it',
        ]}
        notFor={[
          'you want fuller operational drafting around inspections, contractor attendance, key control, and handover detail from the start',
          'the main issue is student occupation, guarantors, or end-of-term student turnover',
          'the property is really a shared house / HMO or a resident-landlord lodger arrangement',
        ]}
        packHighlights={standardPackHighlights}
        routeComparison={[
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Use Premium when the let is still ordinary residential but you want fuller operational drafting and a broader management pack.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Use Student when guarantors, student sharers, replacement procedure, or end-of-term return standards are the real focus.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'Compare Student',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Use HMO / Shared House when communal areas, shared-house controls, or room-by-room occupation are the real complexity.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Use Lodger when the landlord lives at the property and the occupier is sharing the home rather than taking an ordinary residential tenancy.',
            href: '/lodger-agreement',
            ctaLabel: 'Compare Lodger',
          },
        ]}
        faqs={[
          {
            question: 'When should I choose Standard instead of Premium?',
            answer:
              'Choose Standard when the let is a straightforward whole-property England tenancy and you do not need the fuller management, inspection, handover, and operational drafting carried in Premium.',
          },
          {
            question: 'Is Standard still built for the current England route?',
            answer:
              'Yes. Standard is designed around the current England assured periodic framework rather than an older fixed-term AST-style starting point.',
          },
          {
            question: 'What does the Standard pack include?',
            answer:
              'The Standard pack centres on the main agreement and adds the England pre-tenancy checklist plus practical handover and support documents around the tenancy file.',
          },
          {
            question: 'Should I use Standard for a student or HMO let?',
            answer:
              'Usually no. Student and HMO / Shared House now have their own England products, so Standard is best kept for ordinary residential lets that do not need those specialist routes.',
          },
        ]}
        finalCtaBody="Use Standard when the tenancy is straightforward and the property is being let as an ordinary residential whole-property home. If the let needs fuller drafting or a specialist route, compare the other England products before you start."
      />
    </div>
  );
}
