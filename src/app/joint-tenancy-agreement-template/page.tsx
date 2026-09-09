import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/joint-tenancy-agreement-template');
const standardAgreementHref = '/standard-tenancy-agreement';
const chooserHref = '/products/ast';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement England 2026 | Multiple Tenant Agreement',
  description:
    'Create a joint tenancy agreement for England with current wording, multiple-tenant clauses, shared liability points, and setup records.',
  keywords: [
    'joint tenancy agreement template',
    'joint tenancy agreement england',
    'multiple tenants tenancy agreement',
    'shared house tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Joint Tenancy Agreement England 2026 | Multiple Tenant Agreement',
    description:
      'England joint tenancy agreement page for multiple tenants, couples, and shared households using the current England agreement routes.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function JointTenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Joint Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/joint-tenancy-agreement-template"
        title="Joint Tenancy Agreement England"
        subtitle="Create current England tenancy paperwork for couples, flatmates and other households with more than one tenant."
        primaryCtaLabel="Start Standard joint agreement"
        primaryCtaHref={standardAgreementHref}
        secondaryCtaLabel="Compare England agreements"
        secondaryCtaHref={chooserHref}
        introTitle="Multiple tenants, current England wording"
        introBody={[
          'This guide is for landlords who need a joint tenancy agreement for England rather than an old AST form.',
          'Choose according to the household and property. Standard, Premium, Student and HMO / Shared House agreements handle different arrangements.',
        ]}
        highlights={[
          'Multiple-tenant and joint liability drafting support',
          'Current England wording instead of live AST sales copy',
          'Dedicated Student and HMO / Shared House agreements for specialist shared lets',
          'Clear product choices for couples, flatmates and larger shared households',
        ]}
        compliancePoints={[
          'Aligned to the current England tenancy rollout',
          'Uses current joint-tenancy wording rather than an old fixed-term AST',
          'Helps landlords choose Standard, Premium, Student or HMO / Shared House paperwork',
        ]}
        keywordTargets={[
          'joint tenancy agreement template',
          'joint tenancy agreement england',
          'multiple tenants tenancy agreement',
          'shared house tenancy agreement',
        ]}
        faqs={[
          {
            question: 'Can I still use this for multiple tenants in one property?',
            answer:
              'Yes. The page still targets shared-house and joint-tenancy demand, but the live England document path now uses current England agreement wording.',
          },
          {
            question: 'Should I use Premium for student or HMO cases?',
            answer:
              'No, not by default. Use Premium for fuller ordinary-residential drafting. Use Student for student-focused lets and HMO / Shared House for communal sharers or HMO-style management.',
          },
          {
            question: 'Does this page still sell joint ASTs as the live product?',
            answer:
              'No. It now sells the current England agreement flow for joint tenants and shared households.',
          },
        ]}
      />
    </div>
  );
}
