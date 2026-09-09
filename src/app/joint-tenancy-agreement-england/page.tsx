import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/joint-tenancy-agreement-england');
const standardHref = '/standard-tenancy-agreement';
const chooserHref = '/products/ast';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement England | Shared Household Guide 2026',
  description:
    'England page for joint tenancy agreements and shared-house paperwork. Uses current England agreement wording designed for the assured periodic framework.',
  keywords: [
    'joint tenancy agreement england',
    'multiple tenant tenancy agreement',
    'house share tenancy agreement',
    'joint and several liability',
    'england tenancy agreement shared house',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Joint Tenancy Agreement England | Shared Household Guide 2026',
    description:
      'Create shared-house and multi-tenant England paperwork through the current agreement flow designed for the assured periodic framework.',
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
        subtitle="Create England tenancy paperwork for couples, flatmates, and shared households using current wording designed for the assured periodic framework from 1 May 2026."
        primaryCtaLabel="Create Standard joint agreement"
        primaryCtaHref={standardHref}
        secondaryCtaLabel="Compare England agreements"
        secondaryCtaHref={chooserHref}
        introTitle="Shared households, current England wording"
        introBody={[
          'Use a joint agreement when two or more tenants rent the property together and share responsibility under the same tenancy.',
          'Choose Standard, Premium, Student or HMO / Shared House according to the occupiers, property and level of management detail required.',
        ]}
        highlights={[
          'Supports multiple tenants, couples, flatmates, and shared houses',
          'Uses current England tenancy agreement wording instead of outdated AST sales copy',
          'Explains how joint and several liability fits a shared tenancy',
          'Dedicated Student and HMO / Shared House agreements for specialist shared lets',
        ]}
        compliancePoints={[
          'Aligned to the current England tenancy rollout after 1 May 2026',
          'Does not present a fixed-term AST as the default for a new England tenancy',
          'Matches shared-house arrangements to the appropriate England agreement',
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
              'Yes. Choose the agreement according to how the property is occupied. An ordinary joint let, student house and HMO may need different wording.',
          },
          {
            question: 'Should I use Premium for student or HMO lets?',
            answer:
              'No, not by default. Use Premium for fuller ordinary-residential drafting. Use Student for student-focused lets and HMO / Shared House where communal sharers or HMO-style management are the real issue.',
          },
          {
            question: 'Does this page still sell a joint AST as the live product?',
            answer:
              'No. It points England landlords to current agreements for properties with more than one tenant.',
          },
        ]}
      />
    </div>
  );
}
