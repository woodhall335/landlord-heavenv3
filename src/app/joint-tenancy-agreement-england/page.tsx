import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/joint-tenancy-agreement-england');
const standardHref = '/products/ast';
const premiumHref = '/premium-tenancy-agreement';

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement England | Updated Multiple Tenant Agreement',
  description:
    "England page for joint tenancy agreements and shared-house paperwork. Uses updated Residential Tenancy Agreement wording and Renters' Rights compliant product positioning.",
  keywords: [
    'joint tenancy agreement england',
    'multiple tenant tenancy agreement',
    'house share tenancy agreement',
    'joint and several liability',
    'new tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Joint Tenancy Agreement England | Updated Multiple Tenant Agreement',
    description:
      'Create shared-house and multi-tenant England paperwork through the updated Residential Tenancy Agreement flow.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function JointTenancyAgreementEnglandPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Joint Tenancy Agreement England', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/joint-tenancy-agreement-england"
        title="Joint Tenancy Agreement England"
        subtitle="Create England tenancy paperwork for couples, flatmates, and shared households with updated Residential Tenancy Agreement wording and multiple-tenant protection."
        primaryCtaLabel="Create standard joint agreement"
        primaryCtaHref={standardHref}
        secondaryCtaLabel="Use premium HMO or student-ready flow"
        secondaryCtaHref={premiumHref}
        introTitle="Shared households, updated England product language"
        introBody={[
          'This page is now aligned with the updated England tenancy rollout, so it no longer sells old AST-first joint tenancy wording as the live product.',
          "Instead, it directs shared-house and multi-tenant landlords into the current Residential Tenancy Agreement flow with multiple-tenant, guarantor, and HMO-ready options where needed.",
        ]}
        highlights={[
          'Supports multiple tenants, couples, flatmates, and shared houses',
          'Uses Residential Tenancy Agreement wording instead of live AST sales copy',
          'Keeps joint and several liability positioning for shared-house search demand',
          'Premium route available for HMO, guarantor, and student-ready drafting',
        ]}
        compliancePoints={[
          "Aligned to the Renters' Rights compliant England tenancy rollout",
          'Removes live Section 21-led and AST-first positioning from the page',
          'Keeps shared-house and multi-tenant search demand connected to the updated England wizard',
        ]}
        keywordTargets={[
          'joint tenancy agreement england',
          'multiple tenant tenancy agreement',
          'house share tenancy agreement',
          'joint and several liability',
        ]}
        faqs={[
          {
            question: 'Can I still use this for a shared house or flatshare?',
            answer:
              'Yes. This page still targets joint tenancy and house-share demand, but the live England route now uses Residential Tenancy Agreement wording.',
          },
          {
            question: 'Should I use the premium flow for student or HMO lets?',
            answer:
              'Usually yes. The premium path is the stronger fit where you need HMO-ready terms, guarantor wording, or more detailed shared-house documentation.',
          },
          {
            question: 'Does this page still sell a joint AST as the live product?',
            answer:
              'No. It now routes England landlords into the updated Residential Tenancy Agreement flow for multiple-tenant properties.',
          },
        ]}
      />
    </div>
  );
}


