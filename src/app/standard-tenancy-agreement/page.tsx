import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/standard-tenancy-agreement');
const standardWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_standard_tenancy_agreement&src=standard_tenancy_page&topic=tenancy';
const englandHubHref = '/products/ast';

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
  title: 'Assured Periodic Tenancy Agreement England | Baseline Residential Route',
  description:
    'Create the England Assured Periodic Tenancy Agreement for a straightforward whole-property residential let under the current England framework.',
  keywords: [
    'assured periodic tenancy agreement england',
    'england assured periodic tenancy agreement',
    'standard tenancy agreement england',
    'england tenancy agreement standard',
    'basic tenancy agreement england',
    'periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Assured Periodic Tenancy Agreement England | Baseline Residential Route',
    description:
      'Create the England Assured Periodic Tenancy Agreement for a straightforward whole-property residential let under the current England framework.',
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
          { name: 'Assured Periodic Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Assured Periodic Tenancy Agreement',
          description: PRODUCTS.england_standard_tenancy_agreement.description,
          price: PRODUCTS.england_standard_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/standard-tenancy-agreement"
        title="Assured Periodic Tenancy Agreement England"
        subtitle="Use this England assured periodic tenancy agreement if you are letting a whole property on a straightforward residential tenancy and you do not need student, HMO, lodger, or extra Premium detail."
        primaryCtaLabel="Start assured periodic tenancy agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        introTitle="For a normal whole-property let"
        introBody={[
          'This is the baseline England assured periodic route for a straightforward whole-property tenancy. Use it when the let is fairly standard and you do not need the extra operational detail in the Premium assured periodic route or one of the specialist products.',
          'The pack is designed to cover the main agreement and the practical paperwork around it without turning a simple tenancy into something bloated or overcomplicated.',
        ]}
        highlights={[
          'England assured periodic agreement for a normal whole-property residential let',
          'Keeps the wording and support paperwork proportionate',
          'Separate from the Premium assured periodic, Student, HMO / Shared House, and Lodger routes',
          'Guided setup with a preview before payment',
        ]}
        compliancePoints={[
          "Built around the current England assured periodic route from 1 May 2026.",
          "Covers the written-information points needed for the main England residential tenancy route.",
          'Comes with the practical England support paperwork around the agreement.',
          'Where the facts are really student, shared-house, or resident-landlord, use the specialist route instead.',
        ]}
        keywordTargets={[
          'standard tenancy agreement england',
          'england tenancy agreement standard',
          'basic tenancy agreement england',
          'periodic tenancy agreement england',
          'ordinary residential tenancy agreement england',
        ]}
        idealFor={[
          'the tenancy is a straightforward whole-property England let',
          'you want the current England route with the core support pack but not the fuller Premium assured periodic schedule',
          'you want a clean baseline agreement without specialist student, shared-house, or resident-landlord wording',
        ]}
        notFor={[
          'you want fuller wording around inspections, repairs handling, keys, contractor access, and handover from the start',
          'the main issue is student occupation, guarantors, or end-of-term student turnover',
          'the property is really a shared house / HMO or a room let in the landlord home',
        ]}
        packHighlights={standardPackHighlights}
        routeComparison={[
          {
            title: 'Premium Assured Periodic Tenancy Agreement',
            description:
              'Use the Premium assured periodic route when the let is still ordinary residential but you want fuller operational drafting and a broader management pack.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium assured periodic route',
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
            question: 'When should I choose this instead of the Premium assured periodic route?',
            answer:
              'Choose this route when the let is a straightforward whole-property England tenancy and you do not need the fuller management, inspection, handover, and operational drafting carried in the Premium assured periodic route.',
          },
          {
            question: 'Is this still built for the current England route?',
            answer:
              'Yes. This page is built around the current England assured periodic framework rather than an older fixed-term AST-style starting point.',
          },
          {
            question: 'What does this assured periodic pack include?',
            answer:
              'The pack centres on the main agreement and adds the England pre-tenancy checklist plus practical handover and support documents around the tenancy file.',
          },
          {
            question: 'Should I use this for a student or HMO let?',
            answer:
              'Usually no. Student and HMO / Shared House now have their own England products, so this baseline assured periodic route is best kept for ordinary residential lets that do not need those specialist routes.',
          },
        ]}
        finalCtaBody="Use this assured periodic route when the tenancy is straightforward and the property is being let as an ordinary whole-property home. If you need fuller day-to-day wording or a specialist route, compare the other England products first."
      />
    </div>
  );
}
