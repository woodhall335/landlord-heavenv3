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
        secondaryCtaLabel="Compare England joint routes"
        secondaryCtaHref={chooserHref}
        introTitle="Shared households, current England wording"
        introBody={[
          'This page stays live for joint-tenancy and house-share search demand, but it no longer sells old AST-first joint tenancy wording as the live product.',
          'Instead, it directs shared-house and multi-tenant landlords into the current England agreement flow, with dedicated Standard, Premium, Student, and HMO / Shared House routes depending on the setup.',
        ]}
        highlights={[
          'Supports multiple tenants, couples, flatmates, and shared houses',
          'Uses current England tenancy agreement wording instead of outdated AST sales copy',
          'Keeps joint and several liability search intent commercially useful',
          'Dedicated Student and HMO / Shared House routes for specialist shared lets',
        ]}
        compliancePoints={[
          'Aligned to the current England tenancy rollout after 1 May 2026',
          'Avoids presenting a new fixed-term AST as the default England route',
          'Keeps shared-house search demand connected to the live England product routes',
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
              'Yes. This page still targets joint-tenancy and house-share demand, but the live England route now uses current England agreement wording designed for the assured periodic framework.',
          },
          {
            question: 'Should I use Premium for student or HMO lets?',
            answer:
              'No, not by default. Use Premium for fuller ordinary-residential drafting. Use Student for student-focused lets and HMO / Shared House where communal sharers or HMO-style management are the real issue.',
          },
          {
            question: 'Does this page still sell a joint AST as the live product?',
            answer:
              'No. It now routes England landlords into the current England agreement flow for multiple-tenant properties.',
          },
        ]}
      />
    </div>
  );
}
