import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import { getResidentialDocumentList } from '@/lib/residential-letting/document-config';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/student-tenancy-agreement');
const englandHubHref = '/products/ast';
const studentWizardHref = '/wizard?product=england_student_tenancy_agreement&src=student_tenancy_page&topic=tenancy';
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
    'Create the England Student Tenancy Agreement with student-focused sharer, guarantor, and end-of-term detail.',
  keywords: [
    'student tenancy agreement england',
    'student tenancy agreement template',
    'student house agreement england',
    'student let agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Student Tenancy Agreement England | Guarantor and Sharer Route',
    description:
      'Create the England Student Tenancy Agreement with student-focused sharer, guarantor, and end-of-term detail.',
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
        subtitle="Use this when the tenants are students and you want clearer wording on guarantors, joint tenants, replacements, and end-of-term hand-back than a general residential agreement gives you."
        primaryCtaLabel="Start Student tenancy agreement"
        primaryCtaHref={studentWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        introTitle="For student households"
        introBody={[
          'This route is designed for student lets where guarantors, joint occupation, replacement requests, and move-out expectations usually need to be spelled out properly from the start.',
          'It is separate from Premium and separate from the HMO / Shared House route, so you do not have to squeeze a student tenancy into a generic residential product.',
        ]}
        highlights={[
          'Student-focused agreement wording',
          'Guarantor, sharer, and replacement detail',
          'Clearer end-of-term and hand-back expectations',
          'Guided setup with a preview before payment',
        ]}
        compliancePoints={[
          "Built on the current England route from 1 May 2026 for the main tenancy wording.",
          'Lets student cases be handled as student cases instead of being hidden inside Premium.',
          'Captures the practical written-information and support points around the agreement.',
          'If the real issue is communal-house management or resident-landlord sharing, compare the HMO or Lodger routes.',
        ]}
        keywordTargets={[
          'student tenancy agreement england',
          'student house tenancy agreement',
          'student tenancy agreement with guarantor',
          'student let agreement england',
          'student sharer tenancy agreement',
        ]}
        idealFor={[
          'the household is genuinely student-focused',
          'guarantor detail, replacement requests, and end-of-term hand-back matter from the start',
          'you want the option to include a guarantor deed alongside the student agreement pack',
        ]}
        notFor={[
          'the main issue is HMO or shared-house management rather than student occupation',
          'the landlord is resident and the arrangement is really a lodger room let',
          'the let is an ordinary non-student whole-property tenancy and you only need Standard or Premium',
        ]}
        packHighlights={studentPackHighlights}
        routeComparison={[
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Premium is for fuller ordinary-residential drafting, but it is no longer the default product for student lets.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Use HMO / Shared House when communal controls and shared-house rules are the main complexity, even if some occupiers are students.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'England chooser',
            description:
              'If you are weighing up Standard, Premium, Student, HMO, or Lodger, open the main England tenancy-agreement hub first.',
            href: '/products/ast',
            ctaLabel: 'Open England hub',
          },
        ]}
        faqs={[
          {
            question: 'Is this now separate from Premium?',
            answer:
              'Yes. Student lets now have their own dedicated England product instead of being treated as a Premium variant by default.',
          },
          {
            question: 'Does this route cover guarantor-focused drafting?',
            answer:
              'Yes. The guided flow captures student-specific sharer and guarantor detail so the agreement can reflect that setup more directly.',
          },
          {
            question: 'Should I use this for every shared student property?',
            answer:
              'Use the Student route where the case is genuinely student-focused. If the main issue is HMO or shared-house management detail rather than student occupation, compare it against the HMO / Shared House route.',
          },
        ]}
        finalCtaBody="Use the Student route for student households, guarantor-backed lets, and clearer end-of-term expectations. If you are still deciding, compare it against the other England products on the main hub."
      />
    </div>
  );
}
