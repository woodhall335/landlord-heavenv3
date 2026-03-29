import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/lodger-agreement');
const englandHubHref = '/products/ast';
const lodgerWizardHref = '/wizard?product=england_lodger_agreement&src=lodger_page&topic=tenancy';
const lodgerPackDocuments = getResidentialDocumentList('england_lodger_agreement');

function getPackDocument(documentId: string) {
  return lodgerPackDocuments.find((document) => document.id === documentId);
}

const lodgerPackHighlights = [
  getPackDocument('england_lodger_agreement'),
  getPackDocument('england_lodger_checklist'),
  getPackDocument('england_keys_handover_record'),
  getPackDocument('england_lodger_house_rules_appendix'),
]
  .filter((document): document is NonNullable<(typeof lodgerPackDocuments)[number]> => Boolean(document))
  .map((document) => ({
    title: document.title,
    description: document.description,
    supportingLabel: document.pages,
  }));

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Lodger Agreement England | Resident-Landlord Room Let Route',
  description:
    'Create the England Room Let / Lodger Agreement for a resident-landlord room-let or licence arrangement.',
  keywords: [
    'lodger agreement england',
    'room let agreement england',
    'resident landlord agreement',
    'lodger licence agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Lodger Agreement England | Resident-Landlord Room Let Route',
    description:
      'Create the England Room Let / Lodger Agreement for a resident-landlord room-let or licence arrangement.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function LodgerAgreementEnglandPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Lodger Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: PRODUCTS.england_lodger_agreement.label,
          description: PRODUCTS.england_lodger_agreement.description,
          price: PRODUCTS.england_lodger_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/lodger-agreement"
        title="Room Let / Lodger Agreement England"
        subtitle="Use this when you live in the property and you are taking in a lodger. It is kept separate from the normal residential tenancy routes."
        primaryCtaLabel="Start Lodger agreement"
        primaryCtaHref={lodgerWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        introTitle="For a room let in the landlord home"
        introBody={[
          'This route is for room lets where the landlord is resident in the property and the occupier shares the home. It is intentionally separate from the ordinary residential, student, and HMO/shared-house products.',
          'Lodger is its own England product rather than an edge case squeezed into AST or HMO logic.',
        ]}
        highlights={[
          'Resident-landlord room-let route',
          'House rules and shared-space detail',
          'Separate from the ordinary tenancy routes',
          'Guided setup with a preview before payment',
        ]}
        compliancePoints={[
          "Keeps the resident-landlord route separate from the main England tenancy products.",
          'Captures shared-facility, notice, and house-rule expectations directly in the wizard.',
          'Helps avoid treating a lodger arrangement like a normal whole-property tenancy.',
          'Use the England hub if you are not sure whether the arrangement is really a lodger setup.',
        ]}
        keywordTargets={[
          'lodger agreement england',
          'room let agreement england',
          'resident landlord agreement',
          'lodger licence agreement',
          'lodger agreement template england',
        ]}
        idealFor={[
          'the landlord lives in the property and the occupier is sharing the home',
          'you want a room-let document with house rules, shared-space notes, and licence-style notice detail',
          'you want the resident-landlord route kept separate from the normal tenancy and HMO products',
        ]}
        notFor={[
          'the landlord does not live at the property and the arrangement is really a normal residential tenancy',
          'the property is a shared house or HMO with communal sharers but no resident landlord',
          'the case is really a whole-property Standard, Premium, or Student tenancy rather than a room let in the landlord home',
        ]}
        packHighlights={lodgerPackHighlights}
        routeComparison={[
          {
            title: 'England tenancy chooser',
            description:
              'If you are unsure whether the arrangement is really a lodger setup, compare it against the full England tenancy-agreement hub first.',
            href: '/products/ast',
            ctaLabel: 'Open England hub',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Use HMO / Shared House where the complexity comes from communal sharers and house rules rather than a resident landlord.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Use Premium when the let is an ordinary residential tenancy needing fuller drafting, not a room-let licence inside the landlord home.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
        ]}
        faqs={[
          {
            question: 'Is Lodger separate from the normal tenancy agreement route?',
            answer:
              'Yes. Lodger is now a dedicated England product for resident-landlord room lets and licence-style arrangements.',
          },
          {
            question: 'Should I use this if I do not live at the property?',
            answer:
              'Usually no. If the landlord is not resident, compare the Standard, Premium, Student, and HMO / Shared House products instead.',
          },
          {
            question: 'What if I only rent one room but I do not live there?',
            answer:
              'That is not automatically a Lodger case. Use the England chooser and answer the occupation questions so the more suitable tenancy route can be selected.',
          },
        ]}
        finalCtaBody="Use the Lodger route when the landlord lives at the property and the occupier is sharing the home. If that is not the setup, compare the other England tenancy products instead."
      />
    </div>
  );
}
