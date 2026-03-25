import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/fixed-term-tenancy-agreement-template');
const standardWizardHref = '/wizard?product=ast_standard&src=england_tenancy_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=england_tenancy_page&topic=tenancy';

export const metadata: Metadata = {
  title: 'Fixed Term Tenancy Agreement Template | Legacy England Explainer',
  description:
    'Legacy explainer for landlords searching fixed term tenancy agreement template in England.',
  keywords: [
    'fixed term tenancy agreement',
    'fixed term tenancy agreement template',
    'england tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function FixedTermTenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Fixed Term Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/fixed-term-tenancy-agreement-template"
        title="Fixed Term Tenancy Agreement Template"
        subtitle="This is now a legacy England explainer page. From 1 May 2026 new England agreements generally move into the assured periodic framework, so the live self-serve routes no longer sell fixed-term AST paperwork as the core product."
        primaryCtaLabel="Start Standard England agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Start Premium England agreement"
        secondaryCtaHref={premiumWizardHref}
        legacyNotice="Landlord Heaven keeps this fixed-term page live for search demand, but new England self-serve agreements are now routed into current Standard and Premium flows designed for the assured periodic framework."
        introTitle="From fixed-term demand to the current England route"
        introBody={[
          'Landlords still search for fixed term tenancy agreement templates, so this page remains available as a legacy explainer.',
          'For the current England product, the live routes now position new agreements around the assured periodic framework rather than selling fixed-term AST wording as the default.',
        ]}
        highlights={[
          'Preserves fixed-term keyword demand',
          'Explains the product shift to the current England routes',
          'Routes users into Standard or Premium instead of selling fixed-term AST paperwork',
        ]}
        compliancePoints={[
          'Legacy search page only',
          'Live England product positioned around the assured periodic framework from 1 May 2026',
        ]}
      />
    </div>
  );
}
