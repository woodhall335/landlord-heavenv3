import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/assured-shorthold-tenancy-agreement');
const wizardHref = '/wizard?product=ast_standard&jurisdiction=england&src=seo_assured_shorthold_tenancy_agreement&topic=tenancy';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement | England Legacy Guide',
  description:
    'Legacy guide for landlords searching assured shorthold tenancy agreement in England. The live Landlord Heaven product is now an England Residential Tenancy Agreement updated for the Renters’ Rights Act 2025.',
  keywords: [
    'assured shorthold tenancy agreement',
    'ast agreement england',
    'residential tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
};

export default function AssuredShortholdTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Assured Shorthold Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        title="Assured Shorthold Tenancy Agreement"
        subtitle="This legacy England search page explains the AST terminology and routes landlords into the updated Residential Tenancy Agreement flow."
        primaryCtaLabel="Start updated England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="Read main England guide"
        secondaryCtaHref="/tenancy-agreement"
        legacyNotice="AST remains a high-volume England search term, but Landlord Heaven no longer positions ASTs as the live England tenancy product."
        introTitle="England terminology has moved on"
        introBody={[
          'This page now serves as a legacy explainer for landlords searching the old assured shorthold tenancy agreement wording.',
          'The updated live England product is the Residential Tenancy Agreement flow, positioned as Renters’ Rights compliant for the supported self-serve path.',
        ]}
        highlights={[
          'Legacy AST ranking page preserved',
          'Forward CTA into the updated England agreement wizard',
          'Act-era England tenancy positioning reflected in current copy',
        ]}
        compliancePoints={[
          'AST wording retained only for search capture',
          'Current England product positioned as Residential Tenancy Agreement',
        ]}
      />
    </div>
  );
}
