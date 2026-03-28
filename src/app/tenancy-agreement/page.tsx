import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  StructuredData,
  breadcrumbSchema,
  pricingItemListSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreement');
const chooserWizardHref = '/wizard?product=tenancy_agreement&jurisdiction=england&src=england_tenancy_page&topic=tenancy';
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const englandTenancyPricingItems = [
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
] as const;

export const metadata: Metadata = {
  title: 'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger',
  description:
    'Choose the right England tenancy agreement route for a standard let, premium residential let, student let, HMO/shared house, or lodger arrangement.',
  keywords: [
    'new tenancy agreement england',
    'england tenancy agreement assured periodic',
    'renters rights act tenancy agreement',
    'current england tenancy agreement',
    'england tenancy agreement 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger',
    description:
      'Choose the right England tenancy agreement route for a standard let, premium residential let, student let, HMO/shared house, or lodger arrangement.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={pricingItemListSchema(
          englandTenancyPricingItems.map((sku) => ({
            sku,
            name: PRODUCTS[sku].label,
            description: PRODUCTS[sku].description,
            url: PRODUCTS[sku].productPageHref || canonicalUrl,
          }))
        )}
      />
      <EnglandTenancyPage
        pagePath="/tenancy-agreement"
        title="England Tenancy Agreements"
        subtitle="Choose the England agreement route that fits the actual occupation setup: Standard for a straightforward whole-property let, Premium for fuller ordinary-residential drafting, Student for student-focused lets, HMO / Shared House for communal sharers, or Lodger for resident-landlord room lets."
        primaryCtaLabel="Choose England agreement"
        primaryCtaHref={chooserWizardHref}
        secondaryCtaLabel="Start Standard tenancy agreement"
        secondaryCtaHref={standardWizardHref}
        introTitle="Five England agreement routes, not one overloaded product"
        introBody={[
          'If you need a new tenancy agreement for a property in England, this page is now the main product hub rather than a hidden Standard versus Premium split.',
          'Landlords still search using AST language, but from 1 May 2026 new England agreements generally move into the assured periodic model. The important question is no longer just price tier. It is whether the let is a straightforward residential let, a fuller premium residential arrangement, a student let, an HMO/shared house, or a resident-landlord lodger setup.',
        ]}
        highlights={[
          'Five dedicated England product routes',
          'Chooser-driven routing for Standard, Premium, Student, HMO/Shared, and Lodger',
          'Current England tenancy agreement wording',
          'Guided setup with preview before payment',
        ]}
        compliancePoints={[
          "Designed to reflect the Renters' Rights Act changes from 1 May 2026",
          'Built for the assured periodic framework used for new England lets, with a separate resident-landlord lodger route',
          'Using wording that does not reflect the current England framework can lead to weaker protection or complications if issues arise',
          'AST kept only as legacy search language, not the live product framing',
        ]}
        keywordTargets={[
          'england tenancy agreement 2026',
          'new tenancy agreement england',
          'assured periodic tenancy agreement england',
          'renters rights act tenancy agreement',
          'student tenancy agreement england',
          'hmo tenancy agreement england',
          'lodger agreement england',
        ]}
        idealFor={[
          'you want to compare the real England tenancy-agreement routes before starting the wizard',
          'you are replacing an older AST template and need to choose the right modern England product',
          'you need to distinguish between a straightforward let, a fuller premium residential let, a student let, an HMO/shared house, or a resident-landlord room let',
        ]}
        packHighlights={[
          {
            title: 'Main agreement matched to the route',
            description:
              'Each England route now has its own agreement identity rather than forcing every case into a generic Standard versus Premium split.',
          },
          {
            title: 'Practical handover paperwork',
            description:
              'The assured England packs include handover, utilities, pet, and variation support documents around the main agreement.',
          },
          {
            title: 'Product-specific schedules where needed',
            description:
              'Premium, Student, HMO / Shared House, and Lodger each carry route-specific supporting schedules rather than relying on generic filler.',
          },
          {
            title: 'Guided chooser before payment',
            description:
              'The hub points landlords into the product that matches the occupation setup before checkout and generation.',
          },
        ]}
        routeComparison={[
          {
            title: `Standard Tenancy Agreement ${PRODUCTS.england_standard_tenancy_agreement.displayPrice}`,
            description:
              'Baseline ordinary-residential England product for a straightforward whole-property let.',
            href: standardWizardHref,
            ctaLabel: 'Start Standard',
          },
          {
            title: `Premium Tenancy Agreement ${PRODUCTS.england_premium_tenancy_agreement.displayPrice}`,
            description:
              'Ordinary residential Premium route with fuller management, access, handover, and operational drafting.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'View Premium',
          },
          {
            title: `Student Tenancy Agreement ${PRODUCTS.england_student_tenancy_agreement.displayPrice}`,
            description:
              'Student-focused route with guarantor, sharer, replacement, and end-of-term detail.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'View Student',
          },
          {
            title: `HMO / Shared House ${PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice}`,
            description:
              'Shared-house and HMO route with communal-area controls and specialist sharer drafting.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'View HMO',
          },
          {
            title: `Room Let / Lodger ${PRODUCTS.england_lodger_agreement.displayPrice}`,
            description:
              'Resident-landlord room-let product kept separate from the ordinary residential assured-tenancy routes.',
            href: '/lodger-agreement',
            ctaLabel: 'View Lodger',
          },
        ]}
        faqs={[
          {
            question: 'Is this page for a new tenancy agreement in England?',
            answer:
              'Yes. This is the main Landlord Heaven page for England tenancy agreement selection, and it now opens a chooser so the right product can be matched to the let.',
          },
          {
            question: 'Is this still an AST?',
            answer:
              'Landlords still search using AST language, but the live route is now framed as an England tenancy agreement designed for the assured periodic framework from 1 May 2026 rather than as a new fixed-term AST product.',
          },
          {
            question: 'Can I keep using an older tenancy agreement?',
            answer:
              'Many older tenancy agreements still exist, but they may be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty if issues arise.',
          },
          {
            question: 'What if I need a more complex England agreement?',
            answer:
              'Use the dedicated route that matches the setup. Premium is for fuller ordinary-residential drafting, Student is for student-focused lets, HMO / Shared House is for communal sharers, and Lodger is for resident-landlord room lets.',
          },
          {
            question: 'What if the property is not in England?',
            answer:
              'Landlord Heaven also has jurisdiction-specific routes for Wales, Scotland, and Northern Ireland. The agreement should always match where the property is located.',
          },
        ]}
        finalCtaBody="Choose the route that fits the let now, not the label you may have used years ago. England now has dedicated Standard, Premium, Student, HMO / Shared House, and Lodger agreement paths."
      />
    </div>
  );
}


