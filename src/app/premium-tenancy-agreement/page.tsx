import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';
const chooserWizardHref = '/wizard?product=tenancy_agreement&jurisdiction=england&src=england_tenancy_page&topic=tenancy';
const premiumPackDocuments = getResidentialDocumentList('england_premium_tenancy_agreement', {
  englandTenancyPurpose: 'new_agreement',
  depositTaken: true,
  includeGuarantorDeed: true,
});

function getPackDocument(documentId: string) {
  return premiumPackDocuments.find((document) => document.id === documentId);
}

const premiumPackHighlights = [
  getPackDocument('england_premium_tenancy_agreement'),
  getPackDocument('england_premium_management_schedule'),
  getPackDocument('england_keys_handover_record'),
  getPackDocument('england_utilities_handover_sheet'),
  getPackDocument('england_tenancy_variation_record'),
]
  .filter((document): document is NonNullable<(typeof premiumPackDocuments)[number]> => Boolean(document))
  .map((document) => ({
    title: document.title,
    description: document.description,
    supportingLabel: document.pages,
  }));

export const metadata: Metadata = {
  title: 'Premium Tenancy Agreement England | Fuller Residential Drafting',
  description:
    'Create the Premium England Tenancy Agreement for an ordinary residential let needing fuller drafting and more operational detail than the Standard route.',
  keywords: [
    'premium tenancy agreement england',
    'england premium residential tenancy agreement',
    'england tenancy agreement premium',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Premium Tenancy Agreement England | Fuller Residential Drafting',
    description:
      'Premium England tenancy agreement for ordinary residential lets that need fuller drafting and more operational detail than the baseline standard route.',
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
      <StructuredData
        data={productSchema({
          name: PRODUCTS.england_premium_tenancy_agreement.label,
          description: PRODUCTS.england_premium_tenancy_agreement.description,
          price: PRODUCTS.england_premium_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/premium-tenancy-agreement"
        title="Premium Tenancy Agreement England"
        subtitle="Choose the Premium England tenancy agreement when the let is still an ordinary residential arrangement but you want fuller drafting, more operational detail, and a more tailored agreement than the Standard route."
        primaryCtaLabel="Start Premium tenancy agreement"
        primaryCtaHref={premiumWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={chooserWizardHref}
        introTitle="Premium for fuller ordinary-residential drafting"
        introBody={[
          'This page is for landlords who need more than the baseline Standard agreement but do not need a separate Student, HMO / Shared House, or Lodger product.',
          'The Premium route uses the same current England framework as Standard, but adds fuller operational drafting, more optional detail, and a more tailored agreement summary before checkout. Older agreements may be harder to rely on if they use outdated wording or structure.',
        ]}
        highlights={[
          'Built for ordinary residential lets that need more detail than the baseline route',
          'Broader operational wording and optional detail',
          'Separate from Student, HMO / Shared House, and Lodger products',
          'Guided setup with preview before payment',
        ]}
        compliancePoints={[
          "Designed to reflect the Renters' Rights Act changes from 1 May 2026",
          'Built on the current England assured periodic agreement route',
          'Using wording that does not reflect the current England framework can lead to weaker protection or complications if issues arise',
          'Not sold as a fixed-term AST product',
        ]}
        keywordTargets={[
          'premium tenancy agreement england',
          'england premium residential tenancy agreement',
          'england tenancy agreement with guarantor',
          'england tenancy agreement management schedule',
          'premium landlord tenancy agreement england',
        ]}
        idealFor={[
          'the let is still an ordinary whole-property England tenancy but you want fuller drafting than the Standard route',
          'you want clearer operational wording around repairs reporting, access, contractor attendance, key control, and hand-back expectations',
          'you want a stronger supporting pack with a management schedule, handover records, utilities notes, pet-consent record, and variation paperwork',
        ]}
        notFor={[
          'the real issue is student occupation, guarantor-led student turnover, or end-of-term student hand-back',
          'the property is really an HMO or shared-house setup with communal-area controls and sharer house rules',
          'the landlord lives at the property and the arrangement is really a lodger or resident-landlord room let',
          'you only need the simplest baseline residential route and do not want the fuller operational pack',
        ]}
        packHighlights={premiumPackHighlights}
        routeComparison={[
          {
            title: 'Standard Tenancy Agreement',
            description:
              'Use Standard if the let is straightforward and you do not need the fuller management and handover drafting carried in Premium.',
            href: '/tenancy-agreement',
            ctaLabel: 'Compare Standard',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Use the Student route when guarantors, student sharers, replacement procedure, or end-of-term return expectations are the real focus.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'View Student route',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Use HMO / Shared House when the product needs communal-area rules, shared-house controls, or HMO-style occupation detail.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'View HMO route',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Use Lodger when the landlord is resident and the occupier is sharing the home rather than taking an ordinary residential tenancy.',
            href: '/lodger-agreement',
            ctaLabel: 'View Lodger route',
          },
        ]}
        faqs={[
          {
            question: 'When should I choose Premium over Standard?',
            answer:
              'Choose Premium when the let is still an ordinary residential arrangement but you want fuller drafting, more operational detail, or a more tailored agreement than the baseline Standard route.',
          },
          {
            question: 'Do I need Premium for an HMO or student let?',
            answer:
              'No. England now has dedicated Student and HMO / Shared House products, so Premium is no longer the catch-all route for those arrangements.',
          },
          {
            question: 'Is the premium route still updated for the new England system?',
            answer:
              'Yes. Premium sits on the same current England route as Standard. The difference is the level of wording and coverage, not the legal direction of the product.',
          },
          {
            question: 'What if I am still using an older agreement?',
            answer:
              'Many older tenancy agreements still exist, but they may be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty if issues arise, especially on more complex lets.',
          },
          {
            question: 'Can I still use Standard if the let is straightforward?',
            answer:
              'Yes. If the tenancy is relatively simple, the standard agreement is usually the more proportionate choice.',
          },
        ]}
        finalCtaBody="Use Premium when you want fuller ordinary-residential drafting. If the setup is student-focused, shared-house/HMO, or a resident-landlord room let, choose the dedicated England product for that route instead."
      />
    </div>
  );
}


