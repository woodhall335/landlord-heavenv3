import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/student-tenancy-agreement');
const englandHubHref = '/products/ast';
const studentWizardHref =
  '/wizard?product=england_student_tenancy_agreement&src=student_tenancy_page&topic=tenancy';

const studentPackDocuments = getResidentialDocumentList('england_student_tenancy_agreement', {
  englandTenancyPurpose: 'new_agreement',
  depositTaken: true,
  includeGuarantorDeed: true,
});

function getPackDocument(documentId: string) {
  return studentPackDocuments.find((document) => document.id === documentId);
}

const studentPackHighlights = [
  getPackDocument('england_student_tenancy_agreement'),
  getPackDocument('england_student_move_out_schedule'),
  getPackDocument('guarantor_agreement'),
  getPackDocument('england_keys_handover_record'),
  getPackDocument('england_tenancy_variation_record'),
]
  .filter((document): document is NonNullable<(typeof studentPackDocuments)[number]> => Boolean(document))
  .map((document) => ({
    title: document.title,
    description: document.description,
    supportingLabel: document.pages,
  }));

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Student Tenancy Agreement England | Guarantor and Sharer Route',
  description:
    'Create an England Student Tenancy Agreement with clearer wording for student sharers, guarantors, replacements, and end-of-term hand-back.',
  keywords: [
    'student tenancy agreement england',
    'student tenancy agreement template',
    'student house agreement england',
    'student let agreement england',
    'student tenancy agreement with guarantor',
    'student sharer tenancy agreement',
    'student house tenancy agreement',
    'student agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Student Tenancy Agreement England | Guarantor and Sharer Route',
    description:
      'Create an England Student Tenancy Agreement with clearer wording for student sharers, guarantors, replacements, and end-of-term hand-back.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function StudentTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Student Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: PRODUCTS.england_student_tenancy_agreement.label,
          description: PRODUCTS.england_student_tenancy_agreement.description,
          price: PRODUCTS.england_student_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />

      <EnglandTenancyPage
        pagePath="/student-tenancy-agreement"
        title="Student Tenancy Agreement England"
        subtitle="Use this England student tenancy agreement generator when the occupiers are students and you want clearer wording on guarantors, joint tenants, replacement requests, and end-of-term move-out than a general residential agreement usually provides."
        primaryCtaLabel="Start student tenancy agreement"
        primaryCtaHref={studentWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        legacyNotice="If you were searching for a student tenancy agreement template, a student house agreement, or a student tenancy agreement with guarantor wording, this is the dedicated England student route rather than a generic residential agreement adapted after the fact."
        introTitle="Built for student households"
        introBody={[
          'This route is designed for student lets where guarantors, shared occupation, replacement requests, and end-of-term expectations usually need much clearer wording from the outset.',
          'Instead of trying to fit a student household into a general residential agreement, this pack is built around the issues that come up most often in student lets: multiple occupiers, guarantor support, mid-tenancy changes, key return, and how the property is handed back at the end of the academic cycle.',
        ]}
        highlights={[
          'Student-focused agreement wording for shared occupation',
          'Clearer treatment of guarantors, joint tenants, and replacement requests',
          'Better end-of-term and move-out wording than a generic residential agreement',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Built around the current England route from 1 May 2026 for the main tenancy wording.',
          'Lets student households be handled as student households instead of being forced into a generic residential route.',
          'Includes the practical support documents that usually matter around student handover and variation.',
          'If the real issue is shared-house management, communal controls, or resident-landlord occupation, compare the HMO / Shared House or Lodger routes instead.',
        ]}
        keywordTargets={[
          'student tenancy agreement england',
          'student house tenancy agreement',
          'student tenancy agreement with guarantor',
          'student let agreement england',
          'student sharer tenancy agreement',
          'student house agreement england',
        ]}
        idealFor={[
          'the tenants are students and the let is genuinely student-focused',
          'guarantor wording matters from the start',
          'joint tenants, sharers, and replacement requests need to be dealt with more clearly',
          'end-of-term move-out and hand-back expectations need to be set properly',
          'you want the option to include a guarantor deed alongside the agreement pack',
        ]}
        notFor={[
          'the main issue is HMO or shared-house management rather than student occupation itself',
          'the landlord lives at the property and the arrangement is really a lodger room let',
          'the let is an ordinary non-student whole-property tenancy and Standard or Premium would be more proportionate',
        ]}
        packHighlights={studentPackHighlights}
        routeComparison={[
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Premium is for ordinary residential lets that need fuller operational drafting, but it is no longer the default choice for student households.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Choose HMO / Shared House when communal rules, house management, or room-by-room occupation are the main complexity, even if some occupiers are students.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'Standard Tenancy Agreement',
            description:
              'Choose Standard when the tenancy is a straightforward non-student whole-property let and you do not need student-specific wording.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Compare Standard',
          },
          {
            title: 'England tenancy agreement comparison',
            description:
              'Still deciding between Standard, Premium, Student, HMO, or Lodger? Use the main England comparison page to choose the right route.',
            href: '/products/ast',
            ctaLabel: 'Compare England routes',
          },
        ]}
        faqs={[
          {
            question: 'Why use a student tenancy agreement instead of a general residential agreement?',
            answer:
              'Because student lets often raise issues that a general residential agreement does not deal with clearly enough. Guarantors, multiple sharers, replacement requests, and end-of-term hand-back are all more common in student households, so it helps to use wording built for that setup from the start.',
          },
          {
            question: 'Is this now separate from Premium?',
            answer:
              'Yes. Student lets now have their own dedicated England route instead of being treated as a Premium variant by default. Premium is for ordinary residential lets that need more management detail; this route is for student-specific occupation patterns and expectations.',
          },
          {
            question: 'Does this route cover guarantor-focused drafting?',
            answer:
              'Yes. The guided flow is designed to capture the student-specific guarantor and sharer setup more clearly, and the pack can include a guarantor deed where needed.',
          },
          {
            question: 'Is this suitable for joint student tenants sharing one property?',
            answer:
              'Usually yes. This route is intended for student households where joint occupation and shared responsibility need to be reflected more clearly than they would be in a generic agreement.',
          },
          {
            question: 'What if one student wants to be replaced during the tenancy?',
            answer:
              'That is one of the reasons this route exists. Student lets are more likely to involve replacement requests or mid-tenancy changes, so this pack is better suited to that kind of setup than a general residential agreement.',
          },
          {
            question: 'Should I use this for every shared student property?',
            answer:
              'Use the Student route when the case is genuinely student-focused. If the real complexity is house management, communal controls, room-by-room occupation, or HMO-style arrangements, compare it against the HMO / Shared House route first.',
          },
          {
            question: 'Does this help with end-of-term move-out expectations?',
            answer:
              'Yes. One of the key benefits of this route is clearer wording around hand-back, key return, and end-of-term expectations, which are often more important in student lets than in ordinary residential tenancies.',
          },
        ]}
        finalCtaBody="Use the Student route when the occupiers are students and you want the agreement to reflect how student lets actually work in practice. If guarantors, sharers, replacements, and end-of-term hand-back matter from the start, this is usually the better fit than a general residential agreement. If you are still deciding, compare it against the other England routes on the main comparison page."
      />
    </div>
  );
}
