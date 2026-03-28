import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/hmo-shared-house-tenancy-agreement');
const chooserWizardHref = '/wizard?product=tenancy_agreement&jurisdiction=england&src=hmo_shared_page&topic=tenancy';
const hmoWizardHref = '/wizard?product=england_hmo_shared_house_tenancy_agreement&src=hmo_shared_page&topic=tenancy';
const hmoPackDocuments = getResidentialDocumentList('england_hmo_shared_house_tenancy_agreement', {
  englandTenancyPurpose: 'new_agreement',
  depositTaken: true,
});

function getPackDocument(documentId: string) {
  return hmoPackDocuments.find((document) => document.id === documentId);
}

const hmoPackHighlights = [
  getPackDocument('england_hmo_shared_house_tenancy_agreement'),
  getPackDocument('england_hmo_house_rules_appendix'),
  getPackDocument('england_keys_handover_record'),
  getPackDocument('england_utilities_handover_sheet'),
  getPackDocument('england_tenancy_variation_record'),
]
  .filter((document): document is NonNullable<(typeof hmoPackDocuments)[number]> => Boolean(document))
  .map((document) => ({
    title: document.title,
    description: document.description,
    supportingLabel: document.pages,
  }));

export const metadata: Metadata = {
  title: 'HMO / Shared House Tenancy Agreement England',
  description:
    'Create the England HMO / Shared House Tenancy Agreement with communal-area and sharer-specific drafting.',
  keywords: [
    'hmo tenancy agreement england',
    'shared house tenancy agreement',
    'hmo agreement template england',
    'shared accommodation tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'HMO / Shared House Tenancy Agreement England',
    description:
      'Create the England HMO / Shared House Tenancy Agreement with communal-area and sharer-specific drafting.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function HmoSharedHouseTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'HMO / Shared House Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: PRODUCTS.england_hmo_shared_house_tenancy_agreement.label,
          description: PRODUCTS.england_hmo_shared_house_tenancy_agreement.description,
          price: PRODUCTS.england_hmo_shared_house_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/hmo-shared-house-tenancy-agreement"
        title="HMO / Shared House Tenancy Agreement England"
        subtitle="Choose the HMO / Shared House route when communal areas, room-by-room sharers, or shared-house management detail need to be recorded expressly in the agreement."
        primaryCtaLabel="Start HMO / Shared House agreement"
        primaryCtaHref={hmoWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={chooserWizardHref}
        introTitle="Dedicated HMO and shared-house drafting"
        introBody={[
          'This route is built for England lets where communal areas, sharer expectations, and HMO/shared-house detail need to be expressed directly in the agreement instead of being implied by a generic premium tier.',
          'HMO is now a separate first-class product. It is no longer implemented as a synonym for Premium.',
        ]}
        highlights={[
          'HMO and communal-area drafting',
          'Sharer-specific agreement structure',
          'Separate from Premium and Student products',
          'Guided setup with preview before payment',
        ]}
        compliancePoints={[
          "Designed to reflect the Renters' Rights Act changes from 1 May 2026",
          'Captures shared-house and HMO-specific fact patterns in the England flow',
          'Keeps HMO/shared-house drafting separate from ordinary residential Premium drafting',
          'Use the Lodger route instead where the landlord is resident and sharing the home',
        ]}
        keywordTargets={[
          'hmo tenancy agreement england',
          'shared house tenancy agreement england',
          'shared accommodation tenancy agreement',
          'hmo agreement template england',
          'room by room tenancy agreement england',
        ]}
        idealFor={[
          'the real complexity is communal living, sharer occupation, visitor policy, or HMO-style operational management',
          'you want separate drafting for communal areas, house rules, fire-safety notes, and shared-house cleaning arrangements',
          'you want HMO/shared-house wording without pretending the product is just a Premium residential agreement',
        ]}
        notFor={[
          'the landlord is resident and the occupier is sharing the home as a lodger',
          'the let is an ordinary whole-property residential tenancy and does not need communal-area controls',
          'the real issue is a student-focused household with guarantor and end-of-term turnover detail rather than HMO management',
        ]}
        packHighlights={hmoPackHighlights}
        routeComparison={[
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Premium is now a separate ordinary-residential product and should not be used as shorthand for HMO complexity.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Use Student if the specialist issue is student sharers, guarantors, and end-of-term return expectations.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'Compare Student',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Use Lodger where the landlord lives in the property and the arrangement is a resident-landlord room let.',
            href: '/lodger-agreement',
            ctaLabel: 'Compare Lodger',
          },
        ]}
        faqs={[
          {
            question: 'Is HMO still just Premium?',
            answer:
              'No. HMO / Shared House is now its own England product with its own routing and drafting, separate from Premium.',
          },
          {
            question: 'Should I still use Premium for a shared house?',
            answer:
              'Not by default. Use Premium for fuller ordinary-residential drafting. Use the HMO / Shared House route where communal areas, sharers, or HMO-style setup are the real issue.',
          },
          {
            question: 'What if the landlord lives in the property?',
            answer:
              'That is usually a Lodger / resident-landlord route rather than the HMO / Shared House tenancy path, so compare it against the Lodger product.',
          },
        ]}
        finalCtaBody="Use the HMO / Shared House route when the real complexity is communal sharers and shared-house management detail. Premium remains a separate ordinary-residential product."
      />
    </div>
  );
}
