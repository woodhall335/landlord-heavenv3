import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/joint-tenancy-agreement-template');
const standardHref =
  '/wizard?product=ast_standard&jurisdiction=england&src=seo_joint_tenancy_agreement_template&topic=tenancy';
const premiumHref =
  '/wizard?product=ast_premium&jurisdiction=england&src=seo_joint_tenancy_agreement_template&topic=tenancy';

export const metadata: Metadata = {
  title: 'Joint Tenancy Agreement England 2026 | Multiple Tenant Agreement',
  description:
    "Create a joint tenancy agreement for England with updated Residential Tenancy Agreement wording, multiple-tenant clauses, and Renters' Rights compliant positioning.",
  keywords: [
    'joint tenancy agreement template',
    'joint tenancy agreement england',
    'multiple tenants tenancy agreement',
    'shared house tenancy agreement',
    'new tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Joint Tenancy Agreement England 2026 | Multiple Tenant Agreement',
    description:
      'England joint tenancy agreement page for multiple tenants, couples, and shared households using the updated Residential Tenancy Agreement flow.',
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
        title="Joint Tenancy Agreement England"
        subtitle="Create England tenancy paperwork for couples, flatmates, and multi-tenant households through the updated Residential Tenancy Agreement flow."
        primaryCtaLabel="Create standard joint agreement"
        primaryCtaHref={standardHref}
        secondaryCtaLabel="Use premium HMO or student-ready flow"
        secondaryCtaHref={premiumHref}
        introTitle="Multiple tenants, updated England wording"
        introBody={[
          'This page targets landlords who need a joint tenancy agreement for England without falling back to old AST-first sales language.',
          'The live Landlord Heaven route now uses Residential Tenancy Agreement wording, while still supporting multiple tenants, shared households, and premium HMO or student-ready drafting where needed.',
        ]}
        highlights={[
          'Multiple-tenant and joint liability drafting support',
          'England Residential Tenancy Agreement wording instead of live AST sales copy',
          'Premium HMO or student-ready route available for more complex lets',
          'Built to capture joint tenancy search demand while keeping the updated England product position',
        ]}
        compliancePoints={[
          "Aligned to the Renters' Rights compliant England tenancy rollout",
          'Keeps joint tenancy search coverage without reverting to AST-first public copy',
          'Routes landlords into the updated wizard labels and support documents',
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
              'Yes. The page still targets shared-house and joint-tenancy demand, but the live England document path now uses Residential Tenancy Agreement wording.',
          },
          {
            question: 'Should I use the premium version for student or HMO cases?',
            answer:
              'Usually yes. The premium England route is the better fit where you need HMO-ready or student-oriented clauses on top of the updated core agreement wording.',
          },
          {
            question: 'Does this page still sell joint ASTs as the live product?',
            answer:
              'No. It now sells the updated England Residential Tenancy Agreement flow for joint tenants and shared households.',
          },
        ]}
      />
    </div>
  );
}
