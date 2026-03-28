import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const premiumWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_premium_tenancy_agreement&src=england_tenancy_page&topic=tenancy';
const englandHubHref = '/products/ast';
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
  title: 'Premium Assured Periodic Tenancy Agreement England | Fuller Residential Drafting',
  description:
    'Create the Premium Assured Periodic Tenancy Agreement for an ordinary residential let needing fuller drafting and more operational detail than the baseline assured periodic route.',
  keywords: [
    'premium assured periodic tenancy agreement england',
    'england premium assured periodic tenancy agreement',
    'premium tenancy agreement england',
    'england premium residential tenancy agreement',
    'england tenancy agreement premium',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Premium Assured Periodic Tenancy Agreement England | Fuller Residential Drafting',
    description:
      'Premium assured periodic tenancy agreement for ordinary residential lets that need fuller drafting and more operational detail than the baseline assured periodic route.',
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
          { name: 'Premium Assured Periodic Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Premium Assured Periodic Tenancy Agreement',
          description: PRODUCTS.england_premium_tenancy_agreement.description,
          price: PRODUCTS.england_premium_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/premium-tenancy-agreement"
        title="Premium Assured Periodic Tenancy Agreement England"
        subtitle="Use this when the tenancy is still a normal residential let, but you want fuller wording around access, repairs, handover, keys, and day-to-day management than the baseline assured periodic route gives you."
        primaryCtaLabel="Start premium assured periodic tenancy agreement"
        primaryCtaHref={premiumWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        introTitle="For a normal residential let with more detail built in"
        introBody={[
          'This page is for landlords who need more than the baseline assured periodic agreement but do not need a separate Student, HMO / Shared House, or Lodger product.',
          'Premium keeps the tenancy on the ordinary residential route, but adds more detail around inspections, repairs reporting, key handling, contractor access, utilities handover, and move-out expectations.',
        ]}
        highlights={[
          'Premium assured periodic route for ordinary residential lets that need more detail than the baseline version',
          'Adds fuller wording around management and handover',
          'Separate from Student, HMO / Shared House, and Lodger',
          'Guided setup with a preview before payment',
        ]}
        compliancePoints={[
          "Built on the same current England assured periodic route as Standard from 1 May 2026.",
          'Adds depth without pretending that HMO, student, or lodger cases are all just Premium.',
          'Includes the practical written-information and support paperwork needed around the agreement.',
          'Not positioned as an old fixed-term AST shortcut product.',
        ]}
        keywordTargets={[
          'premium tenancy agreement england',
          'england premium residential tenancy agreement',
          'england tenancy agreement with guarantor',
          'england tenancy agreement management schedule',
          'premium landlord tenancy agreement england',
        ]}
        idealFor={[
          'the let is still an ordinary whole-property England tenancy but you want fuller drafting than the baseline assured periodic route',
          'you want clearer wording around repairs reporting, access, contractor attendance, key control, and hand-back expectations',
          'you want a stronger supporting pack with a management schedule and handover paperwork',
        ]}
        notFor={[
          'the real issue is student occupation, student turnover, or guarantor-heavy student letting',
          'the property is really an HMO or shared house with communal-area controls and sharer house rules',
          'the landlord lives at the property and the arrangement is really a lodger room let',
          'you only need the simpler baseline residential route',
        ]}
        packHighlights={premiumPackHighlights}
        routeComparison={[
          {
            title: 'Assured Periodic Tenancy Agreement',
            description:
              'Use the baseline assured periodic route if the let is straightforward and you do not need the fuller management and handover drafting carried in Premium.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Compare baseline assured periodic route',
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
            question: 'When should I choose Premium over the baseline assured periodic route?',
            answer:
              'Choose Premium when the let is still an ordinary residential arrangement but you want fuller drafting, more operational detail, or a more tailored agreement than the baseline assured periodic route.',
          },
          {
            question: 'Do I need Premium for an HMO or student let?',
            answer:
              'No. England now has dedicated Student and HMO / Shared House products, so Premium is no longer the catch-all route for those arrangements.',
          },
          {
            question: 'Is the premium route still updated for the new England system?',
            answer:
              'Yes. Premium sits on the same current England assured periodic route as the baseline version. The difference is the level of wording and coverage, not the legal direction of the product.',
          },
          {
            question: 'What if I am still using an older agreement?',
            answer:
              'Many older tenancy agreements still exist, but they may be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty if issues arise, especially on more complex lets.',
          },
          {
            question: 'Can I still use the baseline assured periodic route if the let is straightforward?',
            answer:
              'Yes. If the tenancy is relatively simple, the baseline assured periodic agreement is usually the more proportionate choice.',
          },
        ]}
        finalCtaBody="Use the Premium assured periodic route when the tenancy is still a normal residential let but you want fuller wording and a stronger support pack than the baseline version. If the setup is really student, shared-house, or lodger, use the dedicated product instead."
      />
    </div>
  );
}


