import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/hmo-shared-house-tenancy-agreement');
const englandHubHref = '/products/ast';
const hmoWizardHref =
  '/wizard?product=england_hmo_shared_house_tenancy_agreement&src=hmo_shared_page&topic=tenancy';

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

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'HMO / Shared House Tenancy Agreement England | Sharers and House Rules Route',
  description:
    'Create an England HMO / Shared House Tenancy Agreement with clearer wording for sharers, communal areas, house rules, and shared-house management.',
  keywords: [
    'hmo tenancy agreement england',
    'shared house tenancy agreement england',
    'shared house tenancy agreement',
    'hmo agreement template england',
    'shared accommodation tenancy agreement',
    'room by room tenancy agreement england',
    'hmo tenancy agreement template',
    'shared house agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'HMO / Shared House Tenancy Agreement England | Sharers and House Rules Route',
    description:
      'Create an England HMO / Shared House Tenancy Agreement with clearer wording for sharers, communal areas, house rules, and shared-house management.',
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
        subtitle="Use this England HMO / Shared House tenancy agreement generator when people are sharing the property and you need clearer wording on communal areas, house rules, shared living arrangements, and day-to-day management than a general residential agreement usually provides."
        primaryCtaLabel="Start HMO / Shared House agreement"
        primaryCtaHref={hmoWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        legacyNotice="If you were searching for an HMO tenancy agreement, a shared house agreement, or a tenancy agreement for sharers in England, this is the dedicated route for shared-house occupation rather than a standard residential agreement adapted after the fact."
        introTitle="Built for shared houses and HMO-style lets"
        introBody={[
          'This route is designed for England lets where the real complexity comes from people sharing the property, using communal areas, and living under shared-house rules that need to be made clear from the start.',
          'Instead of trying to force a shared house into a general residential agreement, this pack is built for the issues that usually matter in HMOs and shared houses: occupiers sharing kitchens and bathrooms, house rules, shared responsibilities, visitor expectations, handover arrangements, and practical day-to-day management.',
        ]}
        highlights={[
          'HMO and shared-house wording built around sharers and communal living',
          'Clearer treatment of house rules, communal areas, and shared responsibilities',
          'Separate from Standard, Premium, Student, and Lodger routes',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Built around the current England route from 1 May 2026 for the main tenancy wording.',
          'Captures shared-house and HMO-style occupation more directly in the guided flow.',
          'Keeps communal-living wording separate from ordinary residential drafting.',
          'Includes practical support documents for shared-house setup, handover, and ongoing variation.',
          'If the landlord lives in the property and shares the home with the occupier, compare the Lodger route instead.',
        ]}
        keywordTargets={[
          'hmo tenancy agreement england',
          'shared house tenancy agreement england',
          'shared accommodation tenancy agreement',
          'hmo agreement template england',
          'room by room tenancy agreement england',
          'shared house agreement england',
        ]}
        idealFor={[
          'the real complexity is shared occupation, communal living, or HMO-style management',
          'you want clearer wording for communal areas, house rules, visitor expectations, and shared-house responsibilities',
          'you need a tenancy agreement that reflects sharers rather than a straightforward whole-property household',
          'you want shared-house wording without trying to stretch a standard residential agreement beyond its natural use',
          'you want supporting paperwork for handover, utilities, and later tenancy changes',
        ]}
        notFor={[
          'the landlord lives at the property and the arrangement is really a lodger or resident-landlord room let',
          'the let is a straightforward whole-property residential tenancy and does not need communal-area or sharer wording',
          'the real issue is a student-focused household with guarantors, replacement requests, and end-of-term turnover rather than shared-house management itself',
        ]}
        packHighlights={hmoPackHighlights}
        routeComparison={[
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Premium is for ordinary residential lets that need more detailed day-to-day drafting, but it is not the default route for HMO or shared-house setups.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Choose Student when the specialist issue is student sharers, guarantors, replacement requests, and end-of-term hand-back rather than shared-house management itself.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'Compare Student',
          },
          {
            title: 'Standard Tenancy Agreement',
            description:
              'Choose Standard when the tenancy is a straightforward whole-property non-shared let and you do not need HMO or sharer-specific wording.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Compare Standard',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Choose Lodger where the landlord lives in the property and the arrangement is a resident-landlord room let rather than a separate shared-house tenancy.',
            href: '/lodger-agreement',
            ctaLabel: 'Compare Lodger',
          },
        ]}
        faqs={[
          {
            question: 'Why use an HMO / Shared House agreement instead of a general residential agreement?',
            answer:
              'Because shared houses often create issues that a general residential agreement does not deal with clearly enough. Where people are sharing kitchens, bathrooms, access, and day-to-day responsibilities, it helps to have wording that reflects communal living from the outset rather than leaving those points vague.',
          },
          {
            question: 'Is HMO / Shared House still just part of Premium?',
            answer:
              'No. HMO / Shared House is now its own England route with its own drafting and positioning. Premium is for ordinary residential lets that need fuller operational wording; HMO / Shared House is for cases where sharers, communal areas, and house management are the real complexity.',
          },
          {
            question: 'Should I still use Premium for a shared house?',
            answer:
              'Usually not. Use Premium when the property is still an ordinary residential let and you simply want more detailed wording. Use HMO / Shared House when shared living arrangements, communal rules, or HMO-style management are central to the setup.',
          },
          {
            question: 'Is this suitable for sharers living together in one property?',
            answer:
              'Usually yes. This route is intended for situations where people are sharing the property and the agreement needs to reflect that more clearly than a standard whole-property tenancy would.',
          },
          {
            question: 'Does this help with house rules and communal areas?',
            answer:
              'Yes. One of the main reasons to use this route is to deal more clearly with communal-living points such as shared areas, practical house rules, and how occupation works in a shared-house setting.',
          },
          {
            question: 'What if some of the occupiers are students?',
            answer:
              'If the real complexity is still shared-house management, communal controls, and HMO-style occupation, this route may still be the better fit. If the specialist issue is really student guarantors, replacement requests, and end-of-term turnover, compare it against the Student route.',
          },
          {
            question: 'What if the landlord lives in the property?',
            answer:
              'That is usually a Lodger or resident-landlord arrangement rather than an HMO / Shared House tenancy route, so it is usually better to compare the Lodger product instead.',
          },
        ]}
        finalCtaBody="Use the HMO / Shared House route when the real complexity is shared occupation, communal areas, and day-to-day house management. If the tenants are sharers and you want the agreement to reflect how shared-house living actually works in practice, this is usually a better fit than a general residential agreement. If you are still deciding, compare it against the other England tenancy routes on the main hub."
      />
    </div>
  );
}