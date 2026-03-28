import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/joint-tenancy-agreement-template');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const chooserHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement England 2026 | Multiple Tenant Agreement',
  description:
    'Create a joint tenancy agreement for England with current England wording, multiple-tenant clauses.',
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
        subtitle="Create England tenancy paperwork for couples, flatmates, and multi-tenant households through the current England agreement routes."
        primaryCtaLabel="Start Standard joint agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Compare England joint routes"
        secondaryCtaHref={chooserHref}
        introTitle="Multiple tenants, current England wording"
        introBody={[
          'This page targets landlords who need a joint tenancy agreement for England without falling back to old AST-first sales language.',
          'The live Landlord Heaven routes now use current England agreement wording, while still supporting multiple tenants, shared households, and dedicated Standard, Premium, Student, and HMO / Shared House routes.',
        ]}
        highlights={[
          'Multiple-tenant and joint liability drafting support',
          'Current England wording instead of live AST sales copy',
          'Dedicated Student and HMO / Shared House routes for specialist shared lets',
          'Built to capture joint tenancy search demand while keeping the current England product position',
        ]}
        compliancePoints={[
          'Aligned to the current England tenancy rollout',
          'Keeps joint tenancy search coverage without reverting to AST-first public copy',
          'Routes landlords into the updated Standard, Premium, Student, and HMO / Shared House flows',
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
