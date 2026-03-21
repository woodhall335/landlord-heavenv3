import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/assured-shorthold-tenancy-agreement-template');
const wizardHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Assured Shorthold Tenancy Agreement Template | Legacy AST Explainer',
  description:
    'Legacy AST explainer page for landlords searching assured shorthold tenancy agreement template. The live England product is now a Residential Tenancy Agreement updated for the Renters’ Rights Act 2025.',
  keywords: [
    'assured shorthold tenancy agreement template',
    'ast template england',
    'assured shorthold tenancy agreement',
    'residential tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Assured Shorthold Tenancy Agreement Template | Legacy AST Explainer',
    description:
      'Legacy AST explainer page that now routes England landlords into the updated Residential Tenancy Agreement flow.',
    url: canonicalUrl,
    type: 'article',
  },
};

export default function AssuredShortholdTenancyAgreementTemplatePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Assured Shorthold Tenancy Agreement Template', url: canonicalUrl },
        ])}
      />
      <EnglandTenancyPage
        pagePath="/assured-shorthold-tenancy-agreement-template"
        title="Assured Shorthold Tenancy Agreement Template"
        subtitle="AST is now legacy search language for England. Use this explainer page to understand the terminology shift, then move into the updated Residential Tenancy Agreement flow."
        primaryCtaLabel="Use updated England agreement"
        primaryCtaHref={wizardHref}
        secondaryCtaLabel="See main England page"
        secondaryCtaHref="/tenancy-agreement"
        legacyNotice="Landlord Heaven keeps this AST page live for search demand, but the live England self-serve tenancy product is now sold as a Residential Tenancy Agreement updated for the Renters’ Rights Act 2025."
        introTitle="AST search intent, updated England route"
        introBody={[
          'Many landlords still search for an assured shorthold tenancy agreement template because that was the familiar England label for years.',
          'The live England product has now been repositioned to reflect the updated public compliance stance: Renters’ Rights compliant Residential Tenancy Agreement.',
        ]}
        highlights={[
          'Legacy AST explainer preserved for ranking',
          'Clear routing into the current England Residential Tenancy Agreement flow',
          'Updated page copy explains why AST is now legacy search terminology',
        ]}
        compliancePoints={[
          'Act wording in body copy, AST wording kept only for legacy query capture',
          'England product messaging now centres on the updated Residential Tenancy Agreement',
        ]}
      />
    </div>
  );
}


