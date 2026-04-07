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
    'Create an England Lodger Agreement for a resident-landlord room let, with clearer wording on shared living, house rules, notice, and day-to-day occupation.',
  keywords: [
    'lodger agreement england',
    'room let agreement england',
    'resident landlord agreement',
    'lodger licence agreement',
    'lodger agreement template england',
    'room let licence agreement',
    'resident landlord lodger agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Lodger Agreement England | Resident-Landlord Room Let Route',
    description:
      'Create an England Lodger Agreement for a resident-landlord room let, with clearer wording on shared living, house rules, notice, and day-to-day occupation.',
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
        subtitle="Use this England lodger agreement generator when you live in the property and are taking in a lodger. It is designed for resident-landlord room lets, with clearer wording on shared living, house rules, and notice than a standard tenancy agreement would usually provide."
        primaryCtaLabel="Start lodger agreement"
        primaryCtaHref={lodgerWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        legacyNotice="If you were searching for a lodger agreement, a room let agreement, or a resident landlord agreement in England, this is the dedicated route for a room let in your own home rather than a standard tenancy agreement adapted after the fact."
        introTitle="Built for room lets in the landlord’s home"
        introBody={[
          'This route is for room lets where the landlord lives at the property and the occupier is sharing the home. It is intentionally separate from the standard residential, student, and HMO / shared-house routes because a resident-landlord arrangement works differently in practice.',
          'Instead of trying to force a lodger setup into a general tenancy product, this pack is built around the points that usually matter most in a room let: shared facilities, house rules, key handling, notice expectations, and the practical realities of living under the same roof.',
        ]}
        highlights={[
          'Resident-landlord room-let agreement built for shared living',
          'Clearer wording on house rules, shared spaces, and notice',
          'Separate from standard tenancy, student, and HMO routes',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Keeps the resident-landlord route separate from the main England tenancy products.',
          'Captures shared-facility, notice, and house-rule expectations directly in the guided flow.',
          'Helps avoid treating a lodger arrangement like a standard whole-property tenancy.',
          'Includes practical support documents for room-let setup and handover.',
          'Use the England hub if you are unsure whether the arrangement is really a lodger setup.',
        ]}
        keywordTargets={[
          'lodger agreement england',
          'room let agreement england',
          'resident landlord agreement',
          'lodger licence agreement',
          'lodger agreement template england',
          'resident landlord lodger agreement',
        ]}
        idealFor={[
          'the landlord lives in the property and the occupier is sharing the home',
          'you want a room-let agreement with clearer wording on house rules and shared spaces',
          'you want notice and occupation expectations set out more clearly from the start',
          'you want the resident-landlord route kept separate from standard tenancy and HMO products',
          'you want practical room-let paperwork alongside the main agreement',
        ]}
        notFor={[
          'the landlord does not live at the property and the arrangement is really a standard residential tenancy',
          'the property is a shared house or HMO with sharers but no resident landlord',
          'the case is really a whole-property Standard, Premium, or Student tenancy rather than a room let in the landlord’s home',
        ]}
        packHighlights={lodgerPackHighlights}
        routeComparison={[
          {
            title: 'England tenancy chooser',
            description:
              'If you are not sure whether the arrangement is really a lodger setup, compare it against the full England tenancy-agreement hub first.',
            href: '/products/ast',
            ctaLabel: 'Open England hub',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Choose HMO / Shared House where the main complexity comes from sharers, communal occupation, and house rules rather than a resident landlord living in the property.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Choose Premium when the let is an ordinary residential tenancy that needs fuller wording, not a room-let arrangement in the landlord’s own home.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'Standard Tenancy Agreement',
            description:
              'Choose Standard when the tenancy is a straightforward whole-property let and you do not need resident-landlord room-let wording.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Compare Standard',
          },
        ]}
        faqs={[
          {
            question: 'Why use a lodger agreement instead of a standard tenancy agreement?',
            answer:
              'Because a room let in the landlord’s own home is different from a standard tenancy. Where the occupier is sharing the property with a resident landlord, it helps to use wording built for shared living, house rules, and room-let expectations rather than relying on a general tenancy agreement.',
          },
          {
            question: 'Is Lodger separate from the normal tenancy agreement route?',
            answer:
              'Yes. Lodger is a dedicated England route for resident-landlord room lets and licence-style arrangements. It is kept separate from the standard tenancy, student, and HMO / shared-house products.',
          },
          {
            question: 'Should I use this if I do not live at the property?',
            answer:
              'Usually not. If the landlord is not resident, compare the Standard, Premium, Student, and HMO / Shared House routes instead, because the arrangement is less likely to be a true lodger setup.',
          },
          {
            question: 'What if I only rent out one room but I do not live there?',
            answer:
              'That is not automatically a lodger arrangement. A single room let can still fall into a different route if the landlord is not resident, so it is better to compare the England products properly rather than assuming lodger is correct just because only one room is being let.',
          },
          {
            question: 'Does this help with house rules and shared facilities?',
            answer:
              'Yes. One of the main reasons to use this route is to deal more clearly with practical shared-living points such as kitchens, bathrooms, access, visitors, quiet enjoyment within a shared home, and house-rule expectations.',
          },
          {
            question: 'What if I am unsure whether my setup is lodger, HMO, or standard tenancy?',
            answer:
              'That is exactly where route confusion tends to happen. If you are unsure, compare the products on the main England hub first so the arrangement can be matched more closely to how the property is actually occupied.',
          },
          {
            question: 'Is this suitable for licence-style room lets?',
            answer:
              'Usually yes. This route is intended for resident-landlord room-let arrangements where the occupier is sharing the home and the setup needs to be documented as that kind of occupation, rather than as a standard whole-property tenancy.',
          },
        ]}
        finalCtaBody="Use the Lodger route when the landlord lives at the property and the occupier is sharing the home. If you want the agreement to reflect the practical reality of a room let, shared facilities, and house rules in a resident-landlord setup, this is usually the right fit. If that is not the arrangement, compare the other England tenancy products instead."
      />
    </div>
  );
}