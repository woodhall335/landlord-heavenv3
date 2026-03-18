import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/fixed-term-tenancy-agreement-template');
const wizardHref = '/wizard?product=ast_standard&jurisdiction=england&src=seo_fixed_term_tenancy_agreement_template&topic=tenancy';

export const metadata: Metadata = {
  title: 'Fixed Term Tenancy Agreement Template | Legacy England Explainer',
  description:
    'Legacy explainer for landlords searching fixed term tenancy agreement template in England. The live self-serve England product is now an updated Residential Tenancy Agreement flow.',
  keywords: [
    'fixed term tenancy agreement',
    'fixed term tenancy agreement template',
    'new tenancy agreement england',
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
        title="Fixed Term Tenancy Agreement Template"
        subtitle="This is now a legacy England explainer page. The live self-serve England agreement path is positioned as an upgraded assured periodic Residential Tenancy Agreement."
        primaryCtaLabel="Start updated England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Read periodic guide"
        secondaryCtaHref="/rolling-tenancy-agreement"
        legacyNotice="Landlord Heaven keeps this fixed-term page live for search demand, but new England self-serve agreements are now routed into the upgraded periodic Residential Tenancy Agreement model."
        introTitle="From fixed-term demand to updated England flow"
        introBody={[
          'Landlords still search for fixed term tenancy agreement templates, so this page remains available as a legacy explainer.',
          'For the current England product, the live route now positions new agreements as updated assured periodic Residential Tenancy Agreements.',
        ]}
        highlights={[
          'Preserves fixed-term keyword demand',
          'Explains the product shift to the new England flow',
          'Routes users into the updated wizard instead of selling fixed-term AST paperwork',
        ]}
        compliancePoints={[
          'Legacy search page only',
          'Live England product positioned around the updated periodic model',
        ]}
      />
    </div>
  );
}
