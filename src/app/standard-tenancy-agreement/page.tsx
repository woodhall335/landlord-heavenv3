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

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Standard Tenancy Agreement England | Straightforward Whole-Property Let',
  description:
    'Create a Standard Tenancy Agreement for a straightforward whole-property let in England, using current assured periodic wording and the practical supporting documents landlords usually need.',
  keywords: [
    'assured periodic tenancy agreement england',
    'england assured periodic tenancy agreement',
    'standard tenancy agreement england',
    'england tenancy agreement standard',
    'basic tenancy agreement england',
    'periodic tenancy agreement england',
    'new england tenancy agreement',
    'renters rights act tenancy agreement england',
    'new tenancy agreement generator england',
    'updated tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Standard Tenancy Agreement England | Straightforward Whole-Property Let',
    description:
      'Create a Standard Tenancy Agreement for a straightforward whole-property let in England, using current assured periodic wording and the practical supporting documents landlords usually need.',
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
          name: 'Standard Tenancy Agreement',
          description: PRODUCTS.england_standard_tenancy_agreement.description,
          price: PRODUCTS.england_standard_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/standard-tenancy-agreement"
        title="Standard Tenancy Agreement England"
        subtitle="Use this standard England tenancy agreement if you are letting a whole property on a straightforward residential tenancy and want current assured periodic wording without student, HMO, lodger, or Premium-level detail."
        primaryCtaLabel="Start standard tenancy agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        legacyNotice="If you were searching for a standard tenancy agreement, a basic tenancy agreement, an updated AST replacement, or a current England tenancy agreement generator, this is the standard route for a straightforward whole-property let."
        introTitle="For a straightforward whole-property let"
        introBody={[
          'This is the standard route for a new England tenancy agreement where the tenancy is a straightforward whole-property let. Use it when you want current assured periodic wording under the post-Renters Rights Act framework, without the extra operational detail included in the Premium route or the specialist products.',
          'The generator keeps the pack practical and proportionate: the main agreement plus the key supporting paperwork, without making a simple tenancy feel more complicated than it needs to be.',
        ]}
        highlights={[
          'England assured periodic agreement for a straightforward whole-property residential let',
          'Keeps the wording and supporting documents practical and proportionate',
          'Separate from the Premium assured periodic, Student, HMO / Shared House, and Lodger routes',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Built around the current England assured periodic route from 1 May 2026.',
          'Covers the written information needed for the main England residential tenancy route under the post-Renters Rights Act framework.',
          'Includes the practical England support paperwork that sits alongside the agreement.',
          'If the tenancy is really a student let, shared house, or resident-landlord arrangement, use the specialist route instead.',
        ]}
        keywordTargets={[
          'standard tenancy agreement england',
          'england tenancy agreement standard',
          'basic tenancy agreement england',
          'periodic tenancy agreement england',
          'ordinary residential tenancy agreement england',
          'new england tenancy agreement',
          'renters rights act tenancy agreement england',
          'new tenancy agreement generator england',
        ]}
        idealFor={[
          'the tenancy is a straightforward whole-property let in England',
          'you want the current England route with the core support pack, but not the fuller Premium assured periodic schedule',
          'you want a new tenancy agreement generator for the standard England route rather than a more detailed Premium pack',
          'you want a clean standard agreement without specialist student, shared-house, or resident-landlord wording',
        ]}
        notFor={[
          'you want fuller wording on inspections, repairs, key handling, contractor access, and handover from the outset',
          'the main issue is student occupation, guarantors, or end-of-term student turnover',
          'the property is really a shared house / HMO or a room let in the landlord’s home',
        ]}
        packHighlights={standardPackHighlights}
        routeComparison={[
          {
            title: 'Premium Assured Periodic Tenancy Agreement',
            description:
              'Choose the Premium assured periodic route when the let is still a standard residential tenancy but you want more detailed operational drafting and a broader management pack.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium assured periodic route',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Choose the Student route when guarantors, student sharers, replacement procedures, or end-of-term return standards are the main focus.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'Compare Student',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Choose the HMO / Shared House route when shared areas, house rules, or room-by-room occupation are where the real complexity lies.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Choose the Lodger route when the landlord lives at the property and the occupier is sharing the home rather than taking a standard residential tenancy.',
            href: '/lodger-agreement',
            ctaLabel: 'Compare Lodger',
          },
        ]}
        faqs={[
          {
            question: 'When should I choose this instead of the Premium assured periodic route?',
            answer:
              'Choose this route when the let is a straightforward whole-property tenancy in England and you do not need the more detailed management, inspection, handover, and operational drafting included in the Premium assured periodic route.',
          },
          {
            question: 'Is this the new England tenancy agreement generator for the current rules?',
            answer:
              'Yes. This page is built around the current England assured periodic framework and is designed as the standard new tenancy agreement generator for straightforward whole-property lets, rather than an older fixed-term AST-style starting point.',
          },
          {
            question: 'Is this the right Renters Rights Act tenancy agreement route for a straightforward let?',
            answer:
              'Usually, yes. If the tenancy is a standard whole-property let in England and you want the current baseline route, this is the assured periodic agreement most landlords are looking for when they search for a Renters Rights Act tenancy agreement.',
          },
          {
            question: 'What does this assured periodic pack include?',
            answer:
              'The pack centres on the main agreement and includes the England pre-tenancy checklist, along with practical handover and support documents for the tenancy file.',
          },
          {
            question: 'Should I use this for a student or HMO let?',
            answer:
              'Usually not. Student and HMO / Shared House lets now have their own England products, so this standard assured periodic route is best for ordinary residential lets that do not need specialist wording.',
          },
        ]}
        finalCtaBody="Use this standard England tenancy agreement generator when the tenancy is straightforward and the property is being let as an ordinary whole-property home. If you were searching for a Renters Rights Act tenancy agreement for a simple let, this will usually be the right route. Compare Premium or the specialist products only when the facts call for something more tailored."
      />
    </div>
  );
}
