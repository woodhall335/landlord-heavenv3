import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const wizardHref =
  '/wizard?product=ast_premium&jurisdiction=england&src=seo_premium_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'Premium Tenancy Agreement England | HMO and Student Lets',
  description:
    "Create a premium England Residential Tenancy Agreement for HMOs, student lets, shared households, and guarantor-backed tenancies. Updated for the Renters' Rights Act 2025.",
  keywords: [
    'hmo residential tenancy agreement england',
    'student tenancy agreement england 2026',
    'premium tenancy agreement england',
    'renters rights compliant tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Premium Tenancy Agreement England | HMO and Student Lets',
    description:
      'Premium England Residential Tenancy Agreement for HMOs, student lets, shared households, and guarantor-backed tenancies.',
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
      <EnglandTenancyPage
        title="Premium Tenancy Agreement England"
        subtitle="Choose the premium England Residential Tenancy Agreement when the let is more complex, with broader wording for HMOs, student properties, shared households, and guarantor-backed setups."
        primaryCtaLabel="Create premium agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="View standard agreement"
        secondaryCtaHref="/tenancy-agreement"
        introTitle="Premium cover for more complex England lets"
        introBody={[
          'This page is for landlords who need more than a basic tenancy agreement. It is the stronger fit where the property is an HMO, the tenants are sharers or students, or the arrangement needs broader wording from the outset.',
          'The premium route stays on the same England Residential Tenancy Agreement model as the standard version, but adds more coverage for shared living, guarantors, and day-to-day management rules.',
        ]}
        highlights={[
          'Built for HMOs, student lets, and shared households',
          'Broader wording for guarantors, joint tenants, and house rules',
          'Guided setup with preview before payment',
          'Saved in your account after purchase',
        ]}
        compliancePoints={[
          "Updated for the Renters' Rights Act 2025",
          'Built on the England Residential Tenancy Agreement route',
          'Not sold as a fixed-term AST product',
          'Designed for more complex England tenancy setups',
        ]}
        faqs={[
          {
            question: 'When should I choose Premium over Standard?',
            answer:
              'Choose Premium when the property or household is more complex, such as an HMO, student let, shared house, or any arrangement where you want broader wording from the start.',
          },
          {
            question: 'Do I need Premium for an HMO or student let?',
            answer:
              'In most cases, yes. Premium is usually the better fit for HMOs, student lets, and shared households because those setups tend to need broader wording and more operational detail.',
          },
          {
            question: 'Is the premium route still updated for the new England system?',
            answer:
              "Yes. Premium sits on the same updated England Residential Tenancy Agreement route as the standard version. The difference is the level of wording and coverage, not the legal direction of the product.",
          },
          {
            question: 'Can I still use Standard if the let is straightforward?',
            answer:
              'Yes. If the tenancy is relatively simple, the standard agreement is usually the more proportionate choice.',
          },
        ]}
      />
    </div>
  );
}
