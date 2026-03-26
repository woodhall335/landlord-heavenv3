import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';

export const metadata: Metadata = {
  title: 'Premium Tenancy Agreement England | HMO and Student Lets',
  description:
    'Create a Premium England tenancy agreement for HMOs, student lets, shared households.',
  keywords: [
    'hmo tenancy agreement england',
    'student tenancy agreement england 2026',
    'premium tenancy agreement england',
    'england tenancy agreement hmo',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Premium Tenancy Agreement England | HMO and Student Lets',
    description:
      'Premium England tenancy agreement for HMOs, student lets, and higher-risk or more complex lets that need broader wording than an older template may provide.',
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
        pagePath="/premium-tenancy-agreement"
        title="Premium Tenancy Agreement England"
        subtitle="Choose the Premium England tenancy agreement when the let is more complex, with broader wording for HMOs, student properties, sharers, and guarantor-backed setups under the current assured periodic framework. Older agreements may be harder to rely on if they use outdated wording or structure."
        primaryCtaLabel="Start Premium tenancy agreement"
        primaryCtaHref={premiumWizardHref}
        secondaryCtaLabel="Start Standard tenancy agreement"
        secondaryCtaHref={standardWizardHref}
        introTitle="Premium cover for more complex England lets"
        introBody={[
          'This page is for landlords who need more than a basic tenancy agreement. It is the stronger fit where the property is an HMO, the tenants are sharers or students, or the arrangement needs broader wording from the outset.',
          'The Premium route uses the same current England framework as Standard, but adds broader wording where the tenancy is more complex. Older agreements may be harder to rely on if they use outdated wording or structure, especially where shared occupation, guarantors, or house rules matter.',
        ]}
        highlights={[
          'Built for HMOs, student lets, and shared households',
          'Broader wording for guarantors, joint tenants, and house rules',
          'Reduces reliance on outdated template wording in higher-risk lets',
          'Guided setup with preview before payment',
        ]}
        compliancePoints={[
          "Designed to reflect the Renters' Rights Act changes from 1 May 2026",
          'Built on the current England assured periodic agreement route',
          'Using wording that does not reflect the current England framework can lead to weaker protection or complications if issues arise',
          'Not sold as a fixed-term AST product',
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
              'Yes. Premium sits on the same current England route as Standard. The difference is the level of wording and coverage, not the legal direction of the product.',
          },
          {
            question: 'What if I am still using an older agreement?',
            answer:
              'Many older tenancy agreements still exist, but they may be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty if issues arise, especially on more complex lets.',
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


